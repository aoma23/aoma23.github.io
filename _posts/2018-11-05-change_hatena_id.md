---
title: "【はてなID変更】はてなブログからはてなブログへ引越しする"
date: 2018-11-05
slug: "change_hatena_id"
category: blog
tags: [IT,はてなブログ,日常]
---
<h2>はてなIDは変更できない。。だから引っ越しする！</h2>

<p>はてなブログをやっていると、はてなIDを変更したくなるときってありますよね。
でもはてなIDは変更不可能な項目となっており、どうしても変更したい場合は『退会してから再登録をお願いします。』とのこと。。</p>

<p>そのためアカウントを新規作成して引っ越す必要があります。
これが面倒で諦めた人も多いのではないでしょうか。</p>

<p>しかし覚悟を決めて引っ越ししたら意外と簡単でした！
って言おうとしてたんですけど、めんどうでした。。
特に画像。。。</p>

<p>今回は実施した全手順をまとめておきます。はてなIDを変更したい人必見！</p>

<h2>今回の引っ越しポイント</h2>

<ul>
<li>はてなIDを変更したい

<ul>
<li>今回のメインです。旧IDと完全にさようなら！</li>
</ul>
</li>
<li>画像も引っ越したい

<ul>
<li>画像URLにもはてなIDが含まれているため、新しいURLにするよ！</li>
</ul>
</li>
<li>記事のページランクも引き継ぎたい（SEO対策）

<ul>
<li>せっかく引越したけどアクセス数が落ちるのは避けたい。記事毎に新URLにリダイレクトします！</li>
</ul>
</li>
</ul>


<h2>引っ越し手順</h2>

<p>※はてなID変更前の引越し元を旧ブログ、引越し先を新ブログと呼びます。</p>

<h3>旧ブログから記事データをエクスポートする</h3>

<p>設定→詳細設定→エクスポート→記事のバックアップと製本サービス→エクスポートする</p>

<h3>新ブログのアカウントを作る</h3>

<p>別のメールアドレスで新規アカウントを作成します。
希望のはてなIDにしましょう。（言うまでもありませんが二度と変更できないので注意）
※メールアドレスは後から変更可能です。（引っ越し後に旧ブログのものに変更可能）</p>

<h3>画像データを引っ越す</h3>

<blockquote><p><a href="http://staff.hatenablog.com/entry/2016/08/16/160000">他のサービスからはてなブログに移転する際に、画像データも一緒に引っ越しできるようにしました。これまでのインポートにも有効です</a>
（はてなブログからはてなブログへの移転を含む）</p></blockquote>

<p>と書いてあったので「超絶楽チンじゃん！」と思ったけど甘かったです。
画像データの移行に旧ブログのはてなフォトライフの画像が出てこない。。
どうやらはてなフォトライフは対象外な模様。</p>

<h4>画像URLを抽出してダウンロード</h4>

<ul>
<li><a href="http://blog.best-hunt.com/entry/2017/09/05/190000">http://blog.best-hunt.com/entry/2017/09/05/190000</a></li>
<li><a href="http://takiji13.hatenablog.com/entry/2016/04/28/224533">http://takiji13.hatenablog.com/entry/2016/04/28/224533</a></li>
<li><a href="https://qiita.com/daisuke_nomura/items/453a62b2e7fa204c1b89">https://qiita.com/daisuke_nomura/items/453a62b2e7fa204c1b89</a></li>
</ul>


<p>参考サイトいろいろありましたが、結局rssのソースコードをコピペして抽出しました。</p>

<p>１. rss.txt作成</p>

<p>rssページ分のソースを貼り付け</p>

<pre class="code" data-lang="" data-unlink>旧ブログRSSのURL例: `https://example.com/Hatena%20Blog/rss`
旧ブログRSSページング: `https://example.com/Hatena%20Blog/rss?page=2`</pre>


<p>２. grepして画像URL抽出</p>

<pre class="code" data-lang="" data-unlink>grep &#34;https\:\/\/cdn-.*png\|https\:\/\/cdn-.*jpg&#34; -o rss.txt &gt; photo.txt</pre>


<p>３. 不要な行を削除</p>

<p><em>m.jpgや</em>120.jpgなどのサムネイル画像は不要なので削除</p>

<pre class="code" data-lang="" data-unlink>cat photo.txt | grep -v &#34;_m.&#34; | grep -v &#34;_120.&#34; &gt; photo2.txt</pre>


<p>４. 画像ファイルをダウンロード</p>

<pre class="code" data-lang="" data-unlink>wget -i photo.txt -nc --random-wait</pre>


<h4>はてなフォトライフに一括アップロード</h4>

<p>最後に画面から一括アップロードして終わり！と思ったら一度に5個までしかアップできない。。
なにやらFlashが有効になっていないといけないらしく、下記サイトを参考に対応できました。</p>

