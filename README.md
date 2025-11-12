# 漢文返り点Webエディタ (KBR Editor)

## 📖 概要

KBR Editor（Kanbun Kaeriten Browser Editor）は、漢文教材を効率的に作成・編集するためのWebアプリケーションです。縦書きレイアウトで返り点・ルビ・縦中横を簡単に付与でき、PDF・Word形式で出力可能です。

## ✨ 主な機能

### Phase 1 (完了) ✅
- ✅ 縦書きエディタ
- ✅ 返り点パレット（レ・一二点・上下点・甲乙点など）
- ✅ キーボードショートカット（Alt+1〜9）
- ✅ リアルタイムプレビュー
- ✅ JSON構造でのデータ保存

### Phase 2 (完了) ✅
- ✅ UI改善（レイアウト変更）
- ✅ Word出力機能（.docx）
- ✅ マクロ用テキスト出力

### Phase 3 (完了) ✅
- ✅ ルビ（振り仮名）対応
- ✅ 縦中横対応（自動検出）
- ✅ ローカルストレージ自動保存
- ✅ ツールバー＆ステータスバー

### Phase 4 (予定)
- 📄 PDF出力（Puppeteer）
- 🌐 Google Docs用HTML出力

### Phase 5 (予定)
- 📋 Wordマクロテンプレート（.dotm）
- 🎨 禁則処理・約物回転
- ⚙️ カスタム設定
- 🤖 AI支援機能

## 🚀 使い方

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

### ビルド

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## ⌨️ キーボードショートカット

| キー | 機能 |
|------|------|
| Alt+1 | レ点 |
| Alt+2 | 一点 |
| Alt+3 | 二点 |
| Alt+4 | 三点 |
| Alt+5 | 上点 |
| Alt+6 | 中点 |
| Alt+7 | 下点 |
| Alt+8 | 甲点 |
| Alt+9 | 乙点 |
| Alt+0 | ルビ入力（実装予定） |

## 🏗️ 技術スタック

- **Frontend**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **Styling**: TailwindCSS 4.1.17
- **PDF Export**: Puppeteer（予定）
- **Word Export**: docx（予定）

## 📁 プロジェクト構造

```
kanbun/
├── .claude/              # Claude Code設定
│   └── Claude.md         # 開発ルール
├── src/
│   ├── components/       # Reactコンポーネント
│   │   ├── KanbunEditor.jsx      # メインエディタ
│   │   ├── KaeritenPalette.jsx   # 返り点パレット
│   │   └── VerticalText.jsx      # 縦書きプレビュー
│   ├── hooks/           # カスタムフック
│   ├── models/          # データモデル
│   │   └── kanbunSchema.js       # JSONスキーマ定義
│   ├── services/        # エクスポートサービス
│   ├── utils/           # ユーティリティ関数
│   │   └── textUtils.js          # テキスト処理
│   └── assets/          # 静的ファイル
├── public/              # 公開ファイル
└── dist/                # ビルド出力
```

## 📊 データモデル

```json
{
  "blocks": [
    {
      "id": "b1",
      "vertical": true,
      "text": "故人之所為、皆當以禮。",
      "annotations": [
        {"pos": 2, "type": "kaeriten", "value": "レ"},
        {"range": [1, 2], "type": "ruby", "rb": "人", "rt": "ひと"}
      ]
    }
  ],
  "meta": {
    "title": "孟子 抜粋",
    "paper": "B5",
    "font": "游明朝",
    "author": "森川大地"
  }
}
```

## 🎯 今後の展開

1. **Ver.2**: 半自動返り点候補（構文解析＋辞書）
2. **Ver.3**: クラス共有モード（校内サーバー同期）
3. **Ver.4**: Streamlit版 or Chrome拡張版
4. **Ver.5**: AI補助による返り点学習支援

## 📝 開発ルール

開発ルールは `.claude/Claude.md` を参照してください。

- 並列開発の活用
- Definition of Done（DOD）の遵守
- フェーズごとのビルド・Lint確認

## 📄 ライセンス

このプロジェクトは教育目的で作成されています。

## 👤 作成者

森川大地

---

## 📅 開発履歴

| Phase | 完了日 | 主な機能 |
|-------|--------|----------|
| Phase 1 | 2025-11-12 | プロジェクト基盤構築、縦書きエディタ |
| Phase 2 | 2025-11-12 | UI改善、Word出力機能 |
| Phase 3 | 2025-11-12 | ルビ・縦中横・ツールバー・ローカルストレージ |
