# QuickBoardの旧URL移行（未適用）

このディレクトリはレビュー用のCloudflare Single Redirect設定です。Jekyllの出力対象外で、**マージしても301は有効になりません**。本番への適用は別途行います。本作業ではデプロイしません。

## 調査結果（2026-11-13）

- ブログは `aoma23/aoma23.github.io` の `main`（調査時 `5d4a373`）。GitHub Pagesの前段にCloudflareがあります。旧URLはHTTP 404でした。
- ブログのPRはopen/closedとも0件。リモートの `main` と `work` は同じコミット。直近のdots関連記事・ホームページ変更にも、対象2記事の修正はありませんでした。
- QuickBoardのSEO関連PR [#97](https://github.com/aoma23/quickboard/pull/97)（検索メタデータ）と [#116](https://github.com/aoma23/quickboard/pull/116)（サイトマップ）はマージ済みで、本件の旧ホスト転送・ブログ本文とは別の変更です。重複して変更していません。
- `267f9a8`（2025-09-20）では旧 `app/quickboard/index.html` にJavaScript転送がありましたが、`5eb9d70`（2026-03-04）でディレクトリごと削除されています。以前の転送は `q` のみを引き継ぐもので、HTTP 301ではありません。
- 現在の `jekyll-redirect-from` はHTMLのmeta refreshを生成します。HTTP 301を設定できないため、この用途には使用しません。
- QuickBoard本体の `next.config.ts` は新ホスト側にだけ作用します。旧ホストはVercel/Next.jsに届かないため、そこにリダイレクトを追加しても旧URLは直りません。ホスト移行は不要です。
- Cloudflareの管理画面は未ログインで、既存のSingle/Bulk Redirects・Page Rules・Workersの全設定は未確認です。公開HTTPの404、DNS、リポジトリ設定と履歴までは確認しました。適用前に管理画面で重複ルールを確認してください。

## 適用する設定

Cloudflareの `aoma23.com` → Rules → Redirect Rules → Single Redirectsで、[rule.json](rule.json)の条件を使います。

- 条件：ホストが `aoma23.com`、パスが `/app/quickboard`、`/app/quickboard/`、`/app/quickboard/index.html` のいずれか。
- 転送先（Static）：`https://quickboard.aoma23.com/ja/`
- ステータス：**301**
- **Preserve query stringを有効化**。`q`、UTM、重複キー、空値、エンコード済み文字を保持します。
- `/app/quickboard/lp/` やJS・画像などには一致させません。ほかのアプリ・ブログページも対象外です。

既存ルールがある場合は重複して作らず、そのルールを更新してください。APIを使う場合、このJSONは単一ルールの本文です。既存ルールセット全体をこの1件で置き換えないでください。自動適用用のワークフローは追加していません。

公式仕様：[Single Redirects API](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-api/)、[Jekyll Redirect Fromの動作](https://github.com/jekyll/jekyll-redirect-from#how-it-works)。

## 共有データと検証

旧版 `351217d:app/quickboard/index.html` に掲載されていた共有データ（青11人・赤11人・ボール）をQuickBoard側の回帰テストで使用します。LZ-Stringで圧縮した `q` に色・座標・背番号が入る形式です。リダイレクト時にデコードや再エンコードを行わず、そのまま渡します。

現行版で当時の `q` が開けることは、HTTP転送とは別に検証します。匿名の手動作成・再生とProのAI生成も区別し、今回の記事では未リリースの機能を前提にしません。

2026-11-13に現行公開アプリの `/ja/?q=...&utm_source=blog...` をブラウザで開き、青11人・赤11人・ボールの23個の駒と、座標・背番号の一致を確認しました。QuickBoard側の `lib/legacyQuickboardShare.test.ts` でも、当時のデータ・名前・追加色・クエリ付き読込を回帰テストしています。

互換性テストのPR：[aoma23/quickboard#127](https://github.com/aoma23/quickboard/pull/127)。関連17件と本体buildが成功、lintはエラー0件（既存警告555件、追加ファイルは警告0件）です。

ブログはRuby 3.1.4・UTF-8環境で `JEKYLL_ENV=production bundle exec jekyll build --baseurl ''` が成功しました。専用のlintコマンドはなく、`git diff --check`、JSON構文、検証スクリプトの `node --check`、出力HTMLの旧URL除去とcanonical URLも確認済みです。本文の外部リンク11種類はすべてHTTP 200に到達しています。

本番の `verify.mjs` 実行は未適用のため失敗（旧URLは404）です。301・クエリ保持のHTTP受入試験は、本番適用後に再実行する必要があります。

承認後のCloudflare適用時に、以下を実行してください。実際の公開URLへのHEADリクエストを送り、301とLocationのクエリ完全一致を検証します。モックの結果を本番の成功と見なすことはありません。

```sh
node _ops/quickboard-redirect/verify.mjs
```

続けて `verify.mjs` 内の実データ付きURLをブラウザで開き、配置と背番号を確認してください。`%2B%24%2F%3D` のケースは転送時の文字保持テスト専用で、有効なボードデータではありません。

## 記事の公式確認先

確認日：2026-11-13。公開日・記事パスを維持し、本文と `last_modified_at` を更新しています。5選記事のタイトルは年次表示だけを「2026年更新」に変更しています。

- [QuickBoard料金](https://quickboard.aoma23.com/ja/pricing/)：Free保存3枚（ログイン要）、Pro月480円／年4,800円、広告非表示・無制限保存・AI合計月200回。
- [TACTICALista](https://tacticalista.com/)：Starter月3プロジェクト・各3シーン、Basic月US$3・プロジェクト無制限・各15シーン、PNG/GIF出力。旧記事のUS$1.99、円換算、未確認のPDF出力・距離計測等は訂正。
- [Coach Tactic Board / App Store](https://apps.apple.com/jp/app/coach-tactic-board-soccer/id834813357)、[Google Play](https://play.google.com/store/apps/details?id=com.bluelinden.coachboard)：無料ダウンロード・アプリ内購入、アニメーション・画像/PDF/動画出力。固定料金はOS・地域によって異なるため断定しません。
- [Tactical Board Online](https://tactical-board.com/)：多競技・多言語、リンク共有、アカウントのコレクション保存。料金表は確認できず「全機能完全無料」は撤回。
- [サッカーの箱](https://footballbox.club/tactics-board.html)：無料、CSV入出力・ローカル保存・PNG/JPEG画像作成。
