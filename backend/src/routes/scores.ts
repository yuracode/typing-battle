import { Router } from 'express';
import { pool } from '../db/client';

const router = Router();

// スコア保存（練習モード）
router.post('/', async (req, res) => {
  const { userId, topicId, mode, wpm, accuracy } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO scores (user_id, topic_id, mode, wpm, accuracy)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, topicId, mode, wpm, accuracy]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// 個人スコア履歴
router.get('/history/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, t.type, t.language, t.content
       FROM scores s
       JOIN topics t ON t.id = s.topic_id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT 50`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// 全体ランキング（練習モード）
// ?sort=chars(default)|kpm|accuracy
router.get('/ranking', async (req, res) => {
  const sort = (req.query.sort as string) || 'chars';
  const orderBy =
    sort === 'kpm'      ? 'best_kpm DESC'      :
    sort === 'accuracy' ? 'avg_accuracy DESC'  :
                          'best_chars DESC';
  try {
    const result = await pool.query(
      `SELECT u.nickname,
              MAX(s.typed_chars) as best_chars,
              MAX(s.wpm) as best_wpm,
              AVG(s.accuracy) as avg_accuracy,
              COUNT(*) as games,
              MAX(CASE WHEN s.duration_ms > 0
                       THEN ROUND(s.typed_chars * 60000.0 / s.duration_ms)
                       ELSE 0 END) as best_kpm
       FROM scores s
       JOIN users u ON u.id = s.user_id
       WHERE s.mode = 'practice'
       GROUP BY u.id, u.nickname
       ORDER BY ${orderBy}
       LIMIT 30`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// 全履歴削除（先生用）
router.delete('/all', async (_req, res) => {
  try {
    const result = await pool.query('DELETE FROM scores');
    res.json({ deleted: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;
