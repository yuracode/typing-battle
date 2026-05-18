import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Problem, ScoreRecord } from '../types';
import TypingInput from '../components/TypingInput';
import TopicFilterBar, { TopicFilterValue, filterToParams } from '../components/TopicFilter';
import { toHiragana } from '../utils/romajiEngine';

interface Props {
  socket: Socket;
  nickname: string;
  userId: string;
  onBack: () => void;
  onViewStats: () => void;
  onViewRanking: () => void;
}

type Phase = 'loading' | 'ready' | 'typing' | 'done';

interface SessionResult {
  topicsCompleted: number;
  totalTypedChars: number;
  totalMistakes: number;
  durationMs: number;
  timeLimitSec: number;
}

const TIME_LIMIT_OPTIONS: { label: string; value: number }[] = [
  { label: '無制限', value: 0 },
  { label: '1分',   value: 60 },
  { label: '3分',   value: 180 },
  { label: '5分',   value: 300 },
];

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function Practice({ socket, nickname, userId, onBack, onViewStats, onViewRanking }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [result, setResult] = useState<{ wpm: number; accuracy: number; durationMs?: number; mistakes?: number; typedChars?: number } | null>(null);
  const [history, setHistory] = useState<ScoreRecord[]>([]);
  const [currentWpm, setCurrentWpm] = useState(0);
  const [topicFilter, setTopicFilter] = useState<TopicFilterValue>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [historySortBy, setHistorySortBy] = useState<'chars' | 'kpm'>('chars');

  // 時間制限モード（0 = 無制限・既存挙動）
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const sessionStartRef = useRef<number | null>(null);
  const sessionStatsRef = useRef<{ topicsCompleted: number; totalTypedChars: number; totalMistakes: number }>({
    topicsCompleted: 0,
    totalTypedChars: 0,
    totalMistakes: 0,
  });
  // 進行中お題の打鍵状況（時間切れ時に合計へ加算するため）
  const currentTopicStatsRef = useRef<{
    topicId: number | null;
    startedAt: number | null;
    typedChars: number;
    mistakes: number;
  }>({ topicId: null, startedAt: null, typedChars: 0, mistakes: 0 });

  // REST APIでお題取得（フィルタ対応）
  const loadProblem = async (filter: TopicFilterValue = topicFilter) => {
    setPhase('loading');
    setProblem(null);
    setResult(null);
    setStartTime(null);
    try {
      const params = filterToParams(filter);
      const qs = params.toString() ? `?${params}` : '';
      const res = await fetch(`/api/topics/random${qs}`);
      const topic = await res.json();
      if (!topic) { alert('該当するお題がありません'); setPhase('ready'); return; }
      setProblem(topic);
      setPhase('ready');
    } catch {
      alert('お題の取得に失敗しました');
    }
  };

  // スコア履歴をREST APIで取得
  const loadHistory = async () => {
    try {
      const res = await fetch(`/api/scores/history/${userId}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch {}
  };

  // フィルタ変更時にお題を再取得（タイピング中は中断して再取得）
  useEffect(() => {
    loadProblem(topicFilter);
  }, [topicFilter]);

  useEffect(() => {
    loadProblem();
    loadHistory();

    // Socket経由のスコア保存完了通知
    socket.on('practice:saved', ({ score }: { score: ScoreRecord }) => {
      setHistory((prev) => [score, ...prev].slice(0, 10));
    });

    return () => {
      socket.off('practice:saved');
    };
  }, []);

  // 無制限モードで完了後、Enterキーで次のお題を読み込んで即スタート
  useEffect(() => {
    if (phase !== 'done' || timeLimit !== 0 || !result) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        void loadAndStartNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, timeLimit, result]);

  // 時間制限モードのカウントダウン
  useEffect(() => {
    if (timeLimit === 0 || phase !== 'typing') return;
    const start = sessionStartRef.current;
    if (!start) return;
    const tick = () => {
      const remaining = timeLimit * 1000 - (Date.now() - start);
      if (remaining <= 0) {
        setRemainingMs(0);
        finalizeSession();
      } else {
        setRemainingMs(remaining);
      }
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [phase, timeLimit]);

  const finalizeSession = () => {
    const stats = sessionStatsRef.current;
    const current = currentTopicStatsRef.current;
    const start = sessionStartRef.current;
    const elapsed = start ? Math.min(Date.now() - start, timeLimit * 1000) : timeLimit * 1000;

    // 進行中お題で打鍵があれば、その分も保存＆合計に加算
    if (current.topicId !== null && current.typedChars > 0 && current.startedAt) {
      const topicElapsed = Date.now() - current.startedAt;
      const totalInput = current.typedChars + current.mistakes;
      const accuracy = totalInput > 0 ? Math.round((current.typedChars / totalInput) * 100) : 100;
      const wpm = topicElapsed > 0 ? Math.round((current.typedChars / 5) / (topicElapsed / 60000)) : 0;
      socket.emit('practice:complete', {
        userId,
        topicId: current.topicId,
        wpm,
        accuracy,
        typedChars: current.typedChars,
        durationMs: topicElapsed,
      });
      loadHistory();
    }

    const partialTyped = current.topicId !== null ? current.typedChars : 0;
    const partialMistakes = current.topicId !== null ? current.mistakes : 0;

    setSessionResult({
      topicsCompleted: stats.topicsCompleted,
      totalTypedChars: stats.totalTypedChars + partialTyped,
      totalMistakes: stats.totalMistakes + partialMistakes,
      durationMs: elapsed,
      timeLimitSec: timeLimit,
    });
    setPhase('done');
    sessionStartRef.current = null; // 二重発火防止
    currentTopicStatsRef.current = { topicId: null, startedAt: null, typedChars: 0, mistakes: 0 };
  };

  // 無制限モード用：次のお題を読み込んでそのまま開始する（Enterキー用）
  const loadAndStartNext = async () => {
    setPhase('loading');
    setResult(null);
    setStartTime(null);
    try {
      const params = filterToParams(topicFilter);
      const qs = params.toString() ? `?${params}` : '';
      const res = await fetch(`/api/topics/random${qs}`);
      const topic = await res.json();
      if (!topic) { alert('該当するお題がありません'); setPhase('ready'); return; }
      setProblem(topic);
      const now = Date.now();
      currentTopicStatsRef.current = {
        topicId: topic.id,
        startedAt: now,
        typedChars: 0,
        mistakes: 0,
      };
      setStartTime(now);
      setPhase('typing');
    } catch {
      alert('お題の取得に失敗しました');
      setPhase('ready');
    }
  };

  // タイマーを維持したままスキップ（startTime はリセットしない）
  const handleSkip = async () => {
    setResult(null);
    try {
      const params = filterToParams(topicFilter);
      const qs = params.toString() ? `?${params}` : '';
      const res = await fetch(`/api/topics/random${qs}`);
      const topic = await res.json();
      if (!topic) return;
      setProblem(topic);
      currentTopicStatsRef.current = {
        topicId: topic.id,
        startedAt: Date.now(),
        typedChars: 0,
        mistakes: 0,
      };
      setPhase('typing');
    } catch {}
  };

  const handleStart = () => {
    const now = Date.now();
    setPhase('typing');
    setStartTime(now);
    setResult(null);
    setSessionResult(null);
    currentTopicStatsRef.current = {
      topicId: problem?.id ?? null,
      startedAt: now,
      typedChars: 0,
      mistakes: 0,
    };
    if (timeLimit > 0) {
      sessionStartRef.current = now;
      sessionStatsRef.current = { topicsCompleted: 0, totalTypedChars: 0, totalMistakes: 0 };
      setRemainingMs(timeLimit * 1000);
    } else {
      sessionStartRef.current = null;
    }
  };

  // 時間制限モードで現お題完了後に次のお題へ自動遷移
  const advanceToNextTopic = async () => {
    setStartTime(null); // 取得中の打鍵を無効化
    currentTopicStatsRef.current = { topicId: null, startedAt: null, typedChars: 0, mistakes: 0 };
    try {
      const params = filterToParams(topicFilter);
      const qs = params.toString() ? `?${params}` : '';
      const res = await fetch(`/api/topics/random${qs}`);
      const topic = await res.json();
      if (!topic) { finalizeSession(); return; }
      setProblem(topic);
      const now = Date.now();
      currentTopicStatsRef.current = {
        topicId: topic.id,
        startedAt: now,
        typedChars: 0,
        mistakes: 0,
      };
      setStartTime(now);
    } catch {
      finalizeSession();
    }
  };

  // 中断ボタン：時間制限モードはセッション終了、無制限モードはお題差し替え
  const handleAbort = () => {
    if (timeLimit > 0 && sessionStartRef.current) {
      finalizeSession();
    } else {
      loadProblem();
    }
  };

  const handleProgress = (_progress: number, wpm: number, typedChars: number, mistakes: number) => {
    setCurrentWpm(wpm);
    currentTopicStatsRef.current = {
      ...currentTopicStatsRef.current,
      typedChars,
      mistakes,
    };
  };

  const handleComplete = (wpm: number, accuracy: number, durationMs?: number, mistakes?: number, typedChars?: number) => {
    // 1お題ごとのスコアは常に保存
    if (problem) {
      socket.emit('practice:complete', {
        userId,
        topicId: problem.id,
        wpm,
        accuracy,
        typedChars: typedChars ?? 0,
        durationMs: durationMs ?? 0,
      });
      loadHistory();
    }

    if (timeLimit > 0 && sessionStartRef.current) {
      // 時間制限モード：セッション集計に加算して、残時間があれば次お題へ
      sessionStatsRef.current = {
        topicsCompleted: sessionStatsRef.current.topicsCompleted + 1,
        totalTypedChars: sessionStatsRef.current.totalTypedChars + (typedChars ?? 0),
        totalMistakes: sessionStatsRef.current.totalMistakes + (mistakes ?? 0),
      };
      // 完了済みお題は sessionStatsRef に集計済みなので、進行中refはクリア（finalizeSessionでの二重加算防止）
      currentTopicStatsRef.current = { topicId: null, startedAt: null, typedChars: 0, mistakes: 0 };
      const remaining = timeLimit * 1000 - (Date.now() - sessionStartRef.current);
      if (remaining > 0) {
        void advanceToNextTopic();
      } else {
        finalizeSession();
      }
    } else {
      // 無制限モード（既存挙動）：単一お題の結果を表示
      setPhase('done');
      setResult({ wpm, accuracy, durationMs, mistakes, typedChars });
    }
  };

  // 入力対象テキストとモード
  // 日本語: ふりがなをひらがなに変換してローマ字エンジンへ渡す
  // コード: そのまま直接入力
  const typingMode = problem?.type === 'japanese' ? 'romaji' : 'direct';
  const targetText = problem
    ? problem.type === 'japanese' && problem.furigana
      ? toHiragana(problem.furigana)
      : problem.content
    : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm"
        >
          ← ロビーへ戻る
        </button>
        <div className="text-slate-700 dark:text-slate-300 text-sm">
          👤 <span className="text-sky-400 font-bold">{nickname}</span> の練習モード
        </div>
        <div className="flex gap-2">
          <button
            onClick={onViewStats}
            className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            📊 成績
          </button>
          <button
            onClick={onViewRanking}
            className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            🏆 ランキング
          </button>
        </div>
      </div>

      {/* テーマ選択 */}
      <div className="mb-4 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">テーマ:</span>
          <button
            onClick={() => !filterOpen && setFilterOpen(true)}
            disabled={phase === 'typing'}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed ${
              topicFilter === 'all'       ? 'bg-slate-500' :
              topicFilter === 'japanese' ? 'bg-purple-600' :
              topicFilter === 'java'     ? 'bg-amber-600'  :
              topicFilter === 'javascript' ? 'bg-yellow-500 text-black' :
              topicFilter === 'python'   ? 'bg-sky-600'    :
              topicFilter === 'html'     ? 'bg-orange-600' :
              topicFilter === 'css'      ? 'bg-blue-600'   :
              topicFilter === 'typescript' ? 'bg-indigo-600' :
              topicFilter === 'sql'      ? 'bg-teal-600'   :
                                           'bg-blue-600'
            }`}
          >
            {topicFilter === 'all' ? 'すべて' :
             topicFilter === 'japanese' ? '🇯🇵 日本語' :
             topicFilter === 'java' ? 'Java' :
             topicFilter === 'javascript' ? 'JavaScript' :
             topicFilter === 'python' ? 'Python' :
             topicFilter === 'html' ? 'HTML' :
             topicFilter === 'css' ? 'CSS' :
             topicFilter === 'typescript' ? 'TypeScript' : 'SQL'}
            {!filterOpen && phase !== 'typing' && <span className="ml-1 opacity-60">▾</span>}
          </button>
          {filterOpen && (
            <button
              onClick={() => setFilterOpen(false)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs transition-colors"
            >
              ✕ 閉じる
            </button>
          )}
        </div>
        {filterOpen && (
          <TopicFilterBar
            value={topicFilter}
            onChange={(v) => { setTopicFilter(v); setFilterOpen(false); }}
          />
        )}
        {/* 時間制限選択 */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">時間:</span>
          <div className="flex gap-1 flex-wrap">
            {TIME_LIMIT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTimeLimit(opt.value)}
                disabled={phase === 'typing'}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  timeLimit === opt.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* メインエリア */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-4">
            {/* お題情報 */}
            {problem && (
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                  problem.type === 'japanese'
                    ? 'bg-purple-800 text-purple-200'
                    : 'bg-amber-800 text-amber-200'
                }`}>
                  {problem.type === 'japanese' ? '日本語' : problem.language?.toUpperCase()}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-xs">難易度 {'⭐'.repeat(problem.difficulty)}</span>
              </div>
            )}

            {/* 日本語：ふりがな・原文表示（タイピング中・完了時のみ）*/}
            {(phase === 'typing' || phase === 'done') && problem?.type === 'japanese' && problem.furigana && (
              <div className="bg-slate-200/60 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">フリガナ</p>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{problem.furigana}</p>
              </div>
            )}
            {(phase === 'typing' || phase === 'done') && problem?.type === 'japanese' && (
              <div className="bg-slate-200/60 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">原文</p>
                <p className="text-slate-900 dark:text-white text-base leading-relaxed">{problem.content}</p>
              </div>
            )}

            {phase === 'loading' && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">お題を読み込み中...</div>
            )}

            {phase === 'ready' && problem && (
              <div className="pt-2">
                <button
                  onClick={handleStart}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  ▶ スタート
                </button>
              </div>
            )}

            {(phase === 'typing' || phase === 'done') && problem && (
              <div className="space-y-4">
                {phase === 'typing' && (
                  <div className="flex justify-between items-end gap-4">
                    {timeLimit > 0 ? (
                      <span
                        className={`font-mono font-bold text-2xl ${
                          remainingMs <= 10000 ? 'text-red-500 animate-pulse' : 'text-amber-400'
                        }`}
                      >
                        ⏱ {formatCountdown(remainingMs)}
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex gap-4 ml-auto">
                      <span className="text-sky-400 font-mono font-bold text-lg">{currentWpm * 5} 打/分</span>
                      <span className="text-slate-400 font-mono text-sm self-end mb-0.5">{currentWpm} WPM</span>
                    </div>
                  </div>
                )}
                <TypingInput
                  mode={typingMode}
                  target={targetText}
                  onProgress={handleProgress}
                  onComplete={handleComplete}
                  disabled={phase === 'done'}
                  startTime={startTime}
                />
                {phase === 'typing' && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSkip}
                      className="flex-[3] bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 font-bold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      ⏭ スキップ
                    </button>
                    <button
                      onClick={handleAbort}
                      className="flex-1 bg-red-900/60 hover:bg-red-800/80 text-red-300 font-bold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      {timeLimit > 0 ? '⏹ 終了' : '✕ 中断'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 時間制限モードのセッション結果 */}
            {phase === 'done' && sessionResult && (
              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-center text-emerald-400">
                  🎉 セッション終了！（{Math.round(sessionResult.timeLimitSec / 60)}分）
                </h3>
                <div className="grid grid-cols-5 gap-3 text-center">
                  <div>
                    <p className="text-3xl font-bold text-purple-400">{sessionResult.topicsCompleted}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">完了お題</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-sky-400">{sessionResult.totalTypedChars}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">総打鍵数</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-400">
                      {sessionResult.durationMs > 0
                        ? Math.round(sessionResult.totalTypedChars * 60000 / sessionResult.durationMs)
                        : 0}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">平均打鍵/分</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-emerald-400">
                      {sessionResult.totalTypedChars + sessionResult.totalMistakes > 0
                        ? Math.round(sessionResult.totalTypedChars / (sessionResult.totalTypedChars + sessionResult.totalMistakes) * 100)
                        : 100}%
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">正確率</p>
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${sessionResult.totalMistakes === 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {sessionResult.totalMistakes}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">総ミス数</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSessionResult(null); loadProblem(); }}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  🔄 もう一度
                </button>
              </div>
            )}

            {/* 結果表示（無制限モード） */}
            {phase === 'done' && result && !sessionResult && (
              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-center text-emerald-400">🎉 完了！</h3>
                <div className="grid grid-cols-5 gap-3 text-center">
                  <div>
                    <p className="text-3xl font-bold text-sky-400">{result.typedChars ?? 0}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">打鍵数</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-400">
                      {result.durationMs && result.durationMs > 0
                        ? Math.round((result.typedChars ?? 0) * 60000 / result.durationMs)
                        : '--'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">打鍵/分</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-emerald-400">{result.accuracy}%</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">正確率</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-400">
                      {result.durationMs ? (result.durationMs / 1000).toFixed(1) : '--'}s
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">タイム</p>
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${(result.mistakes ?? 0) === 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {result.mistakes ?? 0}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">ミス数</p>
                  </div>
                </div>
                <button
                  onClick={() => loadProblem()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  🔄 次のお題（Enterキーで即スタート）
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 履歴サイドバー */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">📊 自分の履歴</h3>
            <div className="flex text-xs rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
              <button
                onClick={() => setHistorySortBy('chars')}
                className={`px-2 py-1 transition-colors ${historySortBy === 'chars' ? 'bg-sky-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                文字数
              </button>
              <button
                onClick={() => setHistorySortBy('kpm')}
                className={`px-2 py-1 transition-colors ${historySortBy === 'kpm' ? 'bg-amber-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                打鍵/分
              </button>
            </div>
          </div>
          {history.length === 0 ? (
            <p className="text-slate-400 dark:text-slate-500 text-sm text-center mt-8">まだ記録がありません</p>
          ) : (
            <div className="space-y-3">
              {[...history]
                .sort((a, b) => {
                  if (historySortBy === 'kpm') {
                    const kpmA = a.duration_ms > 0 ? a.typed_chars * 60000 / a.duration_ms : 0;
                    const kpmB = b.duration_ms > 0 ? b.typed_chars * 60000 / b.duration_ms : 0;
                    return kpmB - kpmA;
                  }
                  return (b.typed_chars || 0) - (a.typed_chars || 0);
                })
                .map((s, i) => {
                  const kpm = s.duration_ms > 0 ? Math.round(s.typed_chars * 60000 / s.duration_ms) : null;
                  return (
                    <div key={i} className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-sky-400 font-bold">{s.typed_chars || 0} 打</span>
                        <span className="text-emerald-400">{s.accuracy}%</span>
                      </div>
                      {kpm !== null && (
                        <div className="text-amber-400 text-xs mt-0.5">{kpm} 打/分</div>
                      )}
                      <div className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                        {new Date(s.created_at).toLocaleString('ja-JP', {
                          month: 'numeric', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
