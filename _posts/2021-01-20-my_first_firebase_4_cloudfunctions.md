---
title: "【はじめてのFirebase】第4話：cloud functionsとエミュレーターと私"
date: 2021-01-20
slug: "my_first_firebase_4_cloudfunctions"
category: blog
tags: [IT,Firebase,CloudFunctions,nodeMailer]
---
<p>おはこんばんちはaomaです。</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">記念日を通知する『KINENBI』というサービスを作ってます！<br>当日だけでなく100日後とか777日後とかキリ番にも通知します！<br>現在事前登録受付中です！拡散お願いします！<a href="https://twitter.com/hashtag/KINENBI?src=hash&amp;ref_src=twsrc%5Etfw">#KINENBI</a><a href="https://t.co/0deleLPFQA">https://t.co/0deleLPFQA</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1348871584530927616?ref_src=twsrc%5Etfw">2021年1月12日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>この物語はそんなaomaがはじめてのFirebaseに挑む壮大なアクションアドベンチャーである！第4話！</p>

<h2>第4話の内容</h2>

<ul>
<li>cloud functions実装できるようになる</li>
<li>cloud functionsからメール送信</li>
<li>firebaseのローカルエミュレーターを使えるようになる</li>
</ul>


<h2>本編</h2>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">さて、cloud schedulerで良さそうなんだけど、これってどうやって使うんです？？</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349980232472686592?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Blazeプランにしてみた。<br>予算アラートなるものがあり、3段階で通知してくれるっぽい。便利だが予算オーバーしたタイミングでサーバーも請求もストップしてくれる設定ほしい。。高額請求こわい。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1349985560719286274?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">みてみる。<a href="https://t.co/86OaX7Fv2G">https://t.co/86OaX7Fv2G</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350036658876424192?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">いんすとーるちう</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350039167476985856?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreのエミュレータ実行しようとしたらjdkがないぞと言われたのでインストールしてみる。<a href="https://t.co/XdmDLCQaKw">https://t.co/XdmDLCQaKw</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350042842022887425?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreのエミュレータやっと動いた。というかcloudfunctionsも。<br>addMessage?text=uppercaseme<br>のとこスラッシュないとエラーになって動かなかった。<br>addMessage/?text=uppercaseme<br>とんだトラップだぜ。<a href="https://t.co/KfDFmnT9ql">https://t.co/KfDFmnT9ql</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350052998102216705?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">さらに<br>functions.logger.log(&#39;Uppercasing&#39;, context.params.documentId, original);<br>がlogがないぜってエラーになってたので消した。<br>そして登録できたー。 <a href="https://t.co/QeekhXxcLb">pic.twitter.com/QeekhXxcLb</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350053864100093953?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なんだろう。hostingからは本番のfirestore見に行っちゃう。。ローカルのエミュレータ見て欲しいのに。。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350056415285547011?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">db.useEmulator(&quot;localhost&quot;, 8080);<br>って書いてあるのに、<br>db.useEmulator is not a function<br>ってエラーになるのなぜなんだぜ？<a href="https://t.co/wh5StLBgX3">https://t.co/wh5StLBgX3</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350065927539228673?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebaseのバージョン確認コマンドは<br>firebase -v<br>でも<br>firebase -version<br>でもなく、<br>firebase --version</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350067620406444032?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">バージョンは9.2.0だった。<br>これ見た感じ9.4.1ならいけるのか！？<a href="https://t.co/Wr3i14higi">https://t.co/Wr3i14higi</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350067815319957506?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>[<a href="https://twitter.com/aoma23/status/1350072503163502593:embed#">https://twitter.com/aoma23/status/1350072503163502593:embed#</a>ローカルのバージョン関係なかった。よくよく見たらCDNで指定してるバージョンが古かった。。<script defer src="/__/firebase/7.14.2/firebase-app.js"></script>7.… <a href="https://t.co/7cY3RIjjDw">https://t.co/7cY3RIjjDw</a>]</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なるほど。firebaseuiは諦めよう。 <a href="https://t.co/63kElS4HUV">https://t.co/63kElS4HUV</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1350073402569052167?ref_src=twsrc%5Etfw">2021年1月15日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なるほど。cloud functionsではリージョン指定をソースに書くのか。<br>.region(&quot;asia-northeast1&quot;)<a href="https://t.co/Fqv07Ry0zI">https://t.co/Fqv07Ry0zI</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351020886866976774?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebase emulators:start<br>いいね！ローカルエミュレーター簡単！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351023632512913421?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">dayjsをnpm install。<br>cloud functionsで使うにはfunctionsフォルダ配下で<br>npm install dayjs<br>すればよさそう。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351047645717028866?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreエミュレータたちあがらなくなったのでこれ見てる<a href="https://t.co/V7YyJnknaK">https://t.co/V7YyJnknaK</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351051561158500353?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">8080と9000のポートkillしたら立ち上がったー！よかった。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351052318083526658?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">console.log(&#39;テストです&#39;);<br>でログ仕込んで、<br>http://localhost:5001/maday-eeeee/asia-northeast1/notifyDays<br>でcloud functions実行して、<br>http://localhost:4000/logs<br>でログ確認してる。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351055585010208773?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firestoreのtimestampで日（DD）や月日（MMDD）が一致するデータを取得したかったけど、範囲指定くらいしかないっぽい。。。<br>どうするか。。<br>全部取得して判定するのも微妙だし、日や月日だけのフィールドを設けるにするか。微妙だけど。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351060668523413506?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">この前書いた設計書がげきくそ役に立ってる！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351069664235950083?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">foreach内でawaitしたら並行して動いてしまうのね。。<br>まさにこのQiitaの通りにハマった。<br>さてどうしようかな。。処理的にはpromise.allが良いのだけど、開発中は順番わかってたほうが実装しやすいのよね。。<a href="https://t.co/Q0PUHMEx4T">https://t.co/Q0PUHMEx4T</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351075429705265155?ref_src=twsrc%5Etfw">2021年1月18日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">cloud functionsからメール飛ばしたい。<br>send grid使ってみるか。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351441176851673093?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">sendgrid申し込んだけどすぐには使えないのか。。<br>一応参考になりそうな記事をペタ。<a href="https://t.co/rHKQtn1pPO">https://t.co/rHKQtn1pPO</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351450402693103620?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">こっちのがよさそう？<a href="https://t.co/p82TZ7BasI">https://t.co/p82TZ7BasI</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351450666539995137?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">GmailとNodemailerを使ってみるか。<a href="https://t.co/4T9OWyQCfK">https://t.co/4T9OWyQCfK</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351450714719981569?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">こっちでも。<a href="https://t.co/Gv0FIDJn8n">https://t.co/Gv0FIDJn8n</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351450866654429186?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">実行しました！<br><br>// functionsディレクトリへ移動<br>cd functions<br>// Nodemailerインストール<br>npm install --save nodemailer</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351452455754600449?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">const gmailEmail = functions.config().gmail.email;<br>const gmailPassword = functions.config().gmail.password;<br>で環境変数取得するために下記コマンド実行したよ！<br>firebase functions:config:set <a href="https://t.co/T1iI1pFvJp">https://t.co/T1iI1pFvJp</a>=&quot;hoge@gmail.com&quot; gmail.password=&quot;fugafuga&quot;</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351457255644794887?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">エミュレータで環境変数取得したいときはfunctionsディレクトリ配下で下記を実行する必要があったよ！<br>firebase functions:config:get &gt; .runtimeconfig.json</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351457450700914688?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">gmailの設定変更して<br>安全性の低いアプリの許可: 有効<br>にしてあげる必要があった！<a href="https://t.co/EaAqMnEaCE">https://t.co/EaAqMnEaCE</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351463241365426183?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">メール送信できたー！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351466442391109636?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ユーザーのメアド一覧取得したいけどAuthenticationから一括取得って100件までなのか。<br>これはユーザー情報をfirestoreで別途管理しとくのが良さそうなのかな。<a href="https://t.co/8rdC3LhE1E">https://t.co/8rdC3LhE1E</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351483643089149952?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">アカウント作成時にcloud functionsでユーザー情報保存かなー。<a href="https://t.co/rVhFM7JEmH">https://t.co/rVhFM7JEmH</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351487593909637121?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">functions.auth.user().onCreateのテストしたいけどfirebaseUI使っててエミュレーター側のauthenticationに書き込まれない。<br>そんなときはエミュレータの画面から直接addUserしちゃえばOK！ <a href="https://t.co/XEGweIeeXJ">pic.twitter.com/XEGweIeeXJ</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351725328847106050?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">だいたい実装できたぞ。<br>さて動作確認のためにonRequestで実行してたけど、やりたいのは1日1回の定期実行なのよね。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351775564642750467?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">.https.onRequest<br>を<br>.pubsub.schedule(&#39;00 7 * * *&#39;).timeZone(&#39;Asia/Tokyo&#39;).onRun(async (context) =&gt; {<br>にしてあげれば良さそう。<br><br>contextって何が入ってるんだろうと思ったら調べてくれてる人いた！ありがたい！<a href="https://t.co/MkOSgi4eQo">https://t.co/MkOSgi4eQo</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351779180766134273?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">よし。デプロイも完了！<br>あとは明日実行されてればOKだ。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351782852183015424?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>To Be Continued...</p>

