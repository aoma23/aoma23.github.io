---
title: "毎日ゲームチャレンジ Day 43: ソルジャーラッシュ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  

43日目は兵士を集めて敵を倒す「ソルジャーラッシュ」。左右に移動しながらゲートを通過して兵士を増やし、オート射撃でボスを倒しましょう！7日間続く連続ストーリーの第1章です。
シンプルな±ゲートで肩慣らし。まずは兵士を育ててボスに挑もう。
<link rel="stylesheet" href="{{ '/assets/css/soldier-rush.css' | relative_url }}">


<div id="soldier-rush-game">
  <div class="hud">
    <span class="soldiers">兵士: 10</span>
    <span class="attack">攻撃力: 1</span>
    <span class="time">タイム:0.0秒</span>
    <span class="best">ベスト:--</span>
  </div>
  <div class="game-area">
    <div class="player"></div>
    <div class="start-overlay">
      <button type="button" class="start">スタート</button>
    </div>
  </div>
  <p class="log">左右移動でゲートを通過！兵士を増やしてボスを倒そう（オート射撃）</p>
  <div class="progress-info">
    <div>シリーズ進行: Day 1/7 - 基礎編</div>
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
  storageKey: 'aomagame:best:soldier-rush-1',
  playedKey: 'aomagame:played:soldier-rush-1',
  nextStageKey: 'aomagame:last-soldiers:soldier-rush-1',
  shareLabel: 'ソルジャーラッシュ',
  renderer: 'hill',
  collectRequiresBreak: false,
  gateTypes: [
    { value: 3, type: 'positive', text: '+3', hp: 3 },
    { value: 5, type: 'positive', text: '+5', hp: 5 },
    { value: 7, type: 'positive', text: '+7', hp: 7 },
    { value: 10, type: 'positive', text: '+10', hp: 10 },
    { value: -3, type: 'negative', text: '-3', hp: 3 },
    { value: -5, type: 'negative', text: '-5', hp: 5 },
    { value: -7, type: 'negative', text: '-7', hp: 7 },
    { value: -10, type: 'negative', text: '-10', hp: 10 }
  ],
  boss: { hp: 50, moveSpeed: 2, attacks: [ { damage: 3, interval: 1500, speed: 4, type: 'direct' } ] },
  gateSpawnInterval: 1200,
  playerBulletInterval: 400,
  bossSpawnTime: 20
});
</script>

## 遊び方
1. 「スタート」でゲーム開始。
2. ←→キーまたはスワイプで移動。
3. オート射撃でゲートとボスを狙おう。
4. +ゲートで増加、-ゲートで減少。0になるとゲームオーバー。
5. ボス出現後は攻撃を避けつつ撃破を目指す。
- 特徴: ±ゲートのみの基本戦。

## 実装メモ
- シリーズDay1/7の基礎回。
- 攻撃パターンはシンプルに直射のみ。
- まずは動きとゲート選びに慣れる回。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
