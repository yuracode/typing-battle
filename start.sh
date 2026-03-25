#!/bin/bash
set -e

echo "=== Typing Battle 起動スクリプト ==="

# Docker（PostgreSQL + Redis）起動
echo "[1/4] Docker コンテナ起動..."
docker compose up -d

# 少し待つ
sleep 3

# バックエンド依存パッケージ
echo "[2/4] バックエンド依存パッケージ確認..."
cd backend
npm install --silent

# DB シード（初回 or 再実行してもOK）
echo "[3/4] DBシード..."
npm run db:seed

# フロントエンドビルド
echo "[4/4] フロントエンドビルド..."
cd ../frontend
npm install --silent
npm run build

# バックエンド起動（tsx で直接実行）
echo ""
echo "✅ 起動完了！ http://$(hostname -I | awk '{print $1}'):3001 でアクセスできます"
echo "   先生URL: http://$(hostname -I | awk '{print $1}'):3001/?host=1"
echo ""
cd ../backend
npm run dev
