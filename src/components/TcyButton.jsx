import { detectTcyPatterns, autoApplyTcy } from '../utils/tcyUtils';

/**
 * 縦中横ボタンコンポーネント
 * TCY (Tate-Chu-Yoko) control button
 */
function TcyButton({ document, onApplyTcy, onRemoveTcy }) {
  const currentBlock = document?.blocks?.[0];

  if (!currentBlock) return null;

  const patterns = detectTcyPatterns(currentBlock.text);
  const existingTcy = currentBlock.annotations?.filter(ann => ann.type === 'tcy') || [];

  const handleAutoApply = () => {
    const newAnnotations = autoApplyTcy(currentBlock.text, currentBlock.annotations);
    onApplyTcy(newAnnotations);
  };

  const handleRemoveAll = () => {
    const newAnnotations = currentBlock.annotations.filter(ann => ann.type !== 'tcy');
    onRemoveTcy(newAnnotations);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-700 border-b pb-2">
        縦中横（TCY）
      </h3>

      {/* 説明 */}
      <p className="text-xs text-gray-600 mb-3">
        数字や年号を縦書きで横向きに表示します
      </p>

      {/* 検出パターン表示 */}
      {patterns.length > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
          <p className="text-blue-800 font-semibold mb-1">
            検出: {patterns.length}件
          </p>
          <div className="flex flex-wrap gap-1">
            {patterns.slice(0, 5).map((p, idx) => (
              <span key={idx} className="px-2 py-1 bg-blue-200 rounded">
                {p.text}
              </span>
            ))}
            {patterns.length > 5 && (
              <span className="px-2 py-1 text-blue-600">
                +{patterns.length - 5}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 現在の適用状況 */}
      {existingTcy.length > 0 && (
        <div className="mb-3 p-2 bg-green-50 rounded text-xs">
          <p className="text-green-800 font-semibold">
            適用中: {existingTcy.length}件
          </p>
        </div>
      )}

      {/* ボタン */}
      <div className="space-y-2">
        <button
          onClick={handleAutoApply}
          disabled={patterns.length === 0}
          className="w-full p-3 bg-purple-500 hover:bg-purple-600 text-white rounded transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🔢 自動適用
        </button>

        {existingTcy.length > 0 && (
          <button
            onClick={handleRemoveAll}
            className="w-full p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition text-xs"
          >
            すべて解除
          </button>
        )}
      </div>

      {/* ヒント */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 2桁の数字、年号、大文字英字を自動検出します
        </p>
      </div>
    </div>
  );
}

export default TcyButton;
