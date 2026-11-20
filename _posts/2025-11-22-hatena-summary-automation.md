---
title: "Hatenaブログの記事を要点だけに置き換えるスクリプトを作った"
date: 2025-11-22
slug: "hatena-summary-automation"
category: blog
tags: [HatenaBlog,Python,Automation]
---

<p>はてなブログに残していた旧記事はすべてこのサイトにリダイレクトするようにしていました（<a href="/hatenablog_to_newblog/">当時の手順はこちら</a>）。とはいえ最近「一部記事がインデックスされない」現象が起きており、旧ブログ側に記事全文が残っていることで重複コンテンツ判定を受けているのではと疑ったため、今回は SEO を意識して旧記事本文を「要点＋新サイトへの導線」に置き換えるバッチを作りました。</p>

<h2>やりたかったこと</h2>

<ul>
  <li>旧記事は削除したくないが、全文を残す必要もない</li>
  <li>自分のドメインに移転済みの記事へ誘導したい</li>
  <li>184件もあるので手作業は無理</li>
</ul>

<h2>実装メモ</h2>

<ul>
  <li><code>app/hatena_summary/hatena_summary.py</code> に Python スクリプトを実装</li>
  <li>Hatena の AtomPub API を WSSE 認証で叩いて記事一覧を取得</li>
  <li>このリポジトリの <code>_posts</code> からタイトル一致で新サイトの本文を取得し、先頭 3 文を要点として抽出</li>
  <li>旧記事本文を「移転しました」＋「要点メモ」＋「続きを読むリンク」に置き換え</li>
  <li><code>--dry-run</code> で出力確認→実行。本番は 1 記事ずつ PUT</li>
</ul>

<p>コマンド例:</p>

```bash
python app/hatena_summary/hatena_summary.py --dry-run --limit 1
python app/hatena_summary/hatena_summary.py
```

<p>環境変数 <code>HATENA_BLOG_ID</code> / <code>HATENA_BLOG_DOMAIN</code> / <code>HATENA_API_KEY</code> / <code>NEW_SITE_URL</code> をセットすれば他の記事にも使えます。詳しい手順は <code>app/hatena_summary/README.md</code> にまとめました。</p>

<h2>結果</h2>

<p>184 件のうち、下書きの 2 件を除いて全記事を置き換えました。旧 URL からアクセスしても要点だけが表示され、続きはこのサイトに誘導されるようになりました。</p>
