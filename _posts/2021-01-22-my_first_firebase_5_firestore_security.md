---
title: "【はじめてのFirebase】第5話：セキュリティルールマスターに俺はなる！"
date: 2021-01-22
slug: "my_first_firebase_5_firestore_security"
category: blog
tags: [IT,firestore,Firebase,セキュリティルール]
---
<p>おはこんばんちはaomaです。</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">記念日を通知する『KINENBI』というサービスを作ってます！<br>当日だけでなく○ヶ月記念日や777日記念日といった<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%AD%A5%EA%C8%D6">キリ番</a>にも対応しています！<br>現在事前登録受付中です！よろしくお願いします！<a href="https://twitter.com/hashtag/KINENBI?src=hash&amp;ref_src=twsrc%5Etfw">#KINENBI</a><a href="https://twitter.com/hashtag/%E6%8B%A1%E6%95%A3%E5%B8%8C%E6%9C%9B?src=hash&amp;ref_src=twsrc%5Etfw">#拡散希望</a> <a href="https://t.co/0deleLPFQA">https://t.co/0deleLPFQA</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352432369102245889?ref_src=twsrc%5Etfw">2021年1月22日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>この物語はそんなaomaがはじめてのFirebaseに挑む壮大なアクションアド<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D9%A5%F3%A5%C1%A5%E3%A1%BC">ベンチャー</a>である！第5話！</p>

<h2>第5話の内容</h2>

<ul>
<li>firestoreのセキュリティルールを設定できるようになる</li>
</ul>


<h2>本編</h2>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">セキュリティルールやっていくぞ！<br>やばいんでね。 <a href="https://t.co/oHow0D3egc">pic.twitter.com/oHow0D3egc</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351790174288527360?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">最強。<br>service cloud.firestore {<br>  match /databases/{database}/documents {<br>    match /{document=**} {<br>      allow read, write: if false;<br>    }<br>  }<br>}<br>service <a href="https://t.co/pttdGoSdI2">https://t.co/pttdGoSdI2</a> {<br>  match /b/{<a class="keyword" href="http://d.hatena.ne.jp/keyword/bucket">bucket</a>}/o {<br>    match /{allPaths=**} {<br>      allow read, write: if false;<br>    }<br>  }<br>}</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351792832789442561?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">読んでる。<a href="https://t.co/31MDR7M9Fe">https://t.co/31MDR7M9Fe</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351793631166828549?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">&gt; アクセス権を付与するルールが 1 つでも一致すれば、リク<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%B9">エス</a>トは許可されます。アクセス権を付与するルールが 1 つも一致しない場合、リク<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%B9">エス</a>トは拒否されます。<br><br>なるほど、つまりルールを書かなければ最強ってことでいいのかな？<a href="https://t.co/Ty5qjwFMLu">https://t.co/Ty5qjwFMLu</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351795595141279744?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">よし！これで自分のものしか作れないし、自分のものしか参照編集削除できない。完璧だ。<br>match /documents/{document=**} {<br>  allow read, update, delete: if request.auth.uid == <a href="https://t.co/UkZsKc01N6">https://t.co/UkZsKc01N6</a>.uid;<br>  allow create: if request.auth.uid == <a href="https://t.co/A7XL7Hxvgz">https://t.co/A7XL7Hxvgz</a>.uid;<br>}</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351823696097284096?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">フィールドの型チェックするのに参考になりそう。<a href="https://t.co/JTdjbVkSEa">https://t.co/JTdjbVkSEa</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351826796304429057?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">セキュリティルールで存在すべきすべてのフィールドがあるかチェックするのどうすればいいか調べてる。。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351829066551230464?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">すごいわかりやすいサイトあった。ありがたい。<a href="https://t.co/QxeIlWjYcU">https://t.co/QxeIlWjYcU</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351830106877005824?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なるほど。フィールドが意図したもののみかはList.hasAll(list)とList.hasOnly(list)の両方を使う必要があると。<br>hasAllで指定したフィールドが全て存在するか確認し、hasOnlyで指定したフィールドのみが存在することを確認する。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351831674363932673?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">updateのフィールドのバリデーションでハマった。update時に渡してないフィールドでもドキュメントに存在していればある扱いになるので、変更がないことをチェックすることは必須らしい。<br>&gt; request.resource 変数にはドキュメントの将来の状態が含まれます。<br>のあたり。<a href="https://t.co/luBIVOOIgR">https://t.co/luBIVOOIgR</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351841103356432385?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">補足。作成時にaa,bb,ccのフィールドがあったとして、create時のフィールドのセキュリティルールは下記のようになる。<br>data.keys().hasAll([&#39;aa&#39;, &#39;bb&#39;, &#39;cc&#39;]) &amp;&amp; data.keys().hasOnly([&#39;aa&#39;, &#39;bb&#39;, &#39;cc&#39;]);<br><br>このときupdate時はccしか更新しなかった（jsでccしか渡さなかった）としても、→つづく</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351841942791864327?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ccだけのチェックではエラーとなる。<br>data.keys().hasAll([&#39;cc&#39;]) &amp;&amp; data.keys().hasOnly([&#39;cc&#39;]);<br><br>これはfirebase側でaa,bbを補完するからで、create時と同様に<br>data.keys().hasAll([&#39;aa&#39;, &#39;bb&#39;, &#39;cc&#39;]) &amp;&amp; data.keys().hasOnly([&#39;aa&#39;, &#39;bb&#39;, &#39;cc&#39;]);<br>でチェックしてあげる必要がある。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351842613813411841?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">※なお、ここで出てくるdataは<a href="https://t.co/A7XL7Hxvgz">https://t.co/A7XL7Hxvgz</a>のこと。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351842732843565057?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">かなり堅牢になった。<br>テストコードもかけるっぽいので明日チャレンジしてみようかな。。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351843921769349120?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>To Be Continued...</p>

