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
  onProgress: (progress: number, wpm: number, typedChars: number, mistakes: number) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  // romaji モード
  const [engine, setEngine] = useState<EngineState | null>(null);
  // direct モード
  const [direct, setDirect] = useState<DirectState>({ position: 0, mistakes: 0, flash: false });
  // 打鍵数カウンター
  const typedCharsRef = useRef(0);
  // IME 変換中フラグ
  const [isComposing, setIsComposing] = useState(false);

  // target / mode 変更時にリセット
  useEffect(() => {
    typedCharsRef.current = 0;
    if (mode === 'romaji') {
      setEngine({ tokens: tokenize(target), tokenIdx: 0, buffer: '', mistakes: 0 });
    } else {
      setDirect({ position: 0, mistakes: 0, flash: false });
    }
    if (inputRef.current) inputRef.current.value = '';
    if (!disabled) inputRef.current?.focus();
  }, [target, mode]);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  // 頻繁な再レンダリングでフォーカスが外れるのを防止
  useEffect(() => {
    if (disabled) return;
    const interval = setInterval(() => {
      if (!isComposing && document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [disabled, isComposing]);

  // ─── direct モード: 1文字を判定 ───
  const processDirectChar = (ch: string) => {
    if (!startTime) return;
    const elapsed = Date.now() - startTime;
    setDirect((prev) => {
      // 既に完了済みなら無視
      if (prev.position >= target.length) return prev;

      if (ch === target[prev.position]) {
        typedCharsRef.current++;
        const newPos = prev.position + 1;
        const progress = Math.round((newPos / target.length) * 100);
        const wpm = calcWpm(typedCharsRef.current, elapsed);
        onProgress(progress, wpm, typedCharsRef.current, prev.mistakes);
        if (newPos === target.length) {
          const totalInput = typedCharsRef.current + prev.mistakes;
          const accuracy = totalInput > 0 ? Math.round((typedCharsRef.current / totalInput) * 100) : 100;
          onComplete(wpm, accuracy, elapsed, prev.mistakes, typedCharsRef.current);
        }
        return { ...prev, position: newPos };
      } else {
        const newMistakes = prev.mistakes + 1;
        const progress = target.length > 0 ? Math.round((prev.position / target.length) * 100) : 0;
        const wpm = calcWpm(typedCharsRef.current, elapsed);
        onProgress(progress, wpm, typedCharsRef.current, newMistakes);
        setTimeout(() => setDirect((p) => ({ ...p, flash: false })), 150);
        return { ...prev, mistakes: newMistakes, flash: true };
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !startTime) return;

    // IME 変換中はネイティブの IME に委ねる
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;

    const key = e.key;

    // ブラウザのデフォルト動作を抑制（input への文字挿入・フォーム送信など）
    if (key.length === 1 || key === 'Backspace' || key === 'Enter' || key === 'Tab') e.preventDefault();

    if (key.length > 1 && key !== 'Backspace' && key !== 'Enter' && key !== 'Tab') return;

    // コードスニペットの改行は Enter → '\n' に変換
    const actualKey = key === 'Enter' ? '\n' : key;

    const elapsed = Date.now() - startTime;

    // ─── romaji モード ───
    if (mode === 'romaji' && engine) {
      // 日本語モードでは Tab は無視
      if (key === 'Tab') return;
      if (actualKey === 'Backspace') {
        if (engine.buffer.length > 0) {
          setEngine({ ...engine, buffer: engine.buffer.slice(0, -1) });
        } else if (engine.tokenIdx > 0) {
          setEngine({ ...engine, tokenIdx: engine.tokenIdx - 1, buffer: '' });
        }
        return;
      }

      const result = processKey(engine, actualKey);
      setEngine(result.newState);

      if (result.accepted) typedCharsRef.current++;

      const progress = getProgress(result.newState);
      const wpm = calcWpm(typedCharsRef.current, elapsed);
      onProgress(progress, wpm, typedCharsRef.current, result.newState.mistakes);

      if (result.accepted && result.allCompleted) {
        const totalInput = typedCharsRef.current + result.newState.mistakes;
        const accuracy = totalInput > 0 ? Math.round((typedCharsRef.current / totalInput) * 100) : 100;
        onComplete(wpm, accuracy, elapsed, result.newState.mistakes, typedCharsRef.current);
      }
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

      // Tab: 次の4文字がすべてスペースなら +4進める（1打鍵としてカウント）
      if (key === 'Tab') {
        const pos = direct.position;
        if (target.slice(pos, pos + 4) === '    ') {
          typedCharsRef.current++;
          const newPos = pos + 4;
          const progress = Math.round((newPos / target.length) * 100);
          const wpm = calcWpm(typedCharsRef.current, elapsed);
          onProgress(progress, wpm, typedCharsRef.current, direct.mistakes);
          setDirect((prev) => ({ ...prev, position: newPos }));

          if (newPos === target.length) {
            const totalInput = typedCharsRef.current + direct.mistakes;
            const accuracy = totalInput > 0 ? Math.round((typedCharsRef.current / totalInput) * 100) : 100;
            onComplete(wpm, accuracy, elapsed, direct.mistakes, typedCharsRef.current);
          }
        } else {
          // 残りスペース3個以下 or 非スペース混在 → ミス扱い
          const newMistakes = direct.mistakes + 1;
          setDirect((prev) => ({ ...prev, mistakes: newMistakes, flash: true }));
          const progress = target.length > 0 ? Math.round((pos / target.length) * 100) : 0;
          const wpm = calcWpm(typedCharsRef.current, elapsed);
          onProgress(progress, wpm, typedCharsRef.current, newMistakes);
          setTimeout(() => setDirect((prev) => ({ ...prev, flash: false })), 150);
        }
        return;
      }

      processDirectChar(actualKey);
    }
  };

  // IME 変換確定時：確定文字を1文字ずつ direct マッチャに通す
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    // 入力欄に残った確定文字をクリア
    if (inputRef.current) inputRef.current.value = '';
    if (disabled || !startTime) return;
    // romaji モードでは IME 入力は使わない（ASCII 入力のみ）
    if (mode !== 'direct') return;
    const text = e.data || '';
    for (const ch of text) {
      processDirectChar(ch);
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
    <div className="space-y-3" onClick={() => inputRef.current?.focus()}>
      {/* テキスト表示 */}
      {mode === 'romaji' && engine ? (
        <RomajiDisplay engine={engine} flash={false} />
      ) : (
        <DirectDisplay target={target} position={direct.position} flash={direct.flash} />
      )}

      {/* キー入力 / IME 取り込み用 input */}
      <input
        ref={inputRef}
        type="text"
        defaultValue=""
        onKeyDown={handleKeyDown}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={handleCompositionEnd}
        onPaste={(e) => e.preventDefault()}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="タイピング入力"
        className={
          mode === 'direct'
            ? `w-full px-3 py-2 rounded-lg font-mono text-base outline-none transition-colors bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border ${
                isComposing
                  ? 'border-sky-400 dark:border-sky-500 ring-2 ring-sky-200 dark:ring-sky-900'
                  : 'border-slate-300 dark:border-slate-600'
              } focus:border-sky-400 dark:focus:border-sky-500`
            : 'sr-only'
        }
        placeholder={mode === 'direct' ? '日本語(IME)入力中はここに変換中の文字が出ます' : ''}
      />

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
          {mode === 'direct'
            ? '英数字は直接判定／日本語は IME で変換確定すると自動判定されます'
            : 'クリックまたはフォーカスしてから入力してください'}
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
