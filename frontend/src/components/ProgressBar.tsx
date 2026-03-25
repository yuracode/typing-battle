import { PlayerProgress } from '../types';

interface Props {
  players: PlayerProgress[];
  myNickname: string;
  totalTopics?: number;
}

export default function ProgressBar({ players, myNickname, totalTopics = 1 }: Props) {
  // 完了問題数→現問題進捗で総合ソート
  const sorted = [...players].sort((a, b) => {
    const scoreA = (a.completedCount ?? 0) * 100 + (a.progress ?? 0);
    const scoreB = (b.completedCount ?? 0) * 100 + (b.progress ?? 0);
    return scoreB - scoreA;
  });

  return (
    <div className="space-y-3">
      {sorted.map((p, i) => {
        const completed = p.completedCount ?? 0;
        const overallPct = totalTopics > 1
          ? Math.round((completed + p.progress / 100) / totalTopics * 100)
          : p.progress;

        return (
          <div key={p.nickname} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={`font-semibold ${p.nickname === myNickname ? 'text-sky-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {i + 1}位 {p.nickname}
                {p.nickname === myNickname && ' 👤'}
                {p.finished && ' ✅'}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">
                {totalTopics > 1 && (
                  <span className="mr-2 text-emerald-400 font-bold">{completed}/{totalTopics}問</span>
                )}
                {p.wpm} WPM
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-200 ${
                  p.nickname === myNickname ? 'bg-sky-400' : 'bg-emerald-500'
                } ${p.finished ? 'opacity-60' : ''}`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
