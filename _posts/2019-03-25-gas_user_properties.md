---
title: "【GAS】ユーザープロパティは2種類ある！？あるいはdeprecatedになったUserPropertiesの代わりはない？？"
date: 2019-03-25
slug: "gas_user_properties"
category: blog
tags: [GAS,IT,環境変数]
---
<h2>はじめに</h2>

<p>普段GASでいろいろ作るんですが、スクリプトファイル横断して同じ値を使いたいときありますよね？<br/>
GitHubのIDとかAWSのアクセスキーとかとか。環境変数的な。</p>

<p>これUserPropertiesで実現できるんですが、<a href="https://developers.google.com/apps-script/reference/properties/user-properties">現在は非推奨</a>になっていて使えません。。どうすればいいですか？</p>

<p>おいおい、いまは<a href="https://developers.google.com/apps-script/reference/properties/properties-service">PropertiesService</a>ってのがあって、getUserProperties()で使えるぜ！
っていうそこのあなた！もう少々お付き合いください。</p>

<p>実はこれ別物なんです。</p>

<h2>ユーザープロパティは2種類ある！？</h2>

<p>スクリプトのメニューから、<br/>
ファイル→プロジェクトのプロパティ→「ユーザープロパティ」タブ</p>

<p><figure class="figure-image figure-image-fotolife" title="ユーザープロパティ"><span itemscope itemtype="http://schema.org/Photograph"><img src="{{ '/assets/images/20190325/20190325180058.png' | relative_url }}" alt="f:id:aoma23:20190325180058p:plain" title="f:id:aoma23:20190325180058p:plain" class="hatena-fotolife" itemprop="image"></span><figcaption>ユーザープロパティ</figcaption></figure></p>

<p>ここでhoge=user_hogeを設定します。</p>

<p>こちら、UserPropertiesでは取得できますが、PropertiesServiceでは利用できません。</p>

<pre class="code" data-lang="" data-unlink>  Logger.log(UserProperties.getProperty(&#39;hoge&#39;)); // user_hoge
  Logger.log(PropertiesService.getUserProperties().getProperty(&#39;hoge&#39;)); // null</pre>


<p>また、UserPropertiesは別スクリプトでも利用できますが、PropertiesService.getUserProperties()はこのスクリプト内のみとなっています。</p>

<p>名前は似てるっていうか同じなのに全くの別物！！</p>

<h2>まとめ</h2>

<p>ユーザープロパティには2種類ある。</p>

<table>
<thead>
<tr>
<th> </th>
<th> UserProperties</th>
<th> PropertiesService.getUserProperties() </th>
</tr>
</thead>
<tbody>
<tr>
<td> エディタから編集 </td>
<td> できる </td>
<td> できない </td>
</tr>
<tr>
<td> 別スクリプトで参照 </td>
<td> できる </td>
<td> できない </td>
</tr>
<tr>
<td> 用途 </td>
<td> 開発者用の環境変数として </td>
<td> スクリプトの実行ユーザー毎の設定値として </td>
</tr>
<tr>
<td> その他 </td>
<td> 非推奨 </td>
<td>  </td>
</tr>
</tbody>
</table>


<p><a href="https://stackoverflow.com/questions/51689943/scriptproperties-userproperties-had-been-deprecated">Stack Overflow</a>でも代替はPropertiesServiceだぜって言われちゃってるし、</p>

<p>このプロパティが本当に非推奨になったのなら、画面からも消して欲しい。。</p>

<p>どなたか詳しい方いませんか？？</p>

