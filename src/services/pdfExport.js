/**
 * PDF Export Service
 * 漢文ドキュメントをPDF形式で出力
 * html2canvas + jsPDF を使用
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 用紙サイズの定義（mm）
 */
const PAPER_SIZES = {
  B5: { width: 182, height: 257 },
  A4: { width: 210, height: 297 },
  B4: { width: 257, height: 364 }
};

/**
 * KanbunドキュメントをPDF形式で出力
 * @param {Object} kanbunDoc - KanbunDocument
 * @param {HTMLElement} previewElement - プレビュー要素（VerticalTextのDOM）
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
 */
export async function exportToPdf(kanbunDoc, previewElement) {
  try {
    if (!previewElement) {
      throw new Error('プレビュー要素が見つかりません');
    }

    const { meta } = kanbunDoc;
    const paperSize = PAPER_SIZES[meta.paper] || PAPER_SIZES.B5;

    // プレビュー要素をキャンバスに変換
    const canvas = await html2canvas(previewElement, {
      scale: 3, // 高解像度
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fef3e2', // 和紙風背景色
      logging: false
    });

    // PDF作成（縦向き）
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [paperSize.width, paperSize.height]
    });

    // キャンバスをPDFに追加
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = paperSize.width - 20; // 左右10mmマージン
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 画像が用紙に収まるように調整
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;

    if (imgHeight > paperSize.height - 20) {
      // 高さが用紙を超える場合は縮小
      finalHeight = paperSize.height - 20;
      finalWidth = (canvas.width * finalHeight) / canvas.height;
    }

    // 中央配置
    const x = (paperSize.width - finalWidth) / 2;
    const y = (paperSize.height - finalHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

    // メタデータ設定
    pdf.setProperties({
      title: meta.title,
      author: meta.author || 'KBR Editor',
      subject: '漢文教材',
      creator: 'KBR Editor',
      keywords: '漢文,返り点,縦書き'
    });

    // ファイル名生成
    const filename = `${meta.title}_${new Date().toISOString().split('T')[0]}.pdf`;

    // PDF保存
    pdf.save(filename);

    return { success: true, filename };

  } catch (error) {
    console.error('PDF export failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 複数ページPDF出力（長文対応）
 * @param {Object} kanbunDoc - KanbunDocument
 * @param {HTMLElement} previewElement - プレビュー要素
 * @returns {Promise<{success: boolean, filename?: string, error?: string}>}
 */
export async function exportToPdfMultiPage(kanbunDoc, previewElement) {
  try {
    if (!previewElement) {
      throw new Error('プレビュー要素が見つかりません');
    }

    const { meta } = kanbunDoc;
    const paperSize = PAPER_SIZES[meta.paper] || PAPER_SIZES.B5;

    // プレビュー要素をキャンバスに変換
    const canvas = await html2canvas(previewElement, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fef3e2',
      logging: false
    });

    // PDF作成
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [paperSize.width, paperSize.height]
    });

    const imgData = canvas.toDataURL('image/png');
    const pageWidth = paperSize.width - 20;
    const pageHeight = paperSize.height - 20;

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // ページ分割が必要な場合
    if (imgHeight > pageHeight) {
      const totalPages = Math.ceil(imgHeight / pageHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const sourceY = (i * pageHeight * canvas.height) / imgHeight;
        const sourceHeight = Math.min(
          (pageHeight * canvas.height) / imgHeight,
          canvas.height - sourceY
        );

        // 部分的にキャンバスを切り取り
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        const pageCtx = pageCanvas.getContext('2d');
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/png');
        const pageImgHeight = (sourceHeight * imgWidth) / canvas.width;

        pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, pageImgHeight);
      }
    } else {
      // 1ページに収まる場合
      const x = (paperSize.width - imgWidth) / 2;
      const y = (paperSize.height - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    }

    // メタデータ設定
    pdf.setProperties({
      title: meta.title,
      author: meta.author || 'KBR Editor',
      subject: '漢文教材',
      creator: 'KBR Editor',
      keywords: '漢文,返り点,縦書き'
    });

    const filename = `${meta.title}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    return { success: true, filename };

  } catch (error) {
    console.error('PDF export failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * PDFプレビュー生成
 * @param {Object} kanbunDoc - KanbunDocument
 * @param {HTMLElement} previewElement - プレビュー要素
 * @returns {Promise<string>} - Data URL
 */
export async function generatePdfPreview(kanbunDoc, previewElement) {
  try {
    if (!previewElement) {
      throw new Error('プレビュー要素が見つかりません');
    }

    const canvas = await html2canvas(previewElement, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#fef3e2',
      logging: false
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('PDF preview generation failed:', error);
    throw error;
  }
}
