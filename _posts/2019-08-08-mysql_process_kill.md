---
title: "【MySQL】デッドロックしているプロセスをkillする"
date: 2019-08-08
slug: "mysql_process_kill"
category: blog
tags: [IT,デッドロック,MySQL,InnoDB,MyISAM,トランザクション,kill]
---
<h2>はじめに</h2>

<p>生きてるとたまーにデッドロックに遭遇することありますよね。</p>

<p>トランザクションの貼り方がいけてない、というか考慮されてない、というかよくわからず処理全体をトランザクションで覆っただろおまえ！みたいなアプリケーションのせいで。</p>

<p>そんなときサクッとプロセス削除できるようにメモ。</p>

<h2>MySQLでデッドロックの原因となっているクエリをkillする</h2>

<h3>原因のプロセスを探す</h3>

<pre class="code" data-lang="" data-unlink>show processlist;</pre>


<h3>Idを指定してkill</h3>

<pre class="code" data-lang="" data-unlink>kill 1234567;</pre>


<p>以上、簡単ですね。</p>

<h2>デッドロックとは？</h2>

<p>そもそもデッドロックって何？何で起きるの？という人向けに簡単な例を。</p>

<h3>usersテーブルの例</h3>

<p>usersテーブルがあったとします。</p>

<pre class="code" data-lang="" data-unlink>mysql&gt; select * from users;
+----+---------+
| id | name    |
+----+---------+
|  1 | aoki    |
|  2 | iida    |
|  3 | ueda    |
|  4 | enomoto |
|  5 | okada   |
|  6 | tanaka  |
|  7 | yamada  |
+----+---------+</pre>


<p>ある日、Aさんがレコードを1→2→3の順に削除していました。</p>

<pre class="code" data-lang="" data-unlink>start transaction;
delete from users where id = 1;
delete from users where id = 2;
delete from users where id = 3;</pre>


<p>時を同じくして、Bさんが5→4→3の順に削除しています。</p>

<pre class="code" data-lang="" data-unlink>start transaction;
delete from users where id = 5;
delete from users where id = 4;
delete from users where id = 3;</pre>


<p>するとどうでしょう。Aさんがすでにid=3のレコードをいじっていたため応答が返ってきません。
Bさんは立ち尽くします。</p>

<p>そんなことも知らずAさんは4のレコードを削除しようとしました。</p>

<pre class="code" data-lang="" data-unlink>delete from users where id = 4;</pre>


<p>するとどうでしょう。Bさんがすでにid=4のレコードをいじっていたため応答が返ってきません。
Aさんは立ち尽くします。</p>

<p>AさんBさんの二人はそのままいつまでも途方に暮れていましたとさ。。。<br/>
<span style="font-size: 150%"><b>これがデッドロック！！！！！</b></span></p>

<h4>ちなみに</h4>

<ul>
<li>デッドロック中にCさんがid=6,7のレコードを削除することは可能</li>
<li>MySQLのInnoDBは<a href="https://dev.mysql.com/doc/refman/5.6/ja/innodb-deadlock-detection.html">デッドロックを自動で検出し片方をロールバックしてくれる機能</a>があります。

<ul>
<li>Aさんがid=4のレコードを処理したタイミングでBさんがrollbackされます</li>
<li><code>ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction</code> って言われる</li>
</ul>
</li>
<li>MySQLのMyISAMはそもそもトランザクションがないから気をつけろ！</li>
</ul>


<h2>さいごに</h2>

<p>トランザクションは適切に貼ってアプリ開発しようね！</p>

<p>処理の途中でDBとのコネクション切れちゃった時にデータの整合性がとれなくなっちゃうー！って部分をトランザクションで囲みましょう。<br/>
切れても問題なしってところはトランザクション分けれるポイントですね。</p>

