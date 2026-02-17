---
layout: single
title: "aomagame100"
permalink: /games100/
author_profile: false
---

<style>
/* 既存のレイアウト制限を無視して画面幅いっぱいに広げるためのラッパー */
.games-grid {
  width: 96vw; /* 画面幅いっぱい（スクロールバー分少し引く） */
  position: relative;
  left: 50%;
  transform: translateX(-50%); /* 中央寄せで配置 */
  
  display: grid;
  /* 最小幅130pxで自動で埋める。幅に応じて列数が増減する */
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 8px;
  padding: 20px 0;
  will-change: transform; /* コンポジタ層への昇格でちらつき抑制 */
}

.game-card {
  display: block;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  /* z-indexのtransitionは削除 */
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none !important;
  background: #000;
  /* ちらつき防止のおまじない */
  backface-visibility: hidden; 
  -webkit-backface-visibility: hidden;
  transform: translateZ(0); 
}

.game-card:hover {
  transform: scale(1.1) translateZ(0); /* 拡大時もGPU使用 */
  box-shadow: 0 10px 20px rgba(0,0,0,0.4);
  z-index: 100; /* ホバー時は最前面に */
}

.game-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  /* 画像のtransitionは削除してシンプルに */
  opacity: 1.0;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* タイトルとオーバーレイの設定 */
.game-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px 2px 6px;
  /* 文字が見やすいように下から黒のグラデーション */
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 60%, transparent 100%);
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0,0,0,1);
  opacity: 1; /* 常時表示 */
  pointer-events: none; /* ホバーを阻害しない */
}

.day-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0,0,0,0.8);
  color: #fc0; /* 少しゴールドっぽく目立たせる */
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0,0,0,0.5);
  backdrop-filter: blur(2px);
  z-index: 2;
}

@media (min-width: 600px) {
  /* PCなど広い画面では少し大きくても良いが、埋め尽くし感を出すため控えめに */
  .games-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
}
</style>

100日間で100個のゲームを作りました！ぜひ遊んでみてください！🎮

created 2025/10/27〜2026/02/03

