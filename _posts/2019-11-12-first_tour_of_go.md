---
title: "PHPer がはじめて Tour of Go を学んだときのポイント24選"
date: 2019-11-12
slug: "first_tour_of_go"
category: blog
tags: [IT,GO,PHP,学習]
---
<p>Goって興味はあったけど全然触ってこなかったaomaです。</p>

<p>Goには <a href="https://tour.golang.org/welcome/1">A Tour of Go</a> という、これをやればGoマスターになれるステキサイトがあります。</p>

<p><a href="https://go-tour-jp.appspot.com/list">A Tour of Go</a></p>

<p>普段<a class="keyword" href="http://d.hatena.ne.jp/keyword/PHP">PHP</a>に慣れている中で、ムムッ！？っとなった点を目次別にメモしました。<br/>
PHPerでこれからGoを学ぶよって人の助けになれば幸いです。</p>

<h2>Packages, variables, and functions.</h2>

<ul>
<li>変数名の 後ろ に型名を書く

<ul>
<li><a href="https://go-tour-jp.appspot.com/basics/4">https://go-tour-jp.appspot.com/basics/4</a></li>
</ul>
</li>
<li>戻り値となる変数に名前をつけることができる

<ul>
<li><a href="https://go-tour-jp.appspot.com/basics/7">https://go-tour-jp.appspot.com/basics/7</a></li>
</ul>
</li>
<li>関数の中では、var 宣言の代わりに := の代入文で暗黙的な型宣言が可能</li>
<li>関数の外では、キーワードではじまる宣言( var, func, など)が必要

<ul>
<li><a href="https://go-tour-jp.appspot.com/basics/10">https://go-tour-jp.appspot.com/basics/10</a></li>
</ul>
</li>
<li>1 &lt;&lt; 100

<ul>
<li>（Go関係ないけど）&lt;&lt;はシフト（bitの移動）で乗のこと。1は2進数で表現されている。つまり2の2乗。</li>
</ul>
</li>
</ul>


<h2>Flow control statements: for, if, else, switch and defer</h2>

<ul>
<li>for、ifに括弧 ( ) は不要。中括弧 { } は必要

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/1">https://go-tour-jp.appspot.com/flowcontrol/1</a></li>
</ul>
</li>
<li>for の初期化と後処理<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B9%A5%C6%A1%BC%A5%C8%A5%E1%A5%F3%A5%C8">ステートメント</a>の記述は任意

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/2">https://go-tour-jp.appspot.com/flowcontrol/2</a></li>
</ul>
</li>
<li>whileはない。代わりにforを使う。<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%BB%A5%DF">セミ</a>コロン(;)の省略が可能

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/3">https://go-tour-jp.appspot.com/flowcontrol/3</a></li>
<li>ループ条件省略で無限ループ

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/4">https://go-tour-jp.appspot.com/flowcontrol/4</a></li>
</ul>
</li>
</ul>
</li>
<li>if は、 for のように、条件の前に、評価するための簡単な<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B9%A5%C6%A1%BC%A5%C8%A5%E1%A5%F3%A5%C8">ステートメント</a>を書くことが可能

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/6">https://go-tour-jp.appspot.com/flowcontrol/6</a></li>
</ul>
</li>
<li>switch はbreakが不要

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/9">https://go-tour-jp.appspot.com/flowcontrol/9</a></li>
<li>条件のないswitchは、 switch true と書くことと同じ</li>
<li>caseに条件を書くことも可能

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/11">https://go-tour-jp.appspot.com/flowcontrol/11</a></li>
</ul>
</li>
</ul>
</li>
<li>defer <a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%B9%A5%C6%A1%BC%A5%C8%A5%E1%A5%F3%A5%C8">ステートメント</a>は、 defer へ渡した関数の実行を、呼び出し元の関数の終わり(returnする)まで遅延させる</li>
<li><p>defer へ渡した関数の引数は、すぐに評価される</p>

<ul>
<li><p><a href="https://go-tour-jp.appspot.com/flowcontrol/12">https://go-tour-jp.appspot.com/flowcontrol/12</a></p>

<pre><code>package main

import "fmt"

func main() {
    t := 1
    defer fmt.Println(t)
    t++
    fmt.Println(t)
}

