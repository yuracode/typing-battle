# Typing Battle

専門学校の授業で使用するリアルタイムタイピング対戦Webアプリです。
約30名の学生がブラウザから参加し、練習・対戦を行えます。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + Vite + TypeScript + Tailwind CSS |
| バックエンド | Node.js + Express + Socket.IO + TypeScript |
| リアルタイム/キャッシュ | Redis |
| 永続化DB | PostgreSQL |
| ローマ字変換 | kuroshiro + kuromoji |
| コンテナ | Docker Compose |

## 機能

### 練習モード
- お題（日本語文章 or コードスニペット）をランダム表示
- 本文・ふりがな（カタカナ）・ローマ字を表示
- WPM・正確率をリアルタイム計測、DBに保存

### 対戦モード
- 3・2・1カウントダウン後に全員同時スタート
- 画面左：自分のタイピングエリア
- 画面右：全参加者のリアルタイム進捗バー + WPM
- 全員完了 or 制限時間（180秒）で終了 → ランキング発表

## 必要環境

- Docker / Docker Compose
- Node.js 20+
- npm

## セットアップ

```bash
# リポジトリをクローン後、セットアップスクリプトを実行
chmod +x setup.sh
./setup.sh
```

セットアップスクリプトは以下を自動実行します：

1. Docker コンテナ（PostgreSQL + Redis）の起動
2. バックエンド・フロントエンドの `npm install`

## 起動方法

### 開発環境（ターミナル2つ）

```bash
# ターミナル1：バックエンド
cd backend && npm run dev

# ターミナル2：フロントエンド
cd frontend && npm run dev
```

### 一括起動スクリプト（本番・授業用）

```bash
chmod +x start.sh
./start.sh
```

フロントエンドをビルドしてバックエンドのみ起動します。
IPアドレスが自動表示されるので、学生はそのURLにアクセスします。

## アクセス先

| 対象 | URL |
|---|---|
| 学生（フロントエンド開発時） | http://localhost:5173 |
| バックエンドAPI | http://localhost:3001/api/health |
| 先生用（対戦管理） | http://\<IPアドレス\>:3001/?host=1 |

## ポート一覧

| サービス | ポート |
|---|---|
| フロントエンド (Vite) | 5173 |
| バックエンド (Express) | 3001 |
| PostgreSQL | 5432 |
| Redis | 6379 |

## DBシード

お題データを投入・再投入するには：

```bash
cd backend && npm run db:seed
```

## 先生向け：対戦を強制スタートする

学生の入室を待たずに対戦を開始したい場合、ブラウザのコンソールで以下を実行：

```js
socket.emit('battle:force_start')
```

## ディレクトリ構成

```
typing-battle/
├── docker-compose.yml
├── setup.sh              # 初回セットアップ
├── start.sh              # 一括起動（授業用）
├── backend/
│   └── src/
│       ├── index.ts
│       ├── routes/       # REST API
│       ├── socket/       # Socket.IO ハンドラ
│       ├── db/           # DBクライアント・スキーマ・シード
│       └── redis/        # Redisクライアント
└── frontend/
    └── src/
        ├── pages/        # LobbyPage / PracticePage / BattlePage
        ├── components/   # TypingArea, ScoreBoard, PlayerList, Countdown
        ├── hooks/        # useSocket, useTyping
        └── types/
```

## Socket.IO イベント

### クライアント → サーバー

| イベント | ペイロード |
|---|---|
| `join_lobby` | `{ nickname }` |
| `join_battle` | `{ nickname }` |
| `typing_progress` | `{ sessionId, progress, wpm }` |
| `typing_complete` | `{ sessionId, wpm, accuracy }` |

### サーバー → クライアント

| イベント | ペイロード |
|---|---|
| `lobby_joined` | `{ userId, players[] }` |
| `player_joined` | `{ players[] }` |
| `battle_countdown` | `{ count }` |
| `battle_start` | `{ topic, timeLimit }` |
| `progress_update` | `{ players[] }` |
| `battle_end` | `{ rankings[] }` |
