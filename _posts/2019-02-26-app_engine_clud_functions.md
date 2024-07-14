---
title: "Google App EngineとCloud Functionsの違い"
date: 2019-02-26
slug: "app_engine_clud_functions"
category: blog
tags: [Google,IT]
---
<p>表題の件、何が違うのかわからなかったのでググったメモ。</p>

<p>下記サイトがわかりやすかったです！</p>

<blockquote><p>App EngineとCloud Functionsの使い分けの基準は、どのイベントを起点にワークロードを実行させるかに依存する。App EngineはHTTPリク<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%B9">エス</a>トのみに反応するが、Cloud FunctionsはCloud Pub/SubやCloud Storage、Firebaseのイベントにも対応している。</p>

<p>一般的なWebアプリケーションを構築したい場合はApp Engineが向いている。一方、Cloud Storageにファイルがアップロードされたのを検知して<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D0%A5%C3%A5%C1%BD%E8%CD%FD">バッチ処理</a>を実行したい場合は、Cloud Functionsで構築した方が簡単な場合が多い。</p></blockquote>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fwww.atmarkit.co.jp%2Fait%2Farticles%2F1808%2F16%2Fnews004.html" title="Google Cloudが推進する、さまざまな「サーバレス」" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://www.atmarkit.co.jp/ait/articles/1808/16/news004.html">www.atmarkit.co.jp</a></cite></p>

<p>App Engineで<a class="keyword" href="http://d.hatena.ne.jp/keyword/PHP">PHP</a>使えるらしいのでいじってみようかしらー。</p>

