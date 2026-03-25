-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(30) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- お題テーブル
CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('japanese', 'code')),
  language VARCHAR(20),  -- java / javascript / python / null(japanese)
  content TEXT NOT NULL,
  furigana TEXT,         -- カタカナ表記
  romaji TEXT,           -- ローマ字表記
  difficulty SMALLINT DEFAULT 2 CHECK (difficulty BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スコアテーブル（練習・対戦共通）
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  topic_id INTEGER REFERENCES topics(id),
  mode VARCHAR(10) NOT NULL CHECK (mode IN ('practice', 'battle')),
  wpm INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 対戦セッションテーブル
CREATE TABLE IF NOT EXISTS battle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'countdown', 'active', 'finished')),
  topic_id INTEGER REFERENCES topics(id),
  time_limit INTEGER DEFAULT 180,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 対戦参加者テーブル
CREATE TABLE IF NOT EXISTS battle_participants (
  session_id UUID REFERENCES battle_sessions(id),
  user_id UUID REFERENCES users(id),
  wpm INTEGER,
  accuracy NUMERIC(5,2),
  rank INTEGER,
  finished_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (session_id, user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_created_at ON scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_battle_participants_session ON battle_participants(session_id);
