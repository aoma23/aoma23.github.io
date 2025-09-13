---
title: "はじめてのVercel。Next.jsをGitHubからデプロイする完全手順"
description: "Vercelのアカウント作成から、GitHubリポジトリ作成、Next.jsプロジェクトの作成、Vercelとの連携、公開までをステップ順にまとめました。初めてでもこれをなぞればデプロイできます。"
tags: [Vercel, Next.js, GitHub, デプロイ]
toc: true
toc_sticky: true
date: 2025-09-13 00:00:00 +0900
last_modified_at: 2025-09-13 00:00:00 +0900
---

この記事では、Vercel（ヴァーセル）を使って Next.js アプリを「ゼロからGitHub経由で本番公開」するまでの手順を、迷わないように一つずつ解説します。アカウント作成→リポジトリ作成→Next.js構築→Vercel連携→デプロイの順で進めます。

## 前提（準備しておくもの）

- Node.js: v18 以上（推奨: v20）
- npm: Node.js に同梱
- Git と GitHub アカウント
- ブラウザ（Vercelのダッシュボードを操作します）

バージョン確認

```
node -v
npm -v
git --version
```

## 1. Vercel アカウントを作成

1) https://vercel.com にアクセス
2) Sign Up をクリック → 「Sign up with GitHub」を選択（おすすめ）
3) GitHub連携を許可すると、Vercel ダッシュボードに入れます

この時点で Vercel 側の準備はOKです。

## 2. GitHub にリポジトリを作成

1) GitHubで新規リポジトリを作成（例: `aomaproject`）
   - 公開/非公開どちらでもOK（個人開発なら非公開でも問題なし）
   - 最初は中身が空でOK（READMEは後で自動生成されます）
2) ローカルにクローン

```
git clone https://github.com/<your-account>/aomaproject.git
cd aomaproject
```

## 3. Next.js プロジェクトを作成（ローカル）

クローンした空のディレクトリ直下に、Next.js を生成します。カレントディレクトリを示す `.` を指定するのがポイントです。

```
npx create-next-app@latest . --ts --eslint --app --no-tailwind
```

対話プロンプトの意味と選び方（詳説）

- Would you like your code inside a src/ directory?
  - 何の設定か: アプリの実装コードを `src/` 配下にまとめるかどうか。
  - No を選ぶと: `app/`, `components/`, `lib/` などがプロジェクト直下に置かれ、階層が浅くシンプルです（小規模〜中規模に向く）。
  - Yes を選ぶと: 実装コードは `src/` に集約され、ルート直下は設定ファイル中心になります（大規模・モノレポ・チーム運用で好まれやすい）。
  - 基準: 個人/MVPなら No で十分。将来的に規模拡大や厳密な整理を見越すなら Yes も有効。

- Would you like to use Turbopack?
  - 何の設定か: 開発時のビルド/ホットリロードに Next.js の次世代ビルドシステム「Turbopack」を使うか（Rust製・高速）。
  - Yes を選ぶと: 開発サーバの起動や更新反映が高速化され、開発体験が向上します。最近は公式でも推奨。多くのケースで問題なく使えます。
  - No を選ぶと: 従来のWebpackベース。互換性の安心感は高い一方、開発中のリロードは相対的に遅め。
  - 基準: 迷ったら Yes（推奨）。もし特定プラグイン/設定で不具合が出たら No に切り替え可能。
  - 今回の選択: Yes（推奨に従いTurbopackを使用）。

- Would you like to customize the import alias (@/* by default)?
  - 何の設定か: インポート時のパス短縮エイリアス設定。デフォルトは `@/` がプロジェクトルート（または `src/`）を指します。
  - No を選ぶと: 既定の `@/` を利用。教材やサンプルと同じで迷いにくい。
  - Yes を選ぶと: `~/` や `@aoma/` など任意に変更可能（`tsconfig.json`/`jsconfig.json` の `paths` で後からでも変更可）。
  - 基準: まずは No（デフォルト）でOK。チーム規約があるなら後で変更。

実際に選んだ回答例

- code inside `src/` directory? → No
- use Turbopack? → Yes
- customize import alias? → No（`@/components/Button` 等が利用可能）

依存のインストール（必要なら）と起動確認

```
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開き、初期ページが表示されればOK。

お好みでトップページを少し編集してみる（`app/page.tsx`）

```tsx
export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>こんにちは、Vercel!</h1>
      <p>初デプロイへ向けて準備完了 🎉</p>
    </main>
  );
}
```

## 4. GitHub に初回プッシュ

```
git add -A
git commit -m "chore: bootstrap Next.js app"
git branch -M main
git push -u origin main
```

プッシュが完了すると、GitHub 上の `aomaproject` リポジトリに Next.js の初期コードが反映されます。

## 5. Vercel にインポートしてデプロイ

1) Vercel ダッシュボードで「New Project」→ 「Import Git Repository」
2) `aomaproject` リポジトリを選択 → 「Import」
3) Framework Preset は自動で「Next.js」になります
4) そのまま「Deploy」をクリック

数十秒ほどでビルドが完了し、`https://<project-name>.vercel.app` のようなURLが発行されます。これで世界に公開されました！

### 自動デプロイ（GitHub連携）

以後、GitHubに push するたびに Vercel が自動で再デプロイします。プルリクエストを作ると、プレビュー用URLも自動発行されます。

## 6. よく使う運用と設定

- 環境変数: Vercel の Project Settings → Environment Variables から追加
  - 例: `NEXT_PUBLIC_API_BASE_URL`（`NEXT_PUBLIC_` で始まるものはクライアントに公開されます）
- Node バージョン固定（任意）

`package.json` の `engines` を指定すると、ビルド環境が安定します。

```json
{
  "engines": {
    "node": "20.x"
  }
}
```

- カスタムドメイン: Project Settings → Domains から独自ドメインを追加
- リダイレクト/ヘッダー: `next.config.js` の `redirects()` / `headers()` を利用
- 画像最適化: `next/image` を使うとVercelの最適化が効きます

## 7. CLI でのデプロイ（任意）

GUIではなくCLI派の方は、次の方法でも本番公開できます。

```
npm i -g vercel
vercel login
vercel        # 初回設定・プレビュー
vercel deploy --prod  # 本番反映
```

## 8. トラブルシューティング（つまずきやすいポイント）

- 依存関係エラー: ローカルで `npm ci && npm run build` が通るかを確認。lockファイル（`package-lock.json`）はコミット必須。
- Nodeバージョン差異: ローカルとVercelで Node バージョンが違うと失敗しがち。`engines.node` で縛る。
- 環境変数未設定: `.env.local` だけに置いてVercel側に入れ忘れるケースに注意。
- 画像/リンク404: `public/` 配下に入れて、`/example.png` のようにルート相対で参照。

---

以上で、Vercel のアカウント作成から Next.js のデプロイまでを一通り完了できます。まずは最小構成でデプロイ体験をして、必要に応じて環境変数・ドメイン・ルーティングなどを拡張していくのがオススメです。楽しいVercelライフを！
