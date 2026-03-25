import { Server, Socket } from 'socket.io';
import { query } from '../db/client';

export function registerPracticeHandlers(_io: Server, socket: Socket) {
  // 練習開始：ランダムお題を返す
  socket.on('practice:start', async ({ topicId }: { topicId?: number }) => {
    try {
      let rows;
      if (topicId) {
        rows = await query('SELECT * FROM topics WHERE id = $1', [topicId]);
      } else {
        rows = await query('SELECT * FROM topics ORDER BY RANDOM() LIMIT 1');
      }
      if (rows.length === 0) {
        socket.emit('practice:error', { message: 'お題がありません' });
        return;
      }
      socket.emit('practice:topic', { topic: rows[0] });
    } catch (err) {
      console.error('practice:start error', err);
      socket.emit('practice:error', { message: 'サーバーエラー' });
    }
  });

  // 練習完了：スコア保存
  socket.on(
    'practice:complete',
    async ({
      userId,
      topicId,
      wpm,
      accuracy,
    }: {
      userId: string;
      topicId: number;
      wpm: number;
      accuracy: number;
    }) => {
      try {
        const rows = await query(
          `INSERT INTO scores (user_id, topic_id, mode, wpm, accuracy)
           VALUES ($1, $2, 'practice', $3, $4) RETURNING *`,
          [userId, topicId, wpm, accuracy]
        );
        socket.emit('practice:saved', { score: rows[0] });
      } catch (err) {
        console.error('practice:complete error', err);
        socket.emit('practice:error', { message: 'スコア保存失敗' });
      }
    }
  );
}
