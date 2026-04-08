export interface User {
  id: string;
  nickname: string;
}

export interface Topic {
  id: number;
  type: 'japanese' | 'code';
  language?: string;
  content: string;
  furigana?: string;
  romaji?: string;
  difficulty: number;
}

// 練習ページで使う型エイリアス
export type Problem = Topic;

export interface Score {
  id: number;
  user_id: string;
  topic_id: number;
  mode: 'practice' | 'battle';
  wpm: number;
  accuracy: number;
  typed_chars: number;
  duration_ms: number;
  created_at: string;
}

export type ScoreRecord = Score;

export interface Player {
  userId: string;
  nickname: string;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  rank?: number;
  topicIndex: number;
  completedCount: number;
  typedChars: number;
}

export type PlayerProgress = Player;

export interface BattleRanking {
  userId: string;
  nickname: string;
  wpm: number;
  accuracy: number;
  progress: number;
  finished: boolean;
  rank: number;
  completedCount: number;
  typedChars: number;
  kpm: number;
}

export type AppPage = 'lobby' | 'practice' | 'battle' | 'result' | 'stats' | 'ranking';
