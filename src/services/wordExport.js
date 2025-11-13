/**
 * Word (.docx) Export Service
 * 漢文ドキュメントをWord形式で出力
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  PageOrientation,
  AlignmentType,
  HeadingLevel
} from 'docx';
import { saveAs } from 'file-saver';

/**
 * 用紙サイズの定義（mm → twip変換）
 * 1mm = 56.7twips
 */
const PAPER_SIZES = {
  B5: {
    width: 182 * 56.7, // 182mm
    height: 257 * 56.7  // 257mm
  },
  A4: {
    width: 210 * 56.7, // 210mm
    height: 297 * 56.7  // 297mm
  },
  B4: {
    width: 257 * 56.7, // 257mm
    height: 364 * 56.7  // 364mm
  }
};

/**
 * KanbunドキュメントをWord形式で出力
 * @param {Object} kanbunDoc - KanbunDocument
 * @returns {Promise<void>}
 */
export async function exportToWord(kanbunDoc) {
  try {
    const { blocks, meta } = kanbunDoc;

    // セクション設定（縦書き対応）
    const sections = [{
      properties: {
        page: {
          // 用紙サイズ
          size: PAPER_SIZES[meta.paper] || PAPER_SIZES.B5,

          // 縦書き設定
          textDirection: 'tbRl', // Top-to-Bottom, Right-to-Left

          // 余白設定
          margin: {
            top: 20 * 56.7,    // 20mm
            right: 20 * 56.7,  // 20mm
            bottom: 20 * 56.7, // 20mm
            left: 20 * 56.7    // 20mm
          }
        },

        // ページ向き
        orientation: PageOrientation.PORTRAIT
      },

      children: []
    }];

    // タイトル段落を追加
    sections[0].children.push(
      new Paragraph({
        text: meta.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400
        }
      })
    );

    // 各ブロックを処理
    blocks.forEach(block => {
      const paragraphs = createBlockParagraphs(block, meta);
      sections[0].children.push(...paragraphs);
    });

    // ドキュメント作成
    const doc = new Document({
      sections,

      // スタイル設定
      styles: {
        default: {
          document: {
            run: {
              font: meta.font || '游明朝',
              size: 24 // 12pt
            },
            paragraph: {
              spacing: {
                line: 360, // 1.8倍行間
                lineRule: 'auto'
              }
            }
          }
        }
      },

      // その他のメタデータ
      creator: meta.author || '',
      description: `KBR Editor - ${meta.title}`,
      title: meta.title
    });

    // Wordファイルとして保存
    const blob = await Packer.toBlob(doc);
    const filename = `${meta.title}_${new Date().toISOString().split('T')[0]}.docx`;

    saveAs(blob, filename);

    return { success: true, filename };

  } catch (error) {
    console.error('Word export failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ブロックから段落を生成
 * 返り点は {KAI:} トークン形式で埋め込み、マクロで後処理
 * @param {Object} block - TextBlock
 * @param {Object} meta - DocumentMeta
 * @returns {Array<Paragraph>}
 */
function createBlockParagraphs(block, meta) {
  const { text, annotations } = block;

  if (!text) return [];

  // 返り点の位置マップを作成
  const kaeritenMap = new Map();
  annotations
    .filter(ann => ann.type === 'kaeriten')
    .forEach(ann => {
      if (ann.pos !== undefined) {
        // 配列の場合は複数の返り点
        const marks = Array.isArray(ann.value) ? ann.value : [ann.value];
        kaeritenMap.set(ann.pos, marks);
      }
    });

  // テキストを1文字ずつ処理してトークン形式に変換
  const chars = Array.from(text);
  let textContent = '';

  chars.forEach((char, idx) => {
    textContent += char;

    // 返り点があれば {KAI:} トークンとして追加
    const kaeritenMarks = kaeritenMap.get(idx);
    if (kaeritenMarks) {
      kaeritenMarks.forEach(mark => {
        textContent += `{KAI:${mark}}`;
      });
    }
  });

  // 1つのTextRunとして段落に含める
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: textContent,
          font: meta.font || '游明朝',
          size: 24 // 12pt
        })
      ],
      spacing: {
        after: 200 // 段落後の間隔
      }
    })
  ];
}

/**
 * 返り点トークン形式でエクスポート（マクロ用）
 * @param {Object} kanbunDoc - KanbunDocument
 * @returns {string}
 */
export function exportToWordTokenFormat(kanbunDoc) {
  const { blocks } = kanbunDoc;

  let output = '';

  blocks.forEach(block => {
    const { text, annotations } = block;

    if (!text) return;

    // 返り点の位置マップを作成
    const kaeritenMap = new Map();
    annotations
      .filter(ann => ann.type === 'kaeriten')
      .forEach(ann => {
        if (ann.pos !== undefined) {
          // 配列の場合は複数の返り点
          const marks = Array.isArray(ann.value) ? ann.value : [ann.value];
          kaeritenMap.set(ann.pos, marks);
        }
      });

    // テキストを1文字ずつ処理
    const chars = Array.from(text);

    chars.forEach((char, idx) => {
      output += char;

      const kaeritenMarks = kaeritenMap.get(idx);
      if (kaeritenMarks) {
        kaeritenMarks.forEach(mark => {
          output += `{KAI:${mark}}`;
        });
      }
    });

    output += '\n\n';
  });

  return output;
}

/**
 * Word整形マクロ用のプレーンテキストを生成
 * @param {Object} kanbunDoc - KanbunDocument
 * @returns {Blob}
 */
export function exportForMacro(kanbunDoc) {
  const content = exportToWordTokenFormat(kanbunDoc);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const filename = `${kanbunDoc.meta.title}_macro_format.txt`;

  saveAs(blob, filename);

  return { success: true, filename };
}
