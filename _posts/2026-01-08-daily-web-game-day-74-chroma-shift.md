---
title: "毎日ゲームチャレンジ Day 74: クロマ・シフト (Chroma Shift)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-73-gravity-golf/' | relative_url }}">グラビティ・ゴルフ</a>

74日目は「クロマ・シフト」。
世界の色を変えろ。自分と同じ色の障害物は通り抜けられる。
反射神経と色認識能力が試される、カメレオン・アクション！

<style>
#chroma-game {
  width: 100%;
  max-width: 600px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 12px;
  background: #fff;
  color: #000;
  font-family: "Verdana", sans-serif;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  transition: background 0.2s;
}
#chroma-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  display: block;
  background: #eee;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#chroma-game .hud {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-weight: 900;
  font-size: 1.5rem;
  color: #fff;
  text-shadow: 0 0 4px rgba(0,0,0,0.5);
  z-index: 10;
}
#chroma-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  color: #333;
}
#chroma-game .start-overlay.hidden { display: none; }
#chroma-game h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #ff4c4c, #4cff4c, #4c4cff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
#chroma-game button.primary {
  border: none;
  background: #333;
  color: #fff;
  padding: 14px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 30px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: transform 0.1s;
}
#chroma-game button.primary:hover {
  transform: scale(1.05);
}
#chroma-game .color-btns {
  position: absolute;
  bottom: 20px;
  left: 0; right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  z-index: 15;
}
#chroma-game .c-btn {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 4px solid rgba(255,255,255,0.5);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: transform 0.1s;
}
#chroma-game .c-btn:active { transform: scale(0.9); }
#chroma-game .c-btn.red { background: #ff4c4c; }
#chroma-game .c-btn.green { background: #4cff4c; }
#chroma-game .c-btn.blue { background: #4c4cff; }

@media (max-width: 480px) {
  #chroma-game { min-height: 320px; display: flex; flex-direction: column; justify-content: center; }
  #chroma-game h2 { font-size: 1.8rem; }
  #chroma-game .color-btns { bottom: 10px; gap: 10px; }
  #chroma-game .c-btn { width: 50px; height: 50px; border-width: 3px; }
  #chroma-game .start-overlay p { margin-bottom: 15px; font-size: 0.9rem; }
  #chroma-game button.primary { padding: 12px 30px; font-size: 1.1rem; }
}
</style>

