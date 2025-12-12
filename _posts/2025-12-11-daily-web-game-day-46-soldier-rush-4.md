---
title: "毎日ゲームチャレンジ Day 46: ソルジャーラッシュ4"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

46日目は兵士を集めて敵を倒す「ソルジャーラッシュ4」。
攻めと守りを切り替えながら進むスリリングな防衛戦。

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
      <div class="mode-selection">
        <button type="button" class="mode-fresh">スタート</button>
        <button type="button" class="mode-continue">引き継いでスタート</button>
      </div>
    </div>
  </div>
  <p class="log">ボタンを押してスタート！</p>
  <div class="progress-info">
    <div>シリーズ進行: Day 4/7</div>
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
  storageKey: 'aomagame:best:soldier-rush-4',
  playedKey: 'aomagame:played:soldier-rush-4',
  prevStageKey: 'aomagame:last-soldiers:soldier-rush-3',
  nextStageKey: 'aomagame:last-soldiers:soldier-rush-4',
  shareLabel: 'ソルジャーラッシュ4',
  renderer: 'hill',
  allowContinue: true,
  startWithModeButtons: true,
  collectRequiresBreak: false,
  shield: { enabled: true, duration: 10000 },
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
    { value: 0, type: 'shield', text: '🛡️' },
    { value: 0, type: 'shield-strong', text: '🛡️+', hp: 2, collectRequiresBreak: true }
  ],

    boss: { hp: 50, moveSpeed: 2, attacks: [ { damage: 3, interval: 1500, speed: 4, type: 'direct' }, { damage: 5, interval: 2500, speed: 4, type: 'direct' } ], emoji: '👽' },
  gateSpawnInterval: 1200,
  playerBulletInterval: 400,
  bossSpawnTime: 20
});
</script>

## 遊び方
1. 「スタート」または「引き継いでスタート」でゲーム開始。
2. ←→キーまたはスワイプで移動。
3. オート射撃でゲートとボスを狙おう。
4. +ゲートで増加、-ゲートで減少。0になるとゲームオーバー。
5. ボス出現後は攻撃を避けつつ撃破を目指す。
- 特徴: シールド/強化シールドで生存力アップ。攻撃は3/5ダメの直射。

## 実装メモ
- Day4/7。防御ギミック追加。
- 強化版は枠破壊→コア取得で長時間バリア。
- 直射の火力が上がるのでバリア管理が重要。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
