---
title: "Tera Termのログインマクロの作成方法"
date: 2019-08-29
slug: "teraterm_ttl"
category: blog
tags: [IT,teraterm,ttl,ログイン]
---
<p>毎<a class="keyword" href="http://d.hatena.ne.jp/keyword/%C5%D9%CB%BA%A4%EC">度忘れ</a>るのでメモ</p>

<h3>1. <a class="keyword" href="http://d.hatena.ne.jp/keyword/ttl">ttl</a>ファイルを作成</h3>

<p>xxxxx.<a class="keyword" href="http://d.hatena.ne.jp/keyword/ttl">ttl</a>ファイルを作る（ファイル名は何でもよいけどhostnameとか<a class="keyword" href="http://d.hatena.ne.jp/keyword/IP%A5%A2%A5%C9%A5%EC%A5%B9">IPアドレス</a>がわかりやすいかな）</p>

<pre class="code" data-lang="" data-unlink>connect &#39;{$ip_address} /ssh /2 /auth=password /user={$username} /passwd={$password}&#39;</pre>


<h3>2. <a class="keyword" href="http://d.hatena.ne.jp/keyword/ttl">ttl</a>ファイルをマクロに関連付け</h3>

<p>作成した<a class="keyword" href="http://d.hatena.ne.jp/keyword/ttl">ttl</a>ファイルを<code>ttpmacro.exe</code>で開く（常に開くように設定する）</p>

<p>これでOK！</p>

<p>※<code>ttpmacro.exe</code>は<code>Tera Term(ttermpro.exe)</code>と同じ<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C7%A5%A3%A5%EC%A5%AF%A5%C8">ディレクト</a>リにいる</p>

