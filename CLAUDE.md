# Typing Battle - 授業用タイピング対戦システム

## プロジェクト概要
専門学校の授業で使用するリアルタイムタイピング対戦Webアプリ。
約30名の学生がブラウザから参加し、練習・対戦を行う。

## 技術スタック
- **フロントエンド**: React 18 + Vite + TypeScript + Tailwind CSS
- **バックエンド**: Node.js + Express + Socket.IO + TypeScript
- **リアルタイム/キャッシュ**: Redis（Docker）
- **永続化DB**: PostgreSQL（Docker）
- **ローマ字変換**: kuroshiro + kuromoji-analyzer-node
- **コンテナ**: Docker Compose

## ディレクトリ構成
```
typing-battle/
├── CLAUDE.md
├── docker-compose.yml
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── routes/
│       │   ├── topics.ts
│       │   ├── scores.ts
│       │   └── users.ts
│       ├── socket/
│       │   ├── battleHandler.ts
│       │   └── practiceHandler.ts
│       ├── db/
│       │   ├── client.ts
│       │   └── schema.sql
│       └── redis/
│           └── client.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.ts
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── types/index.ts
        ├── hooks/
        │   ├── useSocket.ts
        │   └── useTyping.ts
        ├── pages/
        │   ├── LobbyPage.tsx
        │   ├── PracticePage.tsx
        │   └── BattlePage.tsx
        └── components/
            ├── TypingArea.tsx
            ├── ScoreBoard.tsx
            ├── PlayerList.tsx
            └── Countdown.tsx
```

## 機能仕様

### 共通
- ニックネームで参加（ロビー画面で入力）
- 練習モード / 対戦モードを選択

### 練習モード
- お題（日本語 or コードスニペット）をランダム表示
- 本文 + ふりがな（カタカナ）+ ローマ字を表示
- WPM・正確率を表示・DBに保存

### 対戦モード
- 3・2・1カウントダウン後に全員同時スタート
- 画面左：自分のタイピングエリア
- 画面右：全参加者のリアルタイム進捗バー + WPM
- 全員完了 or 制限時間（180秒）で終了
- 終了後にランキング発表

### お題データ
- 種別：japanese（日本語文章）/ code（コードスニペット）
- 日本語：本文 + ふりがな（カタカナ）+ ローマ字
- コード：Java / JavaScript / Python

## データベーススキーマ

```sql
users: id, nickname, created_at
topics: id, type, language, content, furigana, romaji, difficulty
scores: id, user_id, topic_id, mode, wpm, accuracy, created_at
battle_sessions: id, status, topic_id, started_at, ended_at
battle_participants: session_id, user_id, wpm, accuracy, rank, finished_at
```

## Socket.IOイベント

### クライアント → サーバー
- join_lobby { nickname }
- join_battle { nickname }
- typing_progress { sessionId, progress, wpm }
- typing_complete { sessionId, wpm, accuracy }

### サーバー → クライアント
- lobby_joined { userId, players[] }
- player_joined { players[] }
- battle_countdown { count }
- battle_start { topic, timeLimit }
- progress_update { players[] }
- battle_end { rankings[] }

## ポート設定
- フロントエンド: 5173
- バックエンド: 3001
- PostgreSQL: 5432
- Redis: 6379

## 起動コマンド
```bash
# 初回セットアップ
docker-compose up -d
cd backend && npm install && npm run db:seed
cd ../frontend && npm install

# 開発起動
cd backend && npm run dev        # ターミナル1
cd frontend && npm run dev       # ターミナル2
```

## 注意事項
- WSL2環境での開発を想定
- kuroshiroの初期化はバックエンド起動時に1回のみ実行
- Socket.IO CORSは http://localhost:5173 に限定
