---
title: "ローカルでStripe CLIのWebhookが来ない原因は「キーの不一致」だった件"
date: 2026-02-16
category: blog
tags: [Stripe, Webhook, Stripe CLI]
---

Stripeのローカル決済検証で、Webhookがどうしても届かないことがありました。
以前は動いていたのに、`stripe listen` しても何も来ない。ログにも出ない。

原因は単純で、CLIが使っている `sk_test` と、アプリが使っている `sk_test` が違っていただけでした。

<!--more-->

## 起きていた症状

- `stripe listen` は起動している
- 決済フローは成功するがWebhookが来ない
- 以前は動いていたのでコードは疑いにくい

## 原因

同じStripeアカウントでも複数のテストキーが存在するのが落とし穴でした。
CLI側の `test_mode_api_key` と `.env.local` の `STRIPE_SECRET_KEY` が、別の `sk_test_...` になっていました。

CLIは自分がログインしているアカウントのキーを使う一方、
アプリは `.env.local` のキーでAPIを叩くため、
両者が一致していないとイベントは絶対に届きません。

## まとめ

Webhookが届かないときは、まずキーが一致しているかを疑うべきです。
同じアカウントでもキーが複数存在するので、普通にズレます。

- `.env.local` の `STRIPE_SECRET_KEY` が正しいか
- CLIの `test_mode_api_key` が同じか

キーが複数あるというのは盲点だったので、メモがてら残しておきます。
