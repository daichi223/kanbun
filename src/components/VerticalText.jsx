/**
 * 縦書きテキスト表示コンポーネント
 * Vertical text rendering component with annotations
 */
function VerticalText({ block, className = '' }) {
  if (!block) {
    return (
      <div className={`text-center text-gray-400 ${className}`}>
        テキストを入力してください
      </div>
    );
  }

  /**
   * テキストをアノテーション付きで分割
   */
  const renderText = () => {
    const { text, annotations } = block;
    if (!text) return null;

    // 位置ごとの返り点マップを作成
    const kaeritenMap = new Map();
    annotations.forEach(ann => {
      if (ann.type === 'kaeriten' && ann.pos !== undefined) {
        kaeritenMap.set(ann.pos, ann.value);
      }
    });

    // 文字を1つずつ処理
    const chars = Array.from(text);
    return chars.map((char, idx) => {
      const kaeriten = kaeritenMap.get(idx);

      return (
        <span key={idx} className="relative inline-block">
          <span className="text-3xl">{char}</span>
          {kaeriten && (
            <span className="absolute text-sm text-red-600 font-bold" style={{
              right: '-1.2em',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              {kaeriten}
            </span>
          )}
        </span>
      );
    });
  };

  return (
    <div className={`vertical-text-container ${className}`}>
      <div
        className="vertical-text bg-amber-50 p-8 rounded-lg shadow-inner inline-block max-h-[80vh] overflow-auto"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'upright',
          fontFamily: 'Yu Mincho, 游明朝, Hiragino Mincho ProN, serif',
          fontSize: '1.5rem',
          lineHeight: '2.5',
          letterSpacing: '0.1em'
        }}
      >
        {renderText()}
      </div>

      <style>{`
        .vertical-text {
          /* 縦書き用のスクロールバーカスタマイズ */
          scrollbar-width: thin;
          scrollbar-color: #d1a95f #f5e6d3;
        }

        .vertical-text::-webkit-scrollbar {
          width: 8px;
        }

        .vertical-text::-webkit-scrollbar-track {
          background: #f5e6d3;
          border-radius: 4px;
        }

        .vertical-text::-webkit-scrollbar-thumb {
          background: #d1a95f;
          border-radius: 4px;
        }

        .vertical-text::-webkit-scrollbar-thumb:hover {
          background: #b8935a;
        }

        /* 約物の回転（句読点など） */
        .vertical-text span:has(+ span::before) {
          text-combine-upright: all;
        }
      `}</style>
    </div>
  );
}

export default VerticalText;
