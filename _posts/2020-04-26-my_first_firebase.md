---
title: "【はじめてのFirebase】第一話：GitHub管理からデプロイまで"
date: 2020-04-26
slug: "my_first_firebase"
category: blog
tags: [IT,Firebase,GitHub,Maday]
---
<p>おはこんばんちはaomaです。</p>

<p>今日からMaday（まっでい）というアプリを作っていくことにしました。（どんなサービスかはお楽しみに？）<br />
プラットフォームはFirebaseです！<br />
ただここでひとつ問題がありまして、Firebase使ったことないんですよね。。。</p>

<p>この物語はそんなaomaがはじめてのFirebaseに挑む壮大なアクションアド<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D9%A5%F3%A5%C1%A5%E3%A1%BC">ベンチャー</a>である！第一話！</p>

<h2>第一話の内容</h2>

<ul>
<li>Firebaseをとりあえず構築してブラウザでアクセスできるようになる</li>
<li>Firebaseのソースを<a class="keyword" href="http://d.hatena.ne.jp/keyword/GitHub">GitHub</a>で管理できるようになる</li>
<li>途中様々な困難（エラー）に出会うが、記録が残されているのでアナタの助けになるかもしれない...</li>
</ul>


<h2>本編</h2>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">記念Beeってサービス作ろうとしたらもうすでにあった！<br>ねーみんぐせんす！！<a href="https://t.co/Xm5aDkJdCq">https://t.co/Xm5aDkJdCq</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1247884457861730306?ref_src=twsrc%5Etfw">2020年4月8日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">Maday<br>Mad as a March hare<a href="https://t.co/HcZ9aeDffA">https://t.co/HcZ9aeDffA</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1247889367495917572?ref_src=twsrc%5Etfw">2020年4月8日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">サービス名が決まったので満足している。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1247889711021961217?ref_src=twsrc%5Etfw">2020年4月8日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">キターーーー！！<br>圧倒的進捗！！！ <a href="https://t.co/lAN4Hi6z3v">pic.twitter.com/lAN4Hi6z3v</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1248264349778505729?ref_src=twsrc%5Etfw">2020年4月9日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebaseやってみる！<br>説明は見ないぜ！とりあえずアプリを追加してみよう！ <a href="https://t.co/fHpku6hwoX">pic.twitter.com/fHpku6hwoX</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1248972971466604545?ref_src=twsrc%5Etfw">2020年4月11日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="eu" dir="ltr">gogo!! <a href="https://t.co/U3fh8igcPC">pic.twitter.com/U3fh8igcPC</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1248973604382887942?ref_src=twsrc%5Etfw">2020年4月11日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ふう。。（迷子）<br><br>bodyタグの中にコピペしろ言われたけど、どうすればいい？<br>サンプルおとすべき？一から作るべき？<br>とりあえず<a class="keyword" href="http://d.hatena.ne.jp/keyword/GitHub">GitHub</a>に<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%EA%A5%DD%A5%B8%A5%C8%A5%EA">リポジトリ</a>作る？どうしよかな。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1248976214359859201?ref_src=twsrc%5Etfw">2020年4月11日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">とりあえず無視して、<br>次のFirebase <a class="keyword" href="http://d.hatena.ne.jp/keyword/CLI">CLI</a> のインストールいってみるか <a href="https://t.co/ibfACOUXRu">pic.twitter.com/ibfACOUXRu</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1248977939900710913?ref_src=twsrc%5Etfw">2020年4月11日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">プライベー<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C8%A5%EA%A5%DD%A5%B8">トリポジ</a>トリ作った。<a class="keyword" href="http://d.hatena.ne.jp/keyword/SSH">SSH</a>登録してなかったのでこちらを参考に進める。いいQiitaです。<a href="https://t.co/FtYosgZbrV">https://t.co/FtYosgZbrV</a> <a href="https://t.co/JZorO8BmHw">pic.twitter.com/JZorO8BmHw</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1248979721892724736?ref_src=twsrc%5Etfw">2020年4月11日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なんだかよさげ。<br><br><a class="keyword" href="http://d.hatena.ne.jp/keyword/Github">Github</a> Actionsを使ってfirebaseへデプロイする <a href="https://t.co/1qIOUxttWV">https://t.co/1qIOUxttWV</a> <a href="https://twitter.com/hashtag/Qiita?src=hash&amp;ref_src=twsrc%5Etfw">#Qiita</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1248976720708825088?ref_src=twsrc%5Etfw">2020年4月11日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">一昨日からハマってたcloneできない件、ブログ書きました！ <a href="https://twitter.com/hashtag/%E3%81%AF%E3%81%A6%E3%81%AA%E3%83%96%E3%83%AD%E3%82%B0?src=hash&amp;ref_src=twsrc%5Etfw">#はてなブログ</a><br>複数の<a class="keyword" href="http://d.hatena.ne.jp/keyword/GitHub">GitHub</a>アカウント運用で片方のプライベー<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C8%A5%EA%A5%DD%A5%B8">トリポジ</a>トリをcloneできなくて困った話 - aoma blog<a href="https://t.co/JzccXI0m4f">https://t.co/JzccXI0m4f</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1253288128409829377?ref_src=twsrc%5Etfw">2020年4月23日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>clone</p>

