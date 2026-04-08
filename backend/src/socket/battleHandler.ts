import { Server, Socket } from 'socket.io';
import { redis } from '../redis/client';
import { pool } from '../db/client';

interface Player {
  userId: string;
  nickname: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  topicIndex: number;
  completedCount: number;
  typedChars: number;
  currentTypedChars: number;
  finishedAt: number | null;
}

interface BattleSession {
  sessionId: string;
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  topics: any[];   // シャッフル済みお題配列
  players: Record<string, Player>;
  startTime: number | null;
  timeLimit: number;
}

const SESSION_KEY = 'battle:session';
const TIME_LIMIT = 180;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getSession(): Promise<BattleSession | null> {
  const raw = await redis.get(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function saveSession(session: BattleSession): Promise<void> {
  await redis.set(SESSION_KEY, JSON.stringify(session));
}

export function registerBattleHandlers(io: Server, socket: Socket) {
  // ロビー参加
  socket.on('join_battle', async ({ nickname, userId, isHost = false }: { nickname: string; userId: string; isHost?: boolean }) => {
    let session = await getSession();
    const roomSize = (await io.in('battle_room').fetchSockets()).length;

    if (!session || session.status === 'finished' || roomSize === 0) {
      session = {
        sessionId: crypto.randomUUID(),
        status: 'waiting',
        topics: [],
        players: {},
        startTime: null,
        timeLimit: TIME_LIMIT,
      };
    }

    if (session.status === 'active') {
      socket.emit('battle_error', { message: '対戦が既に開始されています' });
      return;
    }

    if (!isHost) {
      session.players[socket.id] = {
        userId, nickname, progress: 0, wpm: 0, accuracy: 0,
        finished: false, topicIndex: 0, completedCount: 0, typedChars: 0, currentTypedChars: 0,
        finishedAt: null,
      };
    }

    await saveSession(session);
    await socket.join('battle_room');

    const playerList = Object.values(session.players);
    socket.emit('players_update', { players: playerList });
    if (!isHost) {
      socket.to('battle_room').emit('players_update', { players: playerList });
    }
    socket.emit('battle_joined', { sessionId: session.sessionId });
  });

  // 対戦開始
  socket.on('start_battle', async ({ topicFilter, timeLimit: requestedTimeLimit }: { topicFilter?: { type?: string; language?: string }; timeLimit?: number } = {}) => {
    const session = await getSession();
    if (!session || session.status !== 'waiting') return;

    // 有効な時間制限（60/180/300/600 秒）のみ受け付ける
    const VALID_LIMITS = [60, 180, 300, 600];
    const chosenLimit = VALID_LIMITS.includes(requestedTimeLimit ?? 0) ? requestedTimeLimit! : TIME_LIMIT;
    session.timeLimit = chosenLimit;

    const conditions: string[] = [];
    const params: string[] = [];
    if (topicFilter?.type)     { conditions.push(`type = $${params.length + 1}`);     params.push(topicFilter.type); }
    if (topicFilter?.language) { conditions.push(`language = $${params.length + 1}`); params.push(topicFilter.language); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(`SELECT * FROM topics ${where}`, params);

    if (result.rows.length === 0) {
      socket.emit('battle_error', { message: '該当するお題がありません' });
      return;
    }

    session.topics = shuffle(result.rows);
    session.status = 'countdown';
    await saveSession(session);

    for (let count = 3; count >= 1; count--) {
      io.to('battle_room').emit('battle_countdown', { count });
      await new Promise((r) => setTimeout(r, 1000));
    }

    session.status = 'active';
    session.startTime = Date.now();
    await saveSession(session);

    io.to('battle_room').emit('battle_start', {
      topic: session.topics[0],
      totalTopics: session.topics.length,
      timeLimit: chosenLimit,
    });

    // 制限時間で強制終了
    setTimeout(async () => {
      const current = await getSession();
      if (current && current.status === 'active') {
        await endBattle(io, current);
      }
    }, chosenLimit * 1000);
  });

  // ホストによる強制終了
  socket.on('force_end_battle', async () => {
    const session = await getSession();
    if (!session || session.status !== 'active') return;
    await endBattle(io, session);
  });

  // タイピング進捗更新
  socket.on('typing_progress', async ({ progress, wpm, typedChars }: { progress: number; wpm: number; typedChars?: number }) => {
    const session = await getSession();
    if (!session || session.status !== 'active') return;
    if (!session.players[socket.id]) return;

    session.players[socket.id].progress = progress;
    session.players[socket.id].wpm = wpm;
    if (typedChars !== undefined) {
      session.players[socket.id].currentTypedChars = typedChars;
    }
    await saveSession(session);

    io.to('battle_room').emit('progress_update', { players: Object.values(session.players) });
  });

  // 1問完了
  socket.on('typing_complete', async ({ wpm, accuracy, typedChars, durationMs }: { wpm: number; accuracy: number; typedChars?: number; durationMs?: number }) => {
    const session = await getSession();
    if (!session || session.status !== 'active') return;
    if (!session.players[socket.id]) return;

    const player = session.players[socket.id];
    player.wpm = wpm;
    player.accuracy = accuracy;
    player.completedCount++;
    player.typedChars += typedChars ?? 0;
    player.currentTypedChars = 0;

    // DB に保存
    const currentTopic = session.topics[player.topicIndex];
    await pool.query(
      `INSERT INTO scores (user_id, topic_id, mode, wpm, accuracy, typed_chars, duration_ms) VALUES ($1, $2, 'battle', $3, $4, $5, $6)`,
      [player.userId, currentTopic.id, wpm, accuracy, typedChars ?? 0, durationMs ?? 0]
    );

    const nextIndex = player.topicIndex + 1;

    if (nextIndex < session.topics.length) {
      // 次の問題へ
      player.topicIndex = nextIndex;
      player.progress = 0;
      await saveSession(session);
      socket.emit('next_topic', {
        topic: session.topics[nextIndex],
        topicIndex: nextIndex,
        totalTopics: session.topics.length,
      });
      io.to('battle_room').emit('progress_update', { players: Object.values(session.players) });
    } else {
      // 全問完了
      player.finished = true;
      player.progress = 100;
      player.finishedAt = Date.now();
      await saveSession(session);
      io.to('battle_room').emit('progress_update', { players: Object.values(session.players) });

      const allFinished = Object.values(session.players).every((p) => p.finished);
      if (allFinished) await endBattle(io, session);
    }
  });

  // 切断処理
  socket.on('disconnect', async () => {
    const session = await getSession();
    if (!session) return;
    const wasPlayer = socket.id in session.players;
    delete session.players[socket.id];
    if (Object.keys(session.players).length === 0) {
      session.status = 'finished';
    }
    await saveSession(session);
    if (wasPlayer) {
      socket.to('battle_room').emit('players_update', { players: Object.values(session.players) });
    }
  });
}

async function endBattle(io: Server, session: BattleSession) {
  session.status = 'finished';
  await saveSession(session);

  const now = Date.now();
  const rankings = Object.values(session.players)
    .map((p) => {
      const totalChars = p.typedChars + p.currentTypedChars;
      const elapsedMs = session.startTime
        ? (p.finishedAt ?? now) - session.startTime
        : 0;
      const kpm = elapsedMs > 0 ? Math.round(totalChars * 60000 / elapsedMs) : 0;
      return { ...p, typedChars: totalChars, kpm };
    })
    .sort((a, b) => {
      if (b.typedChars !== a.typedChars) return b.typedChars - a.typedChars;
      if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
      return b.wpm - a.wpm;
    })
    .map((p, i) => ({ ...p, rank: i + 1 }));

  io.to('battle_room').emit('battle_end', { rankings });
}
