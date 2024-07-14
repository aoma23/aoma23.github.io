---
title: "LICEcapがmacのcatalinaで動かないときの対処法"
date: 2020-03-09
slug: "licecap_mac_catalina"
category: blog
tags: [IT,LICEcap,mac,エラー]
---
<p>catalinaの<a class="keyword" href="http://d.hatena.ne.jp/keyword/mac">mac</a>にLICEcap入れたら全く動きませんでした。
saveボタンを押しても一向に動いてる気配がない感じ。。</p>

<p>ということでググった解決法をメモ。</p>

<ol>
<li><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D1%A1%BC%A5%DF%A5%C3%A5%B7%A5%E7%A5%F3">パーミッション</a>を許可する</li>
</ol>


<p><a href="https://user-images.githubusercontent.com/1505339/67440500-545ce700-f5ae-11e9-869e-94805dc38041.png" class="http-image"><img src="https://user-images.githubusercontent.com/1505339/67440500-545ce700-f5ae-11e9-869e-94805dc38041.png" class="http-image" alt="https://user-images.githubusercontent.com/1505339/67440500-545ce700-f5ae-11e9-869e-94805dc38041.png"></a></p>

<p>上記キャプチャのように<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D1%A1%BC%A5%DF%A5%C3%A5%B7%A5%E7%A5%F3">パーミッション</a>を有効にしてあげる必要があるのですが、全然項目にLICEcapが出てきません。</p>

<ul>
<li><a href="https://github.com/justinfrankel/licecap/issues/71">https://github.com/justinfrankel/licecap/issues/71</a></li>
<li><a href="https://forum.cockos.com/showthread.php?p=2225846">https://forum.cockos.com/showthread.php?p=2225846</a></li>
</ul>


<p>を参考に下記コマンドを実行しました。</p>

<pre class="code" data-lang="" data-unlink>sudo xattr -rd com.apple.quarantine /Applications/LICEcap.app</pre>


<ol>
<li>保存時に<code>.gif</code>を指定する</li>
</ol>


<p>一番の原因はこれだったような気がします。
保存するファイル名に拡張子を指定してあげないと動かないらしく、<code>.gif</code>をつけたら動きました。</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20200309/20200309193339.png" alt="f:id:aoma23:20200309193339p:plain" title="f:id:aoma23:20200309193339p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>動いて良かったー！</p>

