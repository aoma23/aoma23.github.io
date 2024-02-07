---
title: "Laravel LT night #1に行ってきたよ！"
date: 2017-07-28
slug: "Laravel LT night #1に行ってきたよ！"
category: blog
tags: [カンファレンス,IT,PHP,Laravel]
---
<p>7/26にLaravel LT nightに行ってきました！</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Freluxtechlab.connpass.com%2Fevent%2F59496%2F" title="【増席しました！】Laravel LT night #1 (2017/07/26 19:30〜)" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://reluxtechlab.connpass.com/event/59496/">reluxtechlab.connpass.com</a></cite></p>

<p>会場のLoco Partnersさん素敵なオフィスでしたー。</p>

<p>Relux公式アンバサダーはなんとサッカーの<a class="keyword" href="http://d.hatena.ne.jp/keyword/%B9%E1%C0%EE%BF%BF%BB%CA">香川真司</a>選手！うらやましす。</p>

<h2>所感</h2>

<p>勉強会はLTオンリーということもあり、サクサクっとポテチを食べる感覚で終了しました。
悪くないけど物足りなくも感じたり。LTの良さを再認識したり。</p>

<p>懇親会でいろいろな方とお話できて満足！
ピザとビールもたくさん用意いただきお腹も満足！</p>

<p>皆様ありがとうございました！第２回も是非！</p>

<p><span itemscope itemtype="http://schema.org/Photograph"><a href="http://f.hatena.ne.jp/aoma23/20170728072127" class="hatena-fotolife" itemprop="url"><img src="https://cdn-ak.f.st-hatena.com/images/fotolife/n/naoqoo23/20170728/20170728072127.jpg" alt="f:id:aoma23:20170728072127j:image" title="f:id:aoma23:20170728072127j:image" class="hatena-fotolife" itemprop="image"></a></span></p>

<p>以下はタイトルもメモりきれてない勉強会メモです。(^^;;</p>

<h2>Eloquent Modelと親和性の高い〜 [ubonsa]</h2>

<p>DBに依存したオブジェクトと依存していないオブジェクト（料金内訳）をまとめて処理したい</p>

<p>laravelのModelの中身を解析して独自に作ったよ</p>

<h2>モバイルページ高速化〜 [YumaOyaizu]</h2>

<p>AMP対応の話</p>

<p>AMP用に別ページ作るの大変だよね
→<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%DF%A5%C9%A5%EB%A5%A6%A5%A7%A5%A2">ミドルウェア</a>を活用</p>

<p>$responce->setContent($content);でレスポンス（HTML）を書き換えられる</p>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/%C0%B5%B5%AC%C9%BD%B8%BD">正規表現</a>等を使ってAMPに書き換えちゃえばいいよ</p>

<h2>人気の無いAuthorization〜 [happy_ryo]</h2>

<p>認可の話</p>

<p>GateとPolicy</p>

<p>Gate
モデルやリソースに関係ないアクションへの認可</p>

<p>Policy
モデルやリソースに関する認可</p>

<p><iframe src="https://www.slideshare.net/slideshow/embed_code/key/bg8exJq7WNerv0" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="https://www.slideshare.net/happy_ryo/laravel-lt" title="Laravel LT" target="_blank">Laravel LT</a> </strong> from <strong><a target="_blank" href="https://www.slideshare.net/happy_ryo">Iwama Ryo</a></strong> </div><cite class="hatena-citation"><a href="https://www.slideshare.net/happy_ryo/laravel-lt">www.slideshare.net</a></cite></p>

<h2>view〜 [KenjiroKubota]</h2>

<p>view内で複雑な処理をしていたり、コントローラー側でたくさんやってたりしませんか？</p>

<ol>
<li><p>Directiveを拡張してみる
Directive＝if()とか
独自に作れるよ</p></li>
<li><p>View::sgareを使う
サービスプロバイダーや<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%DF%A5%C9%A5%EB%A5%A6%A5%A7%A5%A2">ミドルウェア</a>でやっちゃってもOK</p></li>
<li><p>view::composerを使う
サービスプロバイダー</p></li>
</ol>


<p>特定のbladeテンプレートが呼び出されたときに起動する</p>

<h2><a class="keyword" href="http://d.hatena.ne.jp/keyword/CRUD">CRUD</a>アプリから一歩踏み出す３つのアプローチ [kurikazu]</h2>

<ol>
<li><p>どこでもFacadeを疑う
テストを書くのが大変になるよ</p></li>
<li><p>Model=Eloquentを疑う
テーブル設計がFWに引っ張られる</p></li>
<li><p>FWのコアに触れる
とりあえずindex.<a class="keyword" href="http://d.hatena.ne.jp/keyword/php">php</a>読んでみるといいかも</p></li>
</ol>


<p><iframe src="https://www.slideshare.net/slideshow/embed_code/key/KPFo9SSVx9eaKU" width="427" height="356" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="https://www.slideshare.net/kurikazu/crud3-78296101" title="CRUDアプリから一歩踏み出す3つのアプローチ" target="_blank">CRUDアプリから一歩踏み出す3つのアプローチ</a> </strong> from <strong><a target="_blank" href="https://www.slideshare.net/kurikazu">Kazuaki KURIU</a></strong> </div><cite class="hatena-citation"><a href="https://www.slideshare.net/kurikazu/crud3-78296101">www.slideshare.net</a></cite></p>

<h2>5.5直前！Container振り返り〜 [ytake]</h2>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%A4%A5%F3%A5%B9%A5%BF%A5%F3%A5%B9">インスタンス</a>の方法いろいろ</p>

<h2>さいごに</h2>

<p>発表者の皆様、ステキなLTをありがとうございました！</p>
