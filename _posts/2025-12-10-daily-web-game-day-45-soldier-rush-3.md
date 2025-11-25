---
title: "毎日ゲームチャレンジ Day 45: ソルジャーラッシュ3"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-44-soldier-rush-2/' | relative_url }}">ソルジャーラッシュ2</a>

45日目は兵士を集めて敵を倒す「ソルジャーラッシュ3」。
雨弾の中を縫い、連射で爽快に駆け抜けよう。

<link rel="stylesheet" href="{{ '/assets/css/soldier-rush.css' | relative_url }}">


<div id="soldier-rush-game">
  <div class="hud">
    <span class="soldiers">兵士: 10</span>
    <span class="attack">攻撃力: 1</span>
    <span class="time">タイム: 0.0秒</span>
    <span class="best">ベスト: --</span>
  </div>
  <div class="game-area">
    <div class="player"></div>
  </div>
  <div class="arrow-controls">
    <button type="button" class="arrow-left" disabled>← 左</button>
    <button type="button" class="arrow-right" disabled>→ 右</button>
  </div>
  <div class="mode-selection">
    <button type="button" class="mode-fresh">スタート</button>
    <button type="button" class="mode-continue">引き継いでスタート</button>
  </div>
  
  <p class="log">ボタンを押してスタート！</p>
  <div class="progress-info">
    <div>シリーズ進行: Day 3/7</div>
    <div>累計プレイ: <span class="total-plays">0</span>回</div>
  </div>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script src="{{ '/assets/js/soldier-rush-core.js' | relative_url }}"></script>
<script>
initSoldierRushGame({
  rootId: 'soldier-rush-game',
  storageKey: 'aomagame:best:soldier-rush-3',
  playedKey: 'aomagame:played:soldier-rush-3',
  prevStageKey: 'aomagame:last-soldiers:soldier-rush-2',
  nextStageKey: 'aomagame:last-soldiers:soldier-rush-3',
  shareLabel: 'ソルジャーラッシュ3',
  renderer: 'hill',
  allowContinue: true,
  startWithModeButtons: true,
  collectRequiresBreak: false,
  rapidFire: { enabled: true, duration: 15000, interval: 200 },
  gateTypes: [
    { value: 3, type: 'positive', text: '+3', hp: 3 },
    { value: 5, type: 'positive', text: '+5', hp: 5 },
    { value: 7, type: 'positive', text: '+7', hp: 7 },
    { value: 10, type: 'positive', text: '+10', hp: 10 },
    { value: -3, type: 'negative', text: '-3', hp: 3 },
    { value: -5, type: 'negative', text: '-5', hp: 5 },
    { value: -7, type: 'negative', text: '-7', hp: 7 },
    { value: -10, type: 'negative', text: '-10', hp: 10 },
    { value: 2, type: 'multiply', text: '×2', operation: 'multiply' },
    { value: 2, type: 'divide', text: '÷2', operation: 'divide' },
    { value: 0, type: 'rapidfire', text: '⚡' },
    { value: 0, type: 'rapidfire-strong', text: '⚡+', hp: 2, collectRequiresBreak: true }
  ],

    boss: { hp: 70, moveSpeed: 4, attacks: [ { damage: 3, interval: 1500, speed: 4, type: 'direct' }, { damage: 1, interval: 2000, speed: 5, type: 'rain' } ], emoji: '🤖' },
  gateSpawnInterval: 1200,
  playerBulletInterval: 400,
  bossSpawnTime: 20
});
</script>

## 遊び方
1. 「スタート」または「引き継いでスタート」でゲーム開始。
2. 左右ボタン/←→/スワイプで移動。
3. オート射撃でゲートとボスを狙おう。
4. +ゲートで増加、-ゲートで減少。0になるとゲームオーバー。
5. ボス出現後は攻撃を避けつつ撃破を目指す。
- 特徴: 連射/強化連射アイテムで手数アップ。雨弾あり。

## 実装メモ
- Day3/7。火力ブースト初登場。
- 強化版は枠を壊してコア取得。
- 雨弾との両立で動きが忙しい。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
