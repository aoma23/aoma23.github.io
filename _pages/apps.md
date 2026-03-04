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

<div class="entries-grid">

  <article class="archive__item">
    <div class="archive__item-teaser">
      <a href="https://kinenbi.app/" target="_blank" rel="noopener">
        <img src="https://kinenbi.app/img/icon_x512.png" alt="KINENBI">
      </a>
    </div>
    <h2 class="archive__item-title">
      <a href="https://kinenbi.app/" target="_blank" rel="noopener">KINENBI</a>
    </h2>
    <p class="archive__item-excerpt">
      大切な日を管理するシンプルな記念日アプリ。今日から何日目？次の記念日まで何日？がすぐわかります。
    </p>
    <p><a class="btn btn--primary" href="https://kinenbi.app/" target="_blank" rel="noopener">使ってみる</a></p>
  </article>

  <article class="archive__item">
    <div class="archive__item-teaser">
      <a href="/app/image_stripe_merge/" target="_blank" rel="noopener">
        <img src="/app/image_stripe_merge/sample_a.webp" alt="Image Stripe Merge">
      </a>
    </div>
    <h2 class="archive__item-title">
      <a href="/app/image_stripe_merge/" target="_blank" rel="noopener">Image Stripe Merge</a>
    </h2>
    <p class="archive__item-excerpt">
      画像ストライプ合成ツール。簡単操作で複数の画像を並べて合成できます。
    </p>
    <p><a class="btn btn--primary" href="/app/image_stripe_merge/" target="_blank" rel="noopener">使ってみる</a></p>
  </article>

  <article class="archive__item">
    <div class="archive__item-teaser">
      <a href="https://quickboard.aoma23.com/" target="_blank" rel="noopener">
        <img src="https://quickboard.aoma23.com/images/quickboard-og.png" alt="QuickBoard">
      </a>
    </div>
    <h2 class="archive__item-title">
      <a href="https://quickboard.aoma23.com/" target="_blank" rel="noopener">QuickBoard</a>
    </h2>
    <p class="archive__item-excerpt">
      ブラウザで使えるサッカー戦術ボード。フォーメーション作成・共有に最適。
    </p>
    <p><a class="btn btn--primary" href="https://quickboard.aoma23.com/" target="_blank" rel="noopener">使ってみる</a></p>
  </article>

</div>
