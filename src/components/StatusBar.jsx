/**
 * ステータスバーコンポーネント
 * Status bar showing document statistics
 */
function StatusBar({ document, storageInfo }) {
  if (!document) return null;

  const currentBlock = document.blocks?.[0];
  const textLength = currentBlock?.text?.length || 0;
  const kaeritenCount = currentBlock?.annotations?.filter(
    ann => ann.type === 'kaeriten'
  ).length || 0;
  const rubyCount = currentBlock?.annotations?.filter(
    ann => ann.type === 'ruby'
  ).length || 0;
  const tcyCount = currentBlock?.annotations?.filter(
    ann => ann.type === 'tcy'
  ).length || 0;

  return (
    <div className="bg-gray-800 text-white px-6 py-2 text-xs flex items-center justify-between">
      {/* 左側：統計情報 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">文字数:</span>
          <span className="font-mono font-semibold">{textLength}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">返り点:</span>
          <span className="font-mono font-semibold text-red-400">{kaeritenCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">ルビ:</span>
          <span className="font-mono font-semibold text-green-400">{rubyCount}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">縦中横:</span>
          <span className="font-mono font-semibold text-purple-400">{tcyCount}</span>
        </div>
      </div>

      {/* 右側：その他情報 */}
      <div className="flex items-center gap-6">
        {storageInfo && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">ストレージ:</span>
            <span className="font-mono">{storageInfo.used} KB / {storageInfo.max} KB</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-gray-400">用紙:</span>
          <span className="font-mono">{document.meta?.paper || 'B5'}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">フォント:</span>
          <span className="font-mono">{document.meta?.font || '游明朝'}</span>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
