import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'typing_battle',
  user: process.env.DB_USER || 'typing_user',
  password: process.env.DB_PASSWORD || 'typing_pass',
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

export async function query(sql: string, params?: unknown[]): Promise<any[]> {
  const result = await pool.query(sql, params);
  return result.rows;
}
