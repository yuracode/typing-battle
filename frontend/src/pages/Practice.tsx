import { useEffect, useState } from 'react';
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
      setPhase('typing');
    } catch {}
  };

  const handleStart = () => {
    setPhase('typing');
    setStartTime(Date.now());
  };

  const handleProgress = (_progress: number, wpm: number) => {
    setCurrentWpm(wpm);
  };

  const handleComplete = (wpm: number, accuracy: number, durationMs?: number, mistakes?: number, typedChars?: number) => {
    setPhase('done');
    setResult({ wpm, accuracy, durationMs, mistakes, typedChars });
    if (problem) {
      // Socket経由でスコア保存
      socket.emit('practice:complete', {
        userId,
        topicId: problem.id,
        wpm,
        accuracy,
        typedChars: typedChars ?? 0,
        durationMs: durationMs ?? 0,
      });
      // 履歴を更新
      loadHistory();
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
                  <div className="flex justify-end gap-4">
                    <span className="text-sky-400 font-mono font-bold text-lg">{currentWpm * 5} 打/分</span>
                    <span className="text-slate-400 font-mono text-sm self-end mb-0.5">{currentWpm} WPM</span>
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
                      onClick={() => loadProblem()}
                      className="flex-1 bg-red-900/60 hover:bg-red-800/80 text-red-300 font-bold py-2.5 rounded-xl transition-colors text-sm"
                    >
                      ✕ 中断
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 結果表示 */}
            {phase === 'done' && result && (
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
                  🔄 次のお題
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
