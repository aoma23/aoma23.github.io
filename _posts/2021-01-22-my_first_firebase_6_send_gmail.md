---
title: "【はじめてのFirebase】第6話：届けGmail！ ~ ベッサム神との出会い ~"
date: 2021-01-22
slug: "my_first_firebase_6_send_gmail"
category: blog
tags: [IT,Firebase,nodeMailer,gmail,firebaseUI]
---
<p>おはこんばんちはaomaです。</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">記念日を通知する『KINENBI』というサービスを作ってます！<br>当日だけでなく○ヶ月記念日や777日記念日といった<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%AD%A5%EA%C8%D6">キリ番</a>にも対応しています！<br>現在事前登録受付中です！よろしくお願いします！<a href="https://twitter.com/hashtag/KINENBI?src=hash&amp;ref_src=twsrc%5Etfw">#KINENBI</a><a href="https://twitter.com/hashtag/%E6%8B%A1%E6%95%A3%E5%B8%8C%E6%9C%9B?src=hash&amp;ref_src=twsrc%5Etfw">#拡散希望</a> <a href="https://t.co/0deleLPFQA">https://t.co/0deleLPFQA</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352432369102245889?ref_src=twsrc%5Etfw">2021年1月22日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>この物語はそんなaomaがはじめてのFirebaseに挑む壮大なアクションアド<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D9%A5%F3%A5%C1%A5%E3%A1%BC">ベンチャー</a>である！第6話！</p>

<h2>第6話の内容</h2>

<ul>
<li>本番では送信できていなかったメールを送れるようになる（NodeMailerと<a class="keyword" href="http://d.hatena.ne.jp/keyword/Gmail">Gmail</a>の設定見直し）</li>
<li><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%DF%A5%E5%A5%EC%A1%BC%A5%BF%A1%BC">エミュレーター</a>のテストデータ保持</li>
<li>firebaseUIのメールリンク認証追加</li>
<li>firebaseUIの日本語化</li>
</ul>


