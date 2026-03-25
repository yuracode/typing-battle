import { useState } from 'react';
import axios from 'axios';
import { User } from '../types';

interface Props {
  onEnter: (user: User, mode: 'practice' | 'battle') => void;
}

export default function LobbyPage({ onEnter }: Props) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnter = async (mode: 'practice' | 'battle') => {
    const name = nickname.trim();
    if (!name) { setError('ニックネームを入力してください'); return; }
    if (name.length > 30) { setError('30文字以内で入力してください'); return; }

    setLoading(true);
    try {
      const res = await axios.post<User>('/api/users/register', { nickname: name });
      onEnter(res.data, mode);
    } catch {
      setError('登録に失敗しました。サーバーが起動しているか確認してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="w-full max-w-md p-8 bg-surface rounded-2xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            ⌨️ Typing Battle
          </h1>
          <p className="text-slate-400">ニックネームを入力してはじめよう</p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleEnter('practice')}
            placeholder="ニックネーム（例: taro, 太郎）"
            className="w-full px-4 py-3 bg-dark border border-slate-600 rounded-lg text-white text-lg
                       focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            maxLength={30}
            autoFocus
          />
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleEnter('practice')}
            disabled={loading}
            className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl
                       transition-all duration-200 disabled:opacity-50 text-lg"
          >
            🎯 練習モード
          </button>
          <button
            onClick={() => handleEnter('battle')}
            disabled={loading}
            className="py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl
                       transition-all duration-200 disabled:opacity-50 text-lg"
          >
            ⚔️ 対戦モード
          </button>
        </div>

        <p className="mt-6 text-center text-slate-500 text-sm">
          ニックネームは30文字以内 · スコアは自動保存されます
        </p>
      </div>
    </div>
  );
}
