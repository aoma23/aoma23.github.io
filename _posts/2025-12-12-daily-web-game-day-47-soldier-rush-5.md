---
title: "毎日ゲームチャレンジ Day 47: ソルジャーラッシュ5"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-46-soldier-rush-4/' | relative_url }}">ソルジャーラッシュ4</a>

47日目は連射とシールドが同時に舞う攻守ブースト回。
バフを回し続ける忙しさと、噛み合った瞬間の爆発力が気持ちいい。
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
    <div>シリーズ進行: Day 5/7</div>
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
  storageKey: 'aomagame:best:soldier-rush-5',
  playedKey: 'aomagame:played:soldier-rush-5',
  prevStageKey: 'aomagame:last-soldiers:soldier-rush-4',
  nextStageKey: 'aomagame:last-soldiers:soldier-rush-5',
  shareLabel: 'ソルジャーラッシュ5',
  renderer: 'hill',
  allowContinue: true,
  startWithModeButtons: true,
  collectRequiresBreak: false,
  rapidFire: { enabled: true, duration: 15000, interval: 200 },
  shield: { enabled: true, duration: 10000 },
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
    { value: 0, type: 'rapidfire-strong', text: '⚡+', hp: 2, collectRequiresBreak: true },
    { value: 0, type: 'shield', text: '🛡️' },
    { value: 0, type: 'shield-strong', text: '🛡️+', hp: 2, collectRequiresBreak: true }
  ],

    boss: { hp: 50, moveSpeed: 2, attacks: [ { damage: 3, interval: 1500, speed: 4, type: 'direct' }, { damage: 5, interval: 2500, speed: 4, type: 'direct' }, { damage: 1, interval: 2000, speed: 5, type: 'rain' } ], emoji: '🐲' },
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
- 特徴: 連射＋シールド＋雨弾＋直射が勢ぞろい。

## 実装メモ
- Day5/7。攻守バフの回転勝負。
- 強化版は枠破壊→コア取得。
- 雨弾・直射の両立で位置取りがシビア。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
