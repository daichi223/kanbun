import { useState } from 'react';

/**
 * ツールバーコンポーネント
 * Toolbar with save/load/export actions
 */
function Toolbar({ document, onSave, onLoad, onNew, onExportWord, onExportPdf }) {
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* 左側：ロゴとタイトル */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">
            📝 KBR Editor
          </h1>
          {document?.meta?.title && (
            <span className="text-sm text-gray-500 border-l pl-4">
              {document.meta.title}
            </span>
          )}
        </div>

        {/* 右側：アクションボタン */}
        <div className="flex items-center gap-2">
          {/* 新規作成 */}
          <button
            onClick={onNew}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
            title="新規作成"
          >
            📄 新規
          </button>

          {/* 保存 */}
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded transition"
            title="保存 (Ctrl+S)"
          >
            💾 保存
          </button>

          {/* 開く */}
          <div className="relative">
            <button
              onClick={() => setShowLoadMenu(!showLoadMenu)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
              title="ドキュメントを開く"
            >
              📂 開く
            </button>

            {showLoadMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <button
                  onClick={() => {
                    onLoad();
                    setShowLoadMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
                >
                  📥 JSONファイルから
                </button>
                <button
                  onClick={() => {
                    // TODO: ローカルストレージから選択
                    setShowLoadMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
                >
                  💾 保存済みから
                </button>
              </div>
            )}
          </div>

          {/* 区切り線 */}
          <div className="h-6 w-px bg-gray-300 mx-2" />

          {/* Word出力 */}
          <button
            onClick={onExportWord}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded transition"
            title="Word出力"
          >
            📝 Word
          </button>

          {/* PDF出力 */}
          <button
            onClick={onExportPdf}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded transition"
            title="PDF出力"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {/* 最終保存日時 */}
      {document?.meta?.modified && (
        <div className="px-6 py-1 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            最終更新: {new Date(document.meta.modified).toLocaleString('ja-JP')}
          </p>
        </div>
      )}
    </div>
  );
}

export default Toolbar;
