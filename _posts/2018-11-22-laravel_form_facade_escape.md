---
title: "【Laravel】Formファサードって`{{ }}`で囲ってもエスケープされないの！？"
date: 2018-11-22
slug: "laravel_form_facade_escape"
category: blog
tags: [IT,Laravel,セキュリティ]
---
<h2>ふとレビューしてて気づきました。</h2>

<pre class="code" data-lang="" data-unlink>{{ Form::text(&#39;test&#39;, &#39;&#39;) }}</pre>


<p>んん！？昔は<code>{!! !!}</code>で囲まないといけなかったはず！</p>

<p>疑問に思ったのは{{ }}はタグを<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%B9">エス</a>ケープするのに、Form<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D5%A5%A1%A5%B5%A1%BC%A5%C9">ファサード</a>は無視するんだなーということ。</p>

<h2>で、検証してみました。</h2>

<pre class="code" data-lang="" data-unlink>{{ Form::text(&#39;test&#39;, &#39;&#39;) }}
{!! Form::text(&#39;test&#39;, &#39;&#39;) !!}
{{ &#39;&lt;b&gt;text&lt;/b&gt;&#39; }}
{!! &#39;&lt;b&gt;text&lt;/b&gt;&#39; !!}</pre>


<p>↓　結果はこうなる。なぜだ。。。</p>

<pre class="code" data-lang="" data-unlink>&lt;input name=&#34;test&#34; type=&#34;text&#34; value=&#34;&#34;&gt;
&lt;input name=&#34;test&#34; type=&#34;text&#34; value=&#34;&#34;&gt;
&amp;lt;b&amp;gt;text&amp;lt;/b&amp;gt;
&lt;b&gt;text&lt;/b&gt;</pre>


<p>もしかして<a class="keyword" href="http://d.hatena.ne.jp/keyword/value">value</a>値を<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%B9">エス</a>ケープするようになった？なんて妄想してみたが違った。</p>

<pre class="code" data-lang="" data-unlink>{{ Form::text(&#39;test&#39;, &#39;&lt;b&gt;test&lt;/b&gt;&#39;) }}
{!! Form::text(&#39;test&#39;, &#39;&lt;b&gt;test&lt;/b&gt;&#39;) !!}</pre>


<p>↓</p>

<pre class="code" data-lang="" data-unlink>&lt;input name=&#34;test&#34; type=&#34;text&#34; value=&#34;&amp;lt;b&amp;gt;test&amp;lt;/b&amp;gt;&#34;&gt;
&lt;input name=&#34;test&#34; type=&#34;text&#34; value=&#34;&amp;lt;b&amp;gt;test&amp;lt;/b&amp;gt;&#34;&gt;</pre>


<h2>で、最終的にありがたい記事が！</h2>

<p><a href="https://www.msng.info/archives/2016/01/laravel-blade-braces-dont-always-escape.php">https://www.msng.info/archives/2016/01/laravel-blade-braces-dont-always-escape.php</a></p>

<p>Laravel 5.1 から下記のようになっていたとのこと。</p>

<pre class="code" data-lang="" data-unlink>function e($value)
{
    if ($value instanceof Htmlable) {
        return $value-&gt;toHtml();
    }
    return htmlentities($value, ENT_QUOTES, &#39;UTF-8&#39;, false);
}</pre>


<p>ということで今後Form<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D5%A5%A1%A5%B5%A1%BC%A5%C9">ファサード</a>は<code>{{ }}</code>で囲もうと思います。<br/>
（<code>{!! !!}</code> の出現頻度が減るので<a class="keyword" href="http://d.hatena.ne.jp/keyword/grep">grep</a>が捗りますね！）</p>

