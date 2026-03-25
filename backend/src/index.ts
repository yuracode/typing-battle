import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { registerBattleHandlers } from './socket/battleHandler';
import { registerPracticeHandlers } from './socket/practiceHandler';
import topicsRouter from './routes/topics';
import scoresRouter from './routes/scores';
import usersRouter from './routes/users';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// REST API
app.use('/api/topics', topicsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/users', usersRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// フロントエンド静的ファイル配信（本番用）
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Socket.IO
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  registerBattleHandlers(io, socket);
  registerPracticeHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