// 2
// 1
</code></pre></li>
</ul>
</li>
<li><p>defer が複数ある場合は<a class="keyword" href="http://d.hatena.ne.jp/keyword/LIFO">LIFO</a>(last-in-first-out) で呼び出される</p>

<ul>
<li><a href="https://go-tour-jp.appspot.com/flowcontrol/13">https://go-tour-jp.appspot.com/flowcontrol/13</a></li>
</ul>
</li>
</ul>


<h2>More types: structs, slices, and maps.</h2>

<ul>
<li><p>ポインタ</p>

<ul>
<li><code>&amp;</code> オペレータで、その変数へのポインタを引き出す。<code>p = &amp;i</code></li>
<li><code>*</code> オペレータで、ポインタの指す先の変数を示す。<code>*p（iのこと）</code>

<ul>
<li><a href="https://go-tour-jp.appspot.com/moretypes/1">https://go-tour-jp.appspot.com/moretypes/1</a></li>
</ul>
</li>
</ul>
</li>
<li><p>structのフィールドはポインタで (*p).Xのようにアクセスできる。p.Xと省略することも可能</p>

<ul>
<li><a href="https://go-tour-jp.appspot.com/moretypes/4">https://go-tour-jp.appspot.com/moretypes/4</a></li>
</ul>
</li>
<li>structのポインタpを出力すると&amp;がついた形で返ってくる。（変数だと0x414020みたいなやつなのに...）

<ul>
<li><a href="https://go-tour-jp.appspot.com/moretypes/5">https://go-tour-jp.appspot.com/moretypes/5</a></li>
</ul>
</li>
<li><p>配列は固定長。可変長はスライスをうまく使う</p>

<ul>
<li><a href="https://go-tour-jp.appspot.com/moretypes/7">https://go-tour-jp.appspot.com/moretypes/7</a></li>
<li>コロンで指定した最初の要素は含むが、最後の要素は含まない。var s []int = primes[1:4]の場合、要素は3つ。</li>
<li>Sliceは配列のような感じ。要素をいじると元の配列や別のSliceの要素も変更される

<ul>
<li><a href="https://tour.golang.org/moretypes/8">https://tour.golang.org/moretypes/8</a></li>
</ul>
</li>
<li>長さと容量。とっつきにくいが、長さはどこまで見せるか（カーテンどこまで開けるか）、容量は実際に持っている値たちと考えるとわかりやすい。

<ul>
<li><a href="https://tour.golang.org/moretypes/9">https://tour.golang.org/moretypes/9</a></li>
</ul>
</li>
<li>makeで様々な空のsliceを作れる

<ul>
<li><a href="https://tour.golang.org/moretypes/13">https://tour.golang.org/moretypes/13</a></li>
</ul>
</li>
<li>appendでsliceに追加できる。

<ul>
<li><a href="https://go-tour-jp.appspot.com/moretypes/15">https://go-tour-jp.appspot.com/moretypes/15</a></li>
<li>cap増え方の謎...

<ul>
<li><p>調べた</p>

<pre><code>https://qiita.com/hitode7456/items/562527069e13347b89c8
&gt; 長さ が 容量 を超えた時に、その時の 容量 の倍の 容量 が新たに確保されることが分かりました。
http://toc-dev.blogspot.com/2012/09/goslice-make.html
&gt; 2のn乗で徐々にメモリが拡張されているのがわかる。
</code></pre></li>
<li><p>ということで2の倍数で増えてく模様。（cap=3のときに溢れても6ではない）</p>

<pre><code>2個目の記事で、3 3 3 3 6 6 6 12 になっているところは、今実行すると、3 3 3 3 8 8 8 8 になった。
</code></pre></li>
<li><p>Goのバージョンによっても変わるらしい。気にしなくていいっぽい。</p>

<pre><code>https://stackoverflow.com/questions/38573983/capacity-of-slices-in-go
&gt; TL; DR - スライスの容量がどれだけ拡張されるかは仕様に記載されていません。Goのバージョンが異なれば（または実装が異なる場合も、アーキテクチャが異なる場合も同じバージョンなど）、スライスの容量は異なります。
</code></pre></li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li><p>Maps（辞書的なやつ。key/<a class="keyword" href="http://d.hatena.ne.jp/keyword/value">value</a>）</p>

