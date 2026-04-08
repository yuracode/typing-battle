import { useEffect, useState } from 'react';

interface RankingEntry {
  nickname: string;
  best_chars: number;
  best_wpm: number;
  avg_accuracy: number;
  games: number;
  best_kpm: number;
}

interface Props {
  nickname?: string;
  onBack: () => void;
}

const medalEmoji = ['🥇', '🥈', '🥉'];

type RankSort = 'chars' | 'kpm' | 'accuracy';

export default function Ranking({ nickname, onBack }: Props) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<RankSort>('chars');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/scores/ranking?sort=${sortBy}`)
      .then((r) => r.json())
      .then((data) => {
        setRanking(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sortBy]);

  const myEntry = ranking.find((r) => r.nickname === nickname);
  const myRank = myEntry ? ranking.indexOf(myEntry) + 1 : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
        >
          ← 戻る
        </button>
        <h2 className="text-2xl font-bold text-yellow-400">🏆 ランキング</h2>
      </div>

      {/* 自分の順位（ログイン済みの場合） */}
      {nickname && myEntry && (
        <div className="bg-sky-100/80 dark:bg-sky-600/20 border border-sky-400 dark:border-sky-500 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{medalEmoji[myRank! - 1] ?? `${myRank}位`}</span>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">あなたの順位</p>
              <p className="text-sky-300 font-bold">{nickname}</p>
            </div>
          </div>
          <div className="text-right">
            {sortBy === 'kpm' ? (
              <p className="text-amber-400 font-bold text-xl">{myEntry.best_kpm} 打/分</p>
            ) : sortBy === 'accuracy' ? (
              <p className="text-emerald-400 font-bold text-xl">{Math.round(Number(myEntry.avg_accuracy))}%</p>
            ) : (
              <p className="text-sky-400 font-bold text-xl">{myEntry.best_chars} 打</p>
            )}
            <p className="text-slate-500 dark:text-slate-400 text-xs">{myEntry.games}回プレイ</p>
          </div>
        </div>
      )}

      {/* ランキングリスト */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
        {/* ソートタブ */}
        <div className="flex gap-1 mb-4">
          {([
            { key: 'chars',    label: '打鍵数',   color: 'bg-sky-600' },
            { key: 'kpm',      label: '打鍵/分',  color: 'bg-amber-600' },
            { key: 'accuracy', label: '正確率',   color: 'bg-emerald-600' },
          ] as { key: RankSort; label: string; color: string }[]).map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                sortBy === key ? `${color} text-white` : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {label}順
            </button>
          ))}
        </div>
        {loading ? (
          <p className="text-slate-400 dark:text-slate-500 text-center py-8">読み込み中...</p>
        ) : ranking.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-center py-8">まだ記録がありません</p>
        ) : (
          <div className="space-y-2">
            {ranking.map((r, i) => (
              <div
                key={r.nickname}
                className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                  r.nickname === nickname
                    ? 'bg-sky-100/80 dark:bg-sky-600/30 border border-sky-400 dark:border-sky-500'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">
                    {medalEmoji[i] ?? <span className="text-slate-500 dark:text-slate-400 text-base">{i + 1}</span>}
                  </span>
                  <div>
                    <span
                      className={`font-semibold ${
                        r.nickname === nickname ? 'text-sky-300' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {r.nickname}
                      {r.nickname === nickname && ' 👤'}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{r.games}回プレイ</p>
                  </div>
                </div>
                <div className="text-right">
                  {sortBy === 'kpm' ? (
                    <p className="font-bold text-amber-400">{r.best_kpm} 打/分</p>
                  ) : sortBy === 'accuracy' ? (
                    <p className="font-bold text-emerald-400">{Math.round(Number(r.avg_accuracy))}%</p>
                  ) : (
                    <p className="font-bold text-sky-400">{r.best_chars} 打</p>
                  )}
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {sortBy !== 'accuracy' && `正確率 ${Math.round(Number(r.avg_accuracy))}% · `}{r.games}回
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
