# プログラム検索機能の絞り込み要件

## 確定した絞り込み項目

### 1. 学位取得（ドロップダウン）
- すべて（デフォルト）
- 学位取得を伴わないもの
- 学位取得を目指すもの

### 2. プログラム層（ドロップダウン）
- すべて（デフォルト）
- 基盤層
- 中核層
- 共創層
- その他

### 3. 分野で絞り込む
- 各種タグ名による複数選択可能なフィルター

## データ構造（TypeScript）

```typescript
interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
  degree_type: 'with' | 'without' | null;    // 学位取得
  program_layer: 'foundation' | 'core' | 'collaboration' | 'other' | null;  // プログラム層
  field_tags: string[];  // 分野タグ（複数選択）
}
```

## API設計更新

### WordPressエンドポイント
- `GET /wp-json/wp/v2/programs`：全プログラム取得
- `GET /wp-json/wp/v2/programs?search={keyword}`：キーワード検索
- `GET /wp-json/wp/v2/programs?degree_type={type}`：学位取得による絞り込み
- `GET /wp-json/wp/v2/programs?program_layer={layer}`：プログラム層による絞り込み
- `GET /wp-json/wp/v2/programs?field_tags={tags}`：分野タグによる絞り込み

### カスタムフィールド（WordPress）
- `degree_type`：学位取得タイプ
- `program_layer`：プログラム層
- `field_tags`：分野タグ（配列）

## コンポーネント設計（Preact）

- `ProgramSearch`：メインコンテナ
- `SearchBox`：キーワード検索入力
- `DegreeFilter`：学位取得ドロップダウン
- `LayerFilter`：プログラム層ドロップダウン
- `FieldTagFilter`：分野タグ選択UI
- `ProgramGrid`：結果一覧表示
- `ProgramCard`：個別プログラムカード

## Design-1.png準拠
- 赤枠部分の仕様に完全準拠
- 従来のカテゴリ絞り込みから学位取得・プログラム層・分野タグへ変更