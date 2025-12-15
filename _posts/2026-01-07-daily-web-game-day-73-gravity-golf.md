---
title: "毎日ゲームチャレンジ Day 73: グラビティ・ゴルフ (Gravity Golf)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

73日目は「グラビティ・ゴルフ」。
宇宙空間でゴルフ。
惑星の重力を計算に入れて、ボールをホール（ワームホール）に入れましょう。
予測線が表示されるので、それを頼りにナイスショットを決めてください！

<style>
#gravity-game {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 50%; /* 丸い窓 */
  background: #111;
  color: #fff;
  font-family: "Futura", sans-serif;
  text-align: center;
  box-shadow: 0 0 40px rgba(100, 100, 255, 0.3);
  position: relative;
  overflow: hidden;
  border: 4px solid #446;
  aspect-ratio: 1/1;
}
#gravity-game .game-canvas {
  width: 100%;
  height: 100%;
  display: block;
  background: radial-gradient(circle at center, #1a1a2e 0%, #000 100%);
  cursor: crosshair;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: 50%;
}
#gravity-game .hud {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
  pointer-events: none;
  font-weight: bold;
  font-size: 1.1rem;
  z-index: 10;
}
#gravity-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 50%;
}
#gravity-game .start-overlay.hidden { display: none; }
#gravity-game h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #aae;
}
#gravity-game button.primary {
  border: 2px solid #aae;
  background: transparent;
  color: #aae;
  padding: 12px 36px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 24px;
  transition: all 0.2s;
}
#gravity-game button.primary:hover {
  background: #aae;
  color: #000;
}
</style>

