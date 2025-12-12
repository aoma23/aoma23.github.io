---
title: "毎日ゲームチャレンジ Day 69: プリズム・ブレイカー (Prism Breaker)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

69日目は「プリズム・ブレイカー」。
ガラスの要塞を撃ち砕け！
狙いを定めてボールを発射し、クリスタルを破壊する物理パズルです。
連鎖的な破壊の爽快感を楽しんでください！

<style>
#prism-game {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 16px;
  background: #1e293b;
  color: #f8fafc;
  font-family: "Inter", sans-serif;
  text-align: center;
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.3);
  position: relative;
  overflow: hidden;
}
#prism-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  display: block;
  border-radius: 14px;
  background: #0f172a;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#prism-game .hud {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-size: 1.1rem;
  font-weight: 700;
  text-shadow: 0 0 5px rgba(0,0,0,0.5);
}
#prism-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 20;
  backdrop-filter: blur(4px);
}
#prism-game .start-overlay.hidden { display: none; }
#prism-game h2 {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #e879f9, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}
#prism-game button.primary {
  border: none;
  border-radius: 8px;
  padding: 14px 44px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
  transition: transform 0.1s;
}
#prism-game button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(124, 58, 237, 0.6);
}
#prism-game .tutorial {
  margin-bottom: 24px;
  opacity: 0.9;
  line-height: 1.6;
}
</style>

