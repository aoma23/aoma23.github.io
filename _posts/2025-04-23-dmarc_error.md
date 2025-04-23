---
title: "メールが届かない！DMARCエラーとSPF/DKIMのおはなし"
date: 2025-04-23
category: blog
tags: [メール,DMARC,SPF,DKIM,独自ドメイン]
---

## はじめに

ある日、KINENBIのメールがエラーになって返ってきました。

```
550 5.7.26 Unauthenticated email from kinenbi.app is not accepted due to domain's DMARC policy. Please contact the administrator of kinenbi.app domain if this was a legitimate mail.
```

以前は正常に送れていたメールが突然届かなくなり、調査を進める中で「DMARC」や「SPF」「DKIM」といった、やや馴染みのない技術用語にたどり着きました。

本記事では、これらの用語について、可能な限りやさしく噛み砕いて紹介します。

---

## DMARC？SPF？DKIM？

### ✉ メールって「お手紙」と同じ

メールを送るというのは、誰かに手紙を出すのと同じです。
でも、インターネットの世界には、ニセモノの手紙（スパムメールやなりすましメール）もたくさんあるのです。

だからこそ「これは本物の手紙です！」と証明するための仕組みが必要になります。

---

## SPF（えすぴーえふ）

👮‍♂️「このポスト（サーバー）から出した手紙しか信用しないよ！」

これは「どのサーバーがこの差出人のメールを送ってよいか？」というルールです。

> このポストから出した手紙ならOK！他のポストから出した手紙は怪しいよ！

---

## DKIM（でぃーけーあいえむ）

🖊「ぼくのサインが入ってるから、この手紙は本物だよ！」

DKIMは「この人が本当にこの手紙を書いた」ということを電子署名で証明する仕組みです。

---

## DMARC（でぃーまーく）

👩‍⚖️「SPFかDKIMが失敗したら、どうするかルールを決めよう！」

SPFやDKIMで怪しいと判断されたメールをどう扱うか、そのポリシーを決めるのがDMARCです。

---

## DMARCのルール例

```txt
v=DMARC1; p=reject; aspf=s;
```

この設定が意味するのは、以下の通りです：

- `v=DMARC1` → DMARCのバージョン（標準）
- `p=reject` → 認証に失敗したメールは**完全に拒否**
- `aspf=s` → SPFの差出人ドメインは**完全一致でなければダメ**

つまり、とても厳しいポリシーで、「ちょっとでも怪しかったらメールは届かないようにする」という設定です。

### `p=` の値（ポリシー）

DMARCの `p=` は、メールが認証に**失敗したときにどうするか？**を指定します。

| 値 | 意味 | 処理の内容 |
|----|------|------------|
| `none` | 通知だけ（何もしない） | 認証に失敗してもそのまま配信される。主にテスト用。 |
| `quarantine` | 隔離 | 認証に失敗したメールは**迷惑メールフォルダ行き**の可能性あり。 |
| `reject` | 拒否 | 認証に失敗したメールは**完全に拒否される**。本番運用向けの厳格な設定。 |

### `aspf=` の値（SPFアライメント）

DMARCでは、SPFが成功した場合でも、「どのドメインから送られてきたか」をさらに確認します。  
この「From: のドメインと、SPFのドメインの一致具合」を制御するのが `aspf=` です。

| 値 | 意味 | 判定ルール |
|----|------|-------------|
| `r`（relaxed） | 緩めの一致でOK | `From:` が `mail.kinenbi.app`、SPFが `kinenbi.app` でもOK |
| `s`（strict） | 完全一致のみOK | `From:` もSPFドメインも `kinenbi.app` 完全一致じゃないとNG |

---

## よく使われる組み合わせ例

### 🔓 テスト運用中（ゆるめ）

```txt
v=DMARC1; p=none; aspf=r; rua=mailto:your@email.com
```

### 🟡 本番前の中間設定

```txt
v=DMARC1; p=quarantine; aspf=r; rua=mailto:your@email.com
```

### 🔒 本番環境での厳格設定

```txt
v=DMARC1; p=reject; aspf=s; rua=mailto:your@email.com
```

段階的に `none → quarantine → reject` と移行していくのが安心です。

---

## 今回のエラー原因

いくつか設定を見直したので、どれが効いたかは正確ではないですが、下記対応をしました。

### SPF設定の間違い修正

カスタムレコードが「kinenbi.app」ホストでSPFレコードが設定されていましたが、これは通常「@」または空白のホストに設定すべきものでした。

```
kinenbi.app     v=spf1 include:_spf.firebasemail.com include:_spf.google.com ~all

↓

@               v=spf1 include:_spf.firebasemail.com include:_spf.google.com ~all
```

### aspf=s → r に変更

From: support@kinenbi.app で送っている
SPFは mailgun.kinenbi.app が認証成功してる
→ ドメイン名が完全一致じゃないのでNG！

おそらくこれが有力。

### p=reject のまま。変更せず。

最終的にrejectで運用すべき。突然メールが届かなかったことからこちらは変更せずに修正しました。

---

## おわりに

メールの世界は複雑で繊細ですね。  

また一つ世界を知りました。それではまた！