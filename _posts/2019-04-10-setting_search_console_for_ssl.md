---
title: "はてなブログをSSL化したあとSearchConsoleの設定変更するの忘れてた！"
date: 2019-04-10
slug: "setting_search_console_for_ssl"
category: blog
tags: [IT,SEO,SSL]
---
<p>表題の通りなんですが、久々に<a class="keyword" href="http://d.hatena.ne.jp/keyword/google">google</a>のサーチコンソールにログインしたんですね。（オイ！）</p>

<p>そしたら何ページかインデックス除外されてる！？</p>

<p><figure class="figure-image figure-image-fotolife" title="リダイレクトによりインデックス除外されてる！！"><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190410/20190410101806.png" alt="f:id:aoma23:20190410101806p:plain" title="f:id:aoma23:20190410101806p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>リダイレクトによりインデックス除外されてる！！</figcaption></figure></p>

<p>リダイレクト処理なんて入れてないはずなのに、なぜリダイレクト！？</p>

<p>と思ってよーく見たら、http→<a class="keyword" href="http://d.hatena.ne.jp/keyword/https">https</a>でした。。。なるほど。</p>

<h2>というわけで設定変更！</h2>

<p><a href="https://junichi-manga.com/https-analytics-search-console/">https://junichi-manga.com/https-analytics-search-console/</a></p>

<p>上記サイトを参考に設定変更行いました。</p>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/Google">Google</a>アナリティクスは設定画面でさらっと変更できましたが、サーチコンソールはプロパティを新規作成から行わなくてはならずちょっと面倒でした。</p>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A4%CF%A4%C6%A4%CA%A5%D6%A5%ED%A5%B0">はてなブログ</a>を<a class="keyword" href="http://d.hatena.ne.jp/keyword/SSL">SSL</a>化した方は是非確認を！！</p>