<div id="prism-game">
  <canvas class="game-canvas" width="500" height="625"></canvas>
  <div class="hud">
    <div class="balls">Balls: 3</div>
    <div class="score">Score: 0</div>
  </div>
  
  <div class="start-overlay">
    <h2>Prism Breaker</h2>
    <p class="tutorial">
      ドラッグして狙い、離して発射！<br>
      全てのクリスタルを破壊せよ。<br>
      ボールを落とすとミスになるぞ！
    </p>
    <button class="primary" id="pb-start-btn">START</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('prism-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const ballsEl = root.querySelector('.balls');
  const scoreEl = root.querySelector('.score');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('pb-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const GRAVITY = 0.15;
  const FRICTION = 0.995;
  const BALL_RADIUS = 8;
  const STORAGE_KEY = 'aomagame:best:prism';
  const PLAYED_KEY = 'aomagame:played:prism';

  const state = {
    running: false,
    ballsRemaining: 3,
    score: 0,
    best: 0,
    balls: [],
    prisms: [],
    particles: [],
    aiming: false,
    dragStart: { x: 0, y: 0 },
    dragCurrent: { x: 0, y: 0 },
    level: 1,
    floorBumpers: []
  };

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

    if (type === 'shoot') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'break') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'bumper') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  };

  class Bumper {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.rx = 35; // Wider
      this.ry = 15; // Elliptic
    }
    draw() {
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.rx, this.ry, 0, Math.PI, 0, true); // Top half ellipse
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  class Ball {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.active = true;
      this.radius = BALL_RADIUS;
      this.bounces = 0; // 床でバウンドした回数
    }

    update() {
      if (!this.active) return;
      this.vy += GRAVITY;
      this.vx *= FRICTION;
      this.vy *= FRICTION;
      this.x += this.vx;
      this.y += this.vy;

      // 壁反射
      if (this.x < this.radius) {
        this.x = this.radius;
        this.vx *= -0.8;
      }
      if (this.x > canvas.width - this.radius) {
        this.x = canvas.width - this.radius;
        this.vx *= -0.8;
      }
      if (this.y < this.radius) {
        this.y = this.radius;
        this.vy *= -0.8;
      }
      if (this.y > canvas.height + 50) {
         this.active = false;
         checkGameOver();
      }
    }

    draw() {
      if (!this.active) return;
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // 六角形とか三角形のプリズム
  class Prism {
    constructor(x, y, hits) {
      this.x = x;
      this.y = y;
      this.hits = hits;
      this.maxHits = hits;
      this.radius = 25;
      this.active = true;
      // シンプルにするため六角形固定
      this.vertices = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        this.vertices.push({
          x: this.x + Math.cos(angle) * this.radius,
          y: this.y + Math.sin(angle) * this.radius
        });
      }
    }

    takeDamage(damage = 1) {
      this.hits -= damage;
      if (this.hits <= 0) {
        this.shatter();
        playTone('break');
      } else {
        // ヒット演出（サイズを一瞬変えるとか）
        createParticles(this.x, this.y, '#fff', 5);
        playTone('hit');
      }
    }

    shatter() {
      this.active = false;
      state.score += this.maxHits * 100;
      scoreEl.textContent = `Score: ${state.score}`;
      createParticles(this.x, this.y, getColor(this.maxHits), 15);
      // チェック：全て壊したか？
      if (state.prisms.every(p => !p.active)) {
        setTimeout(nextLevel, 1000);
      }
    }

    draw() {
      if (!this.active) return;
      
      ctx.fillStyle = getColor(this.hits);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;

      // ポリゴン描画
      ctx.beginPath();
      ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
      for (let i = 1; i < this.vertices.length; i++) {
        ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
      }
      ctx.closePath();
      
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      ctx.stroke();

      // 数字描画
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.hits, this.x, this.y);
    }
  }

  function getColor(hits) {
    if (hits >= 50) return '#ec4899'; // Pink
    if (hits >= 20) return '#ef4444'; // Red
    if (hits >= 10) return '#f59e0b'; // Orange
    if (hits >= 5) return '#eab308'; // Yellow
    if (hits >= 3) return '#22c55e'; // Green
    return '#3b82f6'; // Blue
  }

  function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color: color
      });
    }
  }

  // 衝突判定: 円 vs ポリゴン (簡易版: 頂点との距離 + 線分との距離を見るか、多角形の中心距離で簡易判定してから詳細やるか)
  // ここでは一番簡単な「ほぼ円とみなして円衝突」＋「位置補正」にする（高精度はコード量増えるため）
  function checkCollisions() {
    state.balls.forEach(ball => {
      if (!ball.active) return;

      state.prisms.forEach(prism => {
        if (!prism.active) return;

        // 簡易ブロードフェーズ
        const dx = ball.x - prism.x;
        const dy = ball.y - prism.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < prism.radius + ball.radius) {
          // 衝突！
          // 法線を求める（中心からボールへのベクトル）
          const nx = dx / dist;
          const ny = dy / dist;

          // 位置補正 (めり込み解消)
          const overlap = (prism.radius + ball.radius) - dist;
          ball.x += nx * overlap;
          ball.y += ny * overlap;

          // 反射計算 (v - 2 * (v . n) * n)
          const dot = ball.vx * nx + ball.vy * ny;
          ball.vx = ball.vx - 2 * dot * nx;
          ball.vy = ball.vy - 2 * dot * ny;

          // 減衰
          ball.vx *= 0.8;
          ball.vy *= 0.8;

          prism.takeDamage();
        }
      });
    });

    // Bumper Collision (Ellipse Approximation)
    state.balls.forEach(ball => {
      if (!ball.active) return;
      state.floorBumpers.forEach(bm => {
         const dx = ball.x - bm.x;
         const dy = ball.y - bm.y;
         // Check if inside ellipse expanded by ball radius (Approximation)
         // (x/a)^2 + (y/b)^2 <= 1
         const a = bm.rx + ball.radius;
         const b = bm.ry + ball.radius;
         
         if ((dx*dx)/(a*a) + (dy*dy)/(b*b) <= 1) {
           // Collision detected
           
           // Normal vector for ellipse at (dx, dy): (x/a^2, y/b^2)
           // But here a and b are the visual ellipse radii
           let nx = dx / (bm.rx * bm.rx);
           let ny = dy / (bm.ry * bm.ry);
           
           // Normalize
           const len = Math.sqrt(nx*nx + ny*ny);
           nx /= len;
           ny /= len;
           
           // Push out (simplified)
           ball.x += nx * 2;
           ball.y += ny * 2;
           
           // Reflect
           const dot = ball.vx * nx + ball.vy * ny;
           ball.vx = ball.vx - 2 * dot * nx;
           ball.vy = ball.vy - 2 * dot * ny;
           
           // Force Boost Upwards
           ball.vy = -Math.abs(ball.vy) - 5; 
           ball.vx += (Math.random() - 0.5) * 5;
           
           playTone('bumper');
         }
      });
    });
  }

  function nextLevel() {
    state.level++;
    // Bonus Balls
    state.ballsRemaining += 3;
    ballsEl.textContent = `Balls: ${state.ballsRemaining}`;
    setupLevel();
  }

  function setupLevel() {
    state.prisms = [];
    const rows = 3 + Math.floor(state.level / 2);
    const cols = 4;
    const startX = 80;
    const startY = 80;
    const spacingX = 90;
    const spacingY = 80;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // 市松模様配置
        if ((r + c) % 2 === 0) {
          const hp = 1 + Math.floor(Math.random() * state.level * 1.5);
          state.prisms.push(new Prism(startX + c * spacingX, startY + r * spacingY, hp));
        }
      }
    }

    // Setup Floor Bumpers
    state.floorBumpers = [];
    const bumperCount = 3;
    const sectionW = canvas.width / bumperCount;
    for (let i=0; i<bumperCount; i++) {
      state.floorBumpers.push(new Bumper(sectionW * i + sectionW/2, canvas.height));
    }
  }

  function checkGameOver() {
    // アクティブなボールがなく、残機もなければ終了
    const activeBalls = state.balls.filter(b => b.active).length;
    if (activeBalls === 0 && state.ballsRemaining <= 0) {
      endGame();
    }
  }

  function update() {
    state.balls.forEach(b => b.update());
    
    // パーティクル
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += GRAVITY; 
      p.life -= 0.05;
      if (p.life <= 0) state.particles.splice(i, 1);
    }

    checkCollisions();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Prisms
    state.prisms.forEach(p => p.draw());

    // Bumpers
    state.floorBumpers.forEach(b => b.draw());

    // Balls
    state.balls.forEach(b => b.draw());

    // Particles
    state.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      // 三角形の破片
      ctx.moveTo(p.x, p.y - 5);
      ctx.lineTo(p.x + 4, p.y + 3);
      ctx.lineTo(p.x - 4, p.y + 3);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Initial Ball Preview
    if (state.ballsRemaining > 0) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height - 50, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Aiming Line
    if (state.aiming && state.ballsRemaining > 0) {
      if (state.balls.every(b => !b.active)) { // 全ボール停止時のみ発射可能とする場合
        // ここではいつでも発射可能にしておく
      }
      
      const dx = state.dragStart.x - state.dragCurrent.x;
      const dy = state.dragStart.y - state.dragCurrent.y;
      
      // 発射プレビュー
      const startX = canvas.width / 2;
      const startY = canvas.height - 50;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + dx, startY + dy);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Input Handling
  canvas.addEventListener('mousedown', e => {
    if (!state.running || state.ballsRemaining <= 0) return;
    const rect = canvas.getBoundingClientRect();
    state.aiming = true;
    state.dragStart = { x: e.clientX, y: e.clientY };
    state.dragCurrent = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', e => {
    if (!state.aiming) return;
    state.dragCurrent = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', e => {
    if (!state.aiming) return;
    state.aiming = false;
    
    // 発射
    const dx = state.dragStart.x - state.dragCurrent.x;
    const dy = state.dragStart.y - state.dragCurrent.y;
    const mag = Math.sqrt(dx*dx + dy*dy);
    
    if (mag > 10) {
      const speed = Math.min(20, mag * 0.15); // 速度制限
      shootBall(dx / mag * speed, dy / mag * speed);
    }
  });
  
  // Touch
  canvas.addEventListener('touchstart', e => {
    if (!state.running || state.ballsRemaining <= 0) return;
    e.preventDefault();
    state.aiming = true;
    state.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    state.dragCurrent = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });
  
  window.addEventListener('touchmove', e => {
    if (!state.aiming) return;
    e.preventDefault();
    state.dragCurrent = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: false });
  
  window.addEventListener('touchend', e => {
    if (!state.aiming) return;
    // 似たようなロジックだが省略、MouseUpと同じ処理呼べば良い
    state.aiming = false;
    const dx = state.dragStart.x - state.dragCurrent.x;
    const dy = state.dragStart.y - state.dragCurrent.y;
    const mag = Math.sqrt(dx*dx + dy*dy);
    if (mag > 10) {
      const speed = Math.min(20, mag * 0.15);
      shootBall(dx / mag * speed, dy / mag * speed);
    }
  });

  function shootBall(vx, vy) {
    if (state.ballsRemaining <= 0) return;
    state.ballsRemaining--;
    ballsEl.textContent = `Balls: ${state.ballsRemaining}`;
    
    const ball = new Ball(canvas.width / 2, canvas.height - 50);
    ball.vx = vx;
    ball.vy = vy;
    state.balls.push(ball);
    playTone('shoot');
  }

  function init() {
    loadBest();
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    
    // Initial Render
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Audio Init
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
  }

  function startGame() {
    state.running = true;
    state.score = 0;
    state.level = 1;
    state.ballsRemaining = 10; // スタート時は10球
    state.balls = [];
    state.particles = [];
    scoreEl.textContent = 'Score: 0';
    ballsEl.textContent = `Balls: 10`;
    
    setupLevel();
    overlay.classList.add('hidden');
    
    markPlayed();
    requestAnimationFrame(loop);
  }

  function endGame() {
    state.running = false;
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "GAME OVER";
    root.querySelector('.tutorial').innerHTML = `Final Score: <span style="font-size:1.5em;color:#e879f9">${state.score}</span>`;
    startBtn.textContent = "RETRY";
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }
  }

  function loadBest() { try { state.best = parseInt(localStorage.getItem(STORAGE_KEY)||'0'); }catch(e){} }
  function saveBest() { try { localStorage.setItem(STORAGE_KEY, state.best); }catch(e){} }
  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. 画面をドラッグ（スワイプ）して引っ張り、狙いを定めます。
2. 指を離すとボールを発射！
3. プリズム（六角形）に数字が書かれています。ゼロになるまで当てると破壊！
4. 全てのプリズムを壊すとレベルアップ。
5. ボールを画面下に落とすとロスト。持ち玉がなくなるとゲームオーバー。

## 実装メモ
- 反射ベクトルの計算を含む物理挙動をCanvasで実装。
- プリズムの破壊時に多数の三角形パーティクルを生成して散らすことで、タイトル通り「Prism Break」な爽快感を演出。
- レベルが上がるとプリズムの数と耐久度が増加。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
