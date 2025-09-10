---
title: Apps
layout: single
permalink: /apps/
author_profile: true
classes: wide
---

<style>
.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.2rem;
}
/* Equal height cards */
.archive__item {
  display: flex;
  flex-direction: column;
}
.archive__item-teaser img {
  width: 100%;
  height: 200px;            /* fixed teaser height */
  object-fit: cover;        /* crop to fill */
  display: block;
}
.archive__item p:last-child { /* button row */
  margin-top: auto;
}
</style>

以下の自作アプリを公開しています。

<div class="entries-grid">

  <article class="archive__item">
    <div class="archive__item-teaser">
      <a href="https://kinenbi.app/" target="_blank" rel="noopener">
        <img src="https://kinenbi.app/img/icon_x512.png" alt="記念日アプリ Kinenbi">
      </a>
    </div>
    <h2 class="archive__item-title">
      <a href="https://kinenbi.app/" target="_blank" rel="noopener">記念日アプリ Kinenbi</a>
    </h2>
    <p class="archive__item-excerpt">
      大事な日を忘れないためのシンプル管理ツール。今日から何日目？次の記念日まで何日？がすぐわかります。
    </p>
    <p><a class="btn btn--primary" href="https://kinenbi.app/" target="_blank" rel="noopener">使ってみる</a></p>
  </article>

  <article class="archive__item">
    <div class="archive__item-teaser">
      <a href="/app/image_stripe_merge/" target="_blank" rel="noopener">
        <img src="/app/image_stripe_merge/sample_a.webp" alt="画像ストライプ合成ツール">
      </a>
    </div>
    <h2 class="archive__item-title">
      <a href="/app/image_stripe_merge/" target="_blank" rel="noopener">画像ストライプ合成ツール</a>
    </h2>
    <p class="archive__item-excerpt">
      複数の画像を“しましま”に合成。SNSの比較やネタ画像づくりに便利。
    </p>
    <p><a class="btn btn--primary" href="/app/image_stripe_merge/" target="_blank" rel="noopener">使ってみる</a></p>
  </article>

  <article class="archive__item">
    <div class="archive__item-teaser">
      <a href="/app/quickboard/" target="_blank" rel="noopener">
        <img src="/app/quickboard/images/quickboard.png" alt="QuickBoard（サッカー戦術ボード）">
      </a>
    </div>
    <h2 class="archive__item-title">
      <a href="/app/quickboard/" target="_blank" rel="noopener">QuickBoard（サッカー戦術ボード）</a>
    </h2>
    <p class="archive__item-excerpt">
      ブラウザで使えるサッカー戦術ボード。フォーメーション作成・共有に最適。
    </p>
    <p><a class="btn btn--primary" href="/app/quickboard/" target="_blank" rel="noopener">使ってみる</a></p>
  </article>

</div>