<blockquote><p>はてなフォトライフでアップロードを複数選択できない場合の対処方法
<a href="http://www.ktg6.com/entry/2017/06/04/135458">http://www.ktg6.com/entry/2017/06/04/135458</a>
<a href="https://ktg6.com/2017/06/04/2017-06-04-135458/">https://ktg6.com/2017/06/04/2017-06-04-135458/</a></p>

<p>使用しているブラウザにAdobe Flash Playerがインストールされている必要があるようです。
私の場合、ブラウザにGoogleChromeを使っています。どうやら、Flash Playerの設定が有効になっていなかったので、修正したところ、上手くいきました。</p>

<p>1.最新のFlashプレイヤーをインストールする
2.はてなフォトライフ アップロード画面のアドレスバー マークをクリック
3.Flashを「許可」にする。Flashがない場合は4を参照
4.サイトの設定からFlashを「許可」にする</p></blockquote>

<h4>画像を差し替え</h4>

<p>ここでエクスポートした記事データをテキストエディタで開いて
画像URLを旧から新に置換していこうかなーとか思ってたのですが、
結局記事インポートしたあとに手動でひとつひとつ編集するのとそんなに手間変わらないなーという感じです。
（そして面倒になり半年がすぎ結局やらないことにしました。みなさんは頑張ってw）</p>

<h3>新ブログにインポートする</h3>

<p>いよいよ記事をインポートします。
旧IDを完全に消すため、エクスポートした記事データをテキストエディタで開いて
旧IDを新IDに一括置換しました。
※前述の通り画像はインポート後に差し替えたので画像URLのみ置換対象外としました。</p>

<p><a href="https://blog.hatena.ne.jp/my/import">https://blog.hatena.ne.jp/my/import</a> にアクセスしてインポート。これはかんたん。</p>

<h3>旧ブログから新ブログへリダイレクトする</h3>

<p>本当は301（永続的）リダイレクトしたかったのですが、無料アカウントだとjavascriptのみで対応する必要があり、jsだと301できないので302でいくことにしました。</p>

<h4>旧ブログにjsを実装</h4>

<p>「デザイン設定→カスタマイズ→ヘッダ→タイトル下」に下記をコピペ</p>

<pre class="code" data-lang="" data-unlink>&lt;script
  src=&#34;https://code.jquery.com/jquery-2.2.4.min.js&#34;
  integrity=&#34;sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=&#34;
  crossorigin=&#34;anonymous&#34;&gt;&lt;/script&gt;
&lt;script type=&#34;text/javascript&#34;&gt;
    var domain = &#39;https://aoma23.hatenablog.jp&#39;;　// ←新ブログのURL
    var path = location.pathname;
    var url = domain + path; 

    // canonical書き換え
    $(&#34;link[rel=&#39;canonical&#39;]&#34;).attr(&#39;href&#39;, url);
    
    // リダイレクト
    location.href = url; 

&lt;/script&gt;</pre>


<p>jsによるcanonical書き換えはクローラーが<a href="https://www.suzukikenichi.com/blog/google-only-checks-canonicals-on-the-raw-html-not-the-rendered-one/">処理してくれる</a>とか<a href="https://www.suzukikenichi.com/blog/google-only-checks-canonicals-on-the-raw-html-not-the-rendered-one/">無視される</a>とか諸説ありますが、まぁやっておいて損はないでしょう。</p>

<p>これで旧ブログの記事にアクセスすると新ブログの記事にリダイレクトすることを確認できると思います。</p>

<h3>クローラーがインデクシングし直すのを待つ</h3>

<p>Google Search Consoleでsitemap.xmlを送ってあげるとよいでしょう。</p>

<p>※1ヶ月くらい経過したのですが、いまだに変わらない。。。進展あれば更新します！待ってられないので、もう引っ越し記事公開しちゃう！</p>

<h3>旧ブログ閉鎖</h3>

<p>インデクシングが新URLになれば旧ブログへのアクセスもだいぶ減る（新URLに直アクセスされる）はずですので、
Search Consoleで確認し、問題なければ旧ブログは閉鎖しましょう。
（何か不安な方や思い出を大事にする方は消す必要はありません）</p>

<p>ちなみにはてなブログの提供しているアクセス解析はページ表示後のjsでカウントしているらしく、
リダイレクト処理を入れたタイミングで0になるので注意！</p>

<h3>引っ越し完了！</h3>

<p>お疲れ様でした！はてなID変更作業の完了です！</p>

<p>結論として、自分の場合、引っ越し作業はとても面倒で億劫になり、ブログ更新も半年ほど停滞するなどして無駄に時間を使ってしまった感があります。<br/>
（やるぞ！と決めてから11ヶ月も経ってしまった...）</p>

<p>みなさんは私のようにならずサクッと引っ越し完了してくださいね！<br/>
画像URLを無視すればそれほど時間はかかりません！</p>

<p>それではステキなはてなIDライフを！</p>

