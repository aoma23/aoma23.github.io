---
title: "毎日ゲームチャレンジ Day 49: ソルジャーラッシュFINAL"
og_image: "/assets/images/games/day49_og.png"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

49日目は兵士を集めて敵を倒す「ソルジャーラッシュFINAL」。
連射もシールドも総動員して、嵐の攻撃を突破する最終決戦へ。

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
    <div>シリーズ進行: Day 7/7 - 最終章</div>
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
  storageKey: 'aomagame:best:soldier-rush-final',
  playedKey: 'aomagame:played:soldier-rush-final',
  prevStageKey: 'aomagame:last-soldiers:soldier-rush-6',
  shareLabel: 'ソルジャーラッシュFINAL',
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

    boss: { hp: 150, moveSpeed: 5, attacks: [ { damage: 3, interval: 1200, speed: 4, type: 'direct' }, { damage: 5, interval: 2200, speed: 4, type: 'direct' }, { damage: 1, interval: 700, speed: 5, type: 'rain' }, { damage: 10, interval: 5000, speed: 4, type: 'direct' } ], emoji: '👑' },
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
- 特徴: 全攻撃（雨1・直射3/5・稀に10）＋全アイテム。

## 実装メモ
- Day7/7 FINAL。全部盛り。
- 強化バフを回して総攻撃を耐え切る。
- 記録更新を狙う最終決戦。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
