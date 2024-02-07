---
title: "jQueryのajaxエラー時にレスポンスボディを取得する方法"
date: 2019-06-21
slug: "jquery_ajax_failed_response_body"
category: blog
tags: [jQuery,ajax,IT]
---
<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/jQuery">jQuery</a>による<a class="keyword" href="http://d.hatena.ne.jp/keyword/ajax">ajax</a>時のレスポンスボディ取得方法について調べました。</p>

<p>成功時（done）は引数が用意されていてdataで取れますが、エラー時（fail）はなぜか用意されていない。。なぜ？使う機会が少ないからなの？？</p>

<p>エラー時は<code>jqXHR</code>を使って'jqXHR.responseJSON'で取得できます。</p>

<pre class="code" data-lang="" data-unlink>$.ajax({
    url: url,
    type: &#39;POST&#39;,
    data: data,
    cache: false,
    dataType: &#39;json&#39;,
})
.done(function(data, textStatus, jqXHR){
    console.log(data);
})
.fail(function(jqXHR, textStatus, errorThrown){
    console.log(jqXHR.responseJSON);
});</pre>


<p>ちなみにjqXHRとは <a class="keyword" href="http://d.hatena.ne.jp/keyword/jQuery">jQuery</a> <a class="keyword" href="http://d.hatena.ne.jp/keyword/XMLHttpRequest">XMLHttpRequest</a>の略。</p>

<p>成功時もあるので、<code>data</code>は<code>jqXHR.responseJSON</code>でもOKです。</p>

<p>なぜ統一してくれなかったのか。。</p>

