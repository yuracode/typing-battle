export type TopicFilterValue = 'all' | 'japanese' | 'java' | 'javascript' | 'python' | 'html' | 'css';

interface Option {
  value: TopicFilterValue;
  label: string;
  color: string;
}

const OPTIONS: Option[] = [
  { value: 'all',        label: 'すべて',     color: 'bg-slate-600 hover:bg-slate-500 data-[active=true]:bg-slate-400' },
  { value: 'japanese',   label: '🇯🇵 日本語', color: 'bg-purple-700 hover:bg-purple-600 data-[active=true]:bg-purple-500' },
  { value: 'java',       label: 'Java',       color: 'bg-amber-700  hover:bg-amber-600  data-[active=true]:bg-amber-500'  },
  { value: 'javascript', label: 'JavaScript', color: 'bg-yellow-600 hover:bg-yellow-500 data-[active=true]:bg-yellow-400 data-[active=true]:text-black' },
  { value: 'python',     label: 'Python',     color: 'bg-sky-700    hover:bg-sky-600    data-[active=true]:bg-sky-500'    },
  { value: 'html',       label: 'HTML',       color: 'bg-orange-700 hover:bg-orange-600 data-[active=true]:bg-orange-500' },
  { value: 'css',        label: 'CSS',        color: 'bg-blue-700   hover:bg-blue-600   data-[active=true]:bg-blue-500'   },
];

/** APIクエリパラメータに変換 */
export function filterToParams(filter: TopicFilterValue): URLSearchParams {
  const p = new URLSearchParams();
  if (filter === 'japanese') { p.set('type', 'japanese'); }
  else if (filter !== 'all') { p.set('type', 'code'); p.set('language', filter); }
  return p;
}

/** start_battle に渡すオブジェクトに変換 */
export function filterToTopicFilter(filter: TopicFilterValue): { type?: string; language?: string } | undefined {
  if (filter === 'all') return undefined;
  if (filter === 'japanese') return { type: 'japanese' };
  return { type: 'code', language: filter };
}

interface Props {
  value: TopicFilterValue;
  onChange: (v: TopicFilterValue) => void;
  disabled?: boolean;
}

export default function TopicFilterBar({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          data-active={value === opt.value}
          onClick={() => !disabled && onChange(opt.value)}
          disabled={disabled}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed ${opt.color}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
