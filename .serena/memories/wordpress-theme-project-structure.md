# WordPressテーマ改修プロジェクト構成

## 開発環境
- ViteのHMRを利用した開発環境
- Bunランタイムを使用

## ファイル構造
- `src/style.scss` → `dist/style.css`（ビルド出力）
- `src/functions.php`（WordPressファンクション）
- `src/js/index.ts`（エントリーポイント）
- `/vite.config.ts`（Vite設定）

## 開発コマンド
- `bun run start`：開発サーバー起動（Vite + PHP + 画像処理 + ファイル監視の並列実行）
- `bun run dev`：開発サーバーのみ（ポート3000）
- `bun run build`：ビルド（Vite + 画像最適化）

## ワークフロー
- Viteサーバー + PHP監視コピー + JSON監視コピー + 画像ファイル監視が並列実行
- 画像はSharpで自動最適化
- LiveReload対応