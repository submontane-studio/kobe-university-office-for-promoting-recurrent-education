# WordPress + React ハイブリッド開発での重複レンダリング問題解決

## 概要
プログラム検索機能実装時に発生した、WordPress PHP出力とReactコンポーネント間の重複レンダリング問題の解決事例

## 発生した問題

### 1. 重複コンテンツレンダリング
- **症状**: 「検索する」タイトルが移動しない
- **根本原因**: `functions.php`とReactコンポーネント両方でタイトルHTML生成
- **技術的詳細**: WordPressショートコードが先に実行され、Reactコンポーネントの配置を無効化

```php
// functions.php（削除対象）
<h3 class="c-program-search__title">検索する</h3>
```

```tsx
// ProgramSearch.tsx（正常動作）
<h3 className="c-program-search__title">検索する</h3>
```

### 2. 初期診断ミスの教訓
- Reactコード単体確認で「既に正しい位置」と誤判断
- ユーザーフィードバックで複数技術スタックの相互作用を再調査
- **学習**: ハイブリッド環境では常に全レイヤーの確認が必要

## 解決手順

### 1. 問題特定
- `src/components/ProgramSearch.tsx` - タイトル位置確認（問題なし）
- `src/functions.php` - ショートコード実装確認で重複発見

### 2. 修正実装
```php
// functions.php から削除
// 重複するHTML構造を削除し、Reactコンポーネントの表示を有効化
```

### 3. CSS最終調整
```scss
.c-program-search__title {
  all: unset;
  display: block;
  margin: 0 0 10px 0;
  font-size: 30px;
  font-weight: bold;
  max-width: 1600px;
  margin-left: auto;
  margin-right: auto;
  text-align: left;
}
```

## 技術的成果

### アーキテクチャ理解の深化
- WordPress（PHP）+ React/Preact + Vite ビルドシステムの連携パターン
- サーバーサイドレンダリング vs クライアントサイドレンダリングの競合回避
- ショートコード実装時の注意点

### デバッグ手法の確立
- Playwright自動テストでの動作確認
- `bun run build`でのビルド検証フロー
- 複数技術スタック間の問題切り分け手順

### CSS設計の完成
- BEM記法準拠のクラス設計
- レスポンシブ対応基盤（max-width + margin auto）
- モバイルファースト設計の実践

## 重要な教訓

1. **ハイブリッド環境での問題診断**
   - 単一技術スタックでの確認は不十分
   - 複数レンダリングエンジンの相互作用を常に考慮

2. **WordPressショートコード設計**
   - ReactコンポーネントとのHTML重複回避
   - コンテナのみ提供し、内容はReact側に委譲

3. **ユーザーフィードバックの重要性**
   - 技術的正しさと実際の表示結果の乖離
   - 継続的な検証とフィードバックループの構築

## 適用可能な場面
- WordPress + モダンJSフレームワークの統合開発
- ショートコード + React/Vue コンポーネントのハイブリッド実装
- サーバーサイドとクライアントサイドの競合問題