import { Router } from 'express';
import { pool } from '../db/client';

const router = Router();

// ランダム1件取得（?type=japanese|code  &language=java|javascript|python）
router.get('/random', async (req, res) => {
  try {
    const { type, language } = req.query;
    const conditions: string[] = [];
    const params: string[] = [];
    if (type) { conditions.push(`type = $${params.length + 1}`); params.push(type as string); }
    if (language) { conditions.push(`language = $${params.length + 1}`); params.push(language as string); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM topics ${where} ORDER BY RANDOM() LIMIT 1`,
      params
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// 全件取得
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM topics ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;
