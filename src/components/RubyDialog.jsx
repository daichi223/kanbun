import { useState } from 'react';

/**
 * ルビ入力ダイアログコンポーネント
 * Ruby (furigana) input dialog
 */
function RubyDialog({ isOpen, onClose, onAdd, selectedText }) {
  const [ruby, setRuby] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ruby.trim()) {
      onAdd(ruby.trim());
      setRuby('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <h2 className="text-xl font-bold mb-4">ルビを追加</h2>

        {selectedText && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600 mb-1">選択したテキスト:</p>
            <p className="text-2xl font-serif">{selectedText}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              読み仮名（ひらがな/カタカナ）
            </label>
            <input
              type="text"
              value={ruby}
              onChange={(e) => setRuby(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: かん"
              autoFocus
            />
          </div>

          {ruby && selectedText && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-600 mb-1">プレビュー:</p>
              <ruby className="text-2xl font-serif">
                {selectedText}
                <rt className="text-sm">{ruby}</rt>
              </ruby>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRuby('');
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!ruby.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </div>
        </form>

        {/* ショートカットヒント */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 ヒント: テキストを選択してから Alt+0 でこのダイアログを開けます
          </p>
        </div>
      </div>
    </div>
  );
}

export default RubyDialog;
