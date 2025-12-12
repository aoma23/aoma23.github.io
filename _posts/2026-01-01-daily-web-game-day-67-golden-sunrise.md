---
title: "毎日ゲームチャレンジ Day 67: 初日の出クライマー (Golden Sunrise)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

あけましておめでとうございます！67日目は「初日の出クライマー」。
2025年の初日の出を拝むため、雲の上を目指して登り続けよう！
画面の傾き（スマホ）やキー操作で移動して、自動ジャンプでどこまでも高く！

<style>
#sunrise-game {
  width: 100%;
  max-width: 480px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 16px;
  background: #000;
  color: #334155;
  font-family: "Inter", "Hiragino Mincho ProN", serif;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}
#sunrise-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 3;
  display: block;
  border-radius: 14px;
  background: linear-gradient(to top, #1e1b4b 0%, #0f172a 100%);
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#sunrise-game .hud {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  pointer-events: none;
  width: calc(100% - 32px);
  display: flex;
  justify-content: space-between;
}
#sunrise-game .score { color: #fff; }
#sunrise-game .best { font-size: 1rem; color: #facc15; align-self: center; }
#sunrise-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 20;
  backdrop-filter: blur(4px);
}
#sunrise-game .start-overlay.hidden { display: none; }
#sunrise-game h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #b91c1c;
  font-weight: 900;
}
#sunrise-game button.primary {
  border: none;
  border-radius: 8px;
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  background: #b91c1c;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  transition: transform 0.1s;
}
#sunrise-game button.primary:hover { transform: scale(1.05); }
#sunrise-game .tutorial {
  margin-bottom: 24px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1f2937;
}
</style>

