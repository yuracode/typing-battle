interface Props {
  count: number;
}

export default function Countdown({ count }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="text-center">
        <div className="text-9xl font-bold text-sky-400 animate-ping-once">
          {count === 0 ? 'GO!' : count}
        </div>
        <p className="text-slate-700 dark:text-slate-300 mt-4 text-xl">対戦開始まで...</p>
      </div>
    </div>
  );
}
