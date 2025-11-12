import { KAERITEN_TYPES } from '../models/kanbunSchema';

/**
 * 返り点パレットコンポーネント
 * Kaeriten (return marks) selection palette
 */
function KaeritenPalette({ onSelect, currentPosition }) {
  const kaeritenGroups = [
    {
      name: '基本',
      items: [
        { value: KAERITEN_TYPES.RE, key: 'Alt+1', description: 'レ点' }
      ]
    },
    {
      name: '一二点',
      items: [
        { value: KAERITEN_TYPES.ICHI, key: 'Alt+2', description: '一点' },
        { value: KAERITEN_TYPES.NI, key: 'Alt+3', description: '二点' },
        { value: KAERITEN_TYPES.SAN, key: 'Alt+4', description: '三点' }
      ]
    },
    {
      name: '上下点',
      items: [
        { value: KAERITEN_TYPES.JOU, key: 'Alt+5', description: '上点' },
        { value: KAERITEN_TYPES.CHUU, key: 'Alt+6', description: '中点' },
        { value: KAERITEN_TYPES.GE, key: 'Alt+7', description: '下点' }
      ]
    },
    {
      name: '甲乙点',
      items: [
        { value: KAERITEN_TYPES.KOU, key: 'Alt+8', description: '甲点' },
        { value: KAERITEN_TYPES.OTSU, key: 'Alt+9', description: '乙点' },
        { value: KAERITEN_TYPES.HEI, key: '', description: '丙点' },
        { value: KAERITEN_TYPES.TEI, key: '', description: '丁点' }
      ]
    },
    {
      name: '天地人',
      items: [
        { value: KAERITEN_TYPES.TEN, key: '', description: '天点' },
        { value: KAERITEN_TYPES.CHI, key: '', description: '地点' },
        { value: KAERITEN_TYPES.JIN, key: '', description: '人点' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">返り点パレット</h2>
        {currentPosition !== null && (
          <p className="text-sm text-gray-600">
            選択位置: {currentPosition}
          </p>
        )}
      </div>

      {/* ショートカット説明 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-semibold mb-2 text-blue-900">
          キーボードショートカット
        </h3>
        <p className="text-xs text-blue-800">
          Alt + 数字キーで返り点を追加できます
        </p>
      </div>

      {/* 返り点グループ */}
      {kaeritenGroups.map((group, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-700 border-b pb-2">
            {group.name}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {group.items.map((item, itemIdx) => (
              <button
                key={itemIdx}
                onClick={() => onSelect(item.value)}
                className="group relative p-3 bg-gray-50 hover:bg-blue-100 border border-gray-200 hover:border-blue-400 rounded transition-all duration-150"
                title={item.description}
              >
                <div className="text-2xl font-bold text-center mb-1">
                  {item.value}
                </div>
                {item.key && (
                  <div className="text-xs text-gray-500 text-center">
                    {item.key}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ルビ・縦中横ボタン */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 border-b pb-2">
          その他の機能
        </h3>
        <div className="space-y-2">
          <button
            className="w-full p-3 bg-gray-50 hover:bg-green-100 border border-gray-200 hover:border-green-400 rounded transition-all duration-150 text-sm font-medium"
            onClick={() => alert('ルビ機能は次のフェーズで実装予定')}
          >
            📝 ルビを追加 (Alt+0)
          </button>
          <button
            className="w-full p-3 bg-gray-50 hover:bg-purple-100 border border-gray-200 hover:border-purple-400 rounded transition-all duration-150 text-sm font-medium"
            onClick={() => alert('縦中横機能は次のフェーズで実装予定')}
          >
            🔢 縦中横
          </button>
        </div>
      </div>

      {/* エクスポートボタン */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 border-b pb-2">
          エクスポート
        </h3>
        <div className="space-y-2">
          <button
            className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded transition-all duration-150 text-sm font-medium"
            onClick={() => alert('PDF出力は次のフェーズで実装予定')}
          >
            📄 PDF出力
          </button>
          <button
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded transition-all duration-150 text-sm font-medium"
            onClick={() => alert('Word出力は次のフェーズで実装予定')}
          >
            📝 Word出力
          </button>
        </div>
      </div>
    </div>
  );
}

export default KaeritenPalette;
