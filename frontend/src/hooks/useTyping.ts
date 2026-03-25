import { useState, useCallback, useRef } from 'react';

interface UseTypingOptions {
  text: string;
  onComplete?: (wpm: number, accuracy: number) => void;
  onProgress?: (progress: number, wpm: number) => void;
}

export function useTyping({ text, onComplete, onProgress }: UseTypingOptions) {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const isCompleted = useRef(false);

  const reset = useCallback(() => {
    setInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setErrors(0);
    isCompleted.current = false;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isCompleted.current) return;

    const key = e.key;
    if (key === 'Backspace') {
      setInput((prev) => prev.slice(0, -1));
      return;
    }
    if (key.length !== 1) return;

    if (!startTime) setStartTime(Date.now());

    const nextInput = input + key;
    const expectedChar = text[input.length];
    const isCorrect = key === expectedChar;

    setTotalKeystrokes((t) => t + 1);
    if (!isCorrect) setErrors((e) => e + 1);

    setInput(nextInput);

    // WPM計算
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const words = nextInput.length / 5;
      const currentWpm = Math.round(words / elapsed);
      const currentAccuracy = Math.round(((totalKeystrokes + 1 - (isCorrect ? errors : errors + 1)) / (totalKeystrokes + 1)) * 100);
      setWpm(currentWpm);
      setAccuracy(currentAccuracy);

      const progress = Math.round((nextInput.length / text.length) * 100);
      onProgress?.(progress, currentWpm);

      if (nextInput === text && !isCompleted.current) {
        isCompleted.current = true;
        onComplete?.(currentWpm, currentAccuracy);
      }
    }
  }, [input, text, startTime, totalKeystrokes, errors, onComplete, onProgress]);

  // 文字ごとの状態を返す
  const chars = text.split('').map((char, i) => {
    if (i < input.length) {
      return { char, status: input[i] === char ? 'correct' : 'incorrect' } as const;
    }
    if (i === input.length) return { char, status: 'current' } as const;
    return { char, status: 'pending' } as const;
  });

  return { chars, input, wpm, accuracy, handleKeyDown, reset };
}
