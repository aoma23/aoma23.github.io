---
title: "毎日ゲームチャレンジ Day 66: 真夜中の花火 (Midnight Fireworks)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-65-giraffe-fruit-tower/' | relative_url }}">キリンのフルーツタワー</a>

66日目は「真夜中の花火」。大晦日にぴったりの、連鎖する花火ゲームです。
画面をタップして花火を打ち上げ、空中の火種に当てて連鎖爆発を起こそう！美しく輝く光の連鎖で高得点を目指せ！

<style>
#fireworks-game {
  width: 100%;
  max-width: 600px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 16px;
  background: #000;
  color: #fff;
  font-family: "Inter", sans-serif;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}
#fireworks-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  display: block;
  border-radius: 14px;
  background: radial-gradient(circle at bottom, #1a1a2e 0%, #000000 100%);
  cursor: crosshair;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#fireworks-game .hud {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-weight: 700;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0,0,0,0.5);
  z-index: 10;
}
#fireworks-game .hud-left { text-align: left; }
#fireworks-game .hud-right { text-align: right; }
#fireworks-game .score { font-size: 1.5rem; color: #fff; }
#fireworks-game .time { font-size: 1.2rem; color: #facc15; }
#fireworks-game .combo { 
  position: absolute; 
  top: 60px; 
  left: 50%; 
  transform: translateX(-50%); 
  font-size: 2rem; 
  color: #f472b6; 
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
#fireworks-game .combo.visible { opacity: 1; }
#fireworks-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 20;
  backdrop-filter: blur(4px);
}
#fireworks-game .start-overlay.hidden { display: none; }
#fireworks-game h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #f472b6, #fbbf24, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(251, 191, 36, 0.3);
}
#fireworks-game button.primary {
  border: none;
  border-radius: 9999px;
  padding: 16px 48px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #000;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  cursor: pointer;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
  transition: transform 0.1s, box-shadow 0.1s;
}
#fireworks-game button.primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
}
#fireworks-game button.primary:active {
  transform: scale(0.95);
}
#fireworks-game .tutorial {
  margin-bottom: 24px;
  font-size: 0.95rem;
  line-height: 1.6;
  opacity: 0.9;
}
</style>

