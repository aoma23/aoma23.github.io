---
title: "調整さんプラグイン開発までのプロセスを公開します！"
date: 2019-08-19
slug: "cyouseisan_addon_dev_process"
category: blog
tags: [IT,開発,ブックマークレット,調整さん]
---
<p>先日、調整さんのデフォルト開始時間を変更する<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>を作りました。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Faoma23.hatenablog.jp%2Fentry%2Fcyouseisan_js" title="調整さんのデフォルト開始時間を変更するブックマークレットを作ったよ！ - aoma blog" class="embed-card embed-blogcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 190px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://aoma23.hatenablog.jp/entry/cyouseisan_js">aoma23.hatenablog.jp</a></cite></p>

<p>便利だと思うので、皆さん使ってみてください。
調整さんの中の人にも褒めていただいた？ので嬉しい限り。</p>

<p><blockquote class="twitter-tweet" data-lang="HASH(0x5573134c7b20)"><p lang="ja" dir="ltr">スゴイ👏👏👏(我々が取り組むべき課題ですネ…恐れ入ります、ありがとうございます) <a href="https://t.co/nHEreZzDWx">https://t.co/nHEreZzDWx</a></p>&mdash; アヤパカ@調整さん中の人 (@ayapakka) <a href="https://twitter.com/ayapakka/status/1160922928046698497?ref_src=twsrc%5Etfw">August 12, 2019</a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></p>

<p>「どうやって作ったの？」といった質問をいただいたので、作るまでの経緯を解説してみたいと思います！</p>

<h2>作成までの経緯</h2>

<h3>なぜ作ろうと思ったか</h3>

<p>モチベーションは大事ですよね。</p>

<p>友達と来月どこかで飲みに行こうー！と思って調整さんをつかったときに平日全て候補日にしたんですね。</p>

<p>20:00開始予定だったんですが全部19:00～になっちゃって、開始時間のデフォルトはどうやって変えるんだろうと思ったら、どうやらなさそうだと。</p>

<p>ないなら作っちゃうかと。きっと需要あるだろうと。</p>

<p>みたいな感じです。</p>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/chrome">chrome</a>のアドオンにするか迷いましたが、お手軽にjsの<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>でいいやーと。</p>

<h3>調査フェーズ</h3>

<p><a href="view-source:https://chouseisan.com/">調整さんのHTMLソース</a>を見てJS部分を解析してみました。</p>

<p>「19:00」で検索したらそれっぽい箇所がヒットしました！</p>

