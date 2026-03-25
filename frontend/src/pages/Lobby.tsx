import { useState } from 'react';
import { AppPage } from '../types';

interface Props {
  onEnter: (nickname: string, page: AppPage) => void;
  onViewRanking: () => void;
}

const STORAGE_KEY = 'typing_battle_nickname';

export default function Lobby({ onEnter, onViewRanking }: Props) {
  const isHost = new URLSearchParams(window.location.search).get('host') === '1';
  const [nickname, setNickname] = useState(() => localStorage.getItem(STORAGE_KEY) ?? '');
  const [error, setError] = useState('');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'confirm' | 'done'>('idle');

  const handleDeleteAll = async () => {
    setDeleteStatus('idle');
    try {
      const res = await fetch('/api/scores/all', { method: 'DELETE' });
      const data = await res.json();
      alert(`✅ ${data.deleted} 件の履歴を削除しました。`);
      setDeleteStatus('done');
    } catch {
      alert('❌ 削除に失敗しました。');
    }
  };

  const validate = () => {
    if (nickname.trim().length === 0) return 'ニックネームを入力してください';
    if (nickname.trim().length > 10) return '10文字以内で入力してください';
    return '';
  };

  const handleSelect = (page: AppPage) => {
    const err = validate();
    if (err) { setError(err); return; }
    localStorage.setItem(STORAGE_KEY, nickname.trim());
    onEnter(nickname.trim(), page);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-10 w-full max-w-md space-y-8">
        {/* タイトル */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-sky-400 tracking-tight">⌨️ Typing Battle</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">授業用タイピング対戦アプリ</p>
        </div>

        {/* ニックネーム入力 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            ニックネーム（1〜10文字）
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => { setNickname(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect('practice')}
            maxLength={10}
            placeholder="例: tanaka, sato123"
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600
                       focus:border-sky-400 focus:outline-none text-lg"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* モード選択 */}
        <div className="space-y-3">
          <button
            onClick={() => handleSelect('practice')}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-4 px-6
                       rounded-xl transition-colors text-lg"
          >
            🏃 練習モード
            <p className="text-sm font-normal text-sky-200 mt-1">
              自分のペースで練習・スコア確認
            </p>
          </button>

          <button
            onClick={() => handleSelect('battle')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6
                       rounded-xl transition-colors text-lg"
          >
            ⚔️ 対戦モード
            <p className="text-sm font-normal text-emerald-200 mt-1">
              みんなとリアルタイム対戦！
            </p>
          </button>

          <button
            onClick={onViewRanking}
            className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium py-3 px-6
                       rounded-xl transition-colors text-sm"
          >
            🏆 ランキングを見る
          </button>
        </div>

        {/* 先生用管理エリア */}
        {isHost && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center">先生メニュー</p>
            {deleteStatus !== 'confirm' ? (
              <button
                onClick={() => setDeleteStatus('confirm')}
                className="w-full bg-red-100/80 dark:bg-red-900/40 hover:bg-red-800/60 text-red-600 dark:text-red-400 font-medium py-3 px-6
                           rounded-xl transition-colors text-sm border border-red-300 dark:border-red-800/50"
              >
                🗑 全員の履歴を削除する
              </button>
            ) : (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4 space-y-3">
                <p className="text-red-600 dark:text-red-300 text-sm text-center font-bold">
                  ⚠️ 全員のスコア履歴を完全に削除します。<br />この操作は元に戻せません。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    削除する
                  </button>
                  <button
                    onClick={() => setDeleteStatus('idle')}
                    className="flex-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-lg transition-colors text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