<div id="chroma-game">
  <canvas class="game-canvas" width="600" height="340"></canvas>
  <div class="hud">
    <div class="score">0m</div>
  </div>
  
  <!-- Mobile Controls -->
  <div class="color-btns">
    <div class="c-btn red" data-color="0"></div>
    <div class="c-btn green" data-color="1"></div>
    <div class="c-btn blue" data-color="2"></div>
  </div>

  <div class="start-overlay">
    <h2>CHROMA SHIFT</h2>
    <p style="margin-bottom:20px;font-weight:bold;color:#555">
      MATCH THE COLOR TO PASS<br>
      [Z]=RED  [X]=GREEN  [C]=BLUE
    </p>
    <button class="primary" id="cs-start-btn">RUN</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('chroma-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = root.querySelector('.score');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('cs-start-btn');
  const cBtns = root.querySelectorAll('.c-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

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

    if (type === 'shift') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'pass') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'crash') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };

  const COLORS = [
    { name: 'red', hex: '#ff4c4c' },
    { name: 'green', hex: '#4cff4c' },
    { name: 'blue', hex: '#4c4cff' }
  ];

  const state = {
    running: false,
    score: 0,
    speed: 0,
    bgIndex: 0,
    obstacles: [],
    player: { x: 100, y: 250, r: 15, vy: 0, groundY: 250 },
    spawnTimer: 0
  };

  class Obstacle {
    constructor(x, colorIdx) {
      this.x = x;
      this.colorIdx = colorIdx;
      this.w = 40;
      this.h = 100 + Math.random() * 100; // Varying height
      this.y = 340 - this.h; // Ground aligned
      if (Math.random() < 0.3) { // Sometimes floating (Jump required?) - No, simplify to color match first
        // If floating, player needs to jump?
        // Let's keep it simple: Walls you must pass through.
        // So they span the full height or significant height.
        this.y = 0;
        this.h = 340;
      }
      this.passed = false;
    }
    
    update(speed) {
      this.x -= speed;
    }

    draw() {
      const c = COLORS[this.colorIdx];
      ctx.fillStyle = c.hex;
      
      // If matching, transparent
      if (this.colorIdx === state.bgIndex) {
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.w, this.h);
      } else {
        ctx.globalAlpha = 1.0;
        ctx.shadowColor = c.hex;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1.0;
    }
  }

  function update() {
    state.speed += 0.005; // Accel
    state.score += (state.speed / 10);
    scoreEl.textContent = Math.floor(state.score) + "m";

    // BG Color Transition (handled by CSS on root usually, but canvas fill)
    // Canvas handles rendering

    // Spawn
    state.spawnTimer--;
    if (state.spawnTimer <= 0) {
      const nextColor = Math.floor(Math.random() * 3);
      // Ensure mix
      state.obstacles.push(new Obstacle(canvas.width + 50, nextColor));
      state.spawnTimer = 60 + Math.random() * 60 - (state.speed * 2); 
      if (state.spawnTimer < 30) state.spawnTimer = 30;
    }

    // Update Obstacles
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      const o = state.obstacles[i];
      o.update(state.speed);

      // Collision
      // Player rect vs Obstacle rect ?
      // Player is circle (x, y, r)
      // Simple AABB
      if (
        state.player.x + state.player.r > o.x && 
        state.player.x - state.player.r < o.x + o.w
      ) {
         // Horizontal overlap
         // Check match
         if (o.colorIdx === state.bgIndex) {
            // Safe
            if (!o.passed) {
                o.passed = true;
                playTone('pass');
            }
         } else {
            // Crash
            playTone('crash');
            gameOver();
         }
      }

      if (o.x < -100) {
        state.obstacles.splice(i, 1);
      }
    }
  }

  function draw() {
    // BG
    const bgC = COLORS[state.bgIndex];
    // Darken it effectively for contrast
    ctx.fillStyle = bgC.hex; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add a dark overlay pattern
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Make it dark version of the color

    // Ground
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, state.player.groundY + state.player.r, canvas.width, 2);

    // Obstacles
    state.obstacles.forEach(o => o.draw());

    // Player
    // Player is White (Neutral) or same as BG?
    // Let's make Player White.
    // Let's make Player White.
    // Ensure player is visible against white ground stripe?
    // Ground is Y=265 (250+15). Player Y=250.
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000'; // Add outline for visibility
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fff';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI*2);
    ctx.fill();
    ctx.fill();
    ctx.stroke(); // Draw outline
    ctx.shadowBlur = 0;
    
    // Effect lines (Speed)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    for(let i=0; i<5; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function setColor(idx) {
    if (state.bgIndex !== idx) {
        state.bgIndex = idx;
        playTone('shift');
        // update container border?
        root.style.borderColor = COLORS[idx].hex;
        root.style.boxShadow = `0 0 30px ${COLORS[idx].hex}40`;
    }
  }

  // Input
  window.addEventListener('keydown', e => {
    if (!state.running) return;
    if (e.code === 'KeyZ' || e.key === 'ArrowLeft') setColor(0); // Red
    if (e.code === 'KeyX' || e.key === 'ArrowDown' || e.key === 'ArrowUp') setColor(1); // Green
    if (e.code === 'KeyC' || e.key === 'ArrowRight') setColor(2); // Blue
  });

  cBtns.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        setColor(parseInt(btn.dataset.color));
    });
    btn.addEventListener('click', (e) => {
        setColor(parseInt(btn.dataset.color));
    }); // Mouse fallback
  });

  function init() {
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
  }

  function startGame() {
    state.running = true;
    state.score = 0;
    state.speed = 5;
    state.obstacles = [];
    state.bgIndex = 1; // Start Green
    overlay.classList.add('hidden');
    
    markPlayed();
    requestAnimationFrame(loop);
  }

  function gameOver() {
    state.running = false;
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "CRASHED";
    root.querySelector('p').innerHTML = `DISTANCE: <span style="font-size:1.5em">${Math.floor(state.score)}m</span>`;
    startBtn.textContent = "AGAIN";
  }

  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. プレイヤーは自動で走り続けます。
2. 前方から「赤」「緑」「青」の壁が迫ってきます。
3. 下のボタン（PCならZ, X, Cキー）を押して、背景の色を壁と同じに変えてください。
4. 色が一致していれば壁を通り抜けられます。違うと衝突してゲームオーバーです。

## 実装メモ
- 背景色と障害物の色を比較するシンプルな判定ロジック。
- 衝突判定時に `color === bg` なら透過（`globalAlpha`）させて、通り抜ける演出を実装。
- 速度が徐々に上がり、判断の瞬発力が試されるように調整。
