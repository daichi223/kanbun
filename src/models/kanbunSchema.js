/**
 * 漢文返り点エディタのデータモデル
 * KBR Editor Data Model and JSON Schema
 */

/**
 * アノテーションタイプ
 * @typedef {'kaeriten' | 'ruby' | 'tcy' | 'emphasis'} AnnotationType
 */

/**
 * 返り点の種類
 */
export const KAERITEN_TYPES = {
  RE: 'レ',
  ICHI: '一',
  NI: '二',
  SAN: '三',
  JOU: '上',
  CHUU: '中',
  GE: '下',
  KOU: '甲',
  OTSU: '乙',
  HEI: '丙',
  TEI: '丁',
  TEN: '天',
  CHI: '地',
  JIN: '人'
};

/**
 * アノテーションの基本構造
 * @typedef {Object} Annotation
 * @property {number} [pos] - 単一文字の位置（0-based index）
 * @property {[number, number]} [range] - 範囲指定 [start, end]
 * @property {AnnotationType} type - アノテーションの種類
 * @property {string} [value] - 返り点の値
 * @property {string} [rb] - ルビのベース文字（親文字）
 * @property {string} [rt] - ルビのテキスト（読み仮名）
 */

/**
 * テキストブロックの構造
 * @typedef {Object} TextBlock
 * @property {string} id - ブロック識別子
 * @property {boolean} vertical - 縦書きかどうか
 * @property {string} text - 本文テキスト
 * @property {Annotation[]} annotations - アノテーションの配列
 */

/**
 * ドキュメント全体のメタデータ
 * @typedef {Object} DocumentMeta
 * @property {string} title - タイトル
 * @property {string} paper - 用紙サイズ（B5, A4等）
 * @property {string} font - フォント名
 * @property {string} author - 著者
 * @property {string} [created] - 作成日時
 * @property {string} [modified] - 最終更新日時
 */

/**
 * 漢文ドキュメントの完全な構造
 * @typedef {Object} KanbunDocument
 * @property {TextBlock[]} blocks - テキストブロックの配列
 * @property {DocumentMeta} meta - メタデータ
 */

/**
 * デフォルトのドキュメント構造を生成
 * @returns {KanbunDocument}
 */
export function createDefaultDocument() {
  return {
    blocks: [
      {
        id: 'b1',
        vertical: true,
        text: '',
        annotations: []
      }
    ],
    meta: {
      title: '新規ドキュメント',
      paper: 'B5',
      font: '游明朝',
      author: '',
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    }
  };
}

/**
 * テキストブロックを作成
 * @param {string} id - ブロックID
 * @param {string} text - 本文
 * @param {boolean} vertical - 縦書きフラグ
 * @returns {TextBlock}
 */
export function createTextBlock(id, text = '', vertical = true) {
  return {
    id,
    vertical,
    text,
    annotations: []
  };
}

/**
 * 返り点アノテーションを作成
 * @param {number} pos - 文字位置
 * @param {string} value - 返り点の値
 * @returns {Annotation}
 */
export function createKaeritenAnnotation(pos, value) {
  return {
    pos,
    type: 'kaeriten',
    value
  };
}

/**
 * ルビアノテーションを作成
 * @param {number} start - 開始位置
 * @param {number} end - 終了位置
 * @param {string} rb - 親文字
 * @param {string} rt - ルビテキスト
 * @returns {Annotation}
 */
export function createRubyAnnotation(start, end, rb, rt) {
  return {
    range: [start, end],
    type: 'ruby',
    rb,
    rt
  };
}

/**
 * 縦中横アノテーションを作成
 * @param {number} start - 開始位置
 * @param {number} end - 終了位置
 * @returns {Annotation}
 */
export function createTcyAnnotation(start, end) {
  return {
    range: [start, end],
    type: 'tcy'
  };
}

/**
 * JSON スキーマ（バリデーション用）
 */
export const KANBUN_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Kanbun Document Schema',
  type: 'object',
  required: ['blocks', 'meta'],
  properties: {
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'vertical', 'text', 'annotations'],
        properties: {
          id: { type: 'string' },
          vertical: { type: 'boolean' },
          text: { type: 'string' },
          annotations: {
            type: 'array',
            items: {
              type: 'object',
              required: ['type'],
              properties: {
                pos: { type: 'number' },
                range: {
                  type: 'array',
                  items: { type: 'number' },
                  minItems: 2,
                  maxItems: 2
                },
                type: {
                  type: 'string',
                  enum: ['kaeriten', 'ruby', 'tcy', 'emphasis']
                },
                value: { type: 'string' },
                rb: { type: 'string' },
                rt: { type: 'string' }
              }
            }
          }
        }
      }
    },
    meta: {
      type: 'object',
      required: ['title', 'paper', 'font', 'author'],
      properties: {
        title: { type: 'string' },
        paper: { type: 'string' },
        font: { type: 'string' },
        author: { type: 'string' },
        created: { type: 'string', format: 'date-time' },
        modified: { type: 'string', format: 'date-time' }
      }
    }
  }
};

/**
 * サンプルドキュメント
 */
export const SAMPLE_DOCUMENT = {
  blocks: [
    {
      id: 'b1',
      vertical: true,
      text: '故人之所為、皆當以禮。',
      annotations: [
        { pos: 2, type: 'kaeriten', value: 'レ' },
        { range: [1, 2], type: 'ruby', rb: '人', rt: 'ひと' },
        { range: [3, 4], type: 'ruby', rb: '之', rt: 'の' },
        { pos: 7, type: 'kaeriten', value: '二' },
        { pos: 8, type: 'kaeriten', value: '一' }
      ]
    }
  ],
  meta: {
    title: '孟子 抜粋',
    paper: 'B5',
    font: '游明朝',
    author: '森川大地',
    created: '2025-11-12T00:00:00.000Z',
    modified: '2025-11-12T00:00:00.000Z'
  }
};
