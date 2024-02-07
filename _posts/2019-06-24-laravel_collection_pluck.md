---
title: "【Laravel】多次元配列から特定の要素だけ抽出したい"
date: 2019-06-24
slug: "laravel_collection_pluck"
category: blog
tags: [IT,Laravel,pluck,配列]
---
<p>毎回忘れるのでメモ。</p>

<p>下記からcodeの配列だけ作りたい。<code>['circle', 'triangle', 'square']</code></p>

<pre class="code" data-lang="" data-unlink>$data = [
    &#39;maru&#39; =&gt; [
        &#39;code&#39; =&gt; &#39;circle&#39;,
        &#39;name&#39; =&gt; &#39;まる&#39;,
    ],
    &#39;sankaku&#39; =&gt;[
        &#39;code&#39; =&gt; &#39;triangle&#39;,
        &#39;name&#39; =&gt; &#39;さんかく&#39;,
    ],
    &#39;sikaku&#39; =&gt; [
        &#39;code&#39; =&gt; &#39;square&#39;,
        &#39;name&#39; =&gt; &#39;しかく&#39;,
    ],
];</pre>


<p>この場合<a href="https://readouble.com/laravel/5.5/ja/helpers.html#method-array-pluck">ヘルパのarray_pluck</a>ではダメで、
一度コレクションにしてから、<a href="https://readouble.com/laravel/5.5/ja/collections.html#method-pluck">コレクションのpluck</a>を使えばOK！</p>

<pre class="code" data-lang="" data-unlink>$codes = collect($data)-&gt;pluck(&#39;code&#39;);</pre>


