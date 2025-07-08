---
title: "【MySQL】壊れているビューを削除できない！"
date: 2019-09-27
slug: "drop_broken_view"
category: blog
tags: [IT,MySQL,View]
---
<h2>現象</h2>

<p>気づいたらビューが壊れている。</p>

<pre class="code" data-lang="" data-unlink>#1356 - View &#39;testdb.view_test&#39; references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them</pre>


<p>削除しようとしても消せない！！</p>

<pre class="code" data-lang="" data-unlink>DROP TABLE view_test;
// #1051 - Unknown table &#39;testdb.view_test&#39;</pre>


<h2>解決策</h2>

<p>まず適当な<a class="keyword" href="http://d.hatena.ne.jp/keyword/SQL">SQL</a>で壊れていない状態に作り直す！</p>

<pre class="code" data-lang="" data-unlink>CREATE OR REPLACE VIEW view_test AS SELECT now();</pre>


<p>そして削除！</p>

<pre class="code" data-lang="" data-unlink>DROP TABLE view_test;</pre>


<p>SO COOL!!!</p>

