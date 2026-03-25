import { useEffect, useState } from 'react';

interface RankingEntry {
  nickname: string;
  best_wpm: number;
  avg_accuracy: number;
  games: number;
}

interface Props {
  nickname?: string;
  onBack: () => void;
}

const medalEmoji = ['🥇', '🥈', '🥉'];

export default function Ranking({ nickname, onBack }: Props) {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scores/ranking')
      .then((r) => r.json())
      .then((data) => {
        setRanking(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
            <p className="text-sky-400 font-bold text-xl">{myEntry.best_wpm} WPM</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs">{myEntry.games}回プレイ</p>
          </div>
        </div>
      )}

      {/* ランキングリスト */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">練習モードのベストWPM順（上位30名）</p>
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
                  <p className="font-bold text-sky-400">{r.best_wpm} WPM</p>
                  <p className="text-emerald-400 text-xs">
                    正確率 {Math.round(Number(r.avg_accuracy))}%
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
