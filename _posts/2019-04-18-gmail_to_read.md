---
title: "【Gmail】エラーになるほど大量の未読メールを全て既読にする"
date: 2019-04-18
slug: "gmail_to_read"
category: blog
tags: [Gmail,IT]
---
<h2>未読メールをすべて既読にしたい</h2>

<p>自分に関係ないメールを未読スルーしてると大量にたまっていることありますよね！？</p>

<p><figure class="figure-image figure-image-fotolife" title="大量の未読メール"><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190417/20190417142250.png" alt="f:id:aoma23:20190417142250p:plain" title="f:id:aoma23:20190417142250p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>大量の未読メール</figcaption></figure></p>

<p>その数30000件超え！</p>

<p>令和になる前に整理したくなったので、すべて既読にしようとしました。</p>

<h2>大量すぎてエラーになる...</h2>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/Gmail">Gmail</a>の画面からすべて既読にしようとしたところ、大量過ぎてエラーに。。</p>

<p><figure class="figure-image figure-image-fotolife" title="大量すぎてエラーになる"><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190417/20190417142323.png" alt="f:id:aoma23:20190417142323p:plain" title="f:id:aoma23:20190417142323p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>大量すぎてエラーになる</figcaption></figure></p>

<p>2000件程度なら大丈夫だったのですが、10000超えてくるとエラーになる感じですね。。
ググってみると同じ事象にハマっている人がいました。。</p>

<p><a href="https://support.google.com/mail/forum/AAAAhuJmquwopcvd103xU4/?hl=ja&gpf=%23!msg%2Fgmail-ja%2Fopcvd103xU4%2F8MeDPKNpEgAJ&msgid=8MeDPKNpEgAJ">&#x672A;&#x8AAD;&#x30E1;&#x30FC;&#x30EB;&#x3092;&#x65E2;&#x8AAD;&#x306B;&#x51FA;&#x6765;&#x307E;&#x305B;&#x3093;&#x3002; - Gmail &#x30D8;&#x30EB;&#x30D7;</a></p>

<h2>GASで既読にする</h2>

<p>未読のまま放置したくない！（今更ｗ）どうしても既読にしたい！
と思い悩んでいたところ、先程のページにGASでやっちゃえばいいじゃん！という回答があったので、参考に<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B9%A5%AF%A5%EA%A5%D7%A5%C8">スクリプト</a>を組みました。</p>

<p>下記を<a class="keyword" href="http://d.hatena.ne.jp/keyword/google">google</a> app scriptにコピペして実行すればすべて既読にできます！（時間はかかりますが）</p>

<pre class="code" data-lang="" data-unlink>function toRead() {

  //設定したトリガーがあれば削除（一つ前に起動終了したトリガーを削除する）
  var trigger = ScriptApp.getProjectTriggers();
  var trigger_count = trigger.length;
  var i = 0;
  for(i; i &lt; trigger_count; i++) {
    ScriptApp.deleteTrigger(trigger[i]);
  }
  
  var mail = GmailApp.search(&#34;is:unread label:読まない&#34;);  // 未読メールを取得 ※「label:読まない」は適宜変更ください。
  var count = mail.length;
  Logger.log(count);
  //もし未読メールがなければスクリプトを終了
  if(count == 0) {
    return;
  }
  
  var i = 0;
  for(i; i &lt; count; i++) {
    mail[i].markRead();
  }

  // APIで500件しか取得できないので、終わったら1分後にまた叩く
  ScriptApp.newTrigger(&#34;toRead&#34;)
  .timeBased().after(1 * 1000)
  .create();
}</pre>


<p>ただし、GmailApp.searchが<a href="https://developers.google.com/apps-script/guides/services/quotas">1日に取得できる上限</a>（契約により20000または50000）があるので、上限を超えるほど大量な場合は明日また実行してください。（cron登録しとく手もありますね）</p>

<p><figure class="figure-image figure-image-fotolife" title="1日にAPIで取得できる上限を超えるとエラーになる"><span itemscope itemtype="http://schema.org/Photograph"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/a/aoma23/20190417/20190417145334.png" alt="f:id:aoma23:20190417145334p:plain" title="f:id:aoma23:20190417145334p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>1日に<a class="keyword" href="http://d.hatena.ne.jp/keyword/API">API</a>で取得できる上限を超えるとエラーになる</figcaption></figure></p>

<p>それではまた！よければ読者登録！<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A4%CF%A4%C6%A5%D6">はてブ</a>！お願いします！</p>

