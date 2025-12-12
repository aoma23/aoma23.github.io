---
title: "毎日ゲームチャレンジ Day 78: ペーパー・プレーン (Paper Plane)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-77-magnet-core/' | relative_url }}">マグネット・コア</a>

78日目は「ペーパー・プレーン」。
紙飛行機になって風に乗ろう。
急降下で加速し、上昇気流を捕まえ、どこまでも遠くへ。
癒やし系フライトアクションです。

<style>
#plane-game {
  width: 100%;
  max-width: 600px;
  margin: 24px auto;
  padding: 0;
  border-radius: 8px;
  background: #87CEEB; /* Sky */
  color: #fff;
  font-family: "Segoe UI", sans-serif;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  min-height: 400px;
}
#plane-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  display: block;
  background: linear-gradient(#87CEEB, #E0F7FA);
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#plane-game .hud {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-weight: bold;
  font-size: 1.2rem;
  color: #555;
  z-index: 10;
}
#plane-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border: none;
  overflow-y: auto;
}
#plane-game .start-overlay.hidden { display: none; }
#plane-game h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #555;
  font-weight: 300;
  letter-spacing: 2px;
}
#plane-game button.primary {
  border: none;
  background: #fff;
  color: #555;
  padding: 14px 40px;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}
#plane-game button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}
#plane-game .controls-hint {
   position: absolute;
   bottom: 10px;
   left: 0; right: 0;
   color: #777;
   font-size: 0.9rem;
   pointer-events: none;
   opacity: 0.8;
}
@media (max-width: 480px) {
  #plane-game { min-height: 320px; }
  #plane-game .start-overlay { padding: 10px; justify-content: center; }
  #plane-game h2 { font-size: 1.6rem; margin-bottom: 0.5rem; }
  #plane-game p { font-size: 0.8rem; margin-bottom: 10px; line-height: 1.4; }
  #plane-game button.primary { padding: 8px 30px; font-size: 1rem; margin-top: 5px;}
  #plane-game .hud { font-size: 1rem; }
}
</style>

