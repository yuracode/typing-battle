import { useEffect, useState } from 'react';
import { ScoreRecord } from '../types';

interface Props {
  userId: string;
  nickname: string;
  onBack: () => void;
}

export default function Stats({ userId, nickname, onBack }: Props) {
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/scores/history/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const practiceScores = history.filter((s) => s.mode === 'practice');
  const battleScores = history.filter((s) => s.mode === 'battle');
  const bestWpm = history.length > 0 ? Math.max(...history.map((s) => s.wpm)) : 0;
  const avgAccuracy =
    history.length > 0
      ? Math.round(history.reduce((sum, s) => sum + Number(s.accuracy ?? 0), 0) / history.length)
      : 0;
  const bestPracticeWpm =
    practiceScores.length > 0 ? Math.max(...practiceScores.map((s) => s.wpm)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
        >
          ← 練習に戻る
        </button>
        <div className="text-slate-700 dark:text-slate-300 text-sm">
          👤 <span className="text-sky-400 font-bold">{nickname}</span> の成績
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-sky-400">{bestWpm}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">ベスト WPM</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-emerald-400">{avgAccuracy}%</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">平均正確率</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-400">{practiceScores.length}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">練習回数</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-400">{battleScores.length}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">対戦回数</p>
        </div>
      </div>

      {/* 練習ベスト */}
      {practiceScores.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <span className="text-2xl">🏅</span>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">練習モード ベストスコア</p>
            <p className="text-slate-900 dark:text-white font-bold">
              <span className="text-sky-400 text-xl">{bestPracticeWpm} WPM</span>
            </p>
          </div>
        </div>
      )}

      {/* 全記録リスト */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
        <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4">📜 全記録（最新50件）</h3>
        {loading ? (
          <p className="text-slate-400 dark:text-slate-500 text-center py-8">読み込み中...</p>
        ) : history.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-center py-8">まだ記録がありません</p>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {history.map((s, i) => (
              <div
                key={i}
                className="bg-slate-100 dark:bg-slate-700 rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      s.mode === 'practice'
                        ? 'bg-sky-800 text-sky-200'
                        : 'bg-emerald-800 text-emerald-200'
                    }`}
                  >
                    {s.mode === 'practice' ? '練習' : '対戦'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs">
                    {new Date(s.created_at).toLocaleString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sky-400 font-bold">{s.wpm} WPM</span>
                  <span className="text-emerald-400 text-sm w-12 text-right">{s.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
