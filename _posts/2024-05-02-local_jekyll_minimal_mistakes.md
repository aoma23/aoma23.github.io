---
title: "ローカルでJekyllのGitHubページを動かす"
date: 2024-05-02
category: blog
tags: [Jekyll,GitHubPages,minimal-mistakes]
---

## はじめに
ブログ書くとき毎回commitして本番で確認してたのですが、やっぱりプレビューして確認したいよねー。

## 方法

1. config.ymlに下記追加
    - `repository: "mmistakes/minimal-mistakes"`
2. `bundle` 実行
3. `bundle exec jekyll serve` 実行 
4. [http://127.0.0.1:4000](http://127.0.0.1:4000) にアクセス！

簡単だ！もっと早くやればよかった！

## 参考

Remote theme の[README](https://github.com/mmistakes/minimal-mistakes?tab=readme-ov-file#remote-theme-method)