<ul>
<li><a href="https://tour.golang.org/moretypes/19">https://tour.golang.org/moretypes/19</a></li>
<li>エクササイズ

<ul>
<li><a href="https://tour.golang.org/moretypes/23">https://tour.golang.org/moretypes/23</a></li>
<li>やった

<ul>
<li><a href="https://play.golang.org/p/kbXho4nncW7">https://play.golang.org/p/kbXho4nncW7</a></li>
<li>Goは変数使わないと怒られる。使わないものは_にすれば逃げれる</li>
<li>The Go Playgroundで<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%BD%A1%BC%A5%B9%A5%B3%A1%BC%A5%C9">ソースコード</a>シェアできる</li>
</ul>
</li>
</ul>
</li>
</ul>
</li>
<li><p>関数は関数の引数や戻り値としても使える</p>

<ul>
<li><a href="https://tour.golang.org/moretypes/24">https://tour.golang.org/moretypes/24</a></li>
</ul>
</li>
<li><p><a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%AF%A5%ED%A1%BC%A5%B8%A5%E3">クロージャ</a>ーは変数を保持する。戻り値が関数だと<a class="keyword" href="http://d.hatena.ne.jp/keyword/%A5%AF%A5%ED%A1%BC%A5%B8%A5%E3">クロージャ</a>ーと判断してよさそう。</p>

<ul>
<li><a href="https://tour.golang.org/moretypes/25">https://tour.golang.org/moretypes/25</a></li>
<li>sum := 0 は一度しか呼ばれない</li>
<li><code>adder() func(int) int</code>の最後の<code>int</code>はfunc(int)の戻り値ってこと。</li>
<li><a href="https://play.golang.org/p/53ao0yB3GIS">https://play.golang.org/p/53ao0yB3GIS</a></li>
</ul>
</li>
</ul>


<h2>Methods and interfaces</h2>

<ul>
<li>構造体にメソッド定義できる

<ul>
<li><a href="https://tour.golang.org/methods/1">https://tour.golang.org/methods/1</a></li>
</ul>
</li>
<li>intなどの型にもメソッド定義できる。型をtypeで定義すれば。

<ul>
<li><a href="https://tour.golang.org/methods/3">https://tour.golang.org/methods/3</a></li>
</ul>
</li>
<li>ポインタレシーバーで書き換えれる

<ul>
<li><a href="https://tour.golang.org/methods/4">https://tour.golang.org/methods/4</a></li>
</ul>
</li>
</ul>


<h2>ゴルーチン</h2>

<ul>
<li><a href="http://cuto.unirita.co.jp/gostudy/post/goroutin/">http://cuto.unirita.co.jp/gostudy/post/goroutin/</a>

<ul>
<li>並列処理用。独立して動作する実行単位であり、OSが管理するスレッドに割り当てられて動作します。</li>
<li>関数の呼び出し時に先頭に「go」を付けるだけ</li>
<li>「ゴルーチン」として呼び出した関数の終了は待たないことです。そのため、呼び出した関数が返す戻り値を受け取ることはできません。</li>
<li>mainから開始している親となる処理が終了すれば、いくら他に「ゴルーチン」が動いていても、すべて中断して終了します。</li>
</ul>
</li>
</ul>


<h2>おまけ</h2>

<blockquote><p>Note: Go playground上の時間は、いつも "2009-11-10 23:00:00 <a class="keyword" href="http://d.hatena.ne.jp/keyword/UTC">UTC</a>" です。 この値の意味は、読者の楽しみのために残しておきます(^^)</p></blockquote>

<p>一体どんな意味が！？と思い調べてみました。</p>

<blockquote><p>Goは2009年11月に公に発表され[23]、バージョン1.0は2012年3月にリリースされました。
<a href="https://en.wikipedia.org/wiki/Go_(programming_language)">https://en.wikipedia.org/wiki/Go_(programming_language)</a>
<a href="https://opensource.googleblog.com/2009/11/hey-ho-lets-go.html">https://opensource.googleblog.com/2009/11/hey-ho-lets-go.html</a></p></blockquote>

<p>なるほどGoの誕生日ね！おめでとう！</p>

