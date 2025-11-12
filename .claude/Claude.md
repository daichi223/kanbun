# KBR Editor 開発ルール

## 開発哲学

このプロジェクトでは、Claude Codeのサブエージェント機能を最大限活用し、効率的な並列開発を実現します。

## ベストプラクティス

### 1. 分散並列エージェントの活用

- **並列タスク実行**: 独立したタスクは常に並列で実行
- **Task toolの積極利用**: 複雑な探索やコード検索にはTaskツール（subagent_type=Explore）を使用
- **効率最優先**: 単一のメッセージで複数のツール呼び出しを実行

### 2. Definition of Done (DOD)

各フェーズ終了時に以下を必ず実施：

#### Phase Complete Checklist
- [ ] コードレビュー実施
- [ ] プロダクションビルド成功確認
- [ ] ESLintエラー0件
- [ ] 機能テスト完了
- [ ] ドキュメント更新
- [ ] Git commit & push

#### コマンド例
```bash
# ビルド確認
npm run build

# Lint実行
npm run lint

# 開発サーバー起動確認
npm run dev
```

### 3. フェーズ管理

開発を以下のフェーズに分割：

1. **Phase 1**: プロジェクト基盤構築
   - React + Vite + TailwindCSS セットアップ
   - データモデル定義
   - 基本コンポーネント構造

2. **Phase 2**: コアエディタ機能
   - 縦書きエディタコンポーネント
   - 返り点パレットUI
   - キーボードショートカット

3. **Phase 3**: アノテーション機能
   - ルビ（振り仮名）対応
   - 縦中横対応
   - アノテーション管理

4. **Phase 4**: エクスポート機能
   - PDF出力（Puppeteer）
   - Word出力（docx）
   - Google Docs用HTML

5. **Phase 5**: 高度な機能
   - Wordマクロテンプレート（.dotm）
   - 禁則処理
   - 設定管理

### 4. 並列開発戦略

複数のコンポーネントやユーティリティを同時開発：

```javascript
// 並列タスクの例
- コンポーネント開発（UI層）
- ユーティリティ関数開発（ロジック層）
- スタイリング（CSS層）
```

### 5. コミットルール

- **小さく頻繁に**: 機能単位でコミット
- **明確なメッセージ**: `feat:`, `fix:`, `refactor:`, `docs:` プレフィックス使用
- **フェーズ完了時**: 必ずビルド成功後にプッシュ

### 6. コードレビュー基準

- **可読性**: コメント充実、命名規則遵守
- **パフォーマンス**: 不要な再レンダリング防止、メモ化活用
- **セキュリティ**: XSS, インジェクション攻撃対策
- **アクセシビリティ**: ARIA属性、キーボード操作対応

### 7. 技術スタック

- **Frontend**: React 19.2.0 + Vite 7.2.2
- **Styling**: TailwindCSS 4.1.17
- **PDF Export**: Puppeteer
- **Word Export**: docx (dolanmiu/docx)
- **State Management**: React Hooks（必要に応じてContext API）

### 8. ディレクトリ構造

```
kanbun/
├── .claude/              # Claude Code設定
├── src/
│   ├── components/       # Reactコンポーネント
│   ├── hooks/           # カスタムフック
│   ├── models/          # データモデル・スキーマ
│   ├── services/        # エクスポートサービス
│   ├── utils/           # ユーティリティ関数
│   └── assets/          # 静的ファイル
├── public/              # 公開ファイル
└── templates/           # Word/PDF テンプレート
```

## 現在のフェーズ

**Phase 1: プロジェクト基盤構築** 🚧

## 次のアクション

1. 基本コンポーネントの並列開発
2. ユーティリティ関数の実装
3. Phase 1 完了時のDOD実行
