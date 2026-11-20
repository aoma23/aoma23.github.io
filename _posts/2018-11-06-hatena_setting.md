---
title: "はてなブログの設定を晒す"
date: 2018-11-06
slug: "hatena_setting"
category: blog
tags: [日常,はてなブログ,IT]
---
<h2>なぜ晒すのか</h2>

<p>同じような設定をしたい人の参考になれば！</p>

<p>というよりは自分用メモです、はい。
設定どうしたかって忘れちゃうよね！</p>

<h2>主な設定方針</h2>

<ul>
<li>無料アカウントだけど広告（Googleアドセンス）をいい感じ（記事下とか）に出したい

<ul>
<li>スマホでも出したい</li>
</ul>
</li>
<li>googleタグマネージャーでアドセンスやアナリティクスは管理する

<ul>
<li>アカウント作成方法も忘れるのでメモっておきたい</li>
</ul>
</li>
</ul>


<h2>はてなブログの設定</h2>

<ul>
<li><p>デザイン</p>

<ul>
<li>デザインテーマ

<ul>
<li>公式テーマ：Life（デフォルト）</li>
</ul>
</li>
<li><p>カスタマイズ</p>

<ul>
<li>サイドバー

<ul>
<li>モジュールを追加でHTMLを選択

<ul>
<li>googleタグマネージャーのbody内タグを追加（タイトルは『GTMbody内』にした）</li>
</ul>
</li>
</ul>
</li>
<li>フッタ

<ul>
<li>※1をコピペ

<ul>
<li>広告表示</li>
<li>タイトルのリンクをアーカイブに変更</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li><p>スマートフォン</p>

<ul>
<li>詳細設定

<ul>
<li>レスポンスデザインにチェック</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li><p>設定</p>

<ul>
<li>詳細設定

<ul>
<li>headに要素を追加

<ul>
<li>※2をコピペ

<ul>
<li>googleタグマネージャーのhead内タグ</li>
<li>トップページへのアクセスはアーカイブへリダイレクト（※現在はやめた）</li>
</ul>
</li>
</ul>
</li>
<li>解析ツール

<ul>
<li>Google Search Console</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
</ul>


<p>↓※1</p>

<pre class="code" data-lang="" data-unlink>&lt;!-- // 広告表示 --&gt;
&lt;div id=&#34;content-footer-ads&#34;&gt;

&lt;script async src=&#34;//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js&#34;&gt;&lt;/script&gt;
&lt;!-- hatena_aoma23 --&gt;
&lt;ins class=&#34;adsbygoogle&#34;
     style=&#34;display:block&#34;
     data-ad-client=&#34;xxxxxxxxxx&#34;
     data-ad-slot=&#34;xxxxxxxxxx&#34;
     data-ad-format=&#34;auto&#34;&gt;&lt;/ins&gt;
&lt;script&gt;
(adsbygoogle = window.adsbygoogle || []).push({});
&lt;/script&gt;

&lt;/div&gt;
&lt;script&gt;
// 記事があれば記事下に移動
var entry_content_elements = document.getElementsByClassName(&#34;entry-content&#34;);
if (entry_content_elements.length &gt; 0) {
    var content_footer_ads=document.getElementById(&#34;content-footer-ads&#34;);
    var temp=content_footer_ads.cloneNode(true);
    content_footer_ads.parentNode.removeChild(content_footer_ads);
    entry_content_elements[0].appendChild(temp);
}
&lt;/script&gt;

&lt;!-- // タイトルのリンクをアーカイブに変更 --&gt;
&lt;script&gt;
(function() {
  document.querySelector(&#34;#title a&#34;).href = &#34;/archive&#34;;
}());
&lt;/script&gt;</pre>


<p>↓※2</p>

<pre class="code" data-lang="" data-unlink>&lt;!-- トップページへのアクセスはアーカイブへリダイレクト --&gt;
&lt;script type=&#34;text/javascript&#34;&gt;
  if( location.href == &#39;http://aoma23.hatenablog.jp/&#39;){
  location.href=&#39;http://aoma23.hatenablog.jp/archive&#39;;
}
&lt;/script&gt;

&lt;!-- googleタグマネージャーのhead内タグ --&gt;
&lt;!-- Google Tag Manager --&gt;
&lt;script&gt;(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({&#39;gtm.start&#39;:
new Date().getTime(),event:&#39;gtm.js&#39;});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!=&#39;dataLayer&#39;?&#39;&amp;l=&#39;+l:&#39;&#39;;j.async=true;j.src=
&#39;https://www.googletagmanager.com/gtm.js?id=&#39;+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,&#39;script&#39;,&#39;dataLayer&#39;,&#39;GTM-xxxxxxxxxx&#39;);&lt;/script&gt;
&lt;!-- End Google Tag Manager --&gt;</pre>


<h2>googleタグマネージャー作成</h2>

<h3>googleタグマネージャーで新しいアカウントを作成して埋め込むタグを取得</h3>

<p>body内</p>




<p><noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-xxxxxxxxxx"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript></p>




<h3>googleアナリティクス</h3>

<ul>
<li>新しいタグ作成

<ul>
<li>googleアナリティクス側でトラッキングIDを取得しておく</li>
</ul>
</li>
</ul>


<h3>googleアドセンス　タグ</h3>

<p>新規作成</p>

<h3>googleサーチコンソール</h3>

<p>新規プロパティ作成</p>

<p><meta name="google-site-verification" content="xxxxxxxxxx" /></p>