<pre class="code" data-lang="" data-unlink>% env GIT_SSH_COMMAND=&#34;ssh -i ~/.ssh/id_rsa_aoma -F /dev/null&#34; git clone git@github.com:aoma23/maday.git
Cloning into &#39;maday&#39;...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.</pre>


<p>gitアカウント設定</p>

<pre class="code" data-lang="" data-unlink>% git config --local user.name &#34;aoma23&#34;
git config --local user.email &#34;51367901+aoma23@users.noreply.github.com&#34;
git config --local url.&#34;github_aoma23&#34;.insteadOf &#34;git@github.com&#34;</pre>


<p>設定されたこと確認</p>

<pre class="code" data-lang="" data-unlink>% git config -l                        
credential.helper=osxkeychain
core.repositoryformatversion=0
core.filemode=true
core.bare=false
core.logallrefupdates=true
core.ignorecase=true
core.precomposeunicode=true
remote.origin.url=git@github.com:aoma23/maday.git
remote.origin.fetch=+refs/heads/*:refs/remotes/origin/*
branch.master.remote=origin
branch.master.merge=refs/heads/master
user.name=aoma23
user.email=51367901+aoma23@users.noreply.github.com
url.github_aoma23.insteadof=git@github.com</pre>


<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="en" dir="ltr">% npm install -g firebase-tools        <br><a class="keyword" href="http://d.hatena.ne.jp/keyword/zsh">zsh</a>: command not found: npm<br><br>おお、、、</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1253337769893494785?ref_src=twsrc%5Etfw">2020年4月23日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">あらためてnpmをインストールするよ！<br><br>&gt; <a class="keyword" href="http://d.hatena.ne.jp/keyword/mac">mac</a>にNode.jsのインストールを行えば、npmも一緒にインストールすることができます。<br>&gt; <a href="https://t.co/BbTSvpxFLx">https://t.co/BbTSvpxFLx</a><br><br>へえ。。nodeをインストールするよ！！</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1253340097140756481?ref_src=twsrc%5Etfw">2020年4月23日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<pre class="code" data-lang="" data-unlink>% node -v
v12.16.2</pre>


<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">エラー変わらんやないかーい<br>npm ERR! Error: EACCES: permission denied, <a class="keyword" href="http://d.hatena.ne.jp/keyword/access">access</a> &#39;/usr/local/lib/node_modules&#39;<br><br>これ<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D1%A1%BC%A5%DF%A5%C3%A5%B7%A5%E7%A5%F3">パーミッション</a>変えていいの？っていうかみんなこの作業してるのかな？</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1253344917687959555?ref_src=twsrc%5Etfw">2020年4月23日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">ふむふむ<a href="https://t.co/KqflhpC6rs">https://t.co/KqflhpC6rs</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1253345651657543680?ref_src=twsrc%5Etfw">2020年4月23日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">対策どおりやってみたよ！<br>% npm config get prefix        <br>/usr/local<br>% sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1253346626174717952?ref_src=twsrc%5Etfw">2020年4月23日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>firebase-toolsインストール</p>

<pre class="code" data-lang="" data-unlink>% npm install -g firebase-tools                                                
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
/usr/local/bin/firebase -&gt; /usr/local/lib/node_modules/firebase-tools/lib/bin/firebase.js

&gt; protobufjs@6.9.0 postinstall /usr/local/lib/node_modules/firebase-tools/node_modules/protobufjs
&gt; node scripts/postinstall

+ firebase-tools@8.1.1
added 532 packages from 357 contributors in 23.914s</pre>


<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/google">google</a>にlogin</p>

<pre class="code" data-lang="" data-unlink>% firebase login</pre>


<p><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20200424/20200424004411.png' | relative_url }}" alt="f:id:aoma23:20200424004411p:plain" title="f:id:aoma23:20200424004411p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<pre class="code" data-lang="" data-unlink>% % firebase init</pre>


<p>とりあえず全選択して進んだら下記エラー、、</p>

<pre class="code" data-lang="" data-unlink>=== Firestore Setup

Error: Cloud resource location is not set for this project but the operation you are attempting to perform in Cloud Firestore requires it. Please see this documentation for more details: https://firebase.google.com/docs/projects/locations</pre>


<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">これとかこれと同じ現象。<a href="https://t.co/9SnETpOoas">https://t.co/9SnETpOoas</a><a href="https://t.co/O5FiyMT0rb">https://t.co/O5FiyMT0rb</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254402602923515904?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">asia-northeast1に設定！ <a href="https://t.co/YoRDz8Yk9i">pic.twitter.com/YoRDz8Yk9i</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254403457319989248?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">全部チェックして再挑戦！ <a href="https://t.co/vvfVRGT1x1">pic.twitter.com/vvfVRGT1x1</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254404239863853056?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">なんでや！なんでこんなにエラーになるんや！<br><br>&gt; Error: Error fetching Firestore indexes</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254404471985078272?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">まとめてくれてる！同じ道をたどるぜ！<a href="https://t.co/MQTbxZchxV">https://t.co/MQTbxZchxV</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254405842473910273?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">とりあえずネイティブモードにすればいいらしいけど、こわいから調べたぜ！<br>ネイティブ モードと Datastore モードの2種類があり、ネイティブモードのほうが最新でFirestore のすべての新機能にアクセスできるらしい。これで安心してネイティブ選べる！<a href="https://t.co/8ctiLfbKnn">https://t.co/8ctiLfbKnn</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254407134164312064?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">いくぜ！ <a href="https://t.co/7UHfLfp5PC">pic.twitter.com/7UHfLfp5PC</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254407493163220993?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">全選択して再々挑戦！！ <a href="https://t.co/pEhtAxGjVK">pic.twitter.com/pEhtAxGjVK</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254408148443521024?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr"><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A8%A5%DF%A5%E5%A5%EC%A1%BC%A5%BF%A1%BC">エミュレーター</a>よくわからんからとりあえずスキップするか。</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254410757854261254?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>initコマンドのメモ</p>

<pre class="code" data-lang="" data-unlink>? Which Firebase CLI features do you want to set up for this folder? Press Space to select features, then Enter to confirm your choices. (Press &lt;sp
ace&gt; to select, &lt;a&gt; to toggle all, &lt;i&gt; to invert selection)Database: Deploy Firebase Realtime Database Rules, Firestore: Deploy rules and create in
dexes for Firestore, Functions: Configure and deploy Cloud Functions, Hosting: Configure and deploy Firebase Hosting sites, Storage: Deploy Cloud S
torage security rules, Emulators: Set up local emulators for Firebase features

=== Project Setup

First, let&#39;s associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add, 
but for now we&#39;ll just set up a default project.

? Please select an option: Use an existing project
? Select a default Firebase project for this directory: maday-eeeee (maday)
i  Using project maday-eeeee (maday)

=== Database Setup

Firebase Realtime Database Rules allow you to define how your data should be
structured and when your data can be read from and written to.

? What file should be used for Database Rules? database.rules.json
? File database.rules.json already exists. Do you want to overwrite it with the Database Rules for maday-eeeee from the Firebase Console? Yes
✔  Database Rules for maday-eeeee have been downloaded to database.rules.json.
Future modifications to database.rules.json will update Database Rules when you run
firebase deploy.

=== Firestore Setup

Firestore Security Rules allow you to define how and when to allow
requests. You can keep these rules in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore Rules? firestore.rules
? File firestore.rules already exists. Do you want to overwrite it with the Firestore Rules from the Firebase Console? Yes

Firestore indexes allow you to perform complex queries while
maintaining performance that scales with the size of the result
set. You can keep index definitions in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore indexes? firestore.indexes.json

=== Functions Setup

A functions directory will be created in your project with a Node.js
package pre-configured. Functions can be deployed with firebase deploy.

? What language would you like to use to write Cloud Functions? JavaScript
? Do you want to use ESLint to catch probable bugs and enforce style? No
✔  Wrote functions/package.json
✔  Wrote functions/index.js
✔  Wrote functions/.gitignore
? Do you want to install dependencies with npm now? Yes

&gt; protobufjs@6.9.0 postinstall /Users/aoma23/Documents/repo/aoma23/maday/functions/node_modules/protobufjs
&gt; node scripts/postinstall

npm notice created a lockfile as package-lock.json. You should commit this file.
added 258 packages from 206 contributors and audited 972 packages in 11.843s

30 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities


=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build&#39;s output directory.

? What do you want to use as your public directory? public
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
✔  Wrote public/index.html

=== Storage Setup

Firebase Storage Security Rules allow you to define how and when to allow
uploads and downloads. You can keep these rules in your project directory
and publish them with firebase deploy.

? What file should be used for Storage Rules? storage.rules

=== Emulators Setup
? Which Firebase emulators do you want to set up? Press Space to select emulators, then Enter to confirm your choices. (Press &lt;space&gt; to select, &lt;a
&gt; to toggle all, &lt;i&gt; to invert selection)

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...
i  Writing gitignore file to .gitignore...

✔  Firebase initialization complete!
</pre>


<p>とりあえずここまでを<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%EA%A5%DD%A5%B8%A5%C8%A5%EA">リポジトリ</a>にコミット！</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">これにならってfirebase serveしてみた！<br>画面出たよー！<a href="https://t.co/xXO5e6Fa4t">https://t.co/xXO5e6Fa4t</a></p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254415263346257921?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p><code>firebase serve</code> すると <code>http://localhost:5000/</code> にアクセスできること確認。開発はここでやってけばいいのかな？</p>

<p><blockquote data-conversation="none" class="twitter-tweet" data-lang="ja"><p lang="ja" dir="ltr">firebase deploy もできたー！！<br>うおーー！！<br>完成やー！！（環境構築が）</p>&mdash; aoma23 (@aoma23) <a href="https://twitter.com/aoma23/status/1254416286869671942?ref_src=twsrc%5Etfw">2020年4月26日</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script> </p>

<p>無事デプロイできて、ブラウザからアクセスできること確認！</p>

<p>ようこそ素晴らしきFirebaseの世界へ。知らんけど。</p>

<p>To Be Continued...</p>

