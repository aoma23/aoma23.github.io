---
title: "毎日ゲームチャレンジ Day 70: ヴォイド・ラッシュ (Void Rush)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-69-prism-breaker/' | relative_url }}">プリズム・ブレイカー</a>

70日目は「ヴォイド・ラッシュ」。
迫りくる虚無（Void）から逃げ続けろ。
中央のブラックホールに吸い込まれる瓦礫を避ける、高難易度なミニマルアクションゲームです。
画面の左側/右側をタップして軌道を調整し、生き残れ！

<style>
#void-game {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 16px;
  background: #000;
  color: #fff;
  font-family: "Courier New", monospace;
  text-align: center;
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  border: 1px solid #333;
}
#void-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: block;
  border-radius: 14px;
  background: #000;
  cursor: crosshair;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#void-game .hud {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-weight: bold;
  font-size: 1.2rem;
  mix-blend-mode: exclusion;
}
#void-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
#void-game .start-overlay.hidden { display: none; }
#void-game h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #fff;
  letter-spacing: 4px;
  text-transform: uppercase;
  animation: glitch 2s infinite;
}
@keyframes glitch {
  0% { transform: translate(0, 0); text-shadow: 2px 2px #f00; }
  2% { transform: translate(-2px, 2px); text-shadow: -2px -2px #0ff; }
  4% { transform: translate(2px, -2px); text-shadow: 2px -2px #f00; }
  6% { transform: translate(0, 0); text-shadow: 0 0 #fff; }
  100% { transform: translate(0, 0); text-shadow: 0 0 #fff; }
}
#void-game button.primary {
  border: 1px solid #fff;
  border-radius: 0;
  padding: 16px 48px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  background: #000;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Courier New", monospace;
  text-transform: uppercase;
}
#void-game button.primary:hover {
  background: #fff;
  color: #000;
}
#void-game .tutorial {
  margin-bottom: 30px;
  font-size: 0.9rem;
  line-height: 1.8;
  color: #ccc;
}
#void-game .controls-hint {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  font-size: 0.8rem;
  color: #555;
  pointer-events: none;
}
</style>

<div id="void-game">
  <canvas class="game-canvas" width="600" height="600"></canvas>
  <div class="hud">
    <div class="time">TIME: 0.00</div>
    <div class="best">BEST: 0.00</div>
  </div>
  
  <div class="controls-hint">
    <span>&lt; LEFT</span>
    <span>RIGHT &gt;</span>
  </div>

  <div class="start-overlay">
    <h2>VOID RUSH</h2>
    <p class="tutorial">
      AVOID THE DEBRIS<br>
      LEFT/RIGHT CLICK OR TAP TO ORBIT<br>
      SURVIVE THE VOID
    </p>
    <button class="primary" id="vr-start-btn">INITIATE</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('void-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const timeEl = root.querySelector('.time');
  const bestEl = root.querySelector('.best');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('vr-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const STORAGE_KEY = 'aomagame:best:voidrush';
  const PLAYED_KEY = 'aomagame:played:voidrush';

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

    if (type === 'spawn') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'gameover') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.1);
      osc.frequency.linearRampToValueAtTime(50, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  const PLAYER_DIST = 120;
  const PLAYER_SIZE = 8;
  const VOID_RADIUS = 40;
  const ROTATE_SPEED = 0.08;
  const SPAWN_RATE_INITIAL = 60; // Frames

  const state = {
    running: false,
    gameOver: false,
    time: 0,
    best: 0,
    angle: 0,
    enemies: [],
    particles: [],
    spawnTimer: 0,
    difficulty: 1,
    inputLeft: false,
    inputRight: false,
    shake: 0
  };

  class Enemy {
    constructor() {
      // 画面外から出現
      const angle = Math.random() * Math.PI * 2;
      const dist = 400; // 画面中心からの距離
      this.x = Math.cos(angle) * dist + canvas.width / 2;
      this.y = Math.sin(angle) * dist + canvas.height / 2;
      
      // 中心に向かうベクトル
      const speed = 2 + Math.random() * 2 + state.difficulty * 0.5;
      const angleToCenter = Math.atan2(canvas.height/2 - this.y, canvas.width/2 - this.x);
      
      this.vx = Math.cos(angleToCenter) * speed;
      this.vy = Math.sin(angleToCenter) * speed;
      
      this.size = 5 + Math.random() * 8;
      this.active = true;
      
      // 形（四角か円か三角）
      this.type = Math.floor(Math.random() * 3);
    }

    update() {
      // 中心に向かって加速（吸い込み）
      const dx = canvas.width/2 - this.x;
      const dy = canvas.height/2 - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      // 吸い込み力
      const pull = 1000 / (dist * dist + 100); 
      this.vx += (dx / dist) * pull;
      this.vy += (dy / dist) * pull;
      
      this.x += this.vx;
      this.y += this.vy;
      
      this.angle += 0.1; // 自転

      // Voidに飲まれたら消滅
      if (dist < VOID_RADIUS) {
        this.active = false;
        // 飲まれたエフェクト
        state.shake += 2;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = '#fff';
      
      if (this.type === 0) { // Square
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
      } else if (this.type === 1) { // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(this.size/2, this.size/2);
        ctx.lineTo(-this.size/2, this.size/2);
        ctx.fill();
      } else { // Circle
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function update() {
    state.time += 1/60;
    state.difficulty = 1 + state.time / 20; // 1分で倍速
    timeEl.textContent = `TIME: ${state.time.toFixed(2)}`;

    // Player Rotation
    if (state.inputLeft) state.angle -= ROTATE_SPEED;
    if (state.inputRight) state.angle += ROTATE_SPEED;

    // Shake Decay
    state.shake *= 0.9;
    if (state.shake < 0.5) state.shake = 0;

    // Spawning
    state.spawnTimer--;
    const spawnRate = Math.max(10, SPAWN_RATE_INITIAL - state.difficulty * 5);
    if (state.spawnTimer <= 0) {
      state.enemies.push(new Enemy());
      // playTone('spawn'); // 頻度が高いのでうるさいかも？一旦コメントアウトしておくか、あるいは極小音で
      // state.spawnTimer = spawnRate;
       if (Math.random() < 0.3) playTone('spawn'); // たまに鳴らす
      state.spawnTimer = spawnRate;
    }

    // Enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      e.update();
      if (!e.active) {
        state.enemies.splice(i, 1);
        continue;
      }

      // Collision Check
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const px = cx + Math.cos(state.angle) * PLAYER_DIST;
      const py = cy + Math.sin(state.angle) * PLAYER_DIST;
      
      const dx = px - e.x;
      const dy = py - e.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist < PLAYER_SIZE + e.size/2) {
        endGame();
      }
    }
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Screen Shake
    if (state.shake > 0) {
      const sx = (Math.random() - 0.5) * state.shake;
      const sy = (Math.random() - 0.5) * state.shake;
      ctx.translate(sx, sy);
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Void (Center)
    ctx.fillStyle = '#000';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const pulse = Math.sin(state.time * 5) * 5;
    ctx.arc(cx, cy, VOID_RADIUS + pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Orbit Guide (Thin line)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, PLAYER_DIST, 0, Math.PI * 2);
    ctx.stroke();

    // Enemies
    state.enemies.forEach(e => e.draw());

    // Player
    const px = cx + Math.cos(state.angle) * PLAYER_DIST;
    const py = cy + Math.sin(state.angle) * PLAYER_DIST;
    
    // Shield/Player Body
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(state.angle);
    ctx.fillStyle = '#fff';
    // プレイヤーは小さな円と、進行方向を示す盾のような形状
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();
    
    // Trail (Orbiting effect)
    ctx.restore();

    ctx.restore();
    
    // Glitch effect randomly
    if (Math.random() < 0.02) {
      const h = Math.max(1, Math.random() * 50);
      const y = Math.random() * (canvas.height - h);
      const x = (Math.random() - 0.5) * 10;
      const imgData = ctx.getImageData(0, y, canvas.width, h);
      ctx.putImageData(imgData, x, y);
    }
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Inputs
  function handleInput(isLeft, isDown) {
    if (isLeft) state.inputLeft = isDown;
    else state.inputRight = isDown;
  }

  window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') handleInput(true, true);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') handleInput(false, true);
  });
  
  window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') handleInput(true, false);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') handleInput(false, false);
  });

  // Touch/Click
  canvas.addEventListener('mousedown', e => {
    if (!state.running) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) handleInput(true, true);
    else handleInput(false, true);
  });
  
  canvas.addEventListener('mouseup', () => {
    handleInput(true, false);
    handleInput(false, false);
  });

  canvas.addEventListener('touchstart', e => {
    if (!state.running) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    if (x < rect.width / 2) handleInput(true, true);
    else handleInput(false, true);
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    handleInput(true, false);
    handleInput(false, false);
  });

  function init() {
    loadBest();
    updatePlayCount();
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
    
    // Initial Render
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function startGame() {
    state.running = true;
    state.time = 0;
    state.difficulty = 1;
    state.enemies = [];
    state.angle = -Math.PI / 2;
    state.shake = 0;
    
    overlay.classList.add('hidden');
    
    markPlayed();
    requestAnimationFrame(loop);
  }

  function endGame() {
    playTone('gameover');
    state.running = false;
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "DELETED";
    root.querySelector('.tutorial').innerHTML = `SURVIVAL TIME: <span style="font-size:1.5em;color:#fff">${state.time.toFixed(2)}s</span>`;
    startBtn.textContent = "REBOOT";
    
    if (state.time > state.best) {
      state.best = state.time;
      saveBest();
    }
  }

  function loadBest() { try { state.best = parseFloat(localStorage.getItem(STORAGE_KEY)||'0'); 
                            bestEl.textContent = `BEST: ${state.best.toFixed(2)}`; }catch(e){} }
  function saveBest() { try { localStorage.setItem(STORAGE_KEY, state.best); 
                            bestEl.textContent = `BEST: ${state.best.toFixed(2)}`; }catch(e){} }
  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. 画面の左半分を押すと左回転（反時計回り）、右半分を押すと右回転（時計回り）。
2. 四方八方から飛んでくる瓦礫（Debris）を避けてください。
3. 瓦礫は中央のVOIDに吸い込まれていきます。
4. 1秒生き残るごとに難易度が上昇。どれだけ長く存在し続けられるか？

## 実装メモ
- 白と黒のみの硬派なミニマルデザイン。
- グリッチエフェクト（`ctx.putImageData`）や画面シェイクで緊張感を表現。
- シンプルな軌道制御だが、吸い込み力（重力）の計算を入れることで瓦礫の動きを予測しにくくしている。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
