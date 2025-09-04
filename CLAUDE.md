# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

### 開発・ビルド
```bash
# 開発サーバー起動（Vite + PHP + 画像処理 + ファイル監視）
bun run start

# 開発サーバーのみ（ポート3000）
bun run dev

# ビルド（Vite + 画像最適化）
bun run build

# プレビュー
bun run preview

# WordPress環境起動
bun run wp-env start
```

### 個別タスク
```bash
# 依存関係インストール
bun install

# 画像最適化のみ
bun run images

# PHP/JSONファイルの監視コピー
bun run php
bun run json

# SVG最適化
bun run svg
```

### Lint・Type Check
プロジェクトにはBiomeとESLintが設定済み。TypeScriptのtype checkは：
```bash
# TypeScript型チェック
bunx tsc --noEmit
```

## アーキテクチャ

### ビルドシステム
- **ランタイム**: Bun（高速JavaScript runtime）
- **ビルドツール**: Vite（開発サーバー・バンドル）
- **環境変数**: dotenvx経由で`.env`から読み込み
- **ソース**: `src/`（現在は空）→ `dist/`にビルド出力

### 開発ワークフロー
- `bun run start`で並列実行：Viteサーバー + PHP監視コピー + JSON監視コピー + 画像ファイル監視
- 画像はSharpで自動最適化（WebP/AVIF変換対応）
- Sassファイルのglob importサポート
- LiveReload対応

### WordPress連携
- `@wordpress/env`でローカル開発環境
- PHPファイルは`src/`から`dist/`に監視コピー
- ポート8888でWordPress、8889でテスト環境

### TypeScript設定
- 厳格な型チェック有効（`strict: true`）
- バンドラーモード（Vite想定）
- JSX: `react-jsx`
- インデックスアクセス・フォールスルーの厳格チェック

### Viteプラグイン
- `vite-plugin-dev-manifest`: マニフェスト生成
- `vite-plugin-live-reload`: ライブリロード
- `vite-plugin-minipic`: 画像最適化
- `vite-plugin-sass-glob-import`: Sassのglob import
- `vite-plugin-static-copy`: 静的ファイルコピー

## 開発ルール

### ファイル配置
- ソースファイルは`src/`配下に配置
- ビルド成果物は`dist/`に出力
- `.env`で`SRC`と`DIST`のパス定義

### WordPressテーマ/プラグイン開発時
- PHPファイルは`src/`に配置し、自動的に`dist/`にコピーされる
- WordPress環境は`wp-env`で管理（ポート8888）
- テーマ/プラグインファイルはビルド後に`dist/`から参照

### 画像・アセット処理
- 画像ファイルはSharpで自動最適化（WebP/AVIF形式）
- SVGファイルはSVGOで最適化
- 画像ファイル変更時は自動的に再処理

### 開発時の注意点
- Viteの開発サーバーは`--host`オプションで外部アクセス可能
- HMR（Hot Module Replacement）はポート3000
- 環境変数は`.env`ファイルで管理、dotenvxで読み込み

## プロジェクト実装方針

### プログラム検索機能（WordPress REST API + Preact）

**データ取得戦略：**
- WordPress REST API（`/wp-json/wp/v2/`）を使用
- カスタム投稿タイプ「programs」を作成してAPIエンドポイント化
- フィルタリング・検索はAPIクエリパラメータで実装

**APIエンドポイント設計：**
- `GET /wp-json/wp/v2/programs`：全プログラム取得
- `GET /wp-json/wp/v2/programs?search={keyword}`：検索機能
- `GET /wp-json/wp/v2/programs?categories={id}`：カテゴリ絞り込み

**Preact実装方針：**
- `useEffect`でAPI呼び出し
- `useState`で検索状態管理
- debounce処理でAPI呼び出し頻度制御
- ローディング・エラーハンドリング実装

**コンポーネント設計：**
- `ProgramSearch`：メインコンテナ
- `SearchBox`：検索入力フィールド
- `ProgramGrid`：結果一覧のグリッドコンテナ
- `ProgramCard`：個別プログラムカード

**データ構造：**
```typescript
interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
}
```

**WordPressサイド実装：**
- カスタム投稿タイプ「programs」
- カスタムフィールド（ACF等）でプログラム詳細情報
- REST API有効化・CORS設定

**パフォーマンス最適化：**
- ブラウザキャッシュ + SWR/React Queryでデータ取得最適化
- デバウンス処理によるAPI呼び出し制御

**レスポンシブ対応：**
- CSS Gridで可変カラム数
- モバイル1カラム、タブレット2カラム、デスクトップ3-4カラム