<div id="fireworks-game">
  <canvas class="game-canvas" width="600" height="800"></canvas>
  
  <div class="hud">
    <div class="hud-left">
      <div class="score">0</div>
      <div>BEST: <span class="best">0</span></div>
    </div>
    <div class="hud-right">
      <div class="time">60.0</div>
    </div>
  </div>
  
  <div class="combo">x1 CHAIN!</div>

  <div class="start-overlay">
    <h2>Midnight Fireworks</h2>
    <p class="tutorial">
      画面をタップして花火を打ち上げろ！<br>
      爆発の光で他の花火を誘爆させよう。<br>
      連鎖をつなげてハイスコアを目指せ！
    </p>
    <button class="primary" id="fw-start-btn">START</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('fireworks-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const timeEl = root.querySelector('.time');
  const comboEl = root.querySelector('.combo');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('fw-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const GRAVITY = 0.08;
  const DRAG = 0.96;
  const STORAGE_KEY = 'aomagame:best:fireworks';
  const PLAYED_KEY = 'aomagame:played:fireworks';

  const state = {
    running: false,
    gameOver: false,
    lastTime: 0,
    timeRemaining: 60,
    score: 0,
    best: 0,
    particles: [],
    rockets: [],
    combo: 0,
    comboTimer: 0,
    autoLaunchTimer: 0
  };

  class Rocket {
    constructor(x, targetY) {
      this.x = x;
      this.y = canvas.height;
      this.targetY = targetY;
      const dist = this.y - targetY;
      // 到達までにかかる時間から初速度を逆算 (簡易計算)
      // v^2 = 2gy みたいな厳密さより、見た目の気持ちよさ重視
      this.speed = 8 + Math.random() * 4;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = -Math.sqrt(2 * GRAVITY * dist) - 2; // 少し補正
      this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
      this.trail = [];
      this.dead = false;
    }

    update() {
      this.prevX = this.x;
      this.prevY = this.y;
      this.x += this.vx;
      this.y += this.vy;
      this.vy += GRAVITY;

      // トレイル
      this.trail.push({ x: this.x, y: this.y, alpha: 1.0 });
      if (this.trail.length > 10) this.trail.shift();
      this.trail.forEach(t => t.alpha *= 0.8);

      // 頂点付近あるいはターゲット到達で爆発
      if (this.vy >= -1 || this.y <= this.targetY) {
        this.explode();
      }
    }

    explode(chained = false) {
      this.dead = true;
      createExplosion(this.x, this.y, this.color);
      
      const points = 100 * (chained ? (state.combo + 1) : 1);
      addScore(points);
      
      if (chained) {
        state.combo++;
        state.comboTimer = 2.0; // 2秒間コンボ維持
        showCombo();
      }
      playTone('explode');
    }

    draw() {
      // 軌跡描画
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for (let i = 0; i < this.trail.length - 1; i++) {
        const t1 = this.trail[i];
        const t2 = this.trail[i+1];
        ctx.strokeStyle = `rgba(255, 255, 255, ${t1.alpha * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.stroke();
      }

      // 本体
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.color = color;
      this.life = 1.0;
      this.decay = Math.random() * 0.015 + 0.01;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= DRAG;
      this.vy *= DRAG;
      this.vy += GRAVITY * 0.5; // パーティクルは少しふわっと
      this.life -= this.decay;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.life;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  function createExplosion(x, y, color) {
    const count = 40 + Math.random() * 20;
    for (let i = 0; i < count; i++) {
      state.particles.push(new Particle(x, y, color));
    }
    // 閃光
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }

  function addScore(points) {
    state.score += points;
    scoreEl.textContent = state.score.toLocaleString();
    if (state.score > state.best) {
      state.best = state.score;
      bestEl.textContent = state.best.toLocaleString();
      saveBest();
    }
  }

  function showCombo() {
    comboEl.textContent = `x${state.combo} CHAIN!`;
    comboEl.classList.add('visible');
    // クラスを付け直してアニメーションリセットしたいが、CSS transitionで制御
  }

  function checkCollisions() {
    // パーティクルとロケットの当たり判定（誘爆）
    for (const p of state.particles) {
      if (p.life < 0.2) continue; // 消えかけは判定しない
      for (const r of state.rockets) {
        if (r.dead) continue;

        // "なるべく上の方までいって打ち上がるように"
        // 下の方にある(yが大きい)場合は誘爆しないようにする
        if (r.y > canvas.height * 0.7) continue; 

        const dx = p.x - r.x;
        const dy = p.y - r.y;
        const distSq = dx * dx + dy * dy;
        // ロケットの当たり判定半径
        if (distSq < 400) { // 半径20px
           r.explode(true); // 連鎖爆発
        }
      }
    }
  }

  // Audio System
  let audioCtx = null;
  function ensureAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  }

  function playTone(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'launch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'explode') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  // Game Loop
  function update(dt) {
    // タイム管理
    state.timeRemaining -= dt;
    if (state.timeRemaining <= 0) {
      endGame();
      return;
    }
    timeEl.textContent = state.timeRemaining.toFixed(1);

    // コンボタイマー
    if (state.combo > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) {
        state.combo = 0;
        comboEl.classList.remove('visible');
      }
    }

    // 自動で敵（ターゲットとなる花火玉）が上がってくる演出
    // プレイヤーが撃つのではなく、勝手に打ち上がる花火を誘爆させるゲーム性にするか？
    // → いや、プレイヤーが撃って、それが爆発して、たまに勝手に上がってくるやつを巻き込む感じが良い
    
    // 自動射出 (環境花火)
    state.autoLaunchTimer -= dt;
    if (state.autoLaunchTimer <= 0) {
      const x = Math.random() * canvas.width;
      const targetY = 100 + Math.random() * (canvas.height / 2);
      state.rockets.push(new Rocket(x, targetY));
      state.autoLaunchTimer = Math.random() * 0.5 + 0.2; // 0.2~0.7秒ごとに上がる
    }

    // 更新
    state.rockets.forEach(r => r.update());
    state.particles.forEach(p => p.update());

    checkCollisions();

    // 削除
    state.rockets = state.rockets.filter(r => !r.dead);
    state.particles = state.particles.filter(p => p.life > 0);
  }

  function draw() {
    // 残像効果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'lighter'; // 加算合成で光らせる

    state.rockets.forEach(r => r.draw());
    state.particles.forEach(p => p.draw());

    ctx.globalCompositeOperation = 'source-over';
  }

  let lastFrameTime = 0;
  function loop(timestamp) {
    if (!state.running) return;
    const dt = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // Input
  function launchFirework(x, y) {
    if (!state.running) return;
    
    // 下からその地点へ向かう
    // 発射位置はランダムか、下端のX座標をタップ位置に合わせるか
    const startX = x + (Math.random() - 0.5) * 40; 
    const r = new Rocket(startX, y);
    // プレイヤー弾は速度早め
    r.vy *= 1.5; 
    state.rockets.push(r);
    playTone('launch');
  }

  function handleInput(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.changedTouches) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    launchFirework(x, y);
  }

  canvas.addEventListener('mousedown', handleInput);
  canvas.addEventListener('touchstart', handleInput, { passive: false });

  // System
  function init() {
    loadBest();
    updatePlayCount();
    
    startBtn.addEventListener('click', startGame);
    
    // 初回描画（黒背景だけ）
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function startGame() {
    ensureAudio();
    overlay.classList.add('hidden');
    state.running = true;
    state.gameOver = false;
    state.score = 0;
    state.timeRemaining = 60;
    state.particles = [];
    state.rockets = [];
    state.combo = 0;
    scoreEl.textContent = '0';
    comboEl.classList.remove('visible');
    
    markPlayed();
    
    lastFrameTime = performance.now();
    requestAnimationFrame(loop);
  }

  function endGame() {
    state.running = false;
    state.gameOver = true;
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "TIME UP!";
    root.querySelector('.tutorial').innerHTML = `SCORE: <span style="font-size:1.5em;font-weight:bold;color:#fff">${state.score}</span><br>連鎖の輝きは最高でした！`;
    startBtn.textContent = "RETRY";
  }

  function loadBest() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        state.best = parseInt(stored, 10);
        bestEl.textContent = state.best.toLocaleString();
      }
    } catch(e) {}
  }

  function saveBest() {
    try {
      localStorage.setItem(STORAGE_KEY, state.best);
    } catch(e) {}
  }

  function updatePlayCount() {
    const el = getPlayCountEl();
    if (!el) return;
    try {
      let count = 0;
      for (let i=0; i<localStorage.length; i++) {
        if (localStorage.key(i).startsWith('aomagame:played:')) count++;
      }
      el.textContent = count;
    } catch(e) { el.textContent = '-'; }
  }

  function markPlayed() {
    try {
      const current = parseInt(localStorage.getItem(PLAYED_KEY) || '0', 10);
      localStorage.setItem(PLAYED_KEY, current + 1);
    } catch(e) {}
    updatePlayCount();
  }

  init();

})();
</script>

## 遊び方
1. 画面（黒い夜空）をタップ！
2. タップした場所に花火が打ち上がります。
3. 爆発した火花が、自然に上がってくる他の花火玉に当たると誘爆（連鎖）！
4. 連鎖をつなげてコンボボーナスを狙え！
5. 60秒間でどれだけ輝けるかな？

## 実装メモ
- Canvas APIの `globalCompositeOperation = 'lighter'` を使用して、ネオンのような輝きを表現。
- パーティクルシステムによる大量の火花描画でも、オブジェクトプールなしで配列操作だけで実装（60秒なのでGC影響は許容）。
- 重力 (`GRAVITY`) と空気抵抗 (`DRAG`) をもたせて、自然な花火の散り方を再現。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
