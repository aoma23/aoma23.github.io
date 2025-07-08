---
title: "Setting Syncでトークンを再設定する"
date: 2019-08-28
slug: "setting_sync_token"
category: blog
tags: [IT,VSCode,setting,GitHub]
---
<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/Visual%20Studio%20Code">Visual Studio Code</a> の Setting Sync 便利ですよね。</p>

<p>久々に設定をアップロードしようとしたら <a class="keyword" href="http://d.hatena.ne.jp/keyword/GitHub">GitHub</a> Token が有効期限切れでエラーになったので解決策をメモ。</p>

<h2><a class="keyword" href="http://d.hatena.ne.jp/keyword/GitHub">GitHub</a> Token の再設定手順</h2>

<h3>1. <a class="keyword" href="http://d.hatena.ne.jp/keyword/GitHub">GitHub</a> Tokenを再生成</h3>

<ol>
<li><a href="https://github.com/settings/tokens">GitHubのPersonal access tokens</a>を開く</li>
<li>settings-syncの<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C8%A1%BC%A5%AF">トーク</a>ンを選択</li>
<li>「Regenerate token」を押す</li>
<li>画面遷移し<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C8%A1%BC%A5%AF">トーク</a>ンが表示されるのでコピー</li>
</ol>


<h3>2. Setting Sync に設定</h3>

<ol>
<li><a class="keyword" href="http://d.hatena.ne.jp/keyword/VSCode">VSCode</a>で<code>Ctrl + Shift + P</code></li>
<li><code>Sync : Advanced Options</code>を選択</li>
<li><code>Open Settings Page</code>を選択</li>
<li><a class="keyword" href="http://d.hatena.ne.jp/keyword/JSON">JSON</a>が開くので<code>token</code>の値にコピーしていた<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C8%A1%BC%A5%AF">トーク</a>ンを設定</li>
</ol>


<p>これでアップロードできるようになります！</p>

