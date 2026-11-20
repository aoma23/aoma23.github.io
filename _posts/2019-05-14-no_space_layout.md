---
title: "webブラウザで複数半角スペースは1つとして表示されてしまう問題の対処方法"
date: 2019-05-14
slug: "no_space_layout"
category: blog
tags: [IT,半角スペース]
---
<h2>やりたいこと</h2>

<p>どうしてもスペースでレイアウト調整したい！</p>

<h2>事象</h2>

<p>半角スペースが連続しているとブラウザでは１つにまとめられて表示される</p>

<pre class="code" data-lang="" data-unlink>// 例。半角スペースが5つある場合
&lt;p&gt;aaa     bbb&lt;/p&gt;

// ブラウザでは1つに詰められて表示される
aaa bbb</pre>


<h2>対策</h2>

<h3>案1. &amp;nbspを使う</h3>

<p>nbspとは「no-break space」の略です。</p>

<p>ただし<code>&amp;nbsp</code>は半角スペースという意味ではないため、これを使って調整しているのは平成時代の古いものです。</p>

<p>令和時代は<code>&amp;ensp;</code>や<code>&amp;emsp;</code>を使ったほうがいいかもしれません。（見たことないですが）</p>

<p>ちなみに<a href="https://ja.wikipedia.org/wiki/En_%28%E5%8D%98%E4%BD%8D%29">en（エン）</a>は大文字N、<a href="https://ja.wikipedia.org/wiki/Em_%28%E5%8D%98%E4%BD%8D%29">em（エム）</a>は大文字Mの幅のことで、どちらも単位です。</p>

<h3>案2. preタグを使う</h3>

<p>&lt;pre&gt;で囲めば半角スペースや改行をそのまま表示してくれます。</p>

<h3>案3. white-space: pre-wrap; を使う</h3>

<p>cssのwhite-space プロパティを使う方法もあります。</p>

<p><a href="https://developer.mozilla.org/ja/docs/Web/CSS/white-space">white-space - CSS: &#x30AB;&#x30B9;&#x30B1;&#x30FC;&#x30C7;&#x30A3;&#x30F3;&#x30B0;&#x30B9;&#x30BF;&#x30A4;&#x30EB;&#x30B7;&#x30FC;&#x30C8; | MDN</a></p>

<p>preタグは自動折り返しをしてくれないので、<code>pre-wrap;</code>を使うとよいでしょう。</p>

<h3>案4. 全角スペースを使う</h3>

<p>半角スペース2個を全角スペースに置換して表示してもいいかもしれません。ぬわー。</p>

<pre class="code lang-php" data-lang="php" data-unlink>str_replace('  ', '　', $str);
</pre>


<h2>さいごに</h2>

<p>スペースでレイアウト調整するのは平成で終わりにして、右寄せ、中央揃えなどcssで適切に対応しましょ！</p>

