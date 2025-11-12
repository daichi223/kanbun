/**
 * テキスト処理ユーティリティ
 * Text manipulation utilities for Kanbun editor
 */

/**
 * テキストの指定位置に文字を挿入
 * @param {string} text - 元のテキスト
 * @param {number} position - 挿入位置
 * @param {string} insertion - 挿入する文字列
 * @returns {string}
 */
export function insertAt(text, position, insertion) {
  return text.slice(0, position) + insertion + text.slice(position);
}

/**
 * テキストの指定範囲を削除
 * @param {string} text - 元のテキスト
 * @param {number} start - 開始位置
 * @param {number} end - 終了位置
 * @returns {string}
 */
export function deleteRange(text, start, end) {
  return text.slice(0, start) + text.slice(end);
}

/**
 * テキストの指定範囲を取得
 * @param {string} text - 元のテキスト
 * @param {number} start - 開始位置
 * @param {number} end - 終了位置
 * @returns {string}
 */
export function getRange(text, start, end) {
  return text.slice(start, end);
}

/**
 * アノテーションの位置を調整（テキスト編集時）
 * @param {Array} annotations - アノテーション配列
 * @param {number} position - 編集位置
 * @param {number} delta - 変更量（正=挿入、負=削除）
 * @returns {Array}
 */
export function adjustAnnotations(annotations, position, delta) {
  return annotations
    .map(ann => {
      const newAnn = { ...ann };

      // 単一位置のアノテーション
      if (ann.pos !== undefined) {
        if (ann.pos >= position) {
          newAnn.pos = Math.max(position, ann.pos + delta);
        }
      }

      // 範囲指定のアノテーション
      if (ann.range) {
        const [start, end] = ann.range;

        // 編集位置より前の範囲: 影響なし
        if (end <= position) {
          return newAnn;
        }

        // 編集位置より後の範囲: 全体をシフト
        if (start >= position) {
          newAnn.range = [
            Math.max(position, start + delta),
            Math.max(position, end + delta)
          ];
        }

        // 編集位置が範囲内: 終了位置を調整
        else if (start < position && position < end) {
          newAnn.range = [start, Math.max(start + 1, end + delta)];
        }
      }

      return newAnn;
    })
    // 無効なアノテーションを削除
    .filter(ann => {
      if (ann.pos !== undefined) {
        return ann.pos >= 0;
      }
      if (ann.range) {
        return ann.range[0] < ann.range[1];
      }
      return true;
    });
}

/**
 * 禁則処理文字の判定
 * @param {string} char - 文字
 * @returns {boolean}
 */
export function isKinsokuChar(char) {
  const kinsokuStart = '、。,.」』】〕〉》』」）｝〉〗〙〛〟\'"｠»ヽヾゝゞ々';
  const kinsokuEnd = '「『【〔〈《「『（｛〈〖〘〚〝\'"｟«';

  return kinsokuStart.includes(char) || kinsokuEnd.includes(char);
}

/**
 * 縦中横にすべき文字の判定
 * @param {string} text - テキスト
 * @param {number} position - 位置
 * @returns {[number, number] | null} - 範囲、または null
 */
export function detectTcyRange(text, position) {
  // 数字2桁を検出
  const digitRegex = /\d{2,}/g;
  let match;

  while ((match = digitRegex.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (position >= start && position <= end) {
      return [start, end];
    }
  }

  return null;
}

/**
 * ルビ付き文字列をHTMLに変換
 * @param {string} text - テキスト
 * @param {Array} annotations - アノテーション配列
 * @returns {string}
 */
export function toRubyHTML(text, annotations) {
  const rubyAnnotations = annotations
    .filter(ann => ann.type === 'ruby')
    .sort((a, b) => a.range[0] - b.range[0]);

  let html = '';
  let lastIndex = 0;

  rubyAnnotations.forEach(ann => {
    const [start, end] = ann.range;

    // 前のテキスト
    html += text.slice(lastIndex, start);

    // ルビ付きテキスト
    const base = text.slice(start, end);
    html += `<ruby>${base}<rt>${ann.rt}</rt></ruby>`;

    lastIndex = end;
  });

  // 残りのテキスト
  html += text.slice(lastIndex);

  return html;
}

/**
 * 文字数をカウント（サロゲートペア対応）
 * @param {string} text - テキスト
 * @returns {number}
 */
export function countChars(text) {
  return Array.from(text).length;
}

/**
 * JSONのバリデーション
 * @param {Object} data - データ
 * @param {Object} _schema - スキーマ（将来使用予定）
 * @returns {boolean}
 */
export function validateJSON(data, _schema) {
  // 簡易バリデーション（本格的にはajvなどを使用）
  try {
    if (!data || typeof data !== 'object') return false;
    if (!data.blocks || !Array.isArray(data.blocks)) return false;
    if (!data.meta || typeof data.meta !== 'object') return false;
    return true;
  } catch {
    return false;
  }
}