<div class="games-grid">
  <!-- Day 1 -->
  <a href="/daily-web-game-day-1-reaction-timer/" class="game-card">
    <div class="day-badge">Day 1</div>
    <img src="/assets/images/games/day1_og.png" alt="Reaction Timer" class="game-thumbnail">
    <div class="game-overlay">Reaction Timer</div>
  </a>

  <!-- Day 2 -->
  <a href="/daily-web-game-day-2-rgb-quiz/" class="game-card">
    <div class="day-badge">Day 2</div>
    <img src="/assets/images/games/day2_og.png" alt="Color Match" class="game-thumbnail">
    <div class="game-overlay">Color Match</div>
  </a>

  <!-- Day 3 -->
  <a href="/daily-web-game-day-3-mental-math-sprint/" class="game-card">
    <div class="day-badge">Day 3</div>
    <img src="/assets/images/games/day3_og.png" alt="Math Sprint" class="game-thumbnail">
    <div class="game-overlay">Math Sprint</div>
  </a>

  <!-- Day 4 -->
  <a href="/daily-web-game-day-4-catching-stars/" class="game-card">
    <div class="day-badge">Day 4</div>
    <img src="/assets/images/games/day4_og.png" alt="Catching Stars" class="game-thumbnail">
    <div class="game-overlay">Catching Stars</div>
  </a>

  <!-- Day 5 -->
  <a href="/daily-web-game-day-5-memory-beats/" class="game-card">
    <div class="day-badge">Day 5</div>
    <img src="/assets/images/games/day5_og.png" alt="Memory Beats" class="game-thumbnail">
    <div class="game-overlay">Memory Beats</div>
  </a>

  <!-- Day 6 -->
  <a href="/daily-web-game-day-6-click-burst/" class="game-card">
    <div class="day-badge">Day 6</div>
    <img src="/assets/images/games/day6_og.png" alt="Click Burst" class="game-thumbnail">
    <div class="game-overlay">Click Burst</div>
  </a>

  <!-- Day 7 -->
  <a href="/daily-web-game-day-7-mini-minesweeper/" class="game-card">
    <div class="day-badge">Day 7</div>
    <img src="/assets/images/games/day7_og.png" alt="Mini Minesweeper" class="game-thumbnail">
    <div class="game-overlay">Mini Minesweeper</div>
  </a>

  <!-- Day 8 -->
  <a href="/daily-web-game-day-8-number-chase/" class="game-card">
    <div class="day-badge">Day 8</div>
    <img src="/assets/images/games/day8_og.png" alt="Number Chase" class="game-thumbnail">
    <div class="game-overlay">Number Chase</div>
  </a>

  <!-- Day 9 -->
  <a href="/daily-web-game-day-9-word-sprint/" class="game-card">
    <div class="day-badge">Day 9</div>
    <img src="/assets/images/games/day9_og.png" alt="Word Sprint" class="game-thumbnail">
    <div class="game-overlay">Word Sprint</div>
  </a>

  <!-- Day 10 -->
  <a href="/daily-web-game-day-10-light-logic/" class="game-card">
    <div class="day-badge">Day 10</div>
    <img src="/assets/images/games/day10_og.png" alt="Light Logic" class="game-thumbnail">
    <div class="game-overlay">Light Logic</div>
  </a>

  <!-- Day 11 -->
  <a href="/daily-web-game-day-11-beat-bar/" class="game-card">
    <div class="day-badge">Day 11</div>
    <img src="/assets/images/games/day11_og.png" alt="Beat Bar" class="game-thumbnail">
    <div class="game-overlay">Beat Bar</div>
  </a>

  <!-- Day 12 -->
  <a href="/daily-web-game-day-12-maze-dash/" class="game-card">
    <div class="day-badge">Day 12</div>
    <img src="/assets/images/games/day12_og.png" alt="Maze Dash" class="game-thumbnail">
    <div class="game-overlay">Maze Dash</div>
  </a>

  <!-- Day 13 -->
  <a href="/daily-web-game-day-13-stroop-sprint/" class="game-card">
    <div class="day-badge">Day 13</div>
    <img src="/assets/images/games/day13_og.png" alt="Stroop Sprint" class="game-thumbnail">
    <div class="game-overlay">Stroop Sprint</div>
  </a>

  <!-- Day 14 -->
  <a href="/daily-web-game-day-14-emoji-match/" class="game-card">
    <div class="day-badge">Day 14</div>
    <img src="/assets/images/games/day14_og.png" alt="Emoji Match" class="game-thumbnail">
    <div class="game-overlay">Emoji Match</div>
  </a>

  <!-- Day 15 -->
  <a href="/daily-web-game-day-15-sound-memory/" class="game-card">
    <div class="day-badge">Day 15</div>
    <img src="/assets/images/games/day15_og.png" alt="Sound Memory" class="game-thumbnail">
    <div class="game-overlay">Sound Memory</div>
  </a>

  <!-- Day 16 -->
  <a href="/daily-web-game-day-16-vector-escape/" class="game-card">
    <div class="day-badge">Day 16</div>
    <img src="/assets/images/games/day16_og.png" alt="Vector Escape" class="game-thumbnail">
    <div class="game-overlay">Vector Escape</div>
  </a>

  <!-- Day 17 -->
  <a href="/daily-web-game-day-17-clock-align/" class="game-card">
    <div class="day-badge">Day 17</div>
    <img src="/assets/images/games/day17_og.png" alt="Clock Align" class="game-thumbnail">
    <div class="game-overlay">Clock Align</div>
  </a>

  <!-- Day 18 -->
  <a href="/daily-web-game-day-18-pattern-grid/" class="game-card">
    <div class="day-badge">Day 18</div>
    <img src="/assets/images/games/day18_og.png" alt="Pattern Grid" class="game-thumbnail">
    <div class="game-overlay">Pattern Grid</div>
  </a>

  <!-- Day 19 -->
  <a href="/daily-web-game-day-19-equation-drop/" class="game-card">
    <div class="day-badge">Day 19</div>
    <img src="/assets/images/games/day19_og.png" alt="Equation Drop" class="game-thumbnail">
    <div class="game-overlay">Equation Drop</div>
  </a>

  <!-- Day 20 -->
  <a href="/daily-web-game-day-20-color-balance/" class="game-card">
    <div class="day-badge">Day 20</div>
    <img src="/assets/images/games/day20_og.png" alt="Color Balance" class="game-thumbnail">
    <div class="game-overlay">Color Balance</div>
  </a>

  <!-- Day 21 -->
  <a href="/daily-web-game-day-21-sequence-runner/" class="game-card">
    <div class="day-badge">Day 21</div>
    <img src="/assets/images/games/day21_og.png" alt="Sequence Runner" class="game-thumbnail">
    <div class="game-overlay">Sequence Runner</div>
  </a>

  <!-- Day 22 -->
  <a href="/daily-web-game-day-22-track-tap/" class="game-card">
    <div class="day-badge">Day 22</div>
    <img src="/assets/images/games/day22_og.png" alt="Track Tap" class="game-thumbnail">
    <div class="game-overlay">Track Tap</div>
  </a>

  <!-- Day 23 -->
  <a href="/daily-web-game-day-23-shape-sorter/" class="game-card">
    <div class="day-badge">Day 23</div>
    <img src="/assets/images/games/day23_og.png" alt="Shape Sorter" class="game-thumbnail">
    <div class="game-overlay">Shape Sorter</div>
  </a>

  <!-- Day 24 -->
  <a href="/daily-web-game-day-24-orbit-defender/" class="game-card">
    <div class="day-badge">Day 24</div>
    <img src="/assets/images/games/day24_og.png" alt="Orbit Defender" class="game-thumbnail">
    <div class="game-overlay">Orbit Defender</div>
  </a>

  <!-- Day 25 -->
  <a href="/daily-web-game-day-25-pixel-painter/" class="game-card">
    <div class="day-badge">Day 25</div>
    <img src="/assets/images/games/day25_og.png" alt="Pixel Painter" class="game-thumbnail">
    <div class="game-overlay">Pixel Painter</div>
  </a>

  <!-- Day 26 -->
  <a href="/daily-web-game-day-26-quick-stack/" class="game-card">
    <div class="day-badge">Day 26</div>
    <img src="/assets/images/games/day26_og.png" alt="Quick Stack" class="game-thumbnail">
    <div class="game-overlay">Quick Stack</div>
  </a>

  <!-- Day 27 -->
  <a href="/daily-web-game-day-27-weight-balancer/" class="game-card">
    <div class="day-badge">Day 27</div>
    <img src="/assets/images/games/day27_og.png" alt="Weight Balancer" class="game-thumbnail">
    <div class="game-overlay">Weight Balancer</div>
  </a>

  <!-- Day 28 -->
  <a href="/daily-web-game-day-28-emoji-cafe/" class="game-card">
    <div class="day-badge">Day 28</div>
    <img src="/assets/images/games/day28_og.png" alt="Emoji Cafe" class="game-thumbnail">
    <div class="game-overlay">Emoji Cafe</div>
  </a>

  <!-- Day 29 -->
  <a href="/daily-web-game-day-29-swap-sorter/" class="game-card">
    <div class="day-badge">Day 29</div>
    <img src="/assets/images/games/day29_og.png" alt="Swap Sorter" class="game-thumbnail">
    <div class="game-overlay">Swap Sorter</div>
  </a>

  <!-- Day 30 -->
  <a href="/daily-web-game-day-30-prime-dash/" class="game-card">
    <div class="day-badge">Day 30</div>
    <img src="/assets/images/games/day30_og.png" alt="Prime Dash" class="game-thumbnail">
    <div class="game-overlay">Prime Dash</div>
  </a>

  <!-- Day 31 -->
  <a href="/daily-web-game-day-31-hue-harmony/" class="game-card">
    <div class="day-badge">Day 31</div>
    <img src="/assets/images/games/day31_og.png" alt="ヒューハーモニー" class="game-thumbnail">
    <div class="game-overlay">ヒューハーモニー</div>
  </a>

  <!-- Day 32 -->
  <a href="/daily-web-game-day-32-letter-sweep/" class="game-card">
    <div class="day-badge">Day 32</div>
    <img src="/assets/images/games/day32_og.png" alt="レタースイープ" class="game-thumbnail">
    <div class="game-overlay">レタースイープ</div>
  </a>

  <!-- Day 33 -->
  <a href="/daily-web-game-day-33-operator-rush/" class="game-card">
    <div class="day-badge">Day 33</div>
    <img src="/assets/images/games/day33_og.png" alt="オペレーターダッシュ" class="game-thumbnail">
    <div class="game-overlay">オペレーターダッシュ</div>
  </a>

  <!-- Day 34 -->
  <a href="/daily-web-game-day-34-fraction-duel/" class="game-card">
    <div class="day-badge">Day 34</div>
    <img src="/assets/images/games/day34_og.png" alt="フラクションデュエル" class="game-thumbnail">
    <div class="game-overlay">フラクションデュエル</div>
  </a>

  <!-- Day 35 -->
  <a href="/daily-web-game-day-35-number-ladder/" class="game-card">
    <div class="day-badge">Day 35</div>
    <img src="/assets/images/games/day35_og.png" alt="ナンバーラダー" class="game-thumbnail">
    <div class="game-overlay">ナンバーラダー</div>
  </a>

  <!-- Day 36 -->
  <a href="/daily-web-game-day-36-multiple-match/" class="game-card">
    <div class="day-badge">Day 36</div>
    <img src="/assets/images/games/day36_og.png" alt="マルチプルマッチ" class="game-thumbnail">
    <div class="game-overlay">マルチプルマッチ</div>
  </a>

  <!-- Day 37 -->
  <a href="/daily-web-game-day-37-compass-tap/" class="game-card">
    <div class="day-badge">Day 37</div>
    <img src="/assets/images/games/day37_og.png" alt="コンパスタップ" class="game-thumbnail">
    <div class="game-overlay">コンパスタップ</div>
  </a>

  <!-- Day 38 -->
  <a href="/daily-web-game-day-38-ascend-grid/" class="game-card">
    <div class="day-badge">Day 38</div>
    <img src="/assets/images/games/day38_og.png" alt="スカイストライカー" class="game-thumbnail">
    <div class="game-overlay">スカイストライカー</div>
  </a>

  <!-- Day 39 -->
  <a href="/daily-web-game-day-39-color-clash/" class="game-card">
    <div class="day-badge">Day 39</div>
    <img src="/assets/images/games/day39_og.png" alt="カラークラッシュ" class="game-thumbnail">
    <div class="game-overlay">カラークラッシュ</div>
  </a>

  <!-- Day 40 -->
  <a href="/daily-web-game-day-40-sum-snap/" class="game-card">
    <div class="day-badge">Day 40</div>
    <img src="/assets/images/games/day40_og.png" alt="サムスナップ" class="game-thumbnail">
    <div class="game-overlay">サムスナップ</div>
  </a>

  <!-- Day 41 -->
  <a href="/daily-web-game-day-41-one-move-puzzle/" class="game-card">
    <div class="day-badge">Day 41</div>
    <img src="/assets/images/games/day41_og.png" alt="ワンムーブパズル" class="game-thumbnail">
    <div class="game-overlay">ワンムーブパズル</div>
  </a>

  <!-- Day 42 -->
  <a href="/daily-web-game-day-42-merge-slide/" class="game-card">
    <div class="day-badge">Day 42</div>
    <img src="/assets/images/games/day42_og.png" alt="マージスライド" class="game-thumbnail">
    <div class="game-overlay">マージスライド</div>
  </a>

  <!-- Day 43 -->
  <a href="/daily-web-game-day-43-soldier-rush/" class="game-card">
    <div class="day-badge">Day 43</div>
    <img src="/assets/images/games/day43_og.png" alt="ソルジャーラッシュ" class="game-thumbnail">
    <div class="game-overlay">ソルジャーラッシュ</div>
  </a>

  <!-- Day 44 -->
  <a href="/daily-web-game-day-44-soldier-rush-2/" class="game-card">
    <div class="day-badge">Day 44</div>
    <img src="/assets/images/games/day44_og.png" alt="ソルジャーラッシュ2" class="game-thumbnail">
    <div class="game-overlay">ソルジャーラッシュ2</div>
  </a>

  <!-- Day 45 -->
  <a href="/daily-web-game-day-45-soldier-rush-3/" class="game-card">
    <div class="day-badge">Day 45</div>
    <img src="/assets/images/games/day45_og.png" alt="ソルジャーラッシュ3" class="game-thumbnail">
    <div class="game-overlay">ソルジャーラッシュ3</div>
  </a>

  <!-- Day 46 -->
  <a href="/daily-web-game-day-46-soldier-rush-4/" class="game-card">
    <div class="day-badge">Day 46</div>
    <img src="/assets/images/games/day46_og.png" alt="ソルジャーラッシュ4" class="game-thumbnail">
    <div class="game-overlay">ソルジャーラッシュ4</div>
  </a>

  <!-- Day 47 -->
  <a href="/daily-web-game-day-47-soldier-rush-5/" class="game-card">
    <div class="day-badge">Day 47</div>
    <img src="/assets/images/games/day47_og.png" alt="ソルジャーラッシュ5" class="game-thumbnail">
    <div class="game-overlay">ソルジャーラッシュ5</div>
  </a>

  <!-- Day 48 -->
  <a href="/daily-web-game-day-48-soldier-rush-6/" class="game-card">
    <div class="day-badge">Day 48</div>
    <img src="/assets/images/games/day48_og.png" alt="ソルジャーラッシュ6" class="game-thumbnail">
    <div class="game-overlay">ソルジャーラッシュ6</div>
  </a>

  <!-- Day 49 -->
  <a href="/daily-web-game-day-49-soldier-rush-final/" class="game-card">
    <div class="day-badge">Day 49</div>
    <img src="/assets/images/games/day49_og.png" alt="ソルジャーラッシュFINAL" class="game-thumbnail">
    <div class="game-overlay">ソルジャーラッシュFINAL</div>
  </a>

  <!-- Day 50 -->
  <a href="/daily-web-game-day-50-golden-break/" class="game-card">
    <div class="day-badge">Day 50</div>
    <img src="/assets/images/games/day50_og.png" alt="ゴールデンブレイク" class="game-thumbnail">
    <div class="game-overlay">ゴールデンブレイク</div>
  </a>

  <!-- Day 51 -->
  <a href="/daily-web-game-day-51-giraffe-high-reach/" class="game-card">
    <div class="day-badge">Day 51</div>
    <img src="/assets/images/games/day51_og.png" alt="キリンのハイリーチ" class="game-thumbnail">
    <div class="game-overlay">キリンのハイリーチ</div>
  </a>

  <!-- Day 52 -->
  <a href="/daily-web-game-day-52-penguin-fish-dive/" class="game-card">
    <div class="day-badge">Day 52</div>
    <img src="/assets/images/games/day52_og.png" alt="ペンギンのフィッシュダイブ" class="game-thumbnail">
    <div class="game-overlay">ペンギンのフィッシュダイブ</div>
  </a>

  <!-- Day 53 -->
  <a href="/daily-web-game-day-53-kangaroo-hop-race/" class="game-card">
    <div class="day-badge">Day 53</div>
    <img src="/assets/images/games/day53_og.png" alt="カンガルーのホップレース" class="game-thumbnail">
    <div class="game-overlay">カンガルーのホップレース</div>
  </a>

  <!-- Day 54 -->
  <a href="/daily-web-game-day-54-squirrel-nut-catch/" class="game-card">
    <div class="day-badge">Day 54</div>
    <img src="/assets/images/games/day54_og.png" alt="リスのナッツキャッチ" class="game-thumbnail">
    <div class="game-overlay">リスのナッツキャッチ</div>
  </a>

  <!-- Day 55 -->
  <a href="/daily-web-game-day-55-chameleon-tongue-snap/" class="game-card">
    <div class="day-badge">Day 55</div>
    <img src="/assets/images/games/day55_og.png" alt="カメレオンのタンスナップ" class="game-thumbnail">
    <div class="game-overlay">カメレオンのタンスナップ</div>
  </a>

  <!-- Day 56 -->
  <a href="/daily-web-game-day-56-bee-flower-dash/" class="game-card">
    <div class="day-badge">Day 56</div>
    <img src="/assets/images/games/day56_og.png" alt="ハチのフラワーダッシュ" class="game-thumbnail">
    <div class="game-overlay">ハチのフラワーダッシュ</div>
  </a>

  <!-- Day 57 -->
  <a href="/daily-web-game-day-57-monkey-vine-swing/" class="game-card">
    <div class="day-badge">Day 57</div>
    <img src="/assets/images/games/day57_og.png" alt="サルのツルスイング" class="game-thumbnail">
    <div class="game-overlay">サルのツルスイング</div>
  </a>

  <!-- Day 58 -->
  <a href="/daily-web-game-day-58-snake-mouse-hunt/" class="game-card">
    <div class="day-badge">Day 58</div>
    <img src="/assets/images/games/day58_og.png" alt="ヘビのマウスハント" class="game-thumbnail">
    <div class="game-overlay">ヘビのマウスハント</div>
  </a>

  <!-- Day 59 -->
  <a href="/daily-web-game-day-59-otter-dive-fish/" class="game-card">
    <div class="day-badge">Day 59</div>
    <img src="/assets/images/games/day59_og.png" alt="カワウソのダイブフィッシュ" class="game-thumbnail">
    <div class="game-overlay">カワウソのダイブフィッシュ</div>
  </a>

  <!-- Day 60 -->
  <a href="/daily-web-game-day-60-spider-web-trap/" class="game-card">
    <div class="day-badge">Day 60</div>
    <img src="/assets/images/games/day60_og.png" alt="クモのウェブトラップ" class="game-thumbnail">
    <div class="game-overlay">クモのウェブトラップ</div>
  </a>

  <!-- Day 61 -->
  <a href="/daily-web-game-day-61-elephant-golf/" class="game-card">
    <div class="day-badge">Day 61</div>
    <img src="/assets/images/games/day61_og.png" alt="ゾウのゴルフ" class="game-thumbnail">
    <div class="game-overlay">ゾウのゴルフ</div>
  </a>

  <!-- Day 62 -->
  <a href="/daily-web-game-day-62-penguin-ice-slide/" class="game-card">
    <div class="day-badge">Day 62</div>
    <img src="/assets/images/games/day62_og.png" alt="ペンギンのアイススライド" class="game-thumbnail">
    <div class="game-overlay">ペンギンのアイススライド</div>
  </a>

  <!-- Day 63 -->
  <a href="/daily-web-game-day-63-monkey-coconut-catch/" class="game-card">
    <div class="day-badge">Day 63</div>
    <img src="/assets/images/games/day63_og.png" alt="サルのココナッツキャッチ" class="game-thumbnail">
    <div class="game-overlay">サルのココナッツキャッチ</div>
  </a>

  <!-- Day 64 -->
  <a href="/daily-web-game-day-64-rabbit-jump-race/" class="game-card">
    <div class="day-badge">Day 64</div>
    <img src="/assets/images/games/day64_og.png" alt="ウサギのジャンプレース" class="game-thumbnail">
    <div class="game-overlay">ウサギのジャンプレース</div>
  </a>

  <!-- Day 65 -->
  <a href="/daily-web-game-day-65-giraffe-fruit-tower/" class="game-card">
    <div class="day-badge">Day 65</div>
    <img src="/assets/images/games/day65_og.png" alt="キリンのフルーツタワー" class="game-thumbnail">
    <div class="game-overlay">キリンのフルーツタワー</div>
  </a>

  <!-- Day 66 -->
  <a href="/daily-web-game-day-66-midnight-fireworks/" class="game-card">
    <div class="day-badge">Day 66</div>
    <img src="/assets/images/games/day66_og.png" alt="真夜中の花火 (Midnight Fireworks)" class="game-thumbnail">
    <div class="game-overlay">真夜中の花火 (Midnight Fireworks)</div>
  </a>

  <!-- Day 67 -->
  <a href="/daily-web-game-day-67-golden-sunrise/" class="game-card">
    <div class="day-badge">Day 67</div>
    <img src="/assets/images/games/day67_og.png" alt="初日の出クライマー (Golden Sunrise)" class="game-thumbnail">
    <div class="game-overlay">初日の出クライマー (Golden Sunrise)</div>
  </a>

  <!-- Day 68 -->
  <a href="/daily-web-game-day-68-neon-drift/" class="game-card">
    <div class="day-badge">Day 68</div>
    <img src="/assets/images/games/day68_og.png" alt="ネオン・ドリフト (Neon Drift)" class="game-thumbnail">
    <div class="game-overlay">ネオン・ドリフト (Neon Drift)</div>
  </a>

  <!-- Day 69 -->
  <a href="/daily-web-game-day-69-prism-breaker/" class="game-card">
    <div class="day-badge">Day 69</div>
    <img src="/assets/images/games/day69_og.png" alt="プリズム・ブレイカー (Prism Breaker)" class="game-thumbnail">
    <div class="game-overlay">プリズム・ブレイカー (Prism Breaker)</div>
  </a>

  <!-- Day 70 -->
  <a href="/daily-web-game-day-70-void-rush/" class="game-card">
    <div class="day-badge">Day 70</div>
    <img src="/assets/images/games/day70_og.png" alt="ヴォイド・ラッシュ (Void Rush)" class="game-thumbnail">
    <div class="game-overlay">ヴォイド・ラッシュ (Void Rush)</div>
  </a>

  <!-- Day 71 -->
  <a href="/daily-web-game-day-71-shadow-runner/" class="game-card">
    <div class="day-badge">Day 71</div>
    <img src="/assets/images/games/day71_og.png" alt="シャドウ・ランナー (Shadow Runner)" class="game-thumbnail">
    <div class="game-overlay">シャドウ・ランナー (Shadow Runner)</div>
  </a>

  <!-- Day 72 -->
  <a href="/daily-web-game-day-72-cyber-protocol/" class="game-card">
    <div class="day-badge">Day 72</div>
    <img src="/assets/images/games/day72_og.png" alt="サイバー・プロトコル (Cyber Protocol)" class="game-thumbnail">
    <div class="game-overlay">サイバー・プロトコル (Cyber Protocol)</div>
  </a>

  <!-- Day 73 -->
  <a href="/daily-web-game-day-73-gravity-golf/" class="game-card">
    <div class="day-badge">Day 73</div>
    <img src="/assets/images/games/day73_og.png" alt="グラビティ・ゴルフ (Gravity Golf)" class="game-thumbnail">
    <div class="game-overlay">グラビティ・ゴルフ (Gravity Golf)</div>
  </a>

  <!-- Day 74 -->
  <a href="/daily-web-game-day-74-chroma-shift/" class="game-card">
    <div class="day-badge">Day 74</div>
    <img src="/assets/images/games/day74_og.png" alt="クロマ・シフト (Chroma Shift)" class="game-thumbnail">
    <div class="game-overlay">クロマ・シフト (Chroma Shift)</div>
  </a>

  <!-- Day 75 -->
  <a href="/daily-web-game-day-75-echo-dungeon/" class="game-card">
    <div class="day-badge">Day 75</div>
    <img src="/assets/images/games/day75_og.png" alt="エコー・ダンジョン (Echo Dungeon)" class="game-thumbnail">
    <div class="game-overlay">エコー・ダンジョン (Echo Dungeon)</div>
  </a>

  <!-- Day 76 -->
  <a href="/daily-web-game-day-76-time-loop/" class="game-card">
    <div class="day-badge">Day 76</div>
    <img src="/assets/images/games/day76_og.png" alt="タイム・ループ (Time Loop)" class="game-thumbnail">
    <div class="game-overlay">タイム・ループ (Time Loop)</div>
  </a>

  <!-- Day 77 -->
  <a href="/daily-web-game-day-77-magnet-core/" class="game-card">
    <div class="day-badge">Day 77</div>
    <img src="/assets/images/games/day77_og.png" alt="マグネット・コア (Magnet Core)" class="game-thumbnail">
    <div class="game-overlay">マグネット・コア (Magnet Core)</div>
  </a>

  <!-- Day 78 -->
  <a href="/daily-web-game-day-78-paper-plane/" class="game-card">
    <div class="day-badge">Day 78</div>
    <img src="/assets/images/games/day78_og.png" alt="ペーパー・プレーン (Paper Plane)" class="game-thumbnail">
    <div class="game-overlay">ペーパー・プレーン (Paper Plane)</div>
  </a>

  <!-- Day 79 -->
  <a href="/daily-web-game-day-79-beat-circle/" class="game-card">
    <div class="day-badge">Day 79</div>
    <img src="/assets/images/games/day79_og.png" alt="ビート・サークル (Beat Circle)" class="game-thumbnail">
    <div class="game-overlay">ビート・サークル (Beat Circle)</div>
  </a>

  <!-- Day 80 -->
  <a href="/daily-web-game-day-80-the-colossus/" class="game-card">
    <div class="day-badge">Day 80</div>
    <img src="/assets/images/games/day80_og.png" alt="ザ・コロッサス (The Colossus)" class="game-thumbnail">
    <div class="game-overlay">ザ・コロッサス (The Colossus)</div>
  </a>

  <!-- Day 81 -->
  <a href="/daily-web-game-day-81-dungeon-step/" class="game-card">
    <div class="day-badge">Day 81</div>
    <img src="/assets/images/games/day81_og.png" alt="ダンジョン・ステップ (Dungeon Step)" class="game-thumbnail">
    <div class="game-overlay">ダンジョン・ステップ (Dungeon Step)</div>
  </a>

  <!-- Day 82 -->
  <a href="/daily-web-game-day-82-inventory-hero/" class="game-card">
    <div class="day-badge">Day 82</div>
    <img src="/assets/images/games/day82_og.png" alt="インベントリ・ヒーロー (Inventory Hero)" class="game-thumbnail">
    <div class="game-overlay">インベントリ・ヒーロー (Inventory Hero)</div>
  </a>

  <!-- Day 83 -->
  <a href="/daily-web-game-day-83-critical-timing/" class="game-card">
    <div class="day-badge">Day 83</div>
    <img src="/assets/images/games/day83_og.png" alt="クリティカル・タイミング (Critical Timing)" class="game-thumbnail">
    <div class="game-overlay">クリティカル・タイミング (Critical Timing)</div>
  </a>

  <!-- Day 84 -->
  <a href="/daily-web-game-day-84-potion-brewer/" class="game-card">
    <div class="day-badge">Day 84</div>
    <img src="/assets/images/games/day84_og.png" alt="ポーション・ブリュワー (Potion Brewer)" class="game-thumbnail">
    <div class="game-overlay">ポーション・ブリュワー (Potion Brewer)</div>
  </a>

  <!-- Day 85 -->
  <a href="/daily-web-game-day-85-blacksmith-rhythm/" class="game-card">
    <div class="day-badge">Day 85</div>
    <img src="/assets/images/games/day85_og.png" alt="ブラックスミス・リズム (Blacksmith Rhythm)" class="game-thumbnail">
    <div class="game-overlay">ブラックスミス・リズム (Blacksmith Rhythm)</div>
  </a>

  <!-- Day 86 -->
  <a href="/daily-web-game-day-86-golem-defense/" class="game-card">
    <div class="day-badge">Day 86</div>
    <img src="/assets/images/games/day86_og.png" alt="ゴーレム・ディフェンス (Golem Defense)" class="game-thumbnail">
    <div class="game-overlay">ゴーレム・ディフェンス (Golem Defense)</div>
  </a>

  <!-- Day 87 -->
  <a href="/daily-web-game-day-87-hunters-aim/" class="game-card">
    <div class="day-badge">Day 87</div>
    <img src="/assets/images/games/day87_og.png" alt="ハンターズ・エイム (Hunter's Aim)" class="game-thumbnail">
    <div class="game-overlay">ハンターズ・エイム (Hunter's Aim)</div>
  </a>

  <!-- Day 88 -->
  <a href="/daily-web-game-day-88-guild-master/" class="game-card">
    <div class="day-badge">Day 88</div>
    <img src="/assets/images/games/day88_og.png" alt="ダンジョン・カード (Dungeon Cards)" class="game-thumbnail">
    <div class="game-overlay">ダンジョン・カード (Dungeon Cards)</div>
  </a>

  <!-- Day 89 -->
  <a href="/daily-web-game-day-89-mimic-search/" class="game-card">
    <div class="day-badge">Day 89</div>
    <img src="/assets/images/games/day89_og.png" alt="ミミック・サーチ (Mimic Search)" class="game-thumbnail">
    <div class="game-overlay">ミミック・サーチ (Mimic Search)</div>
  </a>

  <!-- Day 90 -->
  <a href="/daily-web-game-day-90-the-last-boss/" class="game-card">
    <div class="day-badge">Day 90</div>
    <img src="/assets/images/games/day90_og.png" alt="ザ・ラスト・ボス (The Last Boss)" class="game-thumbnail">
    <div class="game-overlay">ザ・ラスト・ボス (The Last Boss)</div>
  </a>

  <!-- Day 91 -->
  <a href="/daily-web-game-day-91-healing-cats/" class="game-card">
    <div class="day-badge">Day 91</div>
    <img src="/assets/images/games/day91_og.png" alt="癒しの猫広場 (Healing Cat Square)" class="game-thumbnail">
    <div class="game-overlay">癒しの猫広場 (Healing Cat Square)</div>
  </a>

  <!-- Day 92 -->
  <a href="/daily-web-game-day-92-cyber-drift/" class="game-card">
    <div class="day-badge">Day 92</div>
    <img src="/assets/images/games/day92_og.png" alt="Cyber Drift (サイバードリフト)" class="game-thumbnail">
    <div class="game-overlay">Cyber Drift (サイバードリフト)</div>
  </a>

  <!-- Day 93 -->
  <a href="/daily-web-game-day-93-star-link/" class="game-card">
    <div class="day-badge">Day 93</div>
    <img src="/assets/images/games/day93_og.png" alt="Star Link (スターリンク)" class="game-thumbnail">
    <div class="game-overlay">Star Link (スターリンク)</div>
  </a>

  <!-- Day 94 -->
  <a href="/daily-web-game-day-94-liquid-flow/" class="game-card">
    <div class="day-badge">Day 94</div>
    <img src="/assets/images/games/day94_og.png" alt="Liquid Flow (リキッド・フロー)" class="game-thumbnail">
    <div class="game-overlay">Liquid Flow (リキッド・フロー)</div>
  </a>

  <!-- Day 95 -->
  <a href="/daily-web-game-day-95-laser-mirror/" class="game-card">
    <div class="day-badge">Day 95</div>
    <img src="/assets/images/games/day95_og.png" alt="Laser Mirror (レーザー・ミラー)" class="game-thumbnail">
    <div class="game-overlay">Laser Mirror (レーザー・ミラー)</div>
  </a>

  <!-- Day 96 -->
  <a href="/daily-web-game-day-96-drill-down/" class="game-card">
    <div class="day-badge">Day 96</div>
    <img src="/assets/images/games/day96_og.png" alt="Drill Down (ドリル・ダウン)" class="game-thumbnail">
    <div class="game-overlay">Drill Down (ドリル・ダウン)</div>
  </a>

  <!-- Day 97 -->
  <a href="/daily-web-game-day-97-ripple-reaction/" class="game-card">
    <div class="day-badge">Day 97</div>
    <img src="/assets/images/games/day97_og.png" alt="Ripple Reaction (リップル・リアクション)" class="game-thumbnail">
    <div class="game-overlay">Ripple Reaction (リップル・リアクション)</div>
  </a>

  <!-- Day 98 -->
  <a href="/daily-web-game-day-98-stealth-shade/" class="game-card">
    <div class="day-badge">Day 98</div>
    <img src="/assets/images/games/day98_og.png" alt="Stealth Shade (ステルス・シェイド)" class="game-thumbnail">
    <div class="game-overlay">Stealth Shade (ステルス・シェイド)</div>
  </a>

  <!-- Day 99 -->
  <a href="/daily-web-game-day-99-cube-fit/" class="game-card">
    <div class="day-badge">Day 99</div>
    <img src="/assets/images/games/day99_og.png" alt="Cube Fit (キューブ・フィット)" class="game-thumbnail">
    <div class="game-overlay">Cube Fit (キューブ・フィット)</div>
  </a>

  <!-- Day 100 -->
  <a href="/daily-web-game-day-100-tetra-trinity/" class="game-card">
    <div class="day-badge">Day 100</div>
    <img src="/assets/images/games/day100_og.png" alt="Tetra Trinity (テトラ・トリニティ)" class="game-thumbnail">
    <div class="game-overlay">Tetra Trinity (テトラ・トリニティ)</div>
  </a>

</div>