import { useState, useRef, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { AppPage, BattleRanking } from './types';
import Lobby from './pages/Lobby';
import Practice from './pages/Practice';
import Battle from './pages/Battle';
import Result from './pages/Result';
import Stats from './pages/Stats';
import Ranking from './pages/Ranking';
import ThemeToggle from './components/ThemeToggle';

// 開発時は localhost:3001、本番時はアクセス元と同じホスト
const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;

export default function App() {
  const [page, setPage] = useState<AppPage>('lobby');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);
  const [nickname, setNickname] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<BattleRanking[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const handleEnter = async (nick: string, targetPage: AppPage) => {
    try {
      // ユーザー登録 or 取得
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nick }),
      });
      const user = await res.json();
      if (!user.id) throw new Error('登録失敗');

      // Socket接続
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
      }

      setNickname(nick);
      setUserId(user.id);
      setPage(targetPage);
    } catch {
      alert('サーバーに接続できません。バックエンドが起動しているか確認してください。');
    }
  };

  const handleBackToLobby = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setPage('lobby');
    setNickname(null);
    setUserId(null);
  };

  const handleBattleFinish = (r: BattleRanking[]) => {
    setRankings(r);
    setPage('result');
  };

  const toggle = <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />;

  // ランキングはログイン不要で表示可
  if (page === 'ranking') {
    return <>{toggle}<Ranking nickname={nickname ?? undefined} onBack={() => setPage('lobby')} /></>;
  }

  if (page === 'lobby' || !nickname || !userId || !socketRef.current) {
    return <>{toggle}<Lobby onEnter={handleEnter} onViewRanking={() => setPage('ranking')} /></>;
  }

  if (page === 'stats') {
    return <>{toggle}<Stats userId={userId} nickname={nickname} onBack={() => setPage('practice')} /></>;
  }

  if (page === 'practice') {
    return (
      <>{toggle}<Practice
        socket={socketRef.current}
        nickname={nickname}
        userId={userId}
        onBack={handleBackToLobby}
        onViewStats={() => setPage('stats')}
        onViewRanking={() => setPage('ranking')}
      /></>
    );
  }

  if (page === 'battle') {
    return (
      <>{toggle}<Battle
        socket={socketRef.current}
        nickname={nickname}
        userId={userId}
        onBack={handleBackToLobby}
        onFinish={handleBattleFinish}
      /></>
    );
  }

  if (page === 'result') {
    return <>{toggle}<Result rankings={rankings} nickname={nickname} onReturnLobby={handleBackToLobby} /></>;
  }

  return <>{toggle}<Lobby onEnter={handleEnter} onViewRanking={() => setPage('ranking')} /></>;
}