<pre class="code" data-lang="" data-unlink>$(&#34;#datepicker&#34;).datepicker({
    dateFormat: &#39;m/d(DD)&#39;,
    firstDay: 0,
    yearSuffix: &#39;年&#39;,
    showMonthAfterYear: true,
    monthNames: [&#39;1月&#39;, &#39;2月&#39;, &#39;3月&#39;, &#39;4月&#39;, &#39;5月&#39;, &#39;6月&#39;, &#39;7月&#39;, &#39;8月&#39;, &#39;9月&#39;, &#39;10月&#39;, &#39;11月&#39;, &#39;12月&#39;],
    dayNames: [&#39;日&#39;, &#39;月&#39;, &#39;火&#39;, &#39;水&#39;, &#39;木&#39;, &#39;金&#39;, &#39;土&#39;],
    dayNamesMin: [&#39;日&#39;, &#39;月&#39;, &#39;火&#39;, &#39;水&#39;, &#39;木&#39;, &#39;金&#39;, &#39;土&#39;],
    minDate: new Date(),
    maxDate: &#39;+12m&#39;,
    hideIfNoPrevNext: true,
    // 日付が選択された時、日付をテキストフィールドへセット
    onSelect: function (dateText, inst) {
        var nowText = $(&#34;#kouho&#34;).val();

        if (nowText === &#34;&#34;) {
            $(&#34;#kouho&#34;).val(dateText + &#34; 19:00〜&#34;);
        }
        else {
            $(&#34;#kouho&#34;).val(nowText + &#34;\n&#34; + dateText + &#34; 19:00〜&#34;);
        }
    }
});</pre>


<p>なるほどなるほどdatepickerね。<code>onSelect</code>の部分を書き換えればなんとかなりそう。</p>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B0%A5%B0%A4%EB">ググる</a>。</p>

<pre class="code" data-lang="" data-unlink>datepicker( &#39;option&#39;, &#39;onSelect&#39;, function (dateText, inst) {

});</pre>


<p>で<code>onSelect</code>だけ上書きできそう。これはイケそうだ！</p>

<h3>実装フェーズ</h3>

<p>まず下記のようなコードを作り、</p>

<pre class="code" data-lang="" data-unlink>var time_text = &#34; 19:30〜&#34;;
$(&#34;#datepicker&#34;).datepicker( &#39;option&#39;, &#39;onSelect&#39;, function (dateText, inst) {
    var nowText = $(&#34;#kouho&#34;).val();
    if (nowText === &#34;&#34;) {
        $(&#34;#kouho&#34;).val(dateText + time_text);
    }
    else {
        $(&#34;#kouho&#34;).val(nowText + &#34;\n&#34; + dateText + time_text);
    }
});</pre>


<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/chrome">chrome</a><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C7%A5%D9%A5%ED%A5%C3%A5%D1">デベロッパ</a>ーツールを開いてConsoleにコピペして検証してみました。</p>

<p>こんな感じ。</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190816/20190816102014.png" alt="f:id:aoma23:20190816102014p:plain" title="f:id:aoma23:20190816102014p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>すると無事書き換わったぞ！！</p>

<p>あとはブラッシュアップするだけ。
即時関数にしてグロー<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D0%A5%EB%A5%B9">バルス</a>コープを汚染しないように。そして調整さんへのリダイレクトを追加してみました。</p>

<pre class="code" data-lang="" data-unlink>(() =&gt; {
    const url = &#39;https://chouseisan.com&#39;;
    if (location.origin != url) {
        location.href = url;
        return;
    }
    let time_text = prompt(&#34;デフォルト開始時間を設定します&#34;, &#34;19:30～&#34;);
    $(&#34;#datepicker&#34;).datepicker( &#39;option&#39;, &#39;onSelect&#39;, function (dateText, inst) {
        var nowText = $(&#34;#kouho&#34;).val();
        if (nowText !== &#34;&#34;) {
            nowText += &#34;\n&#34;;
        }
        $(&#34;#kouho&#34;).val(nowText + dateText + &#39; &#39; + time_text);
    });
})();</pre>


<p>これを<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%EF%A5%F3%A5%E9%A5%A4%A5%CA%A1%BC">ワンライナー</a>にして先頭に<code>javascript:</code>を付与したら<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>の完成です。<br/>
<a class="keyword" href="http://d.hatena.ne.jp/keyword/Google">Google</a>の<a href="https://closure-compiler.appspot.com/home">Closure Compiler</a>を使って<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%EF%A5%F3%A5%E9%A5%A4%A5%CA%A1%BC">ワンライナー</a>にすると圧縮もされて便利。</p>

<h2>デプロイ？フェーズ</h2>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>をブックマークするのって意外とめんどうですよね。<br/>
aタグとかにしてブックマークバーにドラッグ＆ドロップする方法が一番お手軽そうだったので今回はそれにしてみました。</p>

<pre class="code" data-lang="" data-unlink>&lt;a href=&#34;｛ブックマークレット｝&#34; onclick=&#34;return false&#34;&gt;ブックマーク名&lt;/a&gt;</pre>


<p>属性値（hrefの値）を<code>"</code>で囲む必要があり、今回<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8">スクリプト</a>内でダブルコーテーションを使っていたのでシングルコーテーションに置換しました。<br/>
※<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8">スクリプト</a>内容によってはダブルコーテーションじゃないといけない可能性もあると思うので、その場合は<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%B9">エス</a>ケープするなり注意してくださいね。</p>

<pre class="code" data-lang="" data-unlink>&lt;a href=&#34;javascript:(function(){if(&#39;https://chouseisan.com&#39;!=location.origin)location.href=&#39;https://chouseisan.com&#39;;else{var b=prompt(&#39;\u30c7\u30d5\u30a9\u30eb\u30c8\u958b\u59cb\u6642\u9593\u3092\u8a2d\u5b9a\u3057\u307e\u3059&#39;,&#39;19:30\uff5e&#39;);$(&#39;#datepicker&#39;).datepicker(&#39;option&#39;,&#39;onSelect&#39;,function(c,d){var a=$(&#39;#kouho&#39;).val();&#39;&#39;!==a&amp;&amp;(a+=&#39;\n&#39;);$(&#39;#kouho&#39;).val(a+c+&#39; &#39;+b)})}})();&#34; onclick=&#34;return false&#34;&gt;調整さんの開始時間変更&lt;/a&gt;</pre>


<p>完成ー。<a href="https://aoma23.hatenablog.jp/entry/cyouseisan_js">メイン記事</a>に設置してるので登録してみてね！</p>

<h4>参考にしたサイト</h4>

<ul>
<li><a href="https://qiita.com/kanaxx/items/63debe502aacd73c3cb8">Bookmarklet&#x3092;&#x4F5C;&#x308D;&#x3046;(&#x6E96;&#x5099;&#x7DE8;&#xFF09; - Qiita</a></li>
</ul>


<h2>今後やりたいこと</h2>

<ul>
<li>外部jsファイルを読み込む<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>の記述方法もあるのでそっちのほうがよさそう

<ul>
<li>今後バージョンアップとかしたときに再配布しなくてよくなる</li>
</ul>
</li>
<li><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>メーカーみたいなものを作りたい

<ul>
<li>お手軽に<a class="keyword" href="http://d.hatena.ne.jp/keyword/JavaScript">JavaScript</a>を<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%C3%A5%AF%A5%DE%A1%BC%A5%AF%A5%EC%A5%C3%A5%C8">ブックマークレット</a>にできるように</li>
</ul>
</li>
</ul>


<h2>さいごに</h2>

<p>不明点等あればお気軽に<a href="https://twitter.com/aoma23">ツイッター</a>等でご質問くださいー。</p>

