import { KAERITEN_TYPES } from '../models/kanbunSchema';
import { exportToWord, exportForMacro } from '../services/wordExport';
import { exportToPdf } from '../services/pdfExport';

/**
 * 返り点パレットコンポーネント
 * Kaeriten (return marks) selection palette
 */
function KaeritenPalette({ onSelect, currentPosition, document, previewRef }) {
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
    <div className="space-y-3">
      <div className="mb-2">
        <h2 className="text-lg font-bold mb-1">返り点パレット</h2>
        {currentPosition !== null && (
          <p className="text-xs text-gray-600">
            選択位置: {currentPosition}
          </p>
        )}
      </div>

      {/* ショートカット説明 */}
      <div className="bg-blue-50 p-2 rounded">
        <p className="text-xs text-blue-800">
          Alt + 数字キーで返り点を追加
        </p>
      </div>

      {/* 返り点グループ */}
      {kaeritenGroups.map((group, idx) => (
        <div key={idx} className="bg-white rounded shadow p-2">
          <h3 className="text-xs font-semibold mb-2 text-gray-700 border-b pb-1">
            {group.name}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            {group.items.map((item, itemIdx) => (
              <button
                key={itemIdx}
                onClick={() => onSelect(item.value)}
                className="group relative p-1.5 bg-gray-50 hover:bg-blue-100 border border-gray-200 hover:border-blue-400 rounded transition-all duration-150"
                title={item.description}
              >
                <div className="text-lg font-bold text-center">
                  {item.value}
                </div>
                {item.key && (
                  <div className="text-[10px] text-gray-500 text-center leading-tight">
                    {item.key}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ルビ・縦中横ボタン */}
      <div className="bg-white rounded shadow p-2">
        <h3 className="text-xs font-semibold mb-2 text-gray-700 border-b pb-1">
          その他の機能
        </h3>
        <div className="space-y-1.5">
          <button
            className="w-full p-2 bg-gray-50 hover:bg-green-100 border border-gray-200 hover:border-green-400 rounded transition-all duration-150 text-xs font-medium"
            onClick={() => alert('ルビ機能は次のフェーズで実装予定')}
          >
            📝 ルビを追加 (Alt+0)
          </button>
          <button
            className="w-full p-2 bg-gray-50 hover:bg-purple-100 border border-gray-200 hover:border-purple-400 rounded transition-all duration-150 text-xs font-medium"
            onClick={() => alert('縦中横機能は次のフェーズで実装予定')}
          >
            🔢 縦中横
          </button>
        </div>
      </div>

      {/* エクスポートボタン */}
      <div className="bg-white rounded shadow p-2">
        <h3 className="text-xs font-semibold mb-2 text-gray-700 border-b pb-1">
          エクスポート
        </h3>
        <div className="space-y-1.5">
          <button
            className="w-full p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-all duration-150 text-xs font-medium"
            onClick={async () => {
              if (!document) {
                alert('ドキュメントが見つかりません');
                return;
              }

              if (!previewRef?.current) {
                alert('プレビュー要素が見つかりません');
                return;
              }

              try {
                const result = await exportToPdf(document, previewRef.current);
                if (result.success) {
                  alert(`✅ PDF出力成功！\nファイル名: ${result.filename}`);
                } else {
                  alert(`❌ PDF出力失敗\nエラー: ${result.error}`);
                }
              } catch (error) {
                alert(`❌ PDF出力エラー\n${error.message}`);
              }
            }}
          >
            📄 PDF出力
          </button>
          <button
            className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-all duration-150 text-xs font-medium"
            onClick={async () => {
              if (!document) {
                alert('ドキュメントが見つかりません');
                return;
              }

              const result = await exportToWord(document);
              if (result.success) {
                alert(`✅ Word出力成功！\nファイル名: ${result.filename}`);
              } else {
                alert(`❌ Word出力失敗\nエラー: ${result.error}`);
              }
            }}
          >
            📝 Word出力
          </button>
          <button
            className="w-full p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-all duration-150 text-xs font-medium"
            onClick={() => {
              if (!document) {
                alert('ドキュメントが見つかりません');
                return;
              }

              const result = exportForMacro(document);
              if (result.success) {
                alert(`✅ マクロ用テキスト出力成功！\nファイル名: ${result.filename}`);
              }
            }}
          >
            🔧 マクロ用テキスト
          </button>
        </div>
      </div>
    </div>
  );
}

export default KaeritenPalette;
