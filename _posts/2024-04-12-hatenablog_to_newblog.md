---
title: "はてなブログの全記事に新サイトへの該当記事へのリダイレクトを埋め込む方法"
date: 2024-04-12
category: blog
tags: [はてなブログ,ブログ移転,javascript]
---

## はじめに
はてなブログから新ブログへ移転したときは全記事に移転のお知らせを入れたいですよね！  
そして該当記事にリダイレクトさせたいですよね！  
でもひとつひとつ記事を修正して回るのは大変。。。  
そんな時はスクリプトを一つ埋め込むだけでできます！

## 前提

記事URLの末尾ははてなブログと新ブログで同じ場合を想定しています。
下の例でいう`my_first_firebase_6_send_gmail` の部分

旧）`https://aoma23.hatenablog.jp/entry/my_first_firebase_6_send_gmail`

新）`https://aoma23.github.io/my_first_firebase_6_send_gmail`

スクリプトは `https://aoma23.hatenablog.jp/entry` 部分を新ドメインに切り替えてリダイレクトします。

## 方法

管理画面を開いて  
`デザイン→カスタマイズ→記事上HTML`  
に下記スクリプトを埋め込むだけ！（新URLの値は適宜変更してくださいね！）

![キャプチャ](</assets/images/2024-04-12-23-54-09.png>)


```
<font size="5" color="red">この記事は移転しました。約5秒後に新記事へ移動します。</font><br>
移動しない場合は<a href="https://aoma23.github.io/">ココ</a>をクリックして新サイトをお楽しみください。

<script type="text/javascript" language="javascript">
  var new_url = "https://aoma23.github.io/";
  var url = new URL(window.location.href);
  var href = url.href;
  var new_post_url = href.replace(url.protocol + '//' + url.hostname + '/entry/', new_url);
  setTimeout("redirect()", 5000);
  function redirect(){
    location.href = new_post_url;
  }
</script>

<hr>
```

## 見た目はこんな感じ

![こんな感じになる](</assets/images/2024-04-12-23-41-04.png>)

かんたんですね！

新ブログでも頑張っていきましょう！