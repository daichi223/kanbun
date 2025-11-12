# KBR Editor 開発ルール v2.0

## 🎯 開発哲学

このプロジェクトでは、**Claude Codeのサブエージェント機能を最大限活用**し、効率的な並列開発を実現します。

---

## 🚀 サブエージェント活用ベストプラクティス

### 1. Task Tool の戦略的活用

#### ✅ 必ず Task Tool を使うべき状況

```javascript
// ❌ BAD: 直接Grep/Globを使う
- 「エラーハンドリングはどこにあるか探して」
- 「コンポーネントの構造を理解したい」
- 「データフローを追跡したい」

// ✅ GOOD: Task Tool (subagent_type=Explore) を使う
Task({
  subagent_type: "Explore",
  prompt: "エラーハンドリングの実装箇所を全て調査",
  description: "Error handling investigation"
})
```

#### 📋 Task Tool 使用シナリオ

| シナリオ | subagent_type | 説明 |
|---------|---------------|------|
| コードベース探索 | `Explore` | ファイル構造・依存関係の理解 |
| 実装計画策定 | `Plan` | 複雑な機能の設計・タスク分解 |
| 複雑なリファクタリング | `general-purpose` | 複数ファイルにまたがる変更 |
| バグ調査 | `Explore` | エラー原因の特定 |

### 2. 並列実行の原則

#### ⚡ 常に並列で実行すべきタスク

```javascript
// ✅ GOOD: 単一メッセージで並列実行
<invoke name="Write">...</invoke>
<invoke name="Write">...</invoke>
<invoke name="Write">...</invoke>

// ❌ BAD: 逐次実行
メッセージ1: Write file A
メッセージ2: Write file B
メッセージ3: Write file C
```

#### 並列実行可能なタスク例

- 独立したコンポーネントファイルの作成
- 複数ユーティリティ関数の実装
- テストファイルの生成
- ドキュメントの更新
- Lint/Build/Test の実行

---

## ✅ Definition of Done (DOD)

### フェーズ完了時の必須チェックリスト

各フェーズ終了時、以下を**すべて**完了させること：

#### 1️⃣ コード品質チェック

```bash
# ESLint チェック（エラー0件必須）
npm run lint

# プロダクションビルド（成功必須）
npm run build

# 開発サーバー起動確認
npm run dev
```

#### 2️⃣ コードレビュー（自動）

**Task Tool を使った自動レビュー**

```javascript
Task({
  subagent_type: "general-purpose",
  prompt: `
    以下の観点でコードレビューを実施：
    1. パフォーマンス問題（不要な再レンダリング等）
    2. セキュリティ問題（XSS, インジェクション等）
    3. アクセシビリティ問題（ARIA属性等）
    4. ベストプラクティス違反
    5. 潜在的バグ

    フェーズ完了前の最終チェックとして実施。
  `,
  description: "Automated code review"
})
```

#### 3️⃣ ドキュメント更新

- [ ] README.md の機能リスト更新
- [ ] コンポーネントのJSDoc完備
- [ ] CHANGELOG.md への記載（該当する場合）

#### 4️⃣ Git コミット＆プッシュ

```bash
# コミット（フォーマット厳守）
git commit -m "feat: Phase X - 機能名

✨ 実装内容:
- 機能1
- 機能2

📋 DOD完了:
- ✅ ESLint エラー 0件
- ✅ ビルド成功
- ✅ コードレビュー完了

🎯 次のフェーズ:
- Phase X+1の概要
"

# プッシュ（リトライ付き）
git push -u origin <branch-name>
```

---

## 📊 フェーズ管理

### Phase 定義

| Phase | 内容 | 完了基準 |
|-------|------|----------|
| **Phase 1** | 基盤構築 | ✅ 完了 (2025-11-12) |
| **Phase 2** | UI改善 + 保存機能 | Toolbar, StatusBar, LocalStorage |
| **Phase 3** | アノテーション拡張 | Ruby, TCY, Context Menu |
| **Phase 4** | エクスポート機能 | PDF, Word, GoogleDocs |
| **Phase 5** | 高度な機能 | Macro, 禁則処理, AI支援 |

### Phase 開始時のプロトコル

```markdown
1. TodoWrite でタスクリスト作成
2. 並列実行可能なタスクを特定
3. Task Tool で複雑なタスクを分離
4. 単一メッセージで並列実行開始
```

