---
title: "JavaScriptで一覧ページの画像URLを全て取得する"
date: 2019-11-25
slug: "get_image_url_list_by_js"
category: blog
tags: [IT,JavaScript,スクレイピング]
---
<p>稀に、一覧ページとかに表示されてる画像URLを全て取得したいとき、あるよねー！</p>

<p>そんなときは <a class="keyword" href="http://d.hatena.ne.jp/keyword/Chrome">Chrome</a> の<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C7%A5%D9%A5%ED%A5%C3%A5%D1">デベロッパ</a>ーツールを使いましょう。</p>

<h2>JS pathを取得</h2>

<p>Copy JS pathで取得</p>

<pre class="code" data-lang="" data-unlink>document.querySelector(&#34;#qurireco &gt; article:nth-child(1) &gt; a &gt; div &gt; div._7uaWVw_YSgf_GKoctUM12 &gt; span &gt; img&#34;)</pre>


<p>こんな感じ。</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20191125/20191125160708.png' | relative_url }}" alt="f:id:aoma23:20191125160708p:plain" title="f:id:aoma23:20191125160708p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<h3>getAttributeで画像URLが取得できることを確認</h3>

<p>Consoleタブに貼り付けて確認してみる。</p>

<pre class="code" data-lang="" data-unlink>console.log(document.querySelector(&#34;#qurireco &gt; article:nth-child(1) &gt; a &gt; div &gt; div._7uaWVw_YSgf_GKoctUM12 &gt; span &gt; img&#34;).getAttribute(&#34;src&#34;));</pre>


<h2>JS pathの規則性を探す</h2>

<pre class="code" data-lang="" data-unlink>document.querySelector(&#34;#qurireco &gt; article:nth-child(1) &gt; a &gt; div &gt; div._7uaWVw_YSgf_GKoctUM12 &gt; span &gt; img&#34;)
document.querySelector(&#34;#qurireco &gt; article:nth-child(2) &gt; a &gt; div &gt; div._7uaWVw_YSgf_GKoctUM12 &gt; span &gt; img&#34;)
document.querySelector(&#34;#qurireco &gt; article:nth-child(3) &gt; a &gt; div &gt; div._7uaWVw_YSgf_GKoctUM12 &gt; span &gt; img&#34;)</pre>


<p>nth-childのカッコ内の数字が違う感じだなー。</p>

<h2>ループさせる要素を見つける</h2>

<p>上記でみつけた規則性から下記要素をループすれば良さそう。</p>

<pre class="code" data-lang="" data-unlink>document.querySelectorAll(&#34;#qurireco &gt; article&#34;)</pre>


<h3>要<a class="keyword" href="http://d.hatena.ne.jp/keyword/%C1%C7%BF%F4">素数</a>を確認</h3>

<p>念の為件数を確認。</p>

<pre class="code" data-lang="" data-unlink>console.log(document.querySelectorAll(&#34;#qurireco &gt; article&#34;).length);</pre>


<h2>ループして出力</h2>

<pre class="code" data-lang="" data-unlink>var elements = document.querySelectorAll(&#34;#qurireco &gt; article&#34;);
for (var element of elements) {
  console.log(element.querySelector(&#34;a &gt; div &gt; div._7uaWVw_YSgf_GKoctUM12 &gt; span &gt; img&#34;).getAttribute(&#34;src&#34;));
}</pre>


<h3><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%AF%A5%EA%A5%C3%A5%D7%A5%DC%A1%BC%A5%C9">クリップボード</a>にコピーするのも良き</h3>

<pre class="code" data-lang="" data-unlink>var elements = document.querySelectorAll(&#34;#qurireco &gt; article&#34;);
var list = [];
for (var element of elements) {
  list.push(element.querySelector(&#34;a &gt; div &gt; div._7uaWVw_YSgf_GKoctUM12 &gt; span &gt; img&#34;).getAttribute(&#34;src&#34;));
}
copy(list.join(&#34;\n&#34;));</pre>


<p>かんたんですね！</p>

