import { Router } from 'express';
import { query } from '../db/client';

const router = Router();

// ランダムお題取得
router.get('/random', async (req, res) => {
  try {
    const type = req.query.type as string | undefined; // 'japanese' | 'code'
    const difficulty = req.query.difficulty as string | undefined;

    let sql = 'SELECT * FROM problems WHERE 1=1';
    const params: any[] = [];

    if (type) {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }
    if (difficulty) {
      params.push(Number(difficulty));
      sql += ` AND difficulty = $${params.length}`;
    }
    sql += ' ORDER BY RANDOM() LIMIT 1';

    const rows = await query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No problems found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 全お題取得
router.get('/', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM problems ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// お題取得（ID指定）
router.get('/:id', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM problems WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