### Phase 終了時のプロトコル

```markdown
1. npm run lint（エラー0件確認）
2. npm run build（成功確認）
3. Task Tool でコードレビュー実施
4. README更新
5. Git commit & push
6. TodoWrite でPhase完了マーク
```

---

## 🎨 コードレビュー基準

### 自動チェック項目

#### パフォーマンス
- [ ] 不要な `useEffect` 依存配列
- [ ] メモ化不足（`useMemo`, `useCallback`）
- [ ] 大規模配列の非効率的処理

#### セキュリティ
- [ ] `dangerouslySetInnerHTML` の使用
- [ ] ユーザー入力の未検証使用
- [ ] XSS脆弱性

#### 可読性
- [ ] JSDocコメント不足
- [ ] マジックナンバー
- [ ] 関数の複雑度が高い（15行超）

#### アクセシビリティ
- [ ] ボタンに `aria-label` 不足
- [ ] キーボード操作未対応
- [ ] 色のみで情報伝達

---

## 🛠️ 並列開発戦略

### 実践例：Phase 2開始時

```javascript
// ❌ BAD: 逐次開発
1. Toolbar.jsx 作成
2. StatusBar.jsx 作成
3. useLocalStorage.js 作成

// ✅ GOOD: 並列開発
<single message>
  <Write file="Toolbar.jsx">...</Write>
  <Write file="StatusBar.jsx">...</Write>
  <Write file="useLocalStorage.js">...</Write>
</single message>
```

### タスク依存関係の管理

```mermaid
並列可能:
  - Component A
  - Component B
  - Utility X

逐次必須:
  1. Data Model定義
  2. Component実装（1に依存）
  3. Integration（2に依存）
```

---

## 📝 コミットルール

### フォーマット

```
<type>: <subject>

<body>

<footer>
```

### Type一覧

| Type | 説明 | 例 |
|------|------|-----|
| `feat` | 新機能 | `feat: Add toolbar component` |
| `fix` | バグ修正 | `fix: Resolve cursor position bug` |
| `refactor` | リファクタリング | `refactor: Extract hook logic` |
| `docs` | ドキュメント | `docs: Update README` |
| `style` | フォーマット | `style: Fix indentation` |
| `test` | テスト追加 | `test: Add unit tests` |
| `chore` | その他 | `chore: Update dependencies` |

---

## 🏗️ 技術スタック

### Core
- **Frontend**: React 19.2.0
- **Build**: Vite 7.2.2
- **Styling**: TailwindCSS 4.1.17

### Planned
- **PDF Export**: Puppeteer
- **Word Export**: docx (dolanmiu/docx)
- **State**: Context API / Zustand

---

## 📁 ディレクトリ構造

```
kanbun/
├── .claude/
│   ├── Claude.md           # このファイル（開発ルール）
│   └── commands/           # カスタムスラッシュコマンド
├── src/
│   ├── components/         # UI Components
│   │   ├── editor/        # Editor関連
│   │   ├── palette/       # Palette関連
│   │   └── shared/        # 共通コンポーネント
│   ├── hooks/             # Custom Hooks
│   ├── models/            # Data Models & Schema
│   ├── services/          # Export Services
│   ├── utils/             # Utilities
│   └── assets/            # Static Files
├── public/
├── templates/             # Word/PDF Templates
└── docs/                  # Additional Documentation
```

---

## 🎯 現在の状態

**Phase**: ✅ Phase 1 完了 → 🚧 Phase 2 準備中

**最終コミット**: `ab7a41e` - Phase 1完了

**次のアクション**:
1. UI改善提案から実装対象を決定
2. Phase 2のタスク分解
3. 並列開発開始

---

## 💡 Quick Reference

### フェーズ開始時

```bash
# 1. ブランチ確認
git status

# 2. タスクリスト作成
TodoWrite [...]

# 3. 並列実行開始（単一メッセージ）
```

### フェーズ終了時

```bash
# 1. 品質チェック
npm run lint && npm run build

# 2. レビュー（Task Tool使用）
# 3. コミット＆プッシュ
git add -A && git commit && git push

# 4. Phaseクローズ
TodoWrite [all completed]
```

---

**Last Updated**: 2025-11-12
**Version**: 2.0
**Maintainer**: 森川大地 + Claude Code
