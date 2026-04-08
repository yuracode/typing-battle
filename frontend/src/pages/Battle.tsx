import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Problem, PlayerProgress, BattleRanking } from '../types';
import TypingInput from '../components/TypingInput';
import ProgressBar from '../components/ProgressBar';
import Countdown from '../components/Countdown';
import TopicFilterBar, { TopicFilterValue, filterToTopicFilter } from '../components/TopicFilter';
import { toHiragana } from '../utils/romajiEngine';

interface Props {
  socket: Socket;
  nickname: string;
  userId: string;
  onBack: () => void;
  onFinish: (rankings: BattleRanking[]) => void;
}

type Phase = 'lobby' | 'countdown' | 'battle' | 'done';

export default function Battle({ socket, nickname, userId, onBack, onFinish }: Props) {
  const isHost = new URLSearchParams(window.location.search).get('host') === '1';

  const [phase, setPhase] = useState<Phase>('lobby');
  const [lobbyPlayers, setLobbyPlayers] = useState<PlayerProgress[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [topicFilter, setTopicFilter] = useState<TopicFilterValue>('all');
  const [timeLimitSec, setTimeLimitSec] = useState(180);
  const [battleError, setBattleError] = useState<string | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [totalTopics, setTotalTopics] = useState(1);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(180);
  const [players, setPlayers] = useState<PlayerProgress[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const battleStartTimeRef = useRef<number | null>(null);
  const [myFinished, setMyFinished] = useState(false);
  const totalTypedCharsRef = useRef(0);
  const currentProblemCharsRef = useRef(0);

  useEffect(() => {
    const doJoin = () => socket.emit('join_battle', { nickname, userId, isHost });
    doJoin();
    socket.io.on('reconnect', doJoin);

    socket.on('battle_error', ({ message }: { message: string }) => {
      setBattleError(message);
    });

    socket.on('players_update', ({ players: pl }: { players: PlayerProgress[] }) => {
      setLobbyPlayers(pl);
    });

    socket.on('battle_countdown', ({ count }: { count: number }) => {
      setPhase('countdown');
      setCountdown(count);
    });

    socket.on('battle_start', ({ topic, totalTopics: tt, timeLimit: tl }: { topic: Problem; totalTopics: number; timeLimit: number }) => {
      setProblem(topic);
      setTotalTopics(tt);
      setCurrentTopicIndex(0);
      setTimeLimit(tl);
      setPhase('battle');
      const now = Date.now();
      battleStartTimeRef.current = now;
      setStartTime(now);
      setMyFinished(false);
      totalTypedCharsRef.current = 0;
      currentProblemCharsRef.current = 0;
    });

    // 次の問題
    socket.on('next_topic', ({ topic, topicIndex, totalTopics: tt }: { topic: Problem; topicIndex: number; totalTopics: number }) => {
      setProblem(topic);
      setCurrentTopicIndex(topicIndex);
      setTotalTopics(tt);
      setMyFinished(false);
      setStartTime(Date.now());
      currentProblemCharsRef.current = 0;
    });

    socket.on('progress_update', ({ players: pl }: { players: PlayerProgress[] }) => {
      setPlayers(pl);
    });

    socket.on('battle_end', ({ rankings }: { rankings: BattleRanking[] }) => {
      setPhase('done');
      onFinish(rankings);
    });

    return () => {
      socket.io.off('reconnect', doJoin);
      socket.off('battle_error');
      socket.off('players_update');
      socket.off('battle_countdown');
      socket.off('battle_start');
      socket.off('next_topic');
      socket.off('progress_update');
      socket.off('battle_end');
    };
  }, []);

  // 経過時間タイマー（battle_start 時のみリセット、次の問題では継続）
  useEffect(() => {
    if (phase !== 'battle') return;
    const base = battleStartTimeRef.current ?? Date.now();
    setElapsed(Math.floor((Date.now() - base) / 1000));
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - base) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const lastProgressRef = useRef<number>(0);
  const handleProgress = (progress: number, wpm: number, typedChars: number) => {
    const now = Date.now();
    if (now - lastProgressRef.current < 200) return;
    lastProgressRef.current = now;
    socket.emit('typing_progress', { progress, wpm, typedChars });
  };

  const handleComplete = (wpm: number, accuracy: number, durationMs?: number, _mistakes?: number, typedChars?: number) => {
    if (myFinished) return;
    setMyFinished(true); // 次の問題が届くまで一時的に無効化
    totalTypedCharsRef.current += typedChars ?? 0;
    currentProblemCharsRef.current = 0;
    socket.emit('typing_complete', { wpm, accuracy, typedChars: typedChars ?? 0, durationMs: durationMs ?? 0 });
  };

  const handleStartBattle = () => {
    socket.emit('start_battle', { topicFilter: filterToTopicFilter(topicFilter), timeLimit: timeLimitSec });
  };

  const handleForceEnd = () => {
    socket.emit('force_end_battle');
  };

  const typingMode = problem?.type === 'japanese' ? 'romaji' : 'direct';
  const targetText = problem
    ? problem.type === 'japanese' && problem.furigana
      ? toHiragana(problem.furigana)
      : problem.content
    : '';

  const remaining = Math.max(0, timeLimit - elapsed);

  // 問題番号バッジ
  const topicBadge = totalTopics > 1
    ? `問${currentTopicIndex + 1}/${totalTopics}`
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 max-w-5xl mx-auto">
      {phase === 'countdown' && <Countdown count={countdown} />}

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        {phase === 'lobby' && (
          <button onClick={onBack} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm">
            ← ロビーへ戻る
          </button>
        )}
        <div className="ml-auto text-slate-700 dark:text-slate-300 text-sm">
          ⚔️ <span className="text-emerald-400 font-bold">{nickname}</span>
          {isHost && <span className="ml-2 text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded-full">先生</span>}
        </div>
      </div>

      {/* ロビー待機 */}
      {phase === 'lobby' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 space-y-6">
          {battleError && (
            <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 rounded-xl px-4 py-3 text-red-600 dark:text-red-300 text-sm">
              ⚠️ {battleError}
              <button
                onClick={() => { setBattleError(null); socket.emit('join_battle', { nickname, userId, isHost }); }}
                className="ml-3 underline hover:no-underline"
              >
                再試行
              </button>
            </div>
          )}
          <h2 className="text-2xl font-bold text-center text-emerald-400">⚔️ 対戦ロビー</h2>

          <div className="space-y-2">
            <p className="text-slate-700 dark:text-slate-300 font-semibold">参加者 ({lobbyPlayers.length}名)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {lobbyPlayers.map((p, i) => (
                <div key={i} className={`rounded-lg px-3 py-2 text-sm text-center ${
                  p.nickname === nickname ? 'bg-sky-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {p.nickname === nickname ? '👤 ' : ''}{p.nickname}
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <div className="space-y-4">
              <div className="bg-slate-200/60 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <p className="text-slate-500 dark:text-slate-400 text-xs">テーマを選択（選択したテーマの全問題をシャッフルして出題）</p>
                <TopicFilterBar value={topicFilter} onChange={setTopicFilter} />
              </div>
              <div className="bg-slate-200/60 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <p className="text-slate-500 dark:text-slate-400 text-xs">制限時間を選択</p>
                <div className="flex gap-2">
                  {([60, 180, 300, 600] as const).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setTimeLimitSec(sec)}
                      className={`flex-1 text-sm font-bold px-3 py-2 rounded-lg transition-colors ${
                        timeLimitSec === sec
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-700 dark:text-white bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500'
                      }`}
                    >
                      {sec === 60 ? '1分' : sec === 180 ? '3分' : sec === 300 ? '5分' : '10分'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleStartBattle}
                disabled={lobbyPlayers.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-4 rounded-xl transition-colors text-lg"
              >
                🚀 対戦スタート！
              </button>
              <p className="text-slate-400 dark:text-slate-500 text-xs text-center">全員揃ったら「対戦スタート」を押してください</p>
            </div>
          ) : (
            <div className="flex justify-center items-center gap-2 text-slate-400 dark:text-slate-500 py-4">
              <span className="animate-pulse w-2 h-2 bg-emerald-400 rounded-full inline-block" />
              先生がスタートするまでお待ちください…
            </div>
          )}
        </div>
      )}

      {/* 対戦中 */}
      {(phase === 'battle' || phase === 'countdown') && problem && (
        isHost ? (
          /* ── 先生: 観戦モード ── */
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {topicBadge && (
                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                      {topicBadge}
                    </span>
                  )}
                  <span className="text-slate-500 dark:text-slate-400 text-sm">観戦中</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`font-mono font-bold text-xl ${remaining <= 10 ? 'text-red-400 animate-pulse' : 'text-sky-400'}`}>
                    ⏱ {remaining}s
                  </div>
                  <button
                    onClick={handleForceEnd}
                    className="bg-red-700 hover:bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    🛑 強制終了
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">🏆 リアルタイム順位</h3>
              <ProgressBar players={players} myNickname="" totalTopics={totalTopics} />
            </div>
          </div>
        ) : (
          /* ── 学生: タイピングモード ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {topicBadge && (
                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200">
                      {topicBadge}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    problem.type === 'japanese' ? 'bg-purple-800 text-purple-200' : 'bg-amber-800 text-amber-200'
                  }`}>
                    {problem.type === 'japanese' ? '日本語' : problem.language?.toUpperCase()}
                  </span>
                </div>
                <div className={`font-mono font-bold text-xl ${remaining <= 10 ? 'text-red-400 animate-pulse' : 'text-sky-400'}`}>
                  ⏱ {remaining}s
                </div>
              </div>

              {problem.type === 'japanese' && problem.furigana && (
                <div className="bg-slate-200/60 dark:bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">フリガナ</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{problem.furigana}</p>
                </div>
              )}
              {problem.type === 'japanese' && (
                <div className="bg-slate-200/60 dark:bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">原文</p>
                  <p className="text-slate-900 dark:text-white text-base leading-relaxed">{problem.content}</p>
                </div>
              )}

              <TypingInput
                mode={typingMode}
                target={targetText}
                onProgress={handleProgress}
                onComplete={handleComplete}
                disabled={myFinished}
                startTime={startTime}
              />
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
              <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">🏆 リアルタイム順位</h3>
              <ProgressBar players={players} myNickname={nickname} totalTopics={totalTopics} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
