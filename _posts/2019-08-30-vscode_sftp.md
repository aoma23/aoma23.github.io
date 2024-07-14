---
title: "【VSCode】SFTPアドオンの設定ファイルのサンプル"
date: 2019-08-30
slug: "vscode_sftp"
category: blog
tags: [IT,VSCode,sftp,アドオン]
---
<p>SFTP便利ですよね。</p>

<p>プログラムファイルをローカルPCで編集して、上書きすると同時にリモートサーバーにアップしてくれます。</p>

<p><iframe src="https://hatenablog-parts.com/embed?url=https%3A%2F%2Fgithub.com%2Fliximomo%2Fvscode-sftp" title="liximomo/vscode-sftp" class="embed-card embed-webcard" scrolling="no" frameborder="0" style="display: block; width: 100%; height: 155px; max-width: 500px; margin: 10px 0px;"></iframe><cite class="hatena-citation"><a href="https://github.com/liximomo/vscode-sftp">github.com</a></cite></p>

<p>公式見ればわかりますが、設定サンプルを一応メモ。</p>

<pre class="code" data-lang="" data-unlink>{
    &#34;name&#34;: &#34;My Server&#34;,
    &#34;host&#34;: &#34;{$ip_address}&#34;,
    &#34;protocol&#34;: &#34;sftp&#34;,
    &#34;port&#34;: 22,
    &#34;username&#34;: &#34;{$username}&#34;,
    &#34;password&#34;: &#34;{$password}&#34;,
    &#34;remotePath&#34;: &#34;/{$app_path}&#34;,
    &#34;uploadOnSave&#34;: true,
    &#34;ignore&#34;: [
        &#34;.vscode&#34;,
        &#34;.git&#34;,
        &#34;.DS_Store&#34;,
        &#34;.buildpath&#34;,
        &#34;vendor/&#34;
    ]
}</pre>


<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/Windows">Windows</a>から<a class="keyword" href="http://d.hatena.ne.jp/keyword/Linux">Linux</a>にアップするときに改行コード変換してくれるオプションとかあるといいなと思ったのですが、最初から<a class="keyword" href="http://d.hatena.ne.jp/keyword/Windows">Windows</a>上でLFで扱ってれば問題ないですね。</p>

<h2>ちなみに</h2>

<p><code>.vscode/sftp.json</code> がgitの処理対象になってしまうのでignoreしたい。どうせなら全<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%EA%A5%DD%A5%B8%A5%C8%A5%EA">リポジトリ</a>でignoreしたい。ということで下記のようにglobalで除外する。</p>

<h3>1. グローバル用の.gitignoreを作る</h3>

<p><code>.gitignore</code>ファイルを作ってホーム<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%C7%A5%A3%A5%EC%A5%AF%A5%C8">ディレクト</a>リに設置。（<a class="keyword" href="http://d.hatena.ne.jp/keyword/Windows">Windows</a>ならきっと<code>C:\Users\{ユーザー名}</code>）</p>

<pre class="code" data-lang="" data-unlink>/.vscode</pre>


<h3>2. 読み込む設定</h3>

<pre class="code" data-lang="" data-unlink>git config --global core.excludesfile ~/.gitignore</pre>


<h4>参考</h4>

<ul>
<li><a href="https://qiita.com/katsew/items/5cade12fa743a2f31f25">&#x30B0;&#x30ED;&#x30FC;&#x30D0;&#x30EB;&#x3067;.gitignore&#x3092;&#x9069;&#x5FDC;&#x3059;&#x308B; - Qiita</a></li>
</ul>


<p>これで<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%EA%A5%DD%A5%B8%A5%C8%A5%EA">リポジトリ</a>毎に<code>sftp.json</code>作っても全て除外してくれます。</p>

<p>べんりー！</p>

