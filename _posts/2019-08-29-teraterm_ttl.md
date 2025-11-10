---
title: "Tera Termのログインマクロの作成方法"
date: 2019-08-29
slug: "teraterm_ttl"
category: blog
tags: [IT,teraterm,ttl,ログイン]
---
<p>毎度忘れるのでメモ</p>

<h3>1. ttlファイルを作成</h3>

<p>xxxxx.ttlファイルを作る（ファイル名は何でもよいけどhostnameとかIPアドレスがわかりやすいかな）</p>

<pre class="code" data-lang="" data-unlink>connect &#39;{$ip_address} /ssh /2 /auth=password /user={$username} /passwd={$password}&#39;</pre>


<h3>2. ttlファイルをマクロに関連付け</h3>

<p>作成したttlファイルを<code>ttpmacro.exe</code>で開く（常に開くように設定する）</p>

<p>これでOK！</p>

<p>※<code>ttpmacro.exe</code>は<code>Tera Term(ttermpro.exe)</code>と同じディレクトリにいる</p>

