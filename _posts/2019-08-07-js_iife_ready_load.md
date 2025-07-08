---
title: "JavaScriptの即時関数とreadyとloadの違いまとめ"
date: 2019-08-07
slug: "js_iife_ready_load"
category: blog
tags: [JavaScript,IT,ready,load,即時関数]
---
<p>たまに新規にJS書くとき、グロー<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D0%A5%EB%A5%B9">バルス</a>コープを汚染したくないので即時関数で囲ってやることが多いんですが、毎回書き方どうだっけ？ってなるのでメモ。</p>

<p>ついでにonready（<a class="keyword" href="http://d.hatena.ne.jp/keyword/jQuery">jQuery</a>での呼び名）とonloadについても。</p>

<h3>実行タイミング</h3>

<ul>
<li>即時関数

<ul>
<li>その名の通り即時</li>
</ul>
</li>
<li>ready

<ul>
<li>DOMツリーの構築が終わったあと</li>
</ul>
</li>
<li>load

<ul>
<li>DOMツリーの構築が終わって、画像等を読み込み終わったあと</li>
</ul>
</li>
</ul>


<h2>コード</h2>

<h3>即時関数</h3>

<p>毎回忘れる即時関数。ちなみに<a href="https://developer.mozilla.org/ja/docs/Glossary/IIFE">IIFE</a>と呼ぶらしい。</p>

<pre class="code" data-lang="" data-unlink>(function () {
    console.log(&#39;test1&#39;);
})();</pre>


<p><a href="https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/Arrow_functions">アロー関数</a>を使うとこんな感じ。慣れない。</p>

<pre class="code" data-lang="" data-unlink>(() =&gt; {
    console.log(&#39;test1&#39;);
})();</pre>


<h3>ready</h3>

<pre class="code" data-lang="" data-unlink>document.addEventListener(&#34;DOMContentLoaded&#34;, function(event) {
    console.log(&#39;test2&#39;);
});</pre>


<h3>road</h3>

<pre class="code" data-lang="" data-unlink>window.addEventListener(&#34;load&#34;, function(event) {
    console.log(&#39;test3&#39;);
  });</pre>


<p>下記でもいけるが、複数指定できない（一番最後のやつで上書きされる）ので注意。</p>

<pre class="code" data-lang="" data-unlink>window.onload = function(){
    console.log(&#39;test3&#39;);
}</pre>


<h3><a class="keyword" href="http://d.hatena.ne.jp/keyword/jQuery">jQuery</a>による記述方法</h3>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/jQuery">jQuery</a>を使用した書き方もよく見かける。とてもわかりやすいQiitaがあったのでこちらを参照！
<a href="https://qiita.com/mimoe/items/74cb3a01a30162759fdd">https://qiita.com/mimoe/items/74cb3a01a30162759fdd</a></p>

<p>ちなみに<a class="keyword" href="http://d.hatena.ne.jp/keyword/jQuery">jQuery</a>を使用した即時関数はない。下記のような記述は引数に<a class="keyword" href="http://d.hatena.ne.jp/keyword/jQuery">jQuery</a>を渡しているだけ。</p>

<pre class="code" data-lang="" data-unlink>(function($){
    
})(jQuery);</pre>


