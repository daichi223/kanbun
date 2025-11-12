import { useState, useRef, useEffect, useCallback } from 'react';
import { createDefaultDocument } from '../models/kanbunSchema';
import KaeritenPalette from './KaeritenPalette';
import VerticalText from './VerticalText';
import Toolbar from './Toolbar';
import StatusBar from './StatusBar';
import RubyDialog from './RubyDialog';
import TcyButton from './TcyButton';
import { useLocalStorage, useAutoSave, getStorageInfo } from '../hooks/useLocalStorage';
import { exportToWord } from '../services/wordExport';

/**
 * 漢文エディタのメインコンポーネント
 * Main Kanbun Editor Component with vertical text support
 */
function KanbunEditor() {
  const [document, setDocument] = useLocalStorage('kanbun_current_doc', createDefaultDocument());
  const [selectedBlockId] = useState('b1');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showRubyDialog, setShowRubyDialog] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const editorRef = useRef(null);

  // 自動保存（2秒ディレイ）
  useAutoSave('kanbun_autosave', document, 2000);

  // ストレージ情報更新
  useEffect(() => {
    const updateStorage = () => {
      const info = getStorageInfo();
      setStorageInfo(info);
    };

    updateStorage();
    const interval = setInterval(updateStorage, 5000);
    return () => clearInterval(interval);
  }, []);

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
  }, [cursorPosition, selectedBlockId, setDocument]);

  /**
   * ルビ追加ハンドラ
   */
  const handleAddRuby = useCallback((ruby) => {
    if (selection.start === selection.end) return;

    const selectedText = currentBlock.text.slice(selection.start, selection.end);

    const newAnnotation = {
      range: [selection.start, selection.end],
      type: 'ruby',
      rb: selectedText,
      rt: ruby
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
  }, [selection, selectedBlockId, currentBlock, setDocument]);

  /**
   * TCY適用ハンドラ
   */
  const handleApplyTcy = useCallback((newAnnotations) => {
    setDocument(prevDoc => {
      const newBlocks = prevDoc.blocks.map(block =>
        block.id === selectedBlockId
          ? { ...block, annotations: newAnnotations }
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
  }, [selectedBlockId, setDocument]);

  /**
   * カーソル位置更新
   */
  const handleCursorChange = (e) => {
    setCursorPosition(e.target.selectionStart);
    setSelection({
      start: e.target.selectionStart,
      end: e.target.selectionEnd
    });
  };

  /**
   * 保存ハンドラ
   */
  const handleSave = useCallback(() => {
    const dataStr = JSON.stringify(document, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.meta.title}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [document]);

  /**
   * 読み込みハンドラ
   */
  const handleLoad = () => {
    const input = window.document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loaded = JSON.parse(event.target.result);
          setDocument(loaded);
          alert('✅ ドキュメントを読み込みました');
        } catch (error) {
          alert('❌ ファイルの読み込みに失敗しました: ' + error.message);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  /**
   * 新規作成ハンドラ
   */
  const handleNew = () => {
    if (confirm('現在のドキュメントを破棄して新規作成しますか？')) {
      setDocument(createDefaultDocument());
    }
  };

  /**
   * Word出力ハンドラ
   */
  const handleExportWord = async () => {
    const result = await exportToWord(document);
    if (result.success) {
      alert(`✅ Word出力成功！\nファイル名: ${result.filename}`);
    } else {
      alert(`❌ Word出力失敗\nエラー: ${result.error}`);
    }
  };

  /**
   * キーボードショートカット処理
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S: 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      // Alt + 数字キー
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const shortcuts = {
          '0': () => {
            e.preventDefault();
            if (selection.start !== selection.end) {
              setShowRubyDialog(true);
            }
          },
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
          if (typeof shortcuts[key] === 'function') {
            shortcuts[key]();
          } else {
            e.preventDefault();
            handleAddKaeriten(shortcuts[key]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursorPosition, selection, selectedBlockId, handleAddKaeriten, handleSave]);

  const selectedText = selection.start !== selection.end
    ? currentBlock?.text.slice(selection.start, selection.end)
    : '';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ツールバー */}
      <Toolbar
        document={document}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
        onExportWord={handleExportWord}
        onExportPdf={() => alert('PDF出力は次のフェーズで実装予定')}
      />

      {/* メインコンテンツ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側：エディタエリア */}
        <div className="flex-1 flex flex-col p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">テキスト入力</h2>
          </div>

          {/* テキスト入力エリア */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-6 flex flex-col">
            <textarea
              ref={editorRef}
              value={currentBlock?.text || ''}
              onChange={handleTextChange}
              onSelect={handleCursorChange}
              onClick={handleCursorChange}
              className="flex-1 w-full p-4 font-serif text-lg border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ここに漢文を入力してください..."
              style={{
                fontFamily: document.meta.font,
                lineHeight: '1.8',
                resize: 'none'
              }}
            />
            <div className="mt-2 text-sm text-gray-500">
              カーソル位置: {cursorPosition} | 選択: {selection.start}-{selection.end} | 文字数: {currentBlock?.text.length || 0}
            </div>
          </div>
        </div>

        {/* 中央：返り点パレット */}
        <div className="w-80 bg-gray-100 border-l border-gray-200 p-6 overflow-auto space-y-4">
          <KaeritenPalette
            onSelect={handleAddKaeriten}
            currentPosition={cursorPosition}
            document={document}
          />

          <TcyButton
            document={document}
            onApplyTcy={handleApplyTcy}
            onRemoveTcy={handleApplyTcy}
          />

          {/* ルビボタン */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700 border-b pb-2">
              ルビ（振り仮名）
            </h3>
            <button
              onClick={() => {
                if (selection.start !== selection.end) {
                  setShowRubyDialog(true);
                } else {
                  alert('テキストを選択してからルビを追加してください');
                }
              }}
              disabled={selection.start === selection.end}
              className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📝 ルビを追加 (Alt+0)
            </button>
            {selectedText && (
              <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                <p className="text-green-800">選択中: {selectedText}</p>
              </div>
            )}
          </div>
        </div>

        {/* 右側：縦書きプレビュー */}
        <div className="flex-1 bg-white border-l border-gray-200 p-6 overflow-auto">
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">プレビュー（縦書き）</h2>
          </div>
          <VerticalText
            block={currentBlock}
            className="mx-auto"
          />
        </div>
      </div>

      {/* ステータスバー */}
      <StatusBar document={document} storageInfo={storageInfo} />

      {/* ルビダイアログ */}
      <RubyDialog
        isOpen={showRubyDialog}
        onClose={() => setShowRubyDialog(false)}
        onAdd={handleAddRuby}
        selectedText={selectedText}
      />
    </div>
  );
}

export default KanbunEditor;
