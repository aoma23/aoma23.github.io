---
title: "Microsoft FlowでSlackのチャネルではなくダイレクトメッセージに送信する方法"
date: 2019-05-11
slug: "flow_slack_dm"
category: blog
tags: [IT,MicrosoftFlow,IFTTT,Slack]
---
<h2>やりたいこと</h2>

<p>Microsoft FlowでSlackのチャネルではなく、ユーザーにダイレクトメッセージを送信したい。</p>

<h2>事象</h2>

<p>チャネル名しか対応しておらず、下記のようにユーザー名を直接書いてもエラーになります。</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20190510/20190510103225.png' | relative_url }}" alt="f:id:aoma23:20190510103225p:plain" title="f:id:aoma23:20190510103225p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<h2>対策</h2>

<p>ユーザー名でなくIDを指定します。</p>

<p>IDの取得方法は、ユーザー名を右クリックしてリンクをコピー。
そのURLの末尾がIDとなります。</p>

<p>これを指定すればダイレクトメッセージが送信できます！</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20190510/20190510103509.png' | relative_url }}" alt="f:id:aoma23:20190510103509p:plain" title="f:id:aoma23:20190510103509p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<h2>参考</h2>

<p><a href="https://qiita.com/YumaInaura/items/0c4f4adb33eb21032c08">Slack &mdash; API&#x306B;&#x4F7F;&#x3046;&#x300C;&#x30C1;&#x30E3;&#x30F3;&#x30CD;&#x30EB;ID&#x300D;&#x3092;&#x53D6;&#x5F97;&#x3059;&#x308B;&#x65B9;&#x6CD5; - Qiita</a></p>

