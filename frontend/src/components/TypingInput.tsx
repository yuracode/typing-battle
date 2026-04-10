import { useEffect, useRef, useState } from 'react';
import {
  tokenize,
  processKey,
  getHint,
  getProgress,
  EngineState,
} from '../utils/romajiEngine';

interface Props {
  /** direct: コードなど完全一致 / romaji: かな→ローマ字エンジン */
  mode: 'direct' | 'romaji';
  /** direct モード: コード文字列 / romaji モード: ひらがな文字列 */
  target: string;
  onProgress: (progress: number, wpm: number, typedChars: number) => void;
  onComplete: (wpm: number, accuracy: number, durationMs?: number, mistakes?: number, typedChars?: number) => void;
  disabled?: boolean;
  startTime: number | null;
}

function calcWpm(charCount: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  return Math.round((charCount / 5) / (elapsedMs / 60000));
}

// ─── direct モード用 state ───
interface DirectState {
  position: number;
  mistakes: number;
  flash: boolean; // 誤入力フラッシュ用
}

export default function TypingInput({
  mode,
  target,
  onProgress,
  onComplete,
  disabled,
  startTime,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // romaji モード
  const [engine, setEngine] = useState<EngineState | null>(null);
  // direct モード
  const [direct, setDirect] = useState<DirectState>({ position: 0, mistakes: 0, flash: false });
  // 打鍵数カウンター
  const typedCharsRef = useRef(0);

  // target / mode 変更時にリセット
  useEffect(() => {
    typedCharsRef.current = 0;
    if (mode === 'romaji') {
      setEngine({ tokens: tokenize(target), tokenIdx: 0, buffer: '', mistakes: 0 });
    } else {
      setDirect({ position: 0, mistakes: 0, flash: false });
    }
    if (!disabled) containerRef.current?.focus();
  }, [target, mode]);

  useEffect(() => {
    if (!disabled) containerRef.current?.focus();
  }, [disabled]);

  // 頻繁な progress_update 再レンダリングでフォーカスが外れるのを防止
  useEffect(() => {
    if (disabled) return;
    const interval = setInterval(() => {
      if (document.activeElement !== containerRef.current) {
        containerRef.current?.focus();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || !startTime) return;

    const key = e.key;

    // ブラウザのデフォルト動作を抑制（スクロール・フォーム送信など）
    if (key.length === 1 || key === 'Backspace' || key === 'Enter') e.preventDefault();

    if (key.length > 1 && key !== 'Backspace' && key !== 'Enter') return;

    // コードスニペットの改行は Enter → '\n' に変換
    const actualKey = key === 'Enter' ? '\n' : key;

    const elapsed = Date.now() - startTime;

    // ─── romaji モード ───
    if (mode === 'romaji' && engine) {
      if (actualKey === 'Backspace') {
        // バッファを1文字削除 / 空なら前トークンへ
        if (engine.buffer.length > 0) {
          setEngine({ ...engine, buffer: engine.buffer.slice(0, -1) });
        } else if (engine.tokenIdx > 0) {
          setEngine({ ...engine, tokenIdx: engine.tokenIdx - 1, buffer: '' });
        }
        return;
      }

      const result = processKey(engine, actualKey);
      setEngine(result.newState);

      if (result.accepted) {
        typedCharsRef.current++;
        const progress = getProgress(result.newState);
        const wpm = calcWpm(typedCharsRef.current, elapsed);
        onProgress(progress, wpm, typedCharsRef.current);

        if (result.allCompleted) {
          const totalInput = typedCharsRef.current + result.newState.mistakes;
          const accuracy = totalInput > 0 ? Math.round((typedCharsRef.current / totalInput) * 100) : 100;
          onComplete(wpm, accuracy, elapsed, result.newState.mistakes, typedCharsRef.current);
        }
      }
      // 不正解は state.mistakes が増えるだけ（ブロック）
      return;
    }

    // ─── direct モード ───
    if (mode === 'direct') {
      if (actualKey === 'Backspace') {
        if (direct.position > 0) {
          setDirect((prev) => ({ ...prev, position: prev.position - 1 }));
        }
        return;
      }

      if (actualKey === target[direct.position]) {
        // 正解
        typedCharsRef.current++;
        const newPos = direct.position + 1;
        const progress = Math.round((newPos / target.length) * 100);
        const wpm = calcWpm(typedCharsRef.current, elapsed);
        onProgress(progress, wpm, typedCharsRef.current);
        setDirect((prev) => ({ ...prev, position: newPos }));

        if (newPos === target.length) {
          const totalInput = typedCharsRef.current + direct.mistakes;
          const accuracy = totalInput > 0 ? Math.round((typedCharsRef.current / totalInput) * 100) : 100;
          onComplete(wpm, accuracy, elapsed, direct.mistakes, typedCharsRef.current);
        }
      } else {
        // 誤入力: ブロック + フラッシュ
        setDirect((prev) => ({ ...prev, mistakes: prev.mistakes + 1, flash: true }));
        setTimeout(() => setDirect((prev) => ({ ...prev, flash: false })), 150);
      }
    }
  };

  // ─── 表示 ───

  const progress =
    mode === 'romaji' && engine
      ? getProgress(engine)
      : target.length > 0
      ? Math.round((direct.position / target.length) * 100)
      : 0;

  return (
    <div className="space-y-3">
      {/* テキスト表示 */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="outline-none cursor-text"
        onClick={() => containerRef.current?.focus()}
      >
        {mode === 'romaji' && engine ? (
          <RomajiDisplay engine={engine} flash={false} />
        ) : (
          <DirectDisplay target={target} position={direct.position} flash={direct.flash} />
        )}
      </div>

      {/* 進捗バー */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div
          className="bg-sky-400 h-2 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* フォーカス案内 */}
      {!disabled && (
        <p className="text-slate-400 dark:text-slate-500 text-xs text-center">
          クリックまたはフォーカスしてから入力してください
        </p>
      )}
    </div>
  );
}

// ─── ローマ字モード表示 ───
function RomajiDisplay({ engine }: { engine: EngineState; flash: boolean }) {
  const { tokens, tokenIdx, buffer } = engine;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 space-y-3">
      {/* かな文字列（進捗） */}
      <div className="flex flex-wrap gap-0.5 text-2xl leading-relaxed font-sans">
        {tokens.map((token, i) => {
          if (i < tokenIdx) {
            return (
              <span key={i} className="text-green-400">
                {token.kana}
              </span>
            );
          }
          if (i === tokenIdx) {
            return (
              <span key={i} className="text-yellow-300 border-b-2 border-yellow-400">
                {token.kana}
              </span>
            );
          }
          return (
            <span key={i} className="text-slate-400 dark:text-slate-500">
              {token.kana}
            </span>
          );
        })}
      </div>

      {/* 現在のローマ字入力ヒント */}
      {tokenIdx < tokens.length && (
        <div className="font-mono text-lg">
          {(() => {
            const { typed, remaining } = getHint(tokens[tokenIdx], buffer);
            return (
              <>
                <span className="text-sky-400">{typed}</span>
                <span className="text-slate-500 dark:text-slate-400">{remaining}</span>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── ダイレクトモード表示（コードなど）───
function DirectDisplay({
  target,
  position,
  flash,
}: {
  target: string;
  position: number;
  flash: boolean;
}) {
  return (
    <div
      className={`font-mono text-xl leading-relaxed bg-white dark:bg-slate-800 rounded-lg p-4 select-none whitespace-pre-wrap transition-colors duration-75 ${
        flash ? 'bg-red-100/80 dark:bg-red-900/40' : ''
      }`}
      style={{ fontVariantLigatures: 'none' }}
    >
      {target.split('').map((char, i) => {
        let cls = 'char-pending';
        if (i < position) cls = 'char-correct';
        else if (i === position) cls = 'char-current';

        if (char === '\n') {
          return (
            <span key={i} className={cls}>
              ↵<br />
            </span>
          );
        }
        return (
          <span key={i} className={cls}>
            {char}
          </span>
        );
      })}
    </div>
  );
}
