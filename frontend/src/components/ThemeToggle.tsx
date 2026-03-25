interface Props {
  dark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ dark, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full shadow-lg
                 bg-slate-700 hover:bg-slate-600 dark:bg-slate-200 dark:hover:bg-white
                 text-slate-200 dark:text-slate-800
                 flex items-center justify-center text-lg transition-colors"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
