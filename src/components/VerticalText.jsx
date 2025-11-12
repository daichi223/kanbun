import { forwardRef } from 'react';

/**
 * 縦書きテキスト表示コンポーネント
 * Vertical text rendering component with annotations (Kaeriten, Ruby, TCY)
 */
const VerticalText = forwardRef(({ block, className = '' }, ref) => {
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

    // 各種アノテーションのマップを作成
    const kaeritenMap = new Map();
    const rubyMap = new Map();
    const tcySet = new Set();

    annotations.forEach(ann => {
      // 返り点
      if (ann.type === 'kaeriten' && ann.pos !== undefined) {
        kaeritenMap.set(ann.pos, ann.value);
      }

      // ルビ
      if (ann.type === 'ruby' && ann.range) {
        for (let i = ann.range[0]; i < ann.range[1]; i++) {
          rubyMap.set(i, {
            isStart: i === ann.range[0],
            isEnd: i === ann.range[1] - 1,
            rt: ann.rt,
            fullRange: ann.range
          });
        }
      }

      // 縦中横
      if (ann.type === 'tcy' && ann.range) {
        for (let i = ann.range[0]; i < ann.range[1]; i++) {
          tcySet.add(i);
        }
      }
    });

    // 縦中横のグループを作成
    const tcyGroups = [];
    annotations
      .filter(ann => ann.type === 'tcy' && ann.range)
      .forEach(ann => {
        tcyGroups.push({
          start: ann.range[0],
          end: ann.range[1],
          text: text.slice(ann.range[0], ann.range[1])
        });
      });

    // ルビのグループを作成
    const rubyGroups = [];
    annotations
      .filter(ann => ann.type === 'ruby' && ann.range)
      .forEach(ann => {
        rubyGroups.push({
          start: ann.range[0],
          end: ann.range[1],
          rb: ann.rb,
          rt: ann.rt
        });
      });

    // 文字を1つずつ処理
    const chars = Array.from(text);
    const elements = [];
    let skipUntil = -1;

    for (let idx = 0; idx < chars.length; idx++) {
      // すでに処理済みならスキップ
      if (idx < skipUntil) continue;

      const char = chars[idx];

      // 縦中横グループに属する場合
      const tcyGroup = tcyGroups.find(g => idx === g.start);
      if (tcyGroup) {
        elements.push(
          <span
            key={`tcy-${idx}`}
            className="inline-block text-2xl"
            style={{
              textCombineUpright: 'all',
              WebkitTextCombineUpright: 'all',
              backgroundColor: 'rgba(147, 51, 234, 0.1)',
              padding: '0.1em 0.2em',
              borderRadius: '2px'
            }}
          >
            {tcyGroup.text}
          </span>
        );
        skipUntil = tcyGroup.end;
        continue;
      }

      // ルビグループに属する場合
      const rubyGroup = rubyGroups.find(g => idx === g.start);
      if (rubyGroup) {
        const kaeriten = kaeritenMap.get(rubyGroup.start);

        elements.push(
          <span key={`ruby-${idx}`} className="relative inline-block">
            <ruby className="text-3xl">
              {rubyGroup.rb}
              <rt className="text-sm text-gray-600">{rubyGroup.rt}</rt>
            </ruby>
            {kaeriten && (
              <span
                className="absolute text-sm text-red-600 font-bold"
                style={{
                  right: '-1.2em',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                {kaeriten}
              </span>
            )}
          </span>
        );
        skipUntil = rubyGroup.end;
        continue;
      }

      // 通常の文字
      const kaeriten = kaeritenMap.get(idx);

      elements.push(
        <span key={idx} className="relative inline-block">
          <span className="text-3xl">{char}</span>
          {kaeriten && (
            <span
              className="absolute text-sm text-red-600 font-bold"
              style={{
                right: '-1.2em',
                top: '50%',
                transform: 'translateY(-50%)'
              }}
            >
              {kaeriten}
            </span>
          )}
        </span>
      );
    }

    return elements;
  };

  return (
    <div className={`vertical-text-container ${className}`}>
      <div
        ref={ref}
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

        /* ルビの縦書き対応 */
        .vertical-text ruby {
          ruby-position: over;
        }

        .vertical-text rt {
          font-size: 0.5em;
        }
      `}</style>
    </div>
  );
});

VerticalText.displayName = 'VerticalText';

export default VerticalText;
