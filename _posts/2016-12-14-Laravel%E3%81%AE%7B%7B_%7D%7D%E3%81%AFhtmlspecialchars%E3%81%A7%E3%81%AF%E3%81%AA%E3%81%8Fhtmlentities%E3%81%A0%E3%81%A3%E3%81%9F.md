---
title: "Laravelの{{ }}はhtmlspecialcharsではなくhtmlentitiesだった"
date: 2016-12-14
slug: "Laravel%E3%81%AE%7B%7B_%7D%7D%E3%81%AFhtmlspecialchars%E3%81%A7%E3%81%AF%E3%81%AA%E3%81%8Fhtmlentities%E3%81%A0%E3%81%A3%E3%81%9F"
category: blog
tags: [PHP,Laravel]
---
<h2>勘違いしてました。</h2>

<p>LaravelのBladeの<code>{{ }}</code>ってhtmlentitiesだったんですね。<br/>
HTMLのサニタイズはhtmlspecialcharsで十分なので、<code>{{ }}</code>もそうだろうと思い込んでました。</p>

<h2>htmlspecialcharsとhtmlentitiesはどう違うの？</h2>

<p>htmlspecialcharsがHTMLにおける特殊文字をHTMLエンティティに変換するのに対して、<br/>
htmlentitiesは適用可能な文字を<strong><span style="color: #ff0000">全て</span></strong> HTML エンティティに変換します。</p>

<p><a href="http://php.net/manual/ja/function.htmlspecialchars.php">PHP: htmlspecialchars - Manual</a><br/>
<a href="http://php.net/manual/ja/function.htmlentities.php">PHP: htmlentities - Manual</a></p>

<p>なので、<code>¥</code>とか<code>©</code>とか<code>×</code>とか<code>÷</code>とか、<br/>
普段よく使う記号も変換するので、意図せず使っている方は注意！</p>

<pre class="code lang-php" data-lang="php" data-unlink>print htmlspecialchars('¥');
// ¥
print htmlentities('¥');
// <span class="synSpecial">&amp;yen;</span>

print htmlspecialchars('©');
// ©
print htmlentities('©');
// <span class="synSpecial">&amp;copy;</span>

print htmlspecialchars('×');
// ×
print htmlentities('×');
// <span class="synSpecial">&amp;times;</span>

print htmlspecialchars('÷');
// ÷
print htmlentities('÷');
// <span class="synSpecial">&amp;divide;</span>
</pre>


<h2>ちなみにe()もhtmlentities。</h2>

<p>ヘルパー関数の<code>e()</code>もhtmlentitiesです。うーん、いやいいんだけどね。。</p>

<p><a href="https://readouble.com/laravel/5.1/ja/helpers.html#method-e">&#x30D8;&#x30EB;&#x30D1;&#x30FC;&#x95A2;&#x6570; 5.1 Laravel</a></p>

<p>勘違いしてたのは私だけかもしれませんが、自分への戒めを込めてもう一度。</p>

<p><span style="font-size: 150%">Laravelの<code>{{ }}</code>はhtmlspecialcharsじゃなくてhtmlentitiesでした！！(> &lt;)</span></p>
