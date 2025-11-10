---
title: "Setting Syncでトークンを再設定する"
date: 2019-08-28
slug: "setting_sync_token"
category: blog
tags: [IT,VSCode,setting,GitHub]
---
<p>Visual Studio Code の Setting Sync 便利ですよね。</p>

<p>久々に設定をアップロードしようとしたら GitHub Token が有効期限切れでエラーになったので解決策をメモ。</p>

<h2>GitHub Token の再設定手順</h2>

<h3>1. GitHub Tokenを再生成</h3>

<ol>
<li><a href="https://github.com/settings/tokens">GitHubのPersonal access tokens</a>を開く</li>
<li>settings-syncのトークンを選択</li>
<li>「Regenerate token」を押す</li>
<li>画面遷移しトークンが表示されるのでコピー</li>
</ol>


<h3>2. Setting Sync に設定</h3>

<ol>
<li>VSCodeで<code>Ctrl + Shift + P</code></li>
<li><code>Sync : Advanced Options</code>を選択</li>
<li><code>Open Settings Page</code>を選択</li>
<li>JSONが開くので<code>token</code>の値にコピーしていたトークンを設定</li>
</ol>


<p>これでアップロードできるようになります！</p>

