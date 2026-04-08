import { useState } from 'react';
import { BattleRanking } from '../types';

interface Props {
  rankings: BattleRanking[];
  nickname: string;
  onReturnLobby: () => void;
}

const medalEmoji = ['🥇', '🥈', '🥉'];

type ResultSort = 'chars' | 'kpm' | 'accuracy';

export default function Result({ rankings, nickname, onReturnLobby }: Props) {
  const [sortBy, setSortBy] = useState<ResultSort>('chars');

  const sorted = [...rankings].sort((a, b) => {
    if (sortBy === 'kpm')      return (b.kpm ?? 0) - (a.kpm ?? 0);
    if (sortBy === 'accuracy') return Number(b.accuracy) - Number(a.accuracy);
    return b.typedChars - a.typedChars;
  }).map((r, i) => ({ ...r, displayRank: i + 1 }));

  const myRank = rankings.find((r) => r.nickname === nickname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-lg space-y-6">
        <h2 className="text-3xl font-bold text-center text-yellow-400">🏆 対戦結果</h2>

        {/* 自分の結果 */}
        {myRank && (
          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 text-center space-y-2">
            <p className="text-slate-500 dark:text-slate-400 text-sm">あなたの結果</p>
            <p className="text-4xl font-bold text-sky-400">
              {medalEmoji[myRank.rank - 1] ?? `${myRank.rank}位`}
            </p>
            <div className="flex justify-center gap-6">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{myRank.typedChars}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">打鍵数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-400">{myRank.accuracy}%</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs">正確率</p>
              </div>
              {myRank.completedCount > 0 && (
                <div>
                  <p className="text-2xl font-bold text-purple-400">{myRank.completedCount}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">完了問題</p>
                </div>
              )}
            </div>
            {!myRank.finished && (
              <p className="text-red-400 text-sm">⏱ タイムアップ（{myRank.progress}%完了）</p>
            )}
          </div>
        )}

        {/* ソートタブ */}
        <div className="flex gap-1">
          {([
            { key: 'chars',    label: '打鍵数',   color: 'bg-sky-600' },
            { key: 'kpm',      label: '打鍵/分',  color: 'bg-amber-600' },
            { key: 'accuracy', label: '正確率',   color: 'bg-emerald-600' },
          ] as { key: ResultSort; label: string; color: string }[]).map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                sortBy === key ? `${color} text-white` : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {label}順
            </button>
          ))}
        </div>

        {/* 全体ランキング */}
        <div className="space-y-2">
          {sorted.map((r) => (
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
                  {medalEmoji[r.displayRank - 1] ?? `${r.displayRank}`}
                </span>
                <span className={`font-semibold ${r.nickname === nickname ? 'text-sky-300' : 'text-slate-900 dark:text-white'}`}>
                  {r.nickname}
                  {r.nickname === nickname && ' 👤'}
                </span>
              </div>
              <div className="text-right">
                {r.completedCount > 0 && (
                  <span className="text-purple-400 text-xs mr-2">{r.completedCount}問</span>
                )}
                {sortBy === 'kpm' ? (
                  <span className="font-bold text-amber-400">{r.kpm ?? 0} 打/分</span>
                ) : sortBy === 'accuracy' ? (
                  <span className="font-bold text-emerald-400">{r.accuracy}%</span>
                ) : (
                  <span className="font-bold text-sky-400">{r.typedChars} 打</span>
                )}
                {sortBy !== 'accuracy' && (
                  <span className="text-emerald-400 text-sm ml-2">{r.accuracy}%</span>
                )}
                {!r.finished && (
                  <span className="text-slate-500 dark:text-slate-400 text-xs ml-2">({r.progress}%)</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onReturnLobby}
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition-colors"
        >
          🏠 ロビーへ戻る
        </button>
      </div>
    </div>
  );
}
