---
title: "Googleの新技術<portal>タグを試してみた"
date: 2019-05-21
slug: "portal_tag"
category: blog
tags: [IT,portalタグ]
---
<h2>Portalsとは</h2>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fjapan.zdnet.com%2Farticle%2F35136847%2F" title="グーグルが発表した新ウェブ技術「Portals」とは--「Google Chrome」向けのウェブナビゲーションシステム" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://japan.zdnet.com/article/35136847/">japan.zdnet.com</a></cite></p>

<p>とのことで、iframeタグとよく似た<a class="keyword" href="http://d.hatena.ne.jp/keyword/portal">portal</a>タグができるらしい。</p>

<blockquote><p><a class="keyword" href="http://d.hatena.ne.jp/keyword/portal">portal</a>タグと&lt;iframe&gt;タグの違いは何かと言えば、<a class="keyword" href="http://d.hatena.ne.jp/keyword/Google">Google</a>の新たなPortalsテク<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%CE%A5%ED">ノロ</a><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B8%A1%BC">ジー</a>が&lt;iframe&gt;タグの制約を取り去ったものだというところにある。</p>

<p>　Portalsを使用することでユーザーは、埋め込んだコンテンツへのナビゲーションが可能になると<a class="keyword" href="http://d.hatena.ne.jp/keyword/Google">Google</a>は述べている。&lt;iframe&gt;タグではセキュリティ上の理由からこういったことが許されていない。</p>

<p>　さらに、Portalsではアドレスバー上のURLを上書きすることもできるため、&lt;iframe&gt;タグが今日担っているコンテンツの埋め込みという枠を超え、ナビゲーションシステムとしても利用できる。</p></blockquote>

<p>ふむふむ。</p>

<blockquote><p>例えばエンジニアらは、ユーザーがニュースサイトを閲覧しており、記事の末尾に達した際に、&lt;<a class="keyword" href="http://d.hatena.ne.jp/keyword/portal">portal</a>&gt;タグを用いて埋め込まれた関連記事へのリンクをクリックすれば、シームレスに該当ページに遷移できるという目的で使われるようになってほしいと考えている。</p></blockquote>

<p>なるほど。さっぱりわからないｗ</p>

<p>ということで試してみました。文章よりも実際の動きを見たほうがわかりやすい！</p>

<h2>検証してみた</h2>

<h3>デモページを開く</h3>

<p>記事の通り、<a class="keyword" href="http://d.hatena.ne.jp/keyword/Chrome">Chrome</a> Canaryをインストールして「Portals <a class="keyword" href="http://d.hatena.ne.jp/keyword/Chrome">Chrome</a>」フラグを有効化してデモページを開きます</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190521/20190521133216.png" alt="f:id:aoma23:20190521133216p:plain" title="f:id:aoma23:20190521133216p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<h3><a class="keyword" href="http://d.hatena.ne.jp/keyword/portal">portal</a>タグを作成</h3>

<p>みんな大好き<a class="keyword" href="http://d.hatena.ne.jp/keyword/Yahoo%21">Yahoo!</a>のURLを入れてボタンを押すと<a class="keyword" href="http://d.hatena.ne.jp/keyword/portal">portal</a>タグが作成されました。</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190521/20190521133427.png" alt="f:id:aoma23:20190521133427p:plain" title="f:id:aoma23:20190521133427p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>キャプチャみたいな感じで画面下部に表示されてます。これが<a class="keyword" href="http://d.hatena.ne.jp/keyword/portal">portal</a>タグか。
iframeと異なり中のリンク等はクリックできない感じで、ほんと画面キャプチャって感じです。</p>

<h3>クリックしてみた</h3>

<p>gif動画でどうぞ。</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190521/20190521134048.gif" alt="f:id:aoma23:20190521134048g:plain" title="f:id:aoma23:20190521134048g:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>なるほど！これがシームレス画面遷移！</p>

<h2>所感</h2>

<ul>
<li>iframeに似てるというよりaタグが<a class="keyword" href="http://d.hatena.ne.jp/keyword/portal">portal</a>タグになる感じかな</li>
<li>ブラウザバックで戻れないのが気になった

<ul>
<li>これはまだ開発中だからだろう</li>
</ul>
</li>
<li>class="fade-in"があったので、様々な遷移アニメーションが用意される？</li>
</ul>


<p>流行るかな...</p>

