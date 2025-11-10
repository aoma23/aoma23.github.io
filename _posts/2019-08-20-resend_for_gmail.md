---
title: "【Gmail】送信済みメールを編集して再送するアドオン作ったよ！"
date: 2019-08-20
slug: "resend_for_gmail"
category: blog
tags: [IT,日常,Gmail,再送,アドオン,resend,メール,日報]
---
<p>送信したメールを編集して再送信したいときってありますよね！<br/>
昨日送った日報メールを日付だけ書き換えて送りたいとか。</p>

<p>でもGmailには再送機能がない。。。</p>

<h2>需要はあるのに実装されない</h2>

<p>かなり昔から需要はあります。</p>

<ul>
<li><a href="https://support.google.com/mail/forum/AAAAhuJmquwNU4NNVFE7Zs/?hl=ja&gpf=%23!msg%2Fgmail-ja%2FNU4NNVFE7Zs%2FZm4PRxi3NgAJ&msgid=Zm4PRxi3NgAJ">&#x540C;&#x3058;&#x30E1;&#x30FC;&#x30EB;&#x3092;&#x7DE8;&#x96C6;&#x3057;&#x3066;&#x9001;&#x4ED8;&#x3059;&#x308B;&#x6A5F;&#x80FD;&#x306F;&#x3042;&#x308A;&#x307E;&#x3059;&#x304B; - Gmail &#x30D8;&#x30EB;&#x30D7;</a></li>
<li><a href="https://anond.hatelabo.jp/20070611161520">Gmail&#x3067;&#x306F;&#x9001;&#x4FE1;&#x6E08;&#x307F;&#x30E1;&#x30FC;&#x30EB;&#x3092;&#x518D;&#x9001;&#x4FE1;&#x3067;&#x304D;&#x306A;&#x3044;</a></li>
<li><a href="https://aprico-media.com/posts/2516">Gmail&#x3067;&#x306F;&#x9001;&#x4FE1;&#x6E08;&#x307F;&#x30E1;&#x30FC;&#x30EB;&#x3092;&#x518D;&#x9001;&#xFF08;&#x518D;&#x9001;&#x4FE1;&#xFF09;&#x51FA;&#x6765;&#x306A;&#x3044;&#xFF1F;&#x518D;&#x9001;&#x4FE1;&#x3059;&#x308B;&#x65B9;&#x6CD5;&#x306F;&#xFF1F; | Aprico</a></li>
</ul>


<p>海外でも困ってるぽい。</p>

<ul>
<li><a href="https://blog.gossland.com/send-email-again-with-gmail/">Send email again with Gmail | Mike Gossland&#39;s Blog</a></li>
<li><a href="https://webapps.stackexchange.com/questions/92897/where-is-the-resend-option/92898">gmail - Where is the &quot;resend&quot; option? - Web Applications Stack Exchange</a></li>
<li><a href="https://www.quora.com/Gmail-How-can-I-resend-emails-in-Gmail-with-minimum-efforts-clicks">Gmail: How can I resend emails in Gmail with minimum efforts/clicks? - Quora</a></li>
</ul>


<p>それなのになぜ実装してくれないのかGoogleさん！なぜなんだぜ...</p>

<h2>もう作っちゃおうと。</h2>

<p>私も再送機能を待ち望んでいる一人でした。いつか実装されるだろうと待ち続けて早10年。ようやく気づきました。これは実装しないなと。。</p>

<p>ということで、今回再送アドオンを作りました！<br/>
その名も「Resend for Gmail」です！</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fgithub.com%2Faoma23%2Fresend_for_gmail" title="aoma23/resend_for_gmail" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://github.com/aoma23/resend_for_gmail">github.com</a></cite></p>

<p>Gmailは「<a href="https://developers.google.com/gsuite/add-ons/gmail/">Gmail Add-ons</a>」という専用のアドオンを開発可能です。chromeなどのブラウザ用アドオンではないので注意。</p>

<h2>使い方</h2>

<p>再送信したいメールを開いて、画面右の「RESEND (CREATE DRAFT)」を押すだけ！<br/>
下書きメールが作成されるのであとはよしなに編集して送信してください。</p>

<p><a href="https://aoma23.com/resend_for_gmail/demo.gif" class="http-image" target="_blank"><img src="https://aoma23.com/resend_for_gmail/demo.gif" class="http-image" alt="https://aoma23.com/resend_for_gmail/demo.gif"></a></p>

<h2>インストール方法</h2>

<p>デベロッパー用アドオンとしてインストールください。<br/>
アドオンを一般公開するにはGCPにアップする必要があったりと大変そうだったのでご容赦ください。m(> &lt;)m</p>

<p>下記サイトを参考にするとわかりやすいです。<br/>
<a href="https://news.mynavi.jp/article/gas-13/">Google Apps Script&#x3067;Gmail&#x3092;&#x81EA;&#x52D5;&#x5316;&#x3059;&#x308B;(13) Gmail&#x30A2;&#x30C9;&#x30AA;&#x30F3;&#x3092;&#x4F5C;&#x308B; (1) &#x30A2;&#x30C9;&#x30AA;&#x30F3;&#x306E;&#x4F5C;&#x6210;&#x304B;&#x3089;&#x30A4;&#x30F3;&#x30B9;&#x30C8;&#x30FC;&#x30EB;&#x307E;&#x3067; | &#x30DE;&#x30A4;&#x30CA;&#x30D3;&#x30CB;&#x30E5;&#x30FC;&#x30B9;</a></p>

<h3>ざっくりインストール手順</h3>

<ul>
<li>ソースを配置

<ul>
<li><a href="https://github.com/aoma%0A23/resend_for_gmail">リポジトリ</a>をダウンロード</li>
<li>下記2ファイルを<a href="https://script.google.com/home">Google App Script</a>に新規プロジェクトとして設置（中身をコピペとかでもOKです）

<ul>
<li>appsscript.json</li>
<li>code.gs</li>
</ul>
</li>
</ul>
</li>
<li>Deployment IDを取得

<ul>
<li>公開→マニフェストから配置を選択</li>
<li>Latest Version (Head)のGet IDをクリック</li>
<li>Deployment IDの値をコピー</li>
</ul>
</li>
<li>インストール

<ul>
<li><a href="https://mail.google.com/mail/u/0/#settings/addons">Gmail→設定→アドオンタブ</a>を開く

<ul>
<li>デベロッパー アドオンを有効にする</li>
<li>Deployment IDを入力</li>
</ul>
</li>
</ul>
</li>
<li>Gmailのページをリロード</li>
</ul>


<p>するとこんな感じで画面右のアドオンにアイコンが追加されます！</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20190816/20190816193537.png' | relative_url }}" alt="f:id:aoma23:20190816193537p:plain" title="f:id:aoma23:20190816193537p:plain" class="hatena-fotolife" itemprop="image"></span></p>

<p>初めて使うときはアクセス承認を聞かれるので承認してください。</p>

<h2>さいごに</h2>

<p>一応HTMLメールとテキストメールの判定出し分けは実装したのですが、バグや改善点等ありましたらお気軽にプルリクお願いします！！<br/>
また、海外の困ってる方向けに英語翻訳、発信等してくれる方もいましたら是非！<br/>
また、アドオン一般公開するの簡単だから教えてあげるよっていう方もいましたら是非！</p>

<p><a href="https://twitter.com/aoma23">ツイッター</a>、読者登録、はてブもよろしくお願いします！</p>

