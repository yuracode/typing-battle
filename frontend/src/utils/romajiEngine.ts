// ─────────────────────────────────────────────
// ローマ字変換エンジン
// 複数パターン対応 (し→si/shi/ci, ち→ti/chi, etc.)
// っ: 後続子音の二重入力 or ltu/xtu
// ん: 子音前は単独 n も可、それ以外は nn
// ─────────────────────────────────────────────

/** カタカナ → ひらがな変換 (Unicode オフセット利用) */
export function toHiragana(text: string): string {
  return text.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// ─── 変換テーブル (複合かな優先: 2文字→ローマ字) ───
// 配列の先頭ほど優先候補として UI ヒントに使われる
type KanaEntry = [string, string[]];

const KANA_TABLE: KanaEntry[] = [
  // ── 2文字複合（先に試す）──
  ['きゃ', ['kya']], ['きゅ', ['kyu']], ['きょ', ['kyo']],
  ['しゃ', ['sha', 'sya']], ['しゅ', ['shu', 'syu']], ['しょ', ['sho', 'syo']],
  ['ちゃ', ['cha', 'tya', 'cya']], ['ちゅ', ['chu', 'tyu', 'cyu']], ['ちょ', ['cho', 'tyo', 'cyo']],
  ['にゃ', ['nya']], ['にゅ', ['nyu']], ['にょ', ['nyo']],
  ['ひゃ', ['hya']], ['ひゅ', ['hyu']], ['ひょ', ['hyo']],
  ['みゃ', ['mya']], ['みゅ', ['myu']], ['みょ', ['myo']],
  ['りゃ', ['rya']], ['りゅ', ['ryu']], ['りょ', ['ryo']],
  ['ぎゃ', ['gya']], ['ぎゅ', ['gyu']], ['ぎょ', ['gyo']],
  ['じゃ', ['ja', 'jya', 'zya']], ['じゅ', ['ju', 'jyu', 'zyu']], ['じょ', ['jo', 'jyo', 'zyo']],
  ['ぢゃ', ['dya']], ['ぢゅ', ['dyu']], ['ぢょ', ['dyo']],
  ['びゃ', ['bya']], ['びゅ', ['byu']], ['びょ', ['byo']],
  ['ぴゃ', ['pya']], ['ぴゅ', ['pyu']], ['ぴょ', ['pyo']],
  ['てぃ', ['thi', 'texi', 'teli']], ['てゅ', ['thu', 'texyu', 'telyu']],
  ['でぃ', ['dhi', 'dexi', 'deli']], ['でゅ', ['dhu', 'dexyu', 'delyu']],
  // ── 外来語音（ファ行・ヴ行など）──
  ['ふぁ', ['fa']], ['ふぃ', ['fi']], ['ふぇ', ['fe']], ['ふぉ', ['fo']],
  ['ふゅ', ['fyu']],
  ['じぇ', ['je', 'jye', 'zye']],
  ['しぇ', ['she', 'sye']],
  ['ちぇ', ['che', 'tye', 'cye']],
  ['つぁ', ['tsa']], ['つぇ', ['tse']], ['つぃ', ['tsi']], ['つぉ', ['tso']],
  ['うぁ', ['wha']], ['うぃ', ['wi']], ['うぇ', ['we']], ['うぉ', ['who']],
  ['ヴぁ', ['va']], ['ヴぃ', ['vi']], ['ヴぇ', ['ve']], ['ヴぉ', ['vo']], ['ヴ', ['vu']],

  // ── 単体かな ──
  ['あ', ['a']], ['い', ['i']], ['う', ['u', 'wu']], ['え', ['e']], ['お', ['o']],
  ['か', ['ka']], ['き', ['ki']], ['く', ['ku']], ['け', ['ke']], ['こ', ['ko']],
  ['さ', ['sa']], ['し', ['si', 'shi', 'ci']], ['す', ['su']], ['せ', ['se', 'ce']], ['そ', ['so']],
  ['た', ['ta']], ['ち', ['ti', 'chi']], ['つ', ['tu', 'tsu']], ['て', ['te']], ['と', ['to']],
  ['な', ['na']], ['に', ['ni']], ['ぬ', ['nu']], ['ね', ['ne']], ['の', ['no']],
  ['は', ['ha']], ['ひ', ['hi']], ['ふ', ['fu', 'hu']], ['へ', ['he']], ['ほ', ['ho']],
  ['ま', ['ma']], ['み', ['mi']], ['む', ['mu']], ['め', ['me']], ['も', ['mo']],
  ['や', ['ya']], ['ゆ', ['yu']], ['よ', ['yo']],
  ['ら', ['ra']], ['り', ['ri']], ['る', ['ru']], ['れ', ['re']], ['ろ', ['ro']],
  ['わ', ['wa']], ['を', ['wo']],
  ['ん', ['nn', 'xn']], // 'n' は後処理で追加
  ['が', ['ga']], ['ぎ', ['gi']], ['ぐ', ['gu']], ['げ', ['ge']], ['ご', ['go']],
  ['ざ', ['za']], ['じ', ['ji', 'zi']], ['ず', ['zu']], ['ぜ', ['ze']], ['ぞ', ['zo']],
  ['だ', ['da']], ['ぢ', ['di']], ['づ', ['du', 'dzu']], ['で', ['de']], ['ど', ['do']],
  ['ば', ['ba']], ['び', ['bi']], ['ぶ', ['bu']], ['べ', ['be']], ['ぼ', ['bo']],
  ['ぱ', ['pa']], ['ぴ', ['pi']], ['ぷ', ['pu']], ['ぺ', ['pe']], ['ぽ', ['po']],
  ['っ', ['ltu', 'xtu', 'ltsu', 'xtsu']], // 二重子音は後処理で追加
  ['ぁ', ['la', 'xa']], ['ぃ', ['li', 'xi']], ['ぅ', ['lu', 'xu']], ['ぇ', ['le', 'xe']], ['ぉ', ['lo', 'xo']],
  ['ゃ', ['lya', 'xya']], ['ゅ', ['lyu', 'xyu']], ['ょ', ['lyo', 'xyo']],
  // 長音・記号
  ['ー', ['-']],
  ['。', ['.']], ['、', [',']], ['・', ['/']], ['「', ['[']], ['」', [']']],
  ['（', ['(']], ['）', [')']], ['！', ['!']], ['？', ['?']],
  [' ', [' ']], ['　', [' ']],
];

// ─── 型定義 ───

export interface RomajiToken {
  kana: string;
  patterns: string[]; // 有効なローマ字列（先頭が推奨候補）
}

export interface EngineState {
  tokens: RomajiToken[];
  tokenIdx: number;  // 現在処理中のトークン位置
  buffer: string;    // 現在のトークンに対して入力済みのローマ字
  mistakes: number;  // ミス回数（誤キー押下）
}

// ─── トークン生成 ───

export function tokenize(text: string): RomajiToken[] {
  const hira = toHiragana(text);
  const tokens: RomajiToken[] = [];
  let i = 0;

  while (i < hira.length) {
    // 2文字複合を先に試す
    let matched = false;
    if (i + 1 < hira.length) {
      const two = hira.slice(i, i + 2);
      const entry = KANA_TABLE.find(([k]) => k === two);
      if (entry) {
        tokens.push({ kana: two, patterns: [...entry[1]] });
        i += 2;
        matched = true;
      }
    }
    if (!matched) {
      const one = hira[i];
      const entry = KANA_TABLE.find(([k]) => k === one);
      tokens.push({
        kana: one,
        patterns: entry ? [...entry[1]] : [one], // 未知文字はそのまま（大文字は大文字で要求）
      });
      i += 1;
    }
  }

  // ── 後処理: っ と ん の動的パターン追加 ──
  for (let j = 0; j < tokens.length; j++) {
    const token = tokens[j];
    const next = tokens[j + 1] ?? null;

    // っ: 後続子音の 1文字入力で完了（例: っか → 'k'+'ka'）
    // 後続トークンの全パターンの先頭文字を登録することで、
    // っちゃ → ccha / tcha / ttya / ccya など全組み合わせを受け付ける
    if (token.kana === 'っ' && next) {
      for (const pat of next.patterns) {
        const fc = pat[0];
        if (/[bcdfghjklmpqrstvwxyz]/.test(fc) && !token.patterns.includes(fc)) {
          token.patterns.push(fc);
        }
      }
    }

    // ん: 後続が子音（n/a/i/u/e/o/y 以外）なら単独 'n' も可
    if (token.kana === 'ん') {
      const shouldAllowSingleN = !next || (() => {
        const nf = next.patterns[0][0];
        return !'naiueoyn'.includes(nf);
      })();
      if (shouldAllowSingleN && !token.patterns.includes('n')) {
        token.patterns.push('n');
      }
    }
  }

  return tokens;
}

// ─── キー処理 ───

export interface ProcessResult {
  accepted: boolean;      // キーが受け付けられたか
  tokenCompleted: boolean; // トークンが完了したか
  allCompleted: boolean;  // 全トークン完了したか
  newState: EngineState;
}

export function processKey(state: EngineState, key: string): ProcessResult {
  const { tokens, tokenIdx, buffer, mistakes } = state;

  if (tokenIdx >= tokens.length) {
    return { accepted: false, tokenCompleted: false, allCompleted: true, newState: state };
  }

  const token = tokens[tokenIdx];
  const candidate = buffer + key;

  // 完全一致: このトークン完了
  if (token.patterns.includes(candidate)) {
    const newIdx = tokenIdx + 1;
    const allCompleted = newIdx >= tokens.length;
    return {
      accepted: true,
      tokenCompleted: true,
      allCompleted,
      newState: { tokens, tokenIdx: newIdx, buffer: '', mistakes },
    };
  }

  // 前方一致: バッファに追加して続ける
  if (token.patterns.some((p) => p.startsWith(candidate))) {
    return {
      accepted: true,
      tokenCompleted: false,
      allCompleted: false,
      newState: { tokens, tokenIdx, buffer: candidate, mistakes },
    };
  }

  // ミス
  return {
    accepted: false,
    tokenCompleted: false,
    allCompleted: false,
    newState: { tokens, tokenIdx, buffer, mistakes: mistakes + 1 },
  };
}

/** 現在トークンの入力ヒント（入力済み部分 + 残り）を返す */
export function getHint(token: RomajiToken, buffer: string): { typed: string; remaining: string } {
  const matching = token.patterns.filter((p) => p.startsWith(buffer));
  if (matching.length === 0) return { typed: buffer, remaining: '' };
  // 最短のパターンを表示
  const best = matching.sort((a, b) => a.length - b.length)[0];
  return { typed: buffer, remaining: best.slice(buffer.length) };
}

/** 進捗率 (0–100) */
export function getProgress(state: EngineState): number {
  if (state.tokens.length === 0) return 0;
  return Math.round((state.tokenIdx / state.tokens.length) * 100);
}