<div id="gravity-game">
  <canvas class="game-canvas" width="500" height="500"></canvas>
  <div class="hud">
    <div class="shots">SHOTS: 3</div>
    <div class="score">SCORE: 0</div>
  </div>
  
  <div class="start-overlay">
    <h2>GRAVITY GOLF</h2>
    <p style="margin-bottom:20px;color:#ccc">
      Drag to Aim & Power<br>
      Use Gravity<br>
      Reach the Wormhole
    </p>
    <button class="primary" id="gg-start-btn">LAUNCH</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('gravity-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const shotsEl = root.querySelector('.shots');
  const scoreEl = root.querySelector('.score');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('gg-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
  const PLAYED_KEY = 'aomagame:played:gravity-golf';

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

    if (type === 'hit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'goal') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  const state = {
    running: false,
    shots: 3,
    score: 0,
    ball: { x: 0, y: 0, vx: 0, vy: 0, moving: false, radius: 6 },
    hole: { x: 0, y: 0, radius: 15 },
    planets: [], // {x, y, mass, radius}
    drag: { active: false, x: 0, y: 0, currX: 0, currY: 0 },
    simTrail: []
  };

  const G = 400; // Gravitational Constant Adjustment (Increased per user feedback)

  function setupLevel() {
    // Reset Ball
    state.ball.moving = false;
    state.ball.vx = 0;
    state.ball.vy = 0;
    
    // Spawn Ball (Bottom Area)
    state.ball.x = canvas.width / 2;
    state.ball.y = canvas.height - 80;

    // Spawn Hole (Top Area)
    state.hole.x = canvas.width / 2 + (Math.random() - 0.5) * 200;
    state.hole.y = 80 + Math.random() * 50;
    
    // Spawn Planets (Obstacles/Attractors)
    state.planets = [];
    const count = 1 + Math.floor(Math.random() * 2) + Math.floor(state.score / 3);

    for (let i=0; i<count; i++) {
        const isSuperDense = Math.random() < 0.3; // 30% chance for Strong Gravity
        const r = isSuperDense ? 15 + Math.random() * 10 : 20 + Math.random() * 30;
        const density = isSuperDense ? 8.0 : 1.5;
        
        state.planets.push({
            x: Math.random() * 300 + 100,
            y: Math.random() * 200 + 150,
            radius: r,
            mass: r * density,
            color: isSuperDense ? '#f0f' : `hsl(${Math.random()*360}, 60%, 50%)`,
            isSuperDense: isSuperDense
        });
    }
  }

  function physicsStep(obj, dt) {
    if (!obj.moving) return;
    
    // Gravity from planets
    let ax = 0;
    let ay = 0;
    state.planets.forEach(p => {
        const dx = p.x - obj.x;
        const dy = p.y - obj.y;
        const distSq = dx*dx + dy*dy;
        const dist = Math.sqrt(distSq);
        
        // F = G * M / r^2
        if (dist > p.radius) { // Simple check to avoid singularities
            const force = G * p.mass / distSq;
            ax += (dx / dist) * force;
            ay += (dy / dist) * force;
        }
    });

    obj.vx += ax * dt;
    obj.vy += ay * dt;
    obj.x += obj.vx * dt;
    obj.y += obj.vy * dt;
  }

  function simulateTrajectory(vx, vy) {
    // Clone ball state
    const simBall = { 
        x: state.ball.x, 
        y: state.ball.y, 
        vx: vx, 
        vy: vy, 
        moving: true 
    };
    
    const points = [];
    const dt = 1/60;
    const maxSteps = 180; // 3 seconds prediction
    
    for(let i=0; i<maxSteps; i++) {
        points.push({x: simBall.x, y: simBall.y});
        physicsStep(simBall, dt);
        
        // Collision Checks (Simplified)
        let collision = false;
        
        // Hole?
        const dxH = simBall.x - state.hole.x;
        const dyH = simBall.y - state.hole.y;
        if (dxH*dxH + dyH*dyH < (state.hole.radius + 10)**2) {
            return points; // Goal reached in sim
        }

        // Planets?
        for (const p of state.planets) {
             const dx = simBall.x - p.x;
             const dy = simBall.y - p.y;
             if (dx*dx + dy*dy < (p.radius + 5)**2) {
                 collision = true;
                 break;
             }
        }
        if (collision) break;
        
        // Bounds (Circular)
        const dxc = simBall.x - canvas.width / 2;
        const dyc = simBall.y - canvas.height / 2;
        if (dxc*dxc + dyc*dyc > (canvas.width / 2)**2) {
            break;
        }
    }
    return points;
  }

  function update() {
    if (state.ball.moving) {
        physicsStep(state.ball, 1/60);
        
        // Collision Hole
        const dx = state.ball.x - state.hole.x;
        const dy = state.ball.y - state.hole.y;
        if (dx*dx + dy*dy < (state.hole.radius + state.ball.radius)**2) {
            // GOAL
            playTone('goal');
            state.score++;
            // No bonus shots per feedback
            scoreEl.textContent = `SCORE: ${state.score}`;
            shotsEl.textContent = `SHOTS: ${state.shots}`;
            setupLevel();
        }

        // Collision Planet
        for (const p of state.planets) {
            const dxp = state.ball.x - p.x;
            const dyp = state.ball.y - p.y;
            if (dxp*dxp + dyp*dyp < (p.radius + state.ball.radius)**2) {
                // Crash
                playTone('hit');
                state.ball.moving = false;
                state.shots--;
                shotsEl.textContent = `SHOTS: ${state.shots}`;
                checkGameOver();
                if (state.running) setupLevel(); // Retry level or same? Let's reset pos
            }
        }

        // Out of Bounds (Circular)
        const dxc = state.ball.x - canvas.width / 2;
        const dyc = state.ball.y - canvas.height / 2;
        if (dxc*dxc + dyc*dyc > (canvas.width / 2)**2) {
            state.ball.moving = false;
            state.shots--;
            shotsEl.textContent = `SHOTS: ${state.shots}`;
            checkGameOver();
            if (state.running) setupLevel();
        }
    }
  }
  
  function checkGameOver() {
    if (state.shots <= 0) {
        state.running = false;
        overlay.classList.remove('hidden');
        root.querySelector('h2').textContent = "OUT OF FUEL";
        root.querySelector('p').innerHTML = `SCORE: ${state.score}`;
        startBtn.textContent = "RETRY";
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // BG is CSS

    // Draw Planets
    state.planets.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.fill();
        // Gravity Aura
        const auraColor = p.isSuperDense ? 'rgba(255, 0, 255, 0.2)' : 'rgba(255,255,255,0.1)';
        const grad = ctx.createRadialGradient(p.x, p.y, p.radius, p.x, p.y, p.radius * (p.isSuperDense ? 4 : 2));
        grad.addColorStop(0, auraColor);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (p.isSuperDense ? 4 : 2), 0, Math.PI*2);
        ctx.fill();
    });

    // Draw Hole
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#0ff';
    ctx.beginPath();
    ctx.arc(state.hole.x, state.hole.y, state.hole.radius, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Ball
    if (state.running) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI*2);
        ctx.fill();
    }

    // Drag Line & Trajectory
    if (state.drag.active && !state.ball.moving) {
        const dx = state.drag.x - state.drag.currX;
        const dy = state.drag.y - state.drag.currY;
        
        // Power multiplier
        const vx = dx * 1.5; // Reduced from 3
        const vy = dy * 1.5;
        
        // Prediction
        const points = simulateTrajectory(vx, vy);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(state.ball.x, state.ball.y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Aim Line
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(state.ball.x, state.ball.y);
        ctx.lineTo(state.ball.x + dx, state.ball.y + dy); // Visualizing pull back or forward? Usually Pull back -> shoot forward
        // If I pull back (drag down), I want ball to go Up.
        // dx = start - curr. If start is center and I drag down(currY > startY), dy is negative.
        // So ball goes Up. Correct.
        ctx.stroke();
    }
  }

  function loop() {
    if (state.running) update();
    draw();
    requestAnimationFrame(loop);
  }

  // Inputs
  function startDrag(x, y) {
    if (!state.running || state.ball.moving) return;
    state.drag.active = true;
    state.drag.x = x;
    state.drag.y = y;
    state.drag.currX = x;
    state.drag.currY = y;
  }
  
  function moveDrag(x, y) {
    if (!state.drag.active) return;
    state.drag.currX = x;
    state.drag.currY = y;
  }
  
  function endDrag() {
    if (!state.drag.active) return;
    state.drag.active = false;
    
    // Shoot
    const dx = state.drag.x - state.drag.currX;
    const dy = state.drag.y - state.drag.currY;
    const mag = Math.sqrt(dx*dx + dy*dy);
    
    if (mag > 5) {
        state.ball.vx = dx * 1.5; // Reduced from 3
        state.ball.vy = dy * 1.5;
        state.ball.moving = true;
        playTone('hit');
    }
  }

  canvas.addEventListener('mousedown', e => {
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      startDrag((e.clientX - r.left)*scale, (e.clientY - r.top)*scale);
  });
  window.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      moveDrag((e.clientX - r.left)*scale, (e.clientY - r.top)*scale);
  });
  window.addEventListener('mouseup', endDrag);

  canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      startDrag((e.touches[0].clientX - r.left)*scale, (e.touches[0].clientY - r.top)*scale);
  }, {passive:false});
  window.addEventListener('touchmove', e => {
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      moveDrag((e.touches[0].clientX - r.left)*scale, (e.touches[0].clientY - r.top)*scale);
  }, {passive:false});
  window.addEventListener('touchend', endDrag);

  function init() {
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
  }

  function startGame() {
    state.running = true;
    state.shots = 5;
    state.score = 0;
    shotsEl.textContent = "SHOTS: 5";
    scoreEl.textContent = "SCORE: 0";
    overlay.classList.add('hidden');
    
    setupLevel();
    markPlayed();
    requestAnimationFrame(loop);
  }

  function updatePlayCount() {
    const counterEl = getPlayCountEl();
    if (!counterEl) return;
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (typeof key !== 'string' || !key.startsWith('aomagame:played:')) continue;
        const value = parseInt(localStorage.getItem(key) || '0', 10);
        if (!isNaN(value) && value > 0) total++;
      }
      counterEl.textContent = total;
    } catch (e) { counterEl.textContent = '0'; }
  }

  function markPlayed() {
    try {
      const current = parseInt(localStorage.getItem(PLAYED_KEY) || '0', 10);
      localStorage.setItem(PLAYED_KEY, String(current + 1));
    } catch(e) {}
    updatePlayCount();
  }

  init();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }

})();
</script>

## 遊び方
1. 画面をドラッグして、引っ張る強さと角度を調整します。
2. 指を離すとボールを発射！
3. 惑星の重力を利用して、白いワームホール（ゴール）に入れてください。
4. 惑星に衝突したり、画面外に出るとミス。持ち玉（SHOTS）が減ります。
5. ゴールすると持ち玉が少し回復します。

## 実装メモ
- N体問題（N-body simulation）の簡易版を実装。各惑星からの引力を合算してボールの軌道を計算しています。
- 発射前に未来の軌道を予測線（Trajectory）として描画する機能つき。
- CSSの `border-radius: 50%` で丸い窓のような見た目にし、宇宙船の覗き窓を表現。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
