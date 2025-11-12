/**
 * 縦中横（TCY）ユーティリティ
 * Tate-Chu-Yoko utility functions
 */

/**
 * 縦中横にすべきパターンを検出
 * @param {string} text - テキスト
 * @returns {Array<{start: number, end: number, text: string}>}
 */
export function detectTcyPatterns(text) {
  const patterns = [];

  // パターン1: 2桁の数字（10〜99）
  const digitRegex = /\d{2}/g;
  let match;

  while ((match = digitRegex.exec(text)) !== null) {
    patterns.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
      type: 'digits'
    });
  }

  // パターン2: 年号（令和、平成、昭和など）+ 数字
  const eraRegex = /(令和|平成|昭和|大正|明治)\d{1,2}年?/g;
  while ((match = eraRegex.exec(text)) !== null) {
    patterns.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
      type: 'era'
    });
  }

  // パターン3: 英字2文字（大文字）
  const alphaRegex = /[A-Z]{2}/g;
  while ((match = alphaRegex.exec(text)) !== null) {
    patterns.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
      type: 'alpha'
    });
  }

  // 重複を除去（優先度: era > digits > alpha）
  return removeTcyOverlaps(patterns);
}

/**
 * 重複する縦中横パターンを除去
 * @param {Array} patterns
 * @returns {Array}
 */
function removeTcyOverlaps(patterns) {
  if (patterns.length === 0) return [];

  // 優先度でソート
  const priority = { era: 3, digits: 2, alpha: 1 };
  patterns.sort((a, b) => {
    if (a.start === b.start) {
      return priority[b.type] - priority[a.type];
    }
    return a.start - b.start;
  });

  const result = [];
  let lastEnd = -1;

  for (const pattern of patterns) {
    if (pattern.start >= lastEnd) {
      result.push(pattern);
      lastEnd = pattern.end;
    }
  }

  return result;
}

/**
 * 縦中横アノテーションを作成
 * @param {number} start - 開始位置
 * @param {number} end - 終了位置
 * @returns {Object}
 */
export function createTcyAnnotation(start, end) {
  return {
    range: [start, end],
    type: 'tcy'
  };
}

/**
 * テキストに縦中横アノテーションを自動適用
 * @param {string} text - テキスト
 * @param {Array} existingAnnotations - 既存のアノテーション
 * @returns {Array}
 */
export function autoApplyTcy(text, existingAnnotations = []) {
  const patterns = detectTcyPatterns(text);

  // 既存のTCYアノテーションを除外
  const existingTcy = new Set(
    existingAnnotations
      .filter(ann => ann.type === 'tcy' && ann.range)
      .map(ann => `${ann.range[0]}-${ann.range[1]}`)
  );

  const newAnnotations = patterns
    .filter(p => !existingTcy.has(`${p.start}-${p.end}`))
    .map(p => createTcyAnnotation(p.start, p.end));

  return [...existingAnnotations, ...newAnnotations];
}

/**
 * TCYが適用されているか確認
 * @param {Array} annotations - アノテーション配列
 * @param {number} start - 開始位置
 * @param {number} end - 終了位置
 * @returns {boolean}
 */
export function hasTcy(annotations, start, end) {
  return annotations.some(
    ann =>
      ann.type === 'tcy' &&
      ann.range &&
      ann.range[0] === start &&
      ann.range[1] === end
  );
}

/**
 * 指定範囲のTCYアノテーションを削除
 * @param {Array} annotations - アノテーション配列
 * @param {number} start - 開始位置
 * @param {number} end - 終了位置
 * @returns {Array}
 */
export function removeTcy(annotations, start, end) {
  return annotations.filter(
    ann =>
      !(
        ann.type === 'tcy' &&
        ann.range &&
        ann.range[0] === start &&
        ann.range[1] === end
      )
  );
}
