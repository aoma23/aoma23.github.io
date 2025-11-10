---
title: "【はじめてのFirebase】第3話：FireStoreに登録更新削除の巻"
date: 2021-01-20
slug: "my_first_firebase_3_firestore"
category: blog
tags: [IT,Firebase,firestore]
---
<p>おはこんばんちはaomaです。</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">記念日を通知する『KINENBI』というサービスを作ってます！<br>当日だけでなく100日後とか777日後とかキリ番にも通知します！<br>現在事前登録受付中です！拡散お願いします！<a href="https://twitter.com/hashtag/KINENBI?src=hash&amp;ref_src=twsrc%5Etfw">#KINENBI</a><a href="https://t.co/0deleLPFQA">https://t.co/0deleLPFQA</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1348871584530927616?ref_src=twsrc%5Etfw">2021年1月12日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>この物語はそんなaomaがはじめてのFirebaseに挑む壮大なアクションアドベンチャーである！第3話！</p>

<h2>第3話の内容</h2>

<ul>
<li>Firestoreに登録、更新、削除できるようになる！</li>
</ul>


<h2>本編</h2>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">twitterカードの設定うまくいったー。<br>card validatorでぽちーする必要あるのね。<a href="https://t.co/pZeHf1JFhe">https://t.co/pZeHf1JFhe</a><br>あと再ツイートする必要はなく、表示されてなかったツイートもちゃんと表示されるようになる、と。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1348876401286422530?ref_src=twsrc%5Etfw">2021年1月12日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">今日はfirestoreにデータ登録する。<br>やっぱり公式ページをみるのが一番！中華一番！<a href="https://t.co/lHMevQiLCS">https://t.co/lHMevQiLCS</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349267095637299202?ref_src=twsrc%5Etfw">2021年1月13日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">あれ、わかんないな。。<br>dbってどっからでてきたんや。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349273120155205634?ref_src=twsrc%5Etfw">2021年1月13日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">こっちをみるべきだったか。<br>firestoreのチュートリアル。<a href="https://t.co/JQBbTfkwYF">https://t.co/JQBbTfkwYF</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349273483809755142?ref_src=twsrc%5Etfw">2021年1月13日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreないって怒られるなーと思ったら firebase-firestore.js を読み込んでないだけだった。。。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349277950642774017?ref_src=twsrc%5Etfw">2021年1月13日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">hosting使ってるからか、下記宣言は不要っぽい。<br>```<br>// Initialize Cloud Firestore through Firebase<br>firebase.initializeApp({<br>  apiKey: &#39;### FIREBASE API KEY ###&#39;,<br>  authDomain: &#39;### FIREBASE AUTH DOMAIN ###&#39;,<br>  projectId: &#39;### CLOUD FIRESTORE PROJECT ID ###&#39;<br>});<br>```</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349278014085898241?ref_src=twsrc%5Etfw">2021年1月13日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreに登録できたよー。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349299980578680832?ref_src=twsrc%5Etfw">2021年1月13日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreのupdateやってく！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349944903552311297?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">updateできるようになりました！完璧です。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349952425147334657?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">次デリートいきまーす</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349953717836025856?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreへの登録、更新、削除できたー。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349960784382627842?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>To Be Continued...</p>

