import { Router } from 'express';
import { pool } from '../db/client';

const router = Router();

// ニックネームで登録 or 取得
router.post('/register', async (req, res) => {
  const { nickname } = req.body;
  if (!nickname || nickname.length > 30) {
    return res.status(400).json({ error: 'Invalid nickname' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO users (nickname) VALUES ($1)
       ON CONFLICT (nickname) DO UPDATE SET nickname = EXCLUDED.nickname
       RETURNING *`,
      [nickname]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;
