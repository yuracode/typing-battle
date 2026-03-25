#!/bin/bash
set -e

echo "=== Typing Battle セットアップ ==="

# Docker確認
if ! command -v docker &> /dev/null; then
  echo "❌ Dockerがインストールされていません"
  exit 1
fi

# Docker Compose起動
echo "▶ Docker起動中..."
docker compose up -d
echo "✅ PostgreSQL + Redis 起動完了"

# DB初期化待機
echo "▶ DB初期化待機中..."
sleep 5

# バックエンド依存関係
echo "▶ バックエンド npm install..."
cd backend && npm install
cd ..

# フロントエンド依存関係
echo "▶ フロントエンド npm install..."
cd frontend && npm install
cd ..

echo ""
echo "=== セットアップ完了！ ==="
echo ""
echo "起動方法（ターミナルを2つ開いて実行）:"
echo "  ターミナル1: cd backend && npm run dev"
echo "  ターミナル2: cd frontend && npm run dev"
echo ""
echo "アクセス先:"
echo "  フロントエンド: http://localhost:5173"
echo "  バックエンドAPI: http://localhost:3001/api/health"
echo ""
echo "先生用 対戦スタート:"
echo "  ブラウザコンソールで実行:"
echo "  socket.emit('battle:force_start')"
