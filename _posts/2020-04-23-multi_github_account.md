---
title: "複数のGitHubアカウント運用で片方のプライベートリポジトリをcloneできなくて困った話"
date: 2020-04-23
slug: "multi_github_account"
category: blog
tags: [IT,GitHub,複数アカウント,エラー]
---
<p>仕事用と個人用などで複数GitHubアカウントを持ってる人は多いと思います。
で、仕事用リポジトリに個人用の（決して知られたくない）アカウントでコミットしてしまったー！という事故が発生することも多いと思います。
私もその一人です。</p>

<p>原因も解決策もよくわかってないのですが、今回PCを初期化したこともありしっかり設定することにしました！</p>

<h1>ひとつのPCで複数GitHubアカウントを運用する</h1>

<p>参考にさせていただいたのはこちらの記事！</p>

<p><a href="https://qiita.com/KeyMama/items/f9291bb125ee94b52b78">&#x8907;&#x6570;&#x306E;Git&#x30A2;&#x30AB;&#x30A6;&#x30F3;&#x30C8;&#x3092;&#x624B;&#x52D5;&#x5207;&#x66FF;&#x4E0D;&#x8981;&#x3067;&#x904B;&#x7528;&#x3059;&#x308B; - Qiita</a></p>

<p>手動で切り替える必要なしということで最高だなと思い設定させていただきました。（完全自動化は諦めたのですが（後述））</p>

<h2>設定手順</h2>

<h3>1. 鍵を作る</h3>

<p><a href="https://qiita.com/suthio/items/2760e4cff0e185fe2db9">&#x304A;&#x524D;&#x3089;&#x306E;SSH Keys&#x306E;&#x4F5C;&#x308A;&#x65B9;&#x306F;&#x9593;&#x9055;&#x3063;&#x3066;&#x3044;&#x308B; - Qiita</a>
を参考に仕事用と個人用で2つ作りました。</p>

<pre class="code" data-lang="" data-unlink>ssh-keygen -t rsa -b 4096 -C &#34;your_email@example.com&#34;</pre>


<p>余談：コメント欄にメアド入れるのが一般的って書いてあったのでその通りにしたけど、公開鍵の中に記載されるから微妙だな。。次から こうしよう。</p>

<pre class="code" data-lang="" data-unlink>ssh-keygen -t rsa -b 4096 -C &#34;aoma&#34; -f ~/.ssh/id_rsa_aoma</pre>


<ul>
<li>~/.ssh/id_rsa : 仕事用</li>
<li>~/.ssh/id_rsa_aoma : 個人用</li>
</ul>


<p>公開鍵をコピーして、それぞれのGitHubアカウントに登録します。</p>

<pre class="code" data-lang="" data-unlink>pbcopy &lt; ~/.ssh/id_rsa.pub # クリップボードにコピーするコマンド</pre>


<h3>2. 使用する秘密鍵の設定</h3>

<p>~/.ssh/configの設定をします。
あんまりよくわかってないんですが、Hostごとにどの秘密鍵を使うか。的な？</p>

<p><code>vi ~/.ssh/config</code></p>

<pre class="code" data-lang="" data-unlink>Host github_work
HostName github.com
User git
IdentityFile ~/.ssh/id_rsa
IdentitiesOnly yes
UseKeychain yes
AddKeysToAgent yes

Host github_aoma23
HostName github.com
User git
IdentityFile ~/.ssh/id_rsa_aoma
IdentitiesOnly yes
UseKeychain yes
AddKeysToAgent yes</pre>


<h3>3. cloneしたリポジトリに設定する</h3>

<p>下記のようにcloneする親ディレクトリを用意します。</p>

<ul>
<li>repo/

<ul>
<li>work/ : 仕事用リポジトリをcloneする</li>
<li>private/ : 個人用リポジトリをcloneする</li>
</ul>
</li>
</ul>


<p>そして、cloneしたリポジトリ毎にgit configのコマンドを実行することにしました。</p>

<pre class="code" data-lang="" data-unlink># 仕事用なら
git config --local user.name &#34;hogehoge&#34;
git config --local user.email &#34;hogehoge@users.noreply.github.com&#34;
git config --local url.&#34;github_work&#34;.insteadOf &#34;git@github.com&#34;

# 個人用なら
git config --local user.name &#34;aoma23&#34;
git config --local user.email &#34;12345601+aoma23@users.noreply.github.com&#34;
git config --local url.&#34;github_aoma23&#34;.insteadOf &#34;git@github.com&#34;</pre>


<p>cloneした際は必ず実行しないといけませんが、そこは頑張ることにしました。</p>

<p>※参考にさせていただいた記事ではここを自動化（cloneしたら自動設定）してたのですが、私には難しすぎて諦めました。</p>

<h2>プライベート（非公開）リポジトリがcloneできない！</h2>

<p>やっと表題の件なのですが、個人用のPrivate（非公開）リポジトリがcloneできなくてはまりました。</p>

<p>仕事用は非公開リポジトリでも<code>git clone 〜</code>でクローンできる。（先に秘密鍵作ったから？）</p>

<p><code>env GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa_aoma -F /dev/null" git clone 〜</code> として秘密鍵指定しても下記のようなエラーに。</p>

<pre class="code" data-lang="" data-unlink>% env GIT_SSH_COMMAND=&#34;ssh -i ~/.ssh/id_rsa_aoma -F /dev/null&#34; git clone git@github.com:aoma23/test.git 
Cloning into &#39;test&#39;...
ERROR: Repository not found.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.</pre>


<p>う〜む、、と悩んでたら同じような現象になっている人を発見！</p>

<p><a href="https://qiita.com/eragonasable/items/ddfd33b6c0ab551d061c">GitHub&#x3067;&#x30EA;&#x30E2;&#x30FC;&#x30C8;&#x304B;&#x3089;clone&#x3067;&#x304D;&#x306A;&#x3044;&#x3068;&#x304D;&#x306B;&#x3084;&#x3063;&#x305F;&#x3053;&#x3068; - Qiita</a></p>

<blockquote><p>どうやらSSH公開鍵をGitHubに登録するだけでなく、ssh-agentに秘密鍵を登録する必要あるそうです。</p></blockquote>

<p>ほうほう。<br />
ということで <a href="https://qiita.com/naoki_mochizuki/items/93ee2643a4c6ab0a20f5">ssh-agent&#x3092;&#x5229;&#x7528;&#x3057;&#x3066;&#x3001;&#x5B89;&#x5168;&#x306B;SSH&#x8A8D;&#x8A3C;&#x3092;&#x884C;&#x3046; - Qiita</a> を参考にssh-agentを登録してみることに。</p>

<p>まずは<code>ssh-add -l</code> で現状登録されている鍵を確認！<br />
なるほど、1個（仕事用）しか登録されていない。</p>

<p>ということで個人用の秘密鍵を登録！</p>

<p><code>ssh-add -K  ~/.ssh/id_rsa_aoma</code></p>

<p>再度<code>ssh-add -l</code> で確認したところ無事2個になってました。</p>

<p>これでcloneいけるのでは！？</p>

<pre class="code" data-lang="" data-unlink>% env GIT_SSH_COMMAND=&#34;ssh -i ~/.ssh/id_rsa_aoma -F /dev/null&#34; git clone git@github.com:aoma23/test.git 
Cloning into &#39;test&#39;...
remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
Receiving objects: 100% (3/3), done.</pre>


<p>キター！！</p>

<p>コミットも検証しましたがそれぞれのアカウントでしっかりコミットされてました！最高！</p>

<p>誰かの役に立てば幸いです。それではまた！</p>

