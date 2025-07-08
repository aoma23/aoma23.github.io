---
title: "【はじめてのFirebase】第2話：FirebaseUI使ってみた"
date: 2020-09-29
slug: "my_first_firebase_2"
category: blog
tags: [IT,firebase,firebaseUI]
---
<p>おはこんばんちはaomaです。</p>

<p>Maday（まっでい）というアプリを作っていきます。 （どんなサービスかはまだヒミツ）
プラットフォームはFirebaseです！<br />
ただここでひとつ問題がありまして、Firebase使ったことないんですよね。。。</p>

<p>この物語はそんなaomaがはじめてのFirebaseに挑む壮大なアクションアド<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D9%A5%F3%A5%C1%A5%E3%A1%BC">ベンチャー</a>である！第2話！</p>

<h2>第2話の内容</h2>

<ul>
<li>FirebaseUIでログイン周りの実装できるようになる</li>
</ul>


<h2>本編</h2>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">うおお！firebaseやっていく！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258389442013716481?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ログイン周りやっていくよ！<br>FirebaseUI か Firebase Authentication <a class="keyword" href="http://d.hatena.ne.jp/keyword/SDK">SDK</a> か。2パターンあるらしい。前者はさくっと導入可能そうで、後者はいろいろカスタマイズしたり玄人向けで、ログイン方法ごとに実装必要そう。<br>前者でいくよ！<a href="https://t.co/1hjeX6d58d">https://t.co/1hjeX6d58d</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258390174737657856?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">まずFirebase を <a class="keyword" href="http://d.hatena.ne.jp/keyword/JavaScript">JavaScript</a> プロジェクトに追加するらしいんだけど、 Firebase Hosting を使用するようにしたので、まぁよくわからん。<a href="https://t.co/GIxs9pSETY">https://t.co/GIxs9pSETY</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258392761041948674?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">/__ の意味はこれ。<br><br>&gt; Firebase にデプロイするとき（firebase deploy）と、ローカル サーバー上でアプリを実行するとき（firebase serve）の両方で利用できます。<a href="https://t.co/8cwI0NgNyP">https://t.co/8cwI0NgNyP</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258393442654121984?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なんかPWAにする場合の注意事項的なのあったのでメモしておく。<a href="https://t.co/hXC6imEKJs">https://t.co/hXC6imEKJs</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258394449865928705?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">とりあえずFirebase <a class="keyword" href="http://d.hatena.ne.jp/keyword/SDK">SDK</a>がhead内で読み込まれていたので、body内に移動。<a href="https://t.co/lNIFWTk0t0">https://t.co/lNIFWTk0t0</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258396841990713344?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">予約済みの Hosting URL （/__）を使う場合はFirebase 構成オブジェクト（firebaseConfig）を指定する必要はない。<br>覚えておこう！！<a href="https://t.co/1SEP9LaDxJ">https://t.co/1SEP9LaDxJ</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258397836984500224?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">1のウェブ アプリケーションに Firebase Authentication を追加します。<br>完了ー！！<a href="https://t.co/LrQcR7DMGM">https://t.co/LrQcR7DMGM</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258397975203602432?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">2. 次のいずれかのオプションを使用して FirebaseUI を追加します。<br><br>a,b,cどれにしようかな。bのnpm モジュール！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258401221888536577?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">待ってvar firebaseui = require(&#39;firebaseui&#39;);でrequire is not defined エラーになる。そう<a class="keyword" href="http://d.hatena.ne.jp/keyword/javascript">javascript</a>にはrequireなんてないんだよね。<br>はい、ここでわからなくなるー。からaの<a class="keyword" href="http://d.hatena.ne.jp/keyword/CDN">CDN</a>にしーよおっと！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258401636747112448?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">OAuth プロバイダで<a class="keyword" href="http://d.hatena.ne.jp/keyword/Google">Google</a>を有効にしちゃうぜー！ <a href="https://t.co/zr2EyyTg7d">pic.twitter.com/zr2EyyTg7d</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258402905737969664?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr"><a class="keyword" href="http://d.hatena.ne.jp/keyword/Google">Google</a>アカウントでログインできるようになった。。。<br>なんなんだこれは。。。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258410729578754049?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">寝る！！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1258410822084161537?ref_src=twsrc%5Etfw">2020年5月7日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>そして月日は流れ。。。</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">起きた！（約5ヶ月ぶり）<br>firebaseやっていき！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310880286519865344?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">さて、ログイン状態を保持するにはどうすればいいんだ？</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310882450176835584?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ログインしてるかはこれか？<br>firebase.auth().onAuthStateChanged(function(user) {<a href="https://t.co/PUCiIfxdmC">https://t.co/PUCiIfxdmC</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310883718056165377?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ログインしてるか判定でけたー！<br>  firebase.auth().onAuthStateChanged(function (user) {<br>     if (user) {<br>        // User is signed in.<br>        console.log(&quot;ログインしてる&quot;);<br>        console.log(user);<br>      } else {<br>        displaySignIn();<br>      }<br>  }</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310887970400948225?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">さて、、、ログアウトはどうすればいいのかな？？</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310890798192312320?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ログアウトはこちらを参考に！<a href="https://t.co/MTuM7KVLRh">https://t.co/MTuM7KVLRh</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310896597564178433?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ログアウト<br>firebase.auth().signOut().then(() =&gt; {</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310897643434827776?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ログイン中の判定とログアウト処理実装できた！<br>今日はここまで！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1310897716231192577?ref_src=twsrc%5Etfw">2020年9月29日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>To Be Continued...</p>

