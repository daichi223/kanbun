import { useState, useRef, useEffect, useCallback } from 'react';
import { createDefaultDocument } from '../models/kanbunSchema';
import KaeritenPalette from './KaeritenPalette';
import VerticalText from './VerticalText';

/**
 * 漢文エディタのメインコンポーネント
 * Main Kanbun Editor Component with vertical text support
 */
function KanbunEditor() {
  const [document, setDocument] = useState(createDefaultDocument());
  const [selectedBlockId] = useState('b1'); // Future: support multiple blocks
  const [cursorPosition, setCursorPosition] = useState(0);
  const editorRef = useRef(null);

  // 現在のブロックを取得
  const currentBlock = document.blocks.find(block => block.id === selectedBlockId);

  /**
   * テキスト変更ハンドラ
   */
  const handleTextChange = (e) => {
    const newText = e.target.value;
    const newBlocks = document.blocks.map(block =>
      block.id === selectedBlockId
        ? { ...block, text: newText }
        : block
    );

    setDocument({
      ...document,
      blocks: newBlocks,
      meta: {
        ...document.meta,
        modified: new Date().toISOString()
      }
    });
  };

  /**
   * 返り点追加ハンドラ
   */
  const handleAddKaeriten = useCallback((value) => {
    if (cursorPosition === null || cursorPosition === undefined) return;

    const newAnnotation = {
      pos: cursorPosition,
      type: 'kaeriten',
      value
    };

    setDocument(prevDoc => {
      const newBlocks = prevDoc.blocks.map(block =>
        block.id === selectedBlockId
          ? {
              ...block,
              annotations: [...block.annotations, newAnnotation]
            }
          : block
      );

      return {
        ...prevDoc,
        blocks: newBlocks,
        meta: {
          ...prevDoc.meta,
          modified: new Date().toISOString()
        }
      };
    });
  }, [cursorPosition, selectedBlockId]);

  /**
   * カーソル位置更新
   */
  const handleCursorChange = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  /**
   * キーボードショートカット処理
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt + 数字キー
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const shortcuts = {
          '1': 'レ',
          '2': '一',
          '3': '二',
          '4': '三',
          '5': '上',
          '6': '中',
          '7': '下',
          '8': '甲',
          '9': '乙'
        };

        const key = e.key;
        if (shortcuts[key]) {
          e.preventDefault();
          handleAddKaeriten(shortcuts[key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorPosition, selectedBlockId, handleAddKaeriten]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左側：エディタエリア */}
      <div className="flex-1 flex flex-col p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold mb-2">{document.meta.title}</h1>
          <p className="text-sm text-gray-600">
            最終更新: {new Date(document.meta.modified).toLocaleString('ja-JP')}
          </p>
        </div>

        {/* テキスト入力エリア */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          <textarea
            ref={editorRef}
            value={currentBlock?.text || ''}
            onChange={handleTextChange}
            onSelect={handleCursorChange}
            onClick={handleCursorChange}
            className="w-full h-full p-4 font-serif text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ここに漢文を入力してください..."
            style={{
              fontFamily: document.meta.font,
              lineHeight: '1.8',
              resize: 'none'
            }}
          />
          <div className="mt-2 text-sm text-gray-500">
            カーソル位置: {cursorPosition} | 文字数: {currentBlock?.text.length || 0}
          </div>
        </div>
      </div>

      {/* 中央：縦書きプレビュー */}
      <div className="flex-1 bg-white border-l border-r border-gray-200 p-6 overflow-auto">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">プレビュー（縦書き）</h2>
        </div>
        <VerticalText
          block={currentBlock}
          className="mx-auto"
        />
      </div>

      {/* 右側：返り点パレット */}
      <div className="w-80 bg-gray-100 p-6 overflow-auto">
        <KaeritenPalette
          onSelect={handleAddKaeriten}
          currentPosition={cursorPosition}
        />
      </div>
    </div>
  );
}

export default KanbunEditor;
