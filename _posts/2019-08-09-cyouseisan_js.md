---
title: "調整さんのデフォルト開始時間を変更するブックマークレットを作ったよ！"
date: 2019-08-09
slug: "cyouseisan_js"
category: blog
tags: [IT,日常,調整さん,ブックマークレット,飲み会,イベント,調整]
---
<p>みなさん、友人や会社メンバーと飲み会の日程調整する時どうしてますか？</p>

<p>そう！やっぱり<a href="https://chouseisan.com/">『調整さん』</a>ですよね！便利！いつもお世話になってます。</p>

<p>しかしひとつ不満が。。</p>

<h2>デフォルト開始時間が変更できない</h2>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20190808/20190808185817.png' | relative_url }}" alt="f:id:aoma23:20190808185817p:plain" title="f:id:aoma23:20190808185817p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>候補日をクリックしたときのデフォルト開始時間は<code>19:00～</code>となっています。<br/>
これ候補日が3日くらいなら手動で変えるからいいんですが、たくさんあると直すのしんどい。
候補日全て19:30開始にしたいんだよー！とかね。</p>

<h2>デフォルト時間を変更できる<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>作りました！</h2>

<p>このリンクをブックマークバーにドラッグ＆ドロップで追加できます。<br/>
<a href="javascript:(function(){if('https://chouseisan.com'!=location.origin)location.href='https://chouseisan.com';else{var b=prompt('\u30c7\u30d5\u30a9\u30eb\u30c8\u958b\u59cb\u6642\u9593\u3092\u8a2d\u5b9a\u3057\u307e\u3059','19:30\uff5e');$('#datepicker').datepicker('option','onSelect',function(c,d){var a=$('#kouho').val();''!==a&&(a+='\n');$('#kouho').val(a+c+' '+b)})}})();" onclick="return false">調整さんの開始時間変更</a></p>

<p>もしくは下記をブックマークに追加して利用ください。</p>

<pre class="code" data-lang="" data-unlink>javascript:(function(){if(&#39;https://chouseisan.com&#39;!=location.origin)location.href=&#39;https://chouseisan.com&#39;;else{var b=prompt(&#39;\u30c7\u30d5\u30a9\u30eb\u30c8\u958b\u59cb\u6642\u9593\u3092\u8a2d\u5b9a\u3057\u307e\u3059&#39;,&#39;19:30\uff5e&#39;);$(&#39;#datepicker&#39;).datepicker(&#39;option&#39;,&#39;onSelect&#39;,function(c,d){var a=$(&#39;#kouho&#39;).val();&#39;&#39;!==a&amp;&amp;(a+=&#39;\n&#39;);$(&#39;#kouho&#39;).val(a+c+&#39; &#39;+b)})}})();</pre>


<h2>使い方</h2>

<ol>
<li>調整さんのページで先程追加したブックマークをクリック</li>
<li>ダイアログが表示されるので開始時間を編集</li>
<li>あとは候補日を選ぶだけ！</li>
</ol>


<p><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20190809/20190809154403.gif' | relative_url }}" alt="f:id:aoma23:20190809154403g:plain" title="f:id:aoma23:20190809154403g:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>どうです？地味に便利でしょう？</p>

<h3>まごころ機能</h3>

<p>別ページにいる時に<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>をクリックすると調整さんにリダイレクトするようになってます。やさしさ！</p>

<h2>さいごに</h2>

<p>みなさん是非使ってくださいね！</p>

