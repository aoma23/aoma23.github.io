---
title: "Vercelで独自ドメイン（サブドメイン）を設定する手順まとめ"
description: "Vercelのプロジェクトに quickboard.aoma23.com を割り当てるまでの流れを、Vercel側の設定とDNS（旧Google Domains→Squarespace）のレコード追加、検証、運用の注意点まで漏れなく解説。"
date: 2025-09-16
tags: [Vercel, 独自ドメイン, DNS, Next.js]
toc: true
toc_sticky: true
category: blog
---

Vercel で公開したアプリを 独自ドメイン（サブドメイン） に乗せる手順をまとめました。今回は、旧Google Domainsで取得した `aoma23.com` を使い、`quickboard.aoma23.com` を Vercel の Next.js プロジェクトに割り当てます。

## 前提

- すでに Vercel でプロジェクトをデプロイ済み（`*.vercel.app` で表示できる）
- ドメイン `aoma23.com` を所有している（旧Google Domains → 現在は Squarespace Domains 管理）
- 目的: `quickboard.aoma23.com` を本番URLにする

## 手順概要

1) Vercelでドメイン（サブドメイン）を追加する
2) DNS（Squarespace Domains）で CNAME レコードを設定する
3) 反映を待って、Vercelで「Verified」になるのを確認する
4) 動作確認＆運用（`*.vercel.app` ドメインの扱い）

## 1. Vercel にサブドメインを追加

- Vercel ダッシュボード → 対象 Project → Settings → Domains
- 「Add」→ `quickboard.aoma23.com` を入力 → 「Add」
- 追加直後は「Pending」表示になります（DNS設定待ち）

## 2. DNS で CNAME レコードを追加（Squarespace Domains）

旧Google Domainsで取得したドメインは、現在 Squarespace の管理画面でDNSを編集します。

- DNS Settings を開く
- 次のレコードを追加

```
Name (Host): quickboard
Type: CNAME
Value (Target): cname.vercel-dns.com  または Vercelが提示する固有のCNAME値
TTL: デフォルトでOK
```

メモ:

- 一部のDNS UIでは 末尾のドット（`.`）付きは保存できません。`cname.vercel-dns.com.` ではなく、`cname.vercel-dns.com` のようにドット無しで保存してください。
- 追加後、数分〜数時間で伝播します（通常は数十分以内）。

## 3. 「DNS Change Recommended」への対応

Vercel の Domains 画面で「DNS Change Recommended」と表示されることがあります。これはエラーではなく、現在の `cname.vercel-dns.com` よりも「プロジェクト固有のCNAME（例: `xxxx.vercel-dns-017.com`）」を推奨しているという通知です。

- 表示されている推奨CNAMEに変更すると、内部的な最適化（冗長化や拡張）に追従しやすくなります。
- 対応手順: DNSの CNAME 値を、Vercel が提示する固有値に置き換えて保存 → しばらく待つ → Vercel 側の表示が「Valid Configuration」になればOK。

## 4. 動作確認

- ブラウザで `https://quickboard.aoma23.com` を開く
- Vercel の Project → Settings → Domains で `Verified` 表示を確認
- 伝播確認（任意）

```
dig quickboard.aoma23.com
```

または https://www.whatsmydns.net/ で世界各地の伝播状況をチェックできます。

## 5. SSL/TLS（https）について

- Vercel はドメインが `Verified` になると自動で証明書を発行します。手動設定は不要です。
- 初回は数分待つことがあります。`https://` でアクセスできるまで少し待ってから再確認してください。

## 6. `*.vercel.app` ドメインは残す？削除する？

Vercel はプロジェクトごとに `xxxx.vercel.app` を自動で割り当てます。独自ドメインに切り替えた後の扱いは次のとおり。

- 残す（おすすめ）
  - 独自ドメインにDNSトラブルがあっても、`*.vercel.app` で動作確認ができるため安心。
  - プロジェクト名を変えると `newname.vercel.app` にリネームされます。
- 削除する
  - Domains 画面で `xxxx.vercel.app` を Remove。
  - 後から再追加も可能ですが、同じサブドメイン名は再利用できない場合があります。

## 7. よくあるハマりどころ

- CNAMEの末尾ドット: UIによっては受け付けません（ドット無しでOK）。
- 既存レコードの衝突: `quickboard` 名で A/AAAA/CNAME が重複していると無効化されます。不要なレコードは削除してから追加。
- 伝播待ち: 反映に時間差あり。`Pending` がすぐ消えなくても焦らない。
- Apex（ルート）に割り当てたい場合: `aoma23.com` 直下は CNAME が使えないDNSもあるため、Vercelの推奨（Aレコード `76.76.21.21` など）や ALIAS/ANAME を利用。今回はサブドメインなので CNAME でOK。
- ステージングと本番: `staging.aoma23.com` など環境別にドメインを追加可能。Preview URL（PRごと）も自動で発行されます。

---

これで `quickboard.aoma23.com` での公開は完了です。以降は GitHub のメインブランチに push するだけで、自動で本番に反映されます。`*.vercel.app` は保険として残しておくのがおすすめです。運用に合わせて、環境変数やカスタムヘッダー/リダイレクト（`next.config.js`）も整えていきましょう。