<div id="sunrise-game">
  <canvas class="game-canvas" width="400" height="600"></canvas>

  <div class="hud">
    <div class="score">0m</div>
    <div class="best">BEST: 0m</div>
  </div>
  
  <div class="start-overlay">
    <h2>初日の出クライマー</h2>
    <p class="tutorial">
      雲を乗り継いで空高く登ろう！<br>
      PC: 左右キーで移動<br>
      スマホ: 本体を左右に傾けて移動<br>
      (タップ操作でも移動できます)
    </p>
    <button class="primary" id="sr-start-btn">登り始める</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('sunrise-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('sr-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const GRAVITY = 0.4;
  const JUMP_POWER = -11;
  const STORAGE_KEY = 'aomagame:best:sunrise';
  const PLAYED_KEY = 'aomagame:played:sunrise';

  let audioCtx = null;
  const ensureAudio = () => {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    if (!audioCtx) audioCtx = new C();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  };

  const playTone = (type) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'jump') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  const state = {
    running: false,
    gameOver: false,
    score: 0,
    best: 0,
    cameraY: 0,
    player: { x: 200, y: 400, vx: 0, vy: 0, r: 10 },
    platforms: [],
    sunY: 800, // 太陽の位置
    tilt: 0,
    inputLeft: false,
    inputRight: false
  };

  class Platform {
    constructor(x, y, w) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = 15;
      this.type = 'normal'; // normal, moving, breakable
      if (Math.random() < 0.1 && state.score > 1000) this.type = 'moving';
      this.vx = this.type === 'moving' ? (Math.random() < 0.5 ? 2 : -2) : 0;
    }

    update() {
      if (this.type === 'moving') {
        this.x += this.vx;
        if (this.x < 0 || this.x + this.w > canvas.width) this.vx *= -1;
      }
    }

    draw() {
      // 雲のような見た目
      ctx.fillStyle = '#fff';
      
      // メインの楕円
      ctx.beginPath();
      ctx.ellipse(this.x + this.w/2, this.y + this.h/2, this.w/2, this.h, 0, 0, Math.PI * 2);
      ctx.fill();

      // もくもく感
      ctx.beginPath();
      ctx.arc(this.x + 10, this.y, 10, 0, Math.PI * 2);
      ctx.arc(this.x + this.w/2, this.y - 5, 12, 0, Math.PI * 2);
      ctx.arc(this.x + this.w - 10, this.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initPlatforms() {
    state.platforms = [];
    // スタート地点の足場
    state.platforms.push(new Platform(150, 550, 100));
    
    let y = 500;
    while (y > -100) {
      y -= 70 + Math.random() * 40;
      const w = 60 + Math.random() * 40;
      const x = Math.random() * (canvas.width - w);
      state.platforms.push(new Platform(x, y, w));
    }
  }

  function generatePlatform() {
    // 画面外（上）に新しい足場を生成
    const highestP = state.platforms[state.platforms.length - 1];
    let y = highestP.y - (70 + Math.random() * 40);
    const w = Math.max(40, 100 - state.score * 0.005); // だんだん小さく
    const x = Math.random() * (canvas.width - w);
    state.platforms.push(new Platform(x, y, w));
  }

  function update() {
    const p = state.player;

    // 入力処理
    if (state.inputLeft) p.vx = -5;
    else if (state.inputRight) p.vx = 5;
    else p.vx = state.tilt * 0.2; // 傾き操作

    // 摩擦と移動制限
    p.vx *= 0.9;
    p.x += p.vx;
    
    // 画面端ループ
    if (p.x < -10) p.x = canvas.width + 10;
    if (p.x > canvas.width + 10) p.x = -10;

    // 重力
    p.vy += GRAVITY;
    p.y += p.vy;

    // 足場との判定 (落下中のみ)
    if (p.vy > 0) { 
      // プレイヤーの足元
      const feetY = p.y + p.r;
      // 画面下部に落ちたらゲームオーバー
      if (feetY > canvas.height + state.cameraY) {
        endGame();
        return;
      }

      for (const plat of state.platforms) {
        // 足場の上に乗ったか判定（少し甘めに）
        if (p.x > plat.x - 10 && p.x < plat.x + plat.w + 10 &&
            feetY >= plat.y && feetY <= plat.y + 20) {
          p.vy = JUMP_POWER;
          playTone('jump');
          break;
        }
      }
    }

    // カメラ移動 (プレイヤーが画面中央より上に行ったらついていく)
    const targetY = p.y - 300;
    if (targetY < state.cameraY) {
      state.cameraY = targetY;
      state.score = Math.floor(Math.abs(state.cameraY));
      scoreEl.textContent = `${state.score}m`;
    }

    // 足場の更新と生成
    for (let i = state.platforms.length - 1; i >= 0; i--) {
      const plat = state.platforms[i];
      plat.update();
      // 画面下から消えたら削除
      if (plat.y > state.cameraY + canvas.height + 50) {
        state.platforms.splice(i, 1);
        generatePlatform();
      }
    }

    // 太陽の上昇演出
    // スコアに応じて背景色を変えるためのパラメータ
    state.sunY = 800 + state.cameraY * 0.8; 
  }

  function draw() {
    // 背景グラデーション (夜明け前 -> 日の出 -> 青空)
    const progress = Math.min(1, state.score / 5000);
    
    // 簡易的な空の色変化
    let bgTop, bgBottom;
    if (progress < 0.3) {
      // 夜明け前 (濃紺)
      bgTop = '#1e1b4b'; 
      bgBottom = '#312e81';
    } else if (progress < 0.6) {
      // 日の出 (オレンジ)
      bgTop = '#1e3a8a';
      bgBottom = '#f97316';
    } else {
      // 青空
      bgTop = '#3b82f6';
      bgBottom = '#93c5fd';
    }

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, bgTop);
    grad.addColorStop(1, bgBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 太陽 (背景)
    const sunYScreen = state.sunY - state.cameraY;
    if (sunYScreen < canvas.height + 200) {
      ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
      ctx.shadowColor = 'orange';
      ctx.shadowBlur = 50;
      ctx.beginPath();
      ctx.arc(canvas.width/2, sunYScreen, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.save();
    ctx.translate(0, -state.cameraY);

    // 足場
    state.platforms.forEach(p => p.draw());

    // プレイヤー (墨絵風の黒い円？あるいは鳥？シンプルに黒いキャラクター)
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI * 2);
    ctx.fill();
    // 目
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.player.x - 3, state.player.y - 2, 3, 0, Math.PI * 2);
    ctx.arc(state.player.x + 3, state.player.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Inputs
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') state.inputLeft = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') state.inputRight = true;
  });
  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') state.inputLeft = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') state.inputRight = false;
  });
  
  // Mobile Tilt
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      // gamma is left/right tilt in degrees [-90, 90]
      if (e.gamma !== null) {
        state.tilt = Math.max(-30, Math.min(30, e.gamma));
      }
    });
  }

  // Touch fallback (Half screen tap)
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    if (x < rect.width / 2) {
      state.inputLeft = true;
      state.inputRight = false;
    } else {
      state.inputLeft = false;
      state.inputRight = true;
    }
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    state.inputLeft = false;
    state.inputRight = false;
  });

  function init() {
    loadBest();
    updatePlayCount();
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
    // 初期描画
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#312e81');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function startGame() {
    // Permission request for DeviceOrientation if needed (iOS 13+)
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(()=>{});
    }

    state.running = true;
    state.gameOver = false;
    state.score = 0;
    state.cameraY = 0;
    state.player = { x: 200, y: 400, vx: 0, vy: 0, r: 12 };
    state.tilt = 0;
    state.inputLeft = false;
    state.inputRight = false;
    
    initPlatforms();
    overlay.classList.add('hidden');
    initPlatforms();
    overlay.classList.add('hidden');
    scoreEl.textContent = '0m';
    
    markPlayed();
    requestAnimationFrame(loop);
  }

  function endGame() {
    playTone('gameover');
    state.running = false;
    state.gameOver = true;
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "GAME OVER";
    root.querySelector('.tutorial').innerHTML = `到達高度: <span style="font-size:1.5em;font-weight:bold;color:#b91c1c">${state.score}m</span>`;
    startBtn.textContent = "もう一度登る";
    
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }
  }

  function loadBest() { 
    try { 
      state.best = parseInt(localStorage.getItem(STORAGE_KEY) || '0'); 
      if(bestEl) bestEl.textContent = `BEST: ${state.best}m`;
    } catch(e){}
  }
  function saveBest() { 
    try { 
      localStorage.setItem(STORAGE_KEY, state.best); 
      if(bestEl) bestEl.textContent = `BEST: ${state.best}m`;
    } catch(e){}
  }
  function updatePlayCount() {
    try {
      const el = getPlayCountEl();
      if(el) {
        let count = 0;
        for(let i=0; i<localStorage.length; i++) if(localStorage.key(i).startsWith('aomagame:played:')) count++;
        el.textContent = count;
      }
    } catch(e){}
  }
  function markPlayed() {
    try { localStorage.setItem(PLAYED_KEY, (parseInt(localStorage.getItem(PLAYED_KEY)||'0')+1)); }catch(e){}
    updatePlayCount();
  }

  init();

})();
</script>

## 遊び方
1. ゲームスタート！自動でジャンプします。
2. 足場（雲）に乗り継いで上へ上へ行きましょう。
3. 画面下へ落ちたらゲームオーバー。
4. PC：矢印キー(←→)またはA/Dキーで左右移動。
5. スマホ：本体を傾けるか、画面の左右をタップして移動。

## 実装メモ
- 加速度センサー (`deviceorientation`) を使用して、スマホならではの直感的な操作感を実現。
- 高さに応じて背景色が変化する演出（夜明け〜日の出〜青空）。
- `cameraY` 変数でワールド全体をスクロール表示。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
