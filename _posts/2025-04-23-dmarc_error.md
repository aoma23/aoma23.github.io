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

### p=reject のまま。変更せず。

最終的にrejectで運用すべき。突然メールが届かなかったことからこちらは変更せずに修正しました。

## でもエラー

Gmail上からは送信できるようになったのですが、firebaseからだとエラーに。😭
google workspaceではなく、これで送信しているので。。
https://support.google.com/mail/answer/22370?hl=ja

ruaに来たエラーレポートは下記。（XMLなんだ）

```
<?xml version="1.0" encoding="UTF-8" ?>
<feedback>
  <version>1.0</version>
  <report_metadata>
    <org_name>google.com</org_name>
    <email>noreply-dmarc-support@google.com</email>
    <extra_contact_info>https://support.google.com/a/answer/2466580</extra_contact_info>
    <report_id>1117814753247964290</report_id>
    <date_range>
      <begin>1745366400</begin>
      <end>1745452799</end>
    </date_range>
  </report_metadata>
  <policy_published>
    <domain>kinenbi.app</domain>
    <adkim>r</adkim>
    <aspf>r</aspf>
    <p>reject</p>
    <sp>reject</sp>
    <pct>100</pct>
    <np>reject</np>
  </policy_published>
  <record>
    <row>
      <source_ip>209.85.220.41</source_ip>
      <count>2</count>
      <policy_evaluated>
        <disposition>reject</disposition>
        <dkim>fail</dkim>
        <spf>fail</spf>
      </policy_evaluated>
    </row>
    <identifiers>
      <header_from>kinenbi.app</header_from>
    </identifiers>
    <auth_results>
      <spf>
        <domain>gmail.com</domain>
        <result>pass</result>
      </spf>
    </auth_results>
  </record>
</feedback>
```

### エラーレポート解析

DMARCレポートによると、kinenbi.appドメインから送信したメールがDMARCの認証に失敗しています。Gmailのエイリアス機能を使用すると、送信元は実際にはGmailのサーバーですが、「From:」アドレスはカスタムドメイン（kinenbi.app）になります。
この状況で問題が発生する理由は以下の通りです：

1. SPFの問題：
- SPFはメールサーバーのIPアドレスを検証します
- Gmail（209.85.220.41）からメールが送信されていますが、kinenbi.appドメインからのメールとして認識されます
- SPFチェックは失敗します（gmail.comのSPFは通過していますが、kinenbi.appのSPFチェックとして見られます）

2. DKIMの問題：

- GmailエイリアスではDKIM署名がカスタムドメインに適切に行われていません

この問題を解決するには、いくつかの選択肢があります：
- オプション1：DMARCポリシーを変更

- DMARCレコードを v=DMARC1; p=none; rua=mailto:あなたのメールアドレス に変更
これにより認証に失敗しても拒否されなくなります

オプション2：通常のGmailアドレスを使用

Gmailエイリアス機能ではなく、通常の@gmail.comアドレスでメールを送信

オプション3：Google Workspaceに移行

kinenbi.appドメインをGoogle Workspaceで設定し、適切な認証を行う

Gmailエイリアス機能でカスタムドメインを使用する場合、残念ながらDMARC認証を完全にパスすることは難しいです。最も簡単な解決策は、DMARCポリシーを「p=none」に変更することですが、セキュリティは低下します。

## というわけで。。。

p=none にしました😅
一旦解決。

Gmailエイリアス送信をやめて、別のメールサービスに乗り換えるしかないかー。

## おわりに

メールの世界は複雑で繊細ですね。  

また一つ世界を知りました。それではまた！