<div id="plane-game">
  <canvas class="game-canvas" width="800" height="450"></canvas>
  <div class="hud">
    <div class="dist">0m</div>
    <div class="alt">Alt: 100m</div>
  </div>
  
  <div class="controls-hint">[LEFT] Nose UP / [RIGHT] Nose DOWN</div>

  <div class="start-overlay">
    <h2>PAPER PLANE</h2>
    <p style="margin-bottom:20px;color:#666">
      Control Pitch to Glide.<br>
      Dive to gain Speed.<br>
      Pull up to gain Height.<br>
      Catch Wind for Boost.
    </p>
    <button class="primary" id="pp-start-btn">TAKEOFF</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('plane-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const distEl = root.querySelector('.dist');
  const altEl = root.querySelector('.alt');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('pp-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  let audioCtx = null;
  const ensureAudio = () => {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    if (!audioCtx) audioCtx = new C();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  };

  // Simplistic Synth for wind noise?
  let windNode = null;
  let windGain = null;
  
  const initAudio = () => {
    if (!audioCtx) return;
    // Wind noise (White noise buffer)
    const bufferSize = audioCtx.sampleRate * 2; // 2 sec
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0; i<bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    if (windNode) { 
        try { windNode.stop(); windNode.disconnect(); } catch(e){} 
        windNode = null; 
    }
    windNode = audioCtx.createBufferSource();
    windNode.buffer = buffer;
    windNode.loop = true;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000; // Increased from 400 for audibility
    
    windGain = audioCtx.createGain();
    windGain.gain.value = 0;
    
    windNode.connect(filter);
    filter.connect(windGain);
    windGain.connect(audioCtx.destination);
    windNode.start();
  };
  
  const updateWindSound = (speed) => {
      if (!windGain) return;
      // Speed 0-25 mapping
      // Logarithmic-ish volume? Or just linear boost.
      // Audible range: 0.1 to 0.6
      const ratio = Math.min(1.0, Math.max(0, speed / 25));
      const vol = ratio * 0.5;
      windGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);
  };

  const state = {
    running: false,
    score: 0,
    x: 100, // Visual X (player fixed mostly)
    y: 200, 
    vx: 10,
    vy: 0,
    angle: 0, // Radians, 0 = right
    camX: 0,
    windZones: [],
    clouds: [],
    keys: { left: false, right: false },
    rafId: null
  };

  const GRAVITY = 0.12;
  const DRAG = 0.998; // Less drag = maintain speed longer
  const LIFT_COEFF = 0.002;
  const ROT_SPEED = 0.05;

  function initLevel() {
    state.x = 0;
    state.y = 200; 
    state.vx = 9;  // Slightly reduced start speed
    state.vy = 0;
    state.angle = 0;
    state.camX = 0;
    state.score = 0;
    state.nextGenX = null;
    
    state.windZones = [];
    state.clouds = [];
    
    // Guaranteed first updraft for easier start
    state.windZones.push({
        x: 500,
        y: 100,
        w: 150,
        h: 400
    });
    
    // Gen initial clouds
    for(let i=0; i<10; i++) {
        state.clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            scale: 0.5 + Math.random(),
            speed: Math.random() * 0.5
        });
    }
  }

  function update() {
    // Input Handling
    // Left = Nose Up (Angle Decrease, toward -PI/2)
    // Right = Nose Down (Angle Increase, toward PI/2)
    if (state.keys.left) state.angle -= ROT_SPEED;
    if (state.keys.right) state.angle += ROT_SPEED;
    
    // Clamp Angle (-80deg to +80deg)
    const MAX_ANG = 1.2;
    if (state.angle < -MAX_ANG) state.angle = -MAX_ANG;
    if (state.angle > MAX_ANG) state.angle = MAX_ANG;

    // Safety check for NaN or Infinity
    if (!Number.isFinite(state.x) || !Number.isFinite(state.y) || !Number.isFinite(state.vx) || !Number.isFinite(state.vy)) {
        console.warn("Physics Error (NaN/Infinity), resetting");
        state.x = 0;
        state.y = 200;
        state.vx = 10;
        state.vy = 0;
        state.angle = 0;
    }

    // Physics
    let speed = Math.sqrt(state.vx*state.vx + state.vy*state.vy);
    const MAX_SPEED = 25.0; // Prevent explosion
    if (speed > MAX_SPEED) {
        const ratio = MAX_SPEED / speed;
        state.vx *= ratio;
        state.vy *= ratio;
        speed = MAX_SPEED;
    }
    
    // Drag
    state.vx *= DRAG;
    state.vy *= DRAG;
    
    // Gravity
    state.vy += GRAVITY;
    
    // Lift / Aerodynamics
    // Simple model: Velocity tends to align with Angle over time, preserving momentum?
    // Or: Lift force component perpendicular to velocity.
    // Let's use simplified arcade logic:
    // "Glide Ratio":
    // If Nose Down -> Accel.
    // If Nose Up -> Decel but Gain Lift (reduce gravity effect or go up).
    
    // Add velocity in direction of angle (Thrust from Gravity/Dive)
    // Gravity adds vertical velocity. 
    // We redirect velocity based on angle.
    // New V vector is blend of Old V and Angle vector?
    
    const targetVx = Math.cos(state.angle) * speed;
    const targetVy = Math.sin(state.angle) * speed;
    
    // Blending (Aerodynamic stability)
    state.vx += (targetVx - state.vx) * 0.1;
    state.vy += (targetVy - state.vy) * 0.1;
    
    // Lift from speed (Opposing gravity)
    // Only effective if angle is reasonable (not stalling)
    // Lift = SpeedSq * Coeff
    // Apply lift vertically upwards? No, perpendicular to airflow.
    // Force up:
    const lift = speed * speed * LIFT_COEFF * Math.cos(state.angle); // Less lift if diving vertical
    state.vy -= lift;
    
    // Induced Drag (Energy loss from lift/turning)
    // Greatly reduced penalty so turning doesn't kill speed immediately
    const inducedDrag = 1.0 - (Math.abs(state.angle) * 0.005);
    state.vx *= inducedDrag;
    state.vy *= inducedDrag;
    
    // Movement
    state.x += state.vx;
    state.y += state.vy;
    state.camX = state.x - 200; // Camera follows
    
    // Wind Interaction
    for(const w of state.windZones) {
        if (state.x > w.x && state.x < w.x + w.w && state.y > w.y && state.y < w.y + w.h) {
            state.vy -= 0.20; // Stronger Updraft
            state.vx += 0.05; // Tailwind
        }
    }
    
    // Gen World
    // Generate more frequently (every 300px)
    if (state.x > state.nextGenX || !state.nextGenX) {
        // Spawn Wind
        if (Math.random() < 0.7) { // 70% chance
            state.windZones.push({
                x: state.x + 800 + Math.random()*200,
                y: 50 + Math.random()*400, // Varied height
                w: 80 + Math.random()*150, // Varied width (Fat winds)
                h: 300 + Math.random()*300 // Tall winds
            });
        }
        state.nextGenX = state.x + 300; // Closer generation check
        
        // Spawn Cloud
        state.clouds.push({
            x: state.x + 900,
            y: Math.random() * 400,
            scale: 0.5 + Math.random(),
            speed: Math.random() * 0.5
        });
    }
    
    // Cleanup
    if (state.clouds.length > 20) state.clouds.shift();
    if (state.windZones.length > 5) state.windZones.shift();

    // Ground Collision
    const groundY = canvas.height;
    if (state.y >= groundY - 20) {
        // Land or Crash?
        // If slow and flat -> Land?
        state.running = false;
        state.y = groundY - 20;
        gameOver();
    }
    
    // UI
    state.score = Math.floor(state.x / 100);
    distEl.textContent = state.score + "m";
    altEl.textContent = "Alt: " + Math.floor(Math.max(0, (groundY - state.y))) + "m";
    
    updateWindSound(speed);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Gradient BG via CSS/Canvas fill
    // Re-fill gradient for clean slate
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Camera Transform (Only X scrolls, Y is fixed for ground reference? Or follow Y?)
    // Game Y: 0 is top. Plane can go negative (high). 
    // Let's clamp camera Y to keep ground visible or follow plane logic.
    // If plane goes very high, camera should follow.
    
    // Smart Cam Y
    const targetCamY = state.y - canvas.height/2;
    // But clamp bottom
    let camY = targetCamY;
    if (camY > 0) camY = 0; // Don't show below ground
    // If plane is at ground (450), camY = 225. ground is at 450. 
    // View: [225 ... 675]. Ground is visible.
    // Actually we want ground at bottom. Ground Y = 450.
    // If plane y = 430. Cam center = 430. Range [205..655]. 450 is visible.
    // If plane y = -100. Cam center = -100. Range [-325..125]. Ground not visible.
    
    ctx.translate(-state.camX, -camY);

    // Clouds (Parallax)
    state.clouds.forEach(c => {
        // Parallax X
        const pX = c.x - (state.camX * 0.5 * c.speed); 
        // Need to draw at absolute position relative to cam
        // Better: draw logical position, apply parallax offset manually?
        // Actually since we translated context by -camX, drawing at c.x means 1:1 movement.
        // For parallax, we draw at c.x + offset.
        // Offset = camX * (1 - factor).
        
        const drawX = c.x + state.camX * (1 - c.speed*0.5); // Moves slower
        
        drawCloud(ctx, drawX, c.y, c.scale);
    });
    
    // Wind Zones
    state.windZones.forEach(w => {
        // Draw flow lines
        ctx.strokeStyle = 'rgba(0, 100, 255, 0.5)'; // Blueish for visibility
        ctx.lineWidth = 3;
        ctx.beginPath();
        for(let i=0; i<5; i++) {
            const lx = w.x + 20*i;
            ctx.moveTo(lx, w.y + w.h);
            // Wavy line
            ctx.bezierCurveTo(lx + 20, w.y + w.h/2, lx - 20, w.y + w.h/4, lx, w.y);
        }
        ctx.stroke();
    });

    // Ground
    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(state.camX - 100, 450, canvas.width + 200, 500); // Infinite strip locally

    // Plane
    ctx.save();
    ctx.translate(state.x, state.y);
    ctx.rotate(state.angle);
    
    // Draw Paper Plane
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, 8);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-10, -8);
    ctx.closePath();
    ctx.fill();
    // Fold crease
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-5, 0);
    ctx.stroke();
    
    ctx.restore();

    ctx.restore();
  }
  
  function drawCloud(ctx, x, y, scale) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, 30*scale, 0, Math.PI*2);
      ctx.arc(x+25*scale, y-10*scale, 35*scale, 0, Math.PI*2);
      ctx.arc(x+50*scale, y, 30*scale, 0, Math.PI*2);
      ctx.fill();
  }

  function loop() {
    if (state.running) update();
    draw();
    state.rafId = requestAnimationFrame(loop);
  }

  // Inputs
  // state.keys initialized in state
  
  const handleKey = (code, down) => {
      if (code === 'ArrowLeft') state.keys.left = down;
      if (code === 'ArrowRight') state.keys.right = down;
  };
  
  window.addEventListener('keydown', e => handleKey(e.code, true));
  window.addEventListener('keyup', e => handleKey(e.code, false));

  const handleTouch = (x, width) => {
      // Screen split? Left/Right?
      // Center based.
      if (x < width / 2) {
          state.keys.left = true;
          state.keys.right = false;
      } else {
          state.keys.left = false;
          state.keys.right = true;
      }
  };
  
  canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      handleTouch(e.touches[0].clientX - rect.left, rect.width);
  }, {passive:false});
  
  canvas.addEventListener('touchend', e => {
      state.keys.left = false;
      state.keys.right = false;
  });

  function init() {
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
  }

  function startGame() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.running = true;
    ensureAudio();
    initLevel();
    initAudio(); // Start wind noise
    overlay.classList.add('hidden');
    markPlayed();
    state.rafId = requestAnimationFrame(loop);
  }

  function gameOver() {
    state.running = false;
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "FLIGHT ENDED";
    root.querySelector('p').innerHTML = `DISTANCE: <span style="font-size:1.5em">${Math.floor(state.score)}m</span>`;
    startBtn.textContent = "FLY AGAIN";
    if (windGain) windGain.gain.setValueAtTime(0, audioCtx.currentTime); 
  }

  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. 紙飛行機は自動で進みます。
2. **左キー（または画面左側タップ）**で機首を上げ、**右キー（または画面右側タップ）**で機首を下げます。
3. 機首を下げると降下して**加速**します。
4. 加速した状態で機首を上げると、速度を高度に変換でき、遠くまで飛べます。
5. 上昇気流（縦の風）を見つけたら乗ってください。高く飛び上がるチャンスです。
6. 地面に着陸すると終了です。

## 実装メモ
- 簡易的な揚力（Lift）と抗力（Drag）の計算を取り入れたフライトシミュレーション。
- 速度の二乗に比例する揚力が働くため、「急降下でスピードをつけてから引き起こす」というグライダー特有の操縦感が楽しめます。
- Web Audio API でノイズバッファを用いた「風切り音」を生成し、速度に応じて音程と音量を変化させています。
