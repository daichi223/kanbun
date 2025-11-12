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
   * 返り点を描画（単一または多段）
   */
  const renderKaeriten = (kaeritenValue, hasRuby = false) => {
    if (!kaeritenValue) return null;

    // 配列の場合は多段返り点
    const marks = Array.isArray(kaeritenValue) ? kaeritenValue : [kaeritenValue];

    return marks.map((mark, idx) => {
      // 多段返り点の場合、右方向にずらす
      const horizontalOffset = hasRuby ? -1.5 : -0.34;
      const stackOffset = idx * -0.36; // 多段の場合、さらに右にずらす

      return (
        <span
          key={`kaeri-${idx}`}
          className="kaeriten-mark"
          style={{
            position: 'absolute',
            insetInlineStart: `${horizontalOffset + stackOffset}em`,
            insetBlockStart: '0.35em', // 文字中央よりやや上
            fontSize: '0.45em',
            color: '#dc2626',
            fontWeight: 'bold',
            lineHeight: 1,
            pointerEvents: 'none'
          }}
        >
          {mark}
        </span>
      );
    });
  };

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
        const kaeriten = kaeritenMap.get(idx);

        elements.push(
          <span key={`tcy-${idx}`} className="char-container">
            <span
              className="tcy-text"
              style={{
                display: 'inline-block',
                textCombineUpright: 'all',
                WebkitTextCombineUpright: 'all',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                padding: '0.1em 0.2em',
                borderRadius: '2px'
              }}
            >
              {tcyGroup.text}
            </span>
            {renderKaeriten(kaeriten, false)}
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
          <span key={`ruby-${idx}`} className="char-container">
            <ruby className="ruby-text">
              {rubyGroup.rb}
              <rt className="ruby-rt">{rubyGroup.rt}</rt>
            </ruby>
            {renderKaeriten(kaeriten, true)}
          </span>
        );
        skipUntil = rubyGroup.end;
        continue;
      }

      // 通常の文字
      const kaeriten = kaeritenMap.get(idx);

      elements.push(
        <span key={idx} className="char-container">
          <span className="base-char">{char}</span>
          {renderKaeriten(kaeriten, false)}
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

        /* 文字コンテナ - 返り点の位置基準 */
        .char-container {
          position: relative;
          display: inline-block;
        }

        /* 基本文字 */
        .base-char {
          font-size: 1em;
          display: inline-block;
        }

        /* ルビの縦書き対応 */
        .vertical-text ruby,
        .ruby-text {
          ruby-position: over;
          font-size: 1em;
        }

        .vertical-text rt,
        .ruby-rt {
          font-size: 0.5em;
          color: #6b7280;
        }

        /* 縦中横 */
        .tcy-text {
          font-size: 0.75em;
        }

        /* 返り点マーク */
        .kaeriten-mark {
          white-space: nowrap;
          user-select: none;
        }
      `}</style>
    </div>
  );
});

VerticalText.displayName = 'VerticalText';

export default VerticalText;
