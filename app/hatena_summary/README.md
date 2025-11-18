# Hatena 要約アップデートスクリプト

Hatena Blog から Jekyll (このリポジトリ) に移行済みの記事を、一括で「要約 + 新サイトへの導線」だけの本文に書き換える Python スクリプトです。AtomPub API を使うため、実行には Hatena ID と API キーが必要です。

## セットアップ

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r app/hatena_summary/requirements.txt
```

環境変数か引数で以下を渡します。

| 変数 | 説明 |
| --- | --- |
| `HATENA_BLOG_ID` | Hatena ID |
| `HATENA_BLOG_DOMAIN` | 例: `aoma23.hatenablog.com` |
| `HATENA_API_KEY` | Hatena 開発者設定で取得できる AtomPub API キー |
| `NEW_SITE_URL` | 省略可。デフォルトは `https://aoma23.com` |

```bash
export HATENA_BLOG_ID=xxxx
export HATENA_BLOG_DOMAIN=xxxx.hatenablog.com
export HATENA_API_KEY=xxxxxxxxxxxxxxxxxxxx
export NEW_SITE_URL=https://aoma23.com
```

## 使い方

1. `_posts` 配下にある Jekyll 記事から、先頭 3 文 (句点 `。` や `!/?` を区切りとみなす) を抽出して要点とします。さらに、`https://aoma23.com/<ファイル名から日付を除いた部分>/` という URL を新サイトのリンクとして利用します。
2. `app/hatena_summary/hatena_summary.py` を実行すると、Hatena API で取得できた最新記事から順番に本文を書き換えます。

```bash
python app/hatena_summary/hatena_summary.py --dry-run --limit 2
python app/hatena_summary/hatena_summary.py   # 実際に更新
```

主なオプション:

- `--dry-run` : API を叩かず、生成される HTML を標準出力に表示します
- `--limit N` : 最新 N 件だけ処理 (テスト用)
- `--max-sentences` / `--sentence-length` : 要約する文数と 1 文の最大文字数
- `--posts-dir` : `_posts` 以外のパスを使う場合
- `--site-url` : 新サイトのベース URL を引数から指定

## 実装メモ

- Hatena AtomPub は WSSE 認証。`hatena_summary.py` 内でヘッダーを都度生成しています
- 更新内容は `<content type="text/html">` のみ差し替え、`updated` タグを現在時刻にします
- Jekyll 側でタイトルが重複していると正しくマッチできません。その場合は `hatena_summary.py` の `load_posts` を拡張して `title -> path` の辞書を手動で調整してください
- `_posts` のファイル名は `YYYY-MM-DD-slug.md` 形式を前提にしてリンクを生成しています。個別に permalink を変えたい記事はスクリプトを実行する前に `NEW_SITE_URL` を環境変数で差し替えるか、スクリプトを編集して `slug_from_filename` の戻り値を調整してください

## よくある確認フロー

1. `--dry-run --limit 1` でプレビュー
2. Hatena の管理画面で該当記事が想定通りか確認
3. バッチで更新 (小分け推奨)
4. 数ページを Spot check

困ったときは `requests.exceptions.HTTPError` や XML のログを頼りに、HTTP レスポンスボディを確認してください。
