---
title: "jekyllリモートテーマにGoogle AdSenseを載せる"
date: 2024-04-30
category: blog
tags: [Jekyll,GitHubPages,minimal-mistakes,Google AdSense]
---

## はじめに
Google AdSense は `<head></head>` タグ内にコードを貼り付けないといけないのですが、jekyllやremote_themeがそもそもよくわかってないので試行錯誤した話です。
使用しているテーマは [mmistakes/minimal-mistakes](https://github.com/mmistakes/minimal-mistakes) です。

## 方法1. GoogleTagManagerを使う → ダメでした

[GoogleタグマネージャーのカスタムHTML](https://sb-wegazine.net/adsense-howtoinstall-gtm/) に埋め込む方法があるのですが、広告は表示されませんでした。  
おそらく`<html>`タグではなく`<body>`タグ以降で表示になっているのでダメなのかなぁと。  
広告審査はこの埋め込みで通ったんですけどね。

## 方法2. _include/xxx.html ファイルでテーマを上書きする → ダメでした

mmistakes/minimal-mistakes には [_includes/head/custom.html](https://github.com/mmistakes/minimal-mistakes/blob/master/_includes/head/custom.html) が存在していたので、このファイルのみ設置してもダメでした。  
remote_themeだから効かないのかなぁと。  
remote_themeやめてテーマの全ファイル置いてもいいのですけど、せっかくなのでremote_themeにこだわりたい。（仕組みはよくわかってないけどもw）

## 方法3. jsファイルを設置してその中でAdSenseのコードを呼び出す → 成功！

結果これでやりました！  
mmistakes/minimal-mistakes はhead内にjsを読み込めます。

/assets/js/ad.js を設置。（ファイル名は何でもOK）

```
const ad_script = document.createElement('script');
ad_script.src = '{ここにアドセンスのURLを貼る}';
ad_script.async = true;
ad_script.crossOrigin = 'anonymous';
document.head.appendChild(ad_script);
console.log('test');
```

_config.ymlに下記を追加

```
head_scripts:
  - /assets/js/ad.js
```

これで無事広告が表示されました！  
確認のためにコンソールで `test` が出てることも確認。

それでは良きAdSenseライフを！