<h2>まえがき</h2>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr"><a class="keyword" href="http://d.hatena.ne.jp/keyword/Gmail">Gmail</a>とNodemailerを使ってみるか。<a href="https://t.co/4T9OWyQCfK">https://t.co/4T9OWyQCfK</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351450714719981569?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr"><a class="keyword" href="http://d.hatena.ne.jp/keyword/gmail">gmail</a>の設定変更して<br>安全性の低いアプリの許可: 有効<br>にしてあげる必要があった！<a href="https://t.co/EaAqMnEaCE">https://t.co/EaAqMnEaCE</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351463241365426183?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">メール送信できたー！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351466442391109636?ref_src=twsrc%5Etfw">2021年1月19日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">よし。デプロイも完了！<br>あとは明日実行されてればOKだ。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1351782852183015424?ref_src=twsrc%5Etfw">2021年1月20日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<h2>本編</h2>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">おいおいメール送られてないじゃん。。。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352064183764807680?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Error: Invalid login: 534-5.7.14<br>このエラーですね。<a class="keyword" href="http://d.hatena.ne.jp/keyword/gmail">gmail</a>にログインできない。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352071368343396354?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">onRequestにしてもダメ。定期実行が問題ではなく、本番環境でのみ発生する。<br>まさにこのstackoverflowと同じ。<a href="https://t.co/eMoefg2uGA">https://t.co/eMoefg2uGA</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352072877403586562?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ベッサムさんは安全性を低くしなくても解決できるといってる。良さそう。<br>そもそも低にしててもエラーになってるしな。<a href="https://t.co/eKUnNfuVSx">https://t.co/eKUnNfuVSx</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352073288013418496?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">結構ハマってる人いるんだな。ローカルではうまく行くけど本番はダメ。<a href="https://t.co/LVe2VSMNvv">https://t.co/LVe2VSMNvv</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352076377864892416?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">よし！俺はベッサムさんについていくぜ！！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352076436652257280?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">OK！順調に進めてるぞ。 <a href="https://t.co/8wVRDQSnXB">pic.twitter.com/8wVRDQSnXB</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352078713144283137?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">もうベッサムさんに言われるがままにやってる。何をしてるかはわかってない。 <a href="https://t.co/ApetLt8ccQ">pic.twitter.com/ApetLt8ccQ</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352080403977289729?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ベッサムさんを信じて無効に戻した。<br>もはやベッサム神である。 <a href="https://t.co/LyNSBnan2g">pic.twitter.com/LyNSBnan2g</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352081619029426176?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr"><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%DF%A5%E5%A5%EC%A1%BC%A5%BF%A1%BC">エミュレーター</a>でメール飛ぶこと確認できたー！<br>ベッサムコードのポイントとしては、AccessTokenは定義不要だったこと（リフレッシュ<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C8%A1%BC%A5%AF">トーク</a>ンあるので）と user: &#39;mail@<a class="keyword" href="http://d.hatena.ne.jp/keyword/gmail.com">gmail.com</a>&#39;,は自分のアドレスに書き換える必要ある。 <a href="https://t.co/TXDyqcQFHb">pic.twitter.com/TXDyqcQFHb</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352094724044124160?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">パスワードの定義は不要になったので削除！<br>firebase functions:config:unset <a class="keyword" href="http://d.hatena.ne.jp/keyword/gmail">gmail</a>.password</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352096535652122626?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ベッサム神のおかげで本番でもメール送信できたーーー！！！😂😂😂<br>ありがとうベッサム神！<br>（もしものときのために手順をキャプチャしとく） <a href="https://t.co/IWSbLIddkq">pic.twitter.com/IWSbLIddkq</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352099136250601476?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr"><a href="https://twitter.com/SahliBessam?ref_src=twsrc%5Etfw">@SahliBessam</a> Thanks for your blog.<br>You are great!<a href="https://t.co/eKUnNfuVSx">https://t.co/eKUnNfuVSx</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352100727443779584?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">うれしさのあまりベッサム神をフォロー＆DMしてしまった。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352100885023789058?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebaseの<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%DF%A5%E5%A5%EC%A1%BC%A5%BF%A1%BC">エミュレーター</a>、毎度データ消えちゃうのやだな。何か方法あるのかな。。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352101051952893953?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">Thank you for your support!<br><br>ありがとうございます！！！<br>なるほどエクスポートとインポートすればいいのか！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352113079111225351?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebase emulators:start --import=./dir --export-on-exit<br>で<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%DF%A5%E5%A5%EC%A1%BC%A5%BF%A1%BC">エミュレーター</a>起動すれば終了時にテストデータ保存されて、実行時にインポートしてくれると。素晴らしい！<br><br>今日は助けられてばかり。ありがたやありがたや。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352120827152502785?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">メールリンク認証も追加しちゃうぞ</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352128534743973889?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">メールリンク認証終わった。終わってしまった。。<br>下記追加しただけでいけた。firebaseUIすごすぎる。<br>  signInOptions: [<br>    {<br>      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,<br>      signInMethod: <a href="https://t.co/1Tde42X0wG">https://t.co/1Tde42X0wG</a>_LINK_<a class="keyword" href="http://d.hatena.ne.jp/keyword/SIGN">SIGN</a>_IN_METHOD<br>    }</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352130551981826049?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebaseUIのサインインウィンドウを日本語化したいなー。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352130857536917505?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>[<a href="https://twitter.com/aoma23/status/1352163973903183874:embed#">https://twitter.com/aoma23/status/1352163973903183874:embed#</a>日本語対応できたー！{LANGUAGE_CODE}をjaにするだけ！かんたん。<script src="https://t.co/YSXd65HrF2{LANGUAGE_CODE}.js"></script><link ty… https://t.co/QbF4kibUL4]</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ログインメールのアプリ名が「project〜」になっちゃってる。<br>これどこで設定するんだ？ <a href="https://t.co/MluPxzXzxQ">pic.twitter.com/MluPxzXzxQ</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352165089143521281?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebaseの設定のとこに公開名ってあったー！<br>これを変えればよさげ。 <a href="https://t.co/xZky2mxbZP">pic.twitter.com/xZky2mxbZP</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352165675872129025?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">1ユーザーが登録できるfirestoreのドキュメント数を上限3件までとかにセキュリティルールで制御したかったんだけど、思いのほか面倒だったので諦めて寝ます！<br>おつかれさまでした！<a href="https://t.co/PC1tT2VfbP">https://t.co/PC1tT2VfbP</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1352238697106731012?ref_src=twsrc%5Etfw">2021年1月21日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>To Be Continued...</p>

