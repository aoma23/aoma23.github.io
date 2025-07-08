---
title: "【JavaScript】varとletとconstとブロックスコープについて検証してみた"
date: 2019-08-06
slug: "js_var_let_const"
category: blog
tags: [JavaScript,var,let,const,scope,IT]
---
<h2>はじめに</h2>

<p>以前まで<a class="keyword" href="http://d.hatena.ne.jp/keyword/JavaScript">JavaScript</a>には<code>var</code>しかなく<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%ED%A5%C3%A5%AF%A5%B9">ブロックス</a>コープはありませんでした。<br/>
最近は<code>let</code>と<code>const</code>が現れ、こちらは<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%ED%A5%C3%A5%AF%A5%B9">ブロックス</a>コープになります。<br/>
※<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B0%A5%B0%A4%EB">ググる</a>と『<a class="keyword" href="http://d.hatena.ne.jp/keyword/JavaScript">JavaScript</a>に<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%ED%A5%C3%A5%AF%A5%B9">ブロックス</a>コープはない』ってのがヒットしますが古い情報なので注意してね。</p>

<h2>検証コード</h2>

<p><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%D6%A5%ED%A5%C3%A5%AF%A5%B9">ブロックス</a>コープの挙動については下記<code>console.log</code>の結果に注目しながらご確認ください。<br/>
ちなみに<code>const</code>は上書き禁止の宣言ですが、スコープが異なれば当然別物になりますのでそのあたりも気にしながら！
ついでに変数巻き上げについても見ていきます！</p>

<pre class="code" data-lang="" data-unlink>// ----------------------------------------
// 変数a, b, c をグローバル変数で宣言し、挙動見ていく
var a = &#34;A&#34;;
let b = &#34;B&#34;;
const c = &#34;C&#34;;
console.log(a, b, c); // A B C

// ----------------------------------------
// 関数スコープでは全て別物
(function () {
  console.log(a); // undefined ※変数巻き上げのため
  //console.log(b); // Uncaught ReferenceError: Cannot access &#39;b&#39; before initialization
  //console.log(c); // Uncaught ReferenceError: Cannot access &#39;c&#39; before initialization
  var a = &#34;AA&#34;;
  let b = &#34;BB&#34;;
  const c = &#34;CC&#34;;
  console.log(a, b, c); // AA BB CC
})();
console.log(a, b, c); // A B C

// ----------------------------------------
// varはブロックスコープではないので上書きされる
{
  console.log(a); // A
  //console.log(b); // Uncaught ReferenceError: Cannot access &#39;b&#39; before initialization
  //console.log(c); // Uncaught ReferenceError: Cannot access &#39;b&#39; before initialization
  var a = &#34;AA&#34;;
  let b = &#34;BB&#34;;
  const c = &#34;CC&#34;;
  console.log(a, b, c); // AA BB CC
}
console.log(a, b, c); // AA B C

// ----------------------------------------
// ブロックスコープ内で上書き
{
  a = &#34;AAA&#34;;
  b = &#34;BBB&#34;;
  //c = &#34;C&#34;; // Uncaught TypeError: Assignment to constant variable.
}
console.log(a, b, c); // AAA BBB C

// ----------------------------------------
// グローバルスコープ上で再定義
var a = &#34;AAAA&#34;;
//let b = &#34;BBBBB&#34;; // Uncaught SyntaxError: Identifier &#39;b&#39; has already been declared
//const c = &#34;CCCC&#34;; // Uncaught SyntaxError: Identifier &#39;c&#39; has already been declared
console.log(a, b, c); // AAAA BBB C</pre>


<p>ややこしいですが状況に応じて使い分けていきましょう！</p>

<h2>さいごに</h2>

<p>JSの挙動確認するときは<a href="http://lite.runstant.com/">Runstant Lite</a>がオススメです！<br/>
上記ソースをコピペして試してみてね。</p>

