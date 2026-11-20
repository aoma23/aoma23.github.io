---
title: "sedコマンドでシングルコーテーションやダブルコーテーションを含む文字列を置換する"
date: 2019-08-01
slug: "sed_replace_quotation"
category: blog
tags: [IT,sed,コマンド,置換]
---
<p>シングルコーテーションやダブルコーテーション内の文字列だけ置換したいときありますよね。</p>

<p>sedコマンドで<code>"aaa"</code>を<code>"bbb"</code>に置換したい！囲まれてない<code>aaa</code>は置換したくない！みたいな。</p>

<p>その場合はシングルコーテーションやダブルコーテーションで囲ってやる必要があります。</p>

<p>何を言っているのかわからねーと思うから例を示すぜ！</p>

<h2><code>"aaa"</code>を<code>"bbb"</code>に置換したい</h2>

<p>こんなファイルがあったとする</p>

<pre class="code" data-lang="" data-unlink>$ cat a.txt
&#34;aaa&#34;
&#39;aaa&#39;
aaa</pre>


<p>単純に<code>aaa</code>をsedコマンドで置換しようとするとこんな感じ。</p>

<pre class="code" data-lang="" data-unlink>$ sed s/aaa/bbb/ a.txt
&#34;bbb&#34;
&#39;bbb&#39;
bbb</pre>


<p>置換対象にダブルコーテーションを指定してみる。</p>

<pre class="code" data-lang="" data-unlink>$ sed s/&#34;aaa&#34;/bbb/ a.txt
&#34;bbb&#34;
&#39;bbb&#39;
bbb</pre>


<p>意味なし。。。<br/>
シングルコーテーションはどうか？</p>

<pre class="code" data-lang="" data-unlink>$ sed s/&#39;aaa&#39;/bbb/ a.txt
&#34;bbb&#34;
&#39;bbb&#39;
bbb</pre>


<p>意味なし。。。<br/>
ところでオプションはシングルコーテーションやダブルコーテーションで囲むことができます。<br/>
こんな感じ。</p>

<pre class="code" data-lang="" data-unlink>$ sed &#39;s/aaa/bbb/&#39; a.txt
&#34;bbb&#34;
&#39;bbb&#39;
bbb</pre>


<p>この状態でダブルコーテーションを指定してみる。</p>

<pre class="code" data-lang="" data-unlink>$ sed &#39;s/&#34;aaa&#34;/bbb/&#39; a.txt
bbb
&#39;aaa&#39;
aaa</pre>


<p>おお！対象が絞れた！<br/>
シングルコーテーションはどうか？</p>

<pre class="code" data-lang="" data-unlink>$ sed &#34;s/&#39;aaa&#39;/bbb/&#34; a.txt
&#34;aaa&#34;
bbb
aaa</pre>


<p>こちらもイケた！<br/>
ということで置換後の文字列にもコーテーションを付与してあげて一件落着。</p>

<pre class="code" data-lang="" data-unlink>$ sed &#39;s/&#34;aaa&#34;/&#34;bbb&#34;/&#39; a.txt
&#34;bbb&#34;
&#39;aaa&#39;
aaa
$ sed &#34;s/&#39;aaa&#39;/&#39;bbb&#39;/&#34; a.txt
&#34;aaa&#34;
&#39;bbb&#39;
aaa</pre>


<p>ファイルを上書きしたい場合はiオプションを付与すればOK！</p>

<p><code>sed -i 's/"aaa"/"bbb"/' a.txt</code></p>

