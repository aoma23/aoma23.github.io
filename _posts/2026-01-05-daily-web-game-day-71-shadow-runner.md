---
title: "毎日ゲームチャレンジ Day 71: シャドウ・ランナー (Shadow Runner)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

71日目は「シャドウ・ランナー」。
光は脅威だ。影の中だけが安全地帯。
動く光源によって刻々と変化する影を見極め、生き残り続けろ！

<style>
#shadow-game {
  width: 100%;
  max-width: 600px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 4px;
  background: #222;
  color: #fff;
  font-family: "Courier New", monospace;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  border: 4px solid #fff;
}
#shadow-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  display: block;
  background: #eee;
  cursor: none; /* Hide cursor for immersion */
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#shadow-game .hud {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-weight: bold;
  font-size: 1.2rem;
  color: #000;
  mix-blend-mode: difference;
  z-index: 10;
}
#shadow-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* or space-evenly? */
  padding: 10px; /* Safety padding */
  z-index: 20;
  color: #fff;
}
#shadow-game .start-overlay.hidden { display: none; }
#shadow-game h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 900;
  letter-spacing: 2px;
  text-transform: uppercase;
  border-bottom: 2px solid #fff;
  padding-bottom: 10px;
}
#shadow-game button.primary {
  border: 2px solid #fff;
  border-radius: 0;
  padding: 12px 36px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #000;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Courier New", monospace;
  text-transform: uppercase;
  margin-top: 10px; /* Reduced margin */
}
#shadow-game .start-overlay * { box-sizing: border-box; } /* Safety */
#shadow-game button.primary:hover {
  background: #000;
  color: #fff;
}
#shadow-game .tutorial {
  margin-bottom: 10px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #ccc;
  max-width: 80%;
}
#shadow-game .danger-flash {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #fff;
  opacity: 0;
  pointer-events: none;
  z-index: 5;
  transition: opacity 0.1s;
}
@media (max-width: 480px) {
  #shadow-game { min-height: 320px; display: flex; flex-direction: column; justify-content: center; }
  #shadow-game h2 { font-size: 1.6rem; margin-bottom: 0.5rem; }
  #shadow-game .tutorial { font-size: 0.75rem; max-width: 95%; margin-bottom: 5px; }
  #shadow-game button.primary { padding: 8px 24px; font-size: 1rem; margin-top: 5px; }
}
</style>

<div id="shadow-game">
  <canvas class="game-canvas" width="800" height="450"></canvas>
  <div class="hud">
    <div class="time">TIME: 0.00</div>
    <div class="best">BEST: 0.00</div>
    <div class="hp">HP: 100%</div>
  </div>
  <div class="danger-flash"></div>
  
  <div class="start-overlay">
    <h2>Shadow Runner</h2>
    <p class="tutorial">
      WARNING: EXTREME SOLAR RADIATION DETECTED.<br>
      STAY IN THE SHADOWS.<br>
      [MOUSE / TOUCH] to Move Left/Right
    </p>
    <button class="primary" id="sr-start-btn">SURVIVE</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('shadow-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const timeEl = root.querySelector('.time');
  const hpEl = root.querySelector('.hp');
  const bestEl = root.querySelector('.best');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('sr-start-btn');
  const flashEl = root.querySelector('.danger-flash');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;
  const SPEED = 5;

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

    if (type === 'damage') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'gameover') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(50, now + 1.0);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.0);
      osc.start(now);
      osc.stop(now + 1.0);
    }
  };

  const state = {
    running: false,
    time: 0,
    hp: 100,
    playerX: 400,
    sunAngle: 0,
    sunSpeed: 0.005,
    platforms: [],
    shadows: [],
    shadows: [],
    difficulty: 1,
    bestTime: 0,
    sunX: 400 // Store sunX to sync update/draw physics
  };
  
  const STORAGE_KEY_BEST = 'aomagame:best:shadowrunner';

  class Platform {
    constructor(x, y, w) {
      this.x = x;
      this.y = y;
      this.w = w;
      // Movement
      this.vx = (Math.random() - 0.5) * 2;
      this.baseX = x;
      this.moveRange = Math.random() * 100;
      this.moveSpeed = Math.random() * 0.02 + 0.01;
    }
    update(t) {
      if (this.moveRange > 0) {
        this.x = this.baseX + Math.sin(t * this.moveSpeed * 100) * this.moveRange;
      }
    }
  }

  function initLevel() {
    state.platforms = [];
    // Generate Random floating platforms
    for (let i = 0; i < 6; i++) {
        const w = 60 + Math.random() * 100;
        const x = Math.random() * (canvas.width - w);
        const y = 50 + Math.random() * 200; // Sky area
        state.platforms.push(new Platform(x, y, w));
    }
    state.hp = 100;
    state.time = 0;
    state.sunAngle = Math.PI / 4; // Start from 45deg
    state.sunSpeed = 0.005;
  }

  function update() {
    state.time += 1/60;
    state.difficulty = 1 + state.time / 30; // 30s for level 2

    // Sun movement (Pendulum or loop?)
    // Let's make the sun oscillate left to right to force movement
    // Sun position source:
    // We treat Sun as a point source at y = -500 (very high)
    // But varying X.
    
    // Cycle: 0 to PI (Sunrise to Sunset)
    // But we want endless survival, so maybe it loops?
    // Let's simulate a moving spotlight effect.
    state.sunAngle += state.sunSpeed * state.difficulty * 0.5;
    
    // Platforms Move
    state.platforms.forEach(p => p.update(state.time));

    // Calculate Shadows
    // Ground is at y = canvas.height - 20
    const groundY = canvas.height;
    const sunY = -200;
    // Sun X moves sinusoidally wildly
    // Sun X moves sinusoidally but kept closer to ensure shadows exist
    // Sun X moves sinusoidally but kept closer to ensure shadows exist
    const sunX = canvas.width / 2 + Math.sin(state.time * 0.5 * state.difficulty) * (canvas.width * 0.7);
    state.sunX = sunX; // Store for draw

    state.shadows = []; // Array of intervals [start, end]

    state.platforms.forEach(p => {
        // Project left edge and right edge
        // Vector from sun to edge
        // Left Edge
        const lx = p.x;
        const ly = p.y;
        // Right Edge
        const rx = p.x + p.w;
        const ry = p.y;

        // Projection logic:
        // P_ground = P_obj + (P_obj - Sun) * scale
        // scale = (groundY - objY) / (objY - sunY) ? No, simpler vector math
        // ratio = (groundY - sunY) / (objY - sunY) -> projected X relative to sunX?
        
        // Let's use similar triangles
        // (x - sunX) / (y - sunY) = (shadowX - sunX) / (groundY - sunY)
        // shadowX = sunX + (x - sunX) * (groundY - sunY) / (y - sunY)
        
        const projL = sunX + (lx - sunX) * (groundY - sunY) / (ly - sunY);
        const projR = sunX + (rx - sunX) * (groundY - sunY) / (ry - sunY);
        
        // Depending on sun position relative to object, L might be right of R?
        // No, assuming sunY < objY < groundY, and sun is single point, order should be preserved if not crossing?
        // If Object is "above" ground and sun is "above" object.
        
        let start = Math.min(projL, projR);
        let end = Math.max(projL, projR);
        
        // Clip to canvas? No, keep logic bounds
        state.shadows.push({ start, end });
    });

    // Merge overlapping shadows for collision
    state.shadows.sort((a,b) => a.start - b.start);
    // (Simple merge not strictly needed for point check, but good for drawing)
    
    // Player Logic
    // Player is controlled by mouse/touch X
    // Lerp towards input
    const targetX = state.inputX || canvas.width/2;
    state.playerX += (targetX - state.playerX) * 0.2;
    
    // Clamp
    if (state.playerX < 0) state.playerX = 0;
    if (state.playerX > canvas.width) state.playerX = canvas.width;

    // Damage Check
    const playerW = 10;
    const px = state.playerX;
    
    // Is px inside any shadow?
    let safe = false;
    for (const sh of state.shadows) {
        if (px >= sh.start && px <= sh.end) {
            safe = true;
            break;
        }
    }

    if (!safe) {
        state.hp -= 2 * state.difficulty; // Damage
        if (Math.random() < 0.2) playTone('damage');
        flashEl.style.opacity = '0.5';
    } else {
        // Recovery? slightly
        if (state.hp < 100) state.hp += 0.5;
        flashEl.style.opacity = '0';
    }

    if (state.hp <= 0) {
        state.hp = 0;
        endGame();
    }

    // Update UI
    timeEl.textContent = `TIME: ${state.time.toFixed(2)}`;
    hpEl.textContent = `HP: ${Math.floor(state.hp)}%`;
    
    if (state.hp < 30) hpEl.style.color = '#f00';
    else hpEl.style.color = state.safe ? '#0f0' : '#444'; // Blend difference makes this tricky, stick to numeric
}

  function draw() {
    // Clear (White background = Light)
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Sun Position (for reference, though maybe offscreen)
    // Draw Sun Position (for reference, though maybe offscreen)
    const sunX = state.sunX; // Use synced value
    const sunY = -200;
    
    // Draw Sun rays?
    // Just minimal visual

    // Draw Shadows (Black)
    ctx.fillStyle = '#000';
    state.shadows.forEach(sh => {
        ctx.fillRect(sh.start, 0, sh.end - sh.start, canvas.height);
    });

    // Note: The above draws shadows as full vertical bars? 
    // Wait, physically shadows are on the *ground*.
    // And logically "Light is Lava" means the air is filled with light?
    // Concept: "Shadow Runner". Usually implies running *on the ground*.
    // So visual should be:
    // White Sky. Black Objects. 
    // Shadows are projected onto the ground (bottom of screen).
    
    // Let's refine visual:
    // 1. Sky Gradient (Light)
    // 2. Draw Platforms (Black shapes)
    // 3. Draw Rays?
    // 4. Draw Ground Level. Shadow areas on ground are Black. Light areas are White.
    
    // Re-draw
    ctx.fillStyle = '#eee'; // Light Sky
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Rays (Subtle)
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffff00';
    // Complex to draw volumetric, skip for performance/style
    
    // Draw Platforms and their individual shadow projections
    ctx.globalAlpha = 1.0;
    
    const groundY = canvas.height;
    
    state.platforms.forEach(p => {
        // Draw Shadow Polygon from object to ground
        // Vertices: L_obj, R_obj, R_proj, L_proj
        
        // Projection calculation again for drawing
        const lx = p.x;
        const ly = p.y;
        const rx = p.x + p.w;
        const ry = p.y;
        
        const projL = sunX + (lx - sunX) * (groundY - sunY) / (ly - sunY);
        const projR = sunX + (rx - sunX) * (groundY - sunY) / (ry - sunY);

        ctx.fillStyle = '#222'; // Shadow color
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(rx, ry);
        ctx.lineTo(projR, groundY);
        ctx.lineTo(projL, groundY);
        ctx.closePath();
        ctx.fill();
        
        // Draw Object
        ctx.fillStyle = '#000';
        ctx.fillRect(p.x, p.y, p.w, 20);
    });

    // Draw Ground Strip
    ctx.fillStyle = '#fff'; // Dangerous Ground
    ctx.fillRect(0, groundY - 20, canvas.width, 20);
    
    // Overlay Shadows on Ground Strip
    ctx.fillStyle = '#000'; // Safe Shadow
    state.shadows.forEach(sh => {
        ctx.fillRect(sh.start, groundY - 20, sh.end - sh.start, 20);
    });

    // Player
    ctx.fillStyle = '#f00'; // Player is Red
    ctx.beginPath();
    // Triangle
    ctx.moveTo(state.playerX, groundY - 30);
    ctx.lineTo(state.playerX - 8, groundY - 10);
    ctx.lineTo(state.playerX + 8, groundY - 10);
    ctx.fill();
    
    // Draw Sun Direction Indicator
    ctx.fillStyle = '#fa0';
    ctx.beginPath();
    ctx.arc(Math.max(10, Math.min(canvas.width-10, sunX)), 30, 10, 0, Math.PI*2);
    ctx.fill();
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Input
  function handleInput(x) {
    if (!state.running) return;
    state.inputX = x;
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    handleInput(x);
  });
  
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
    handleInput(x);
  }, { passive: false });
  
  canvas.addEventListener('touchstart', e => {
     if (!state.running) return;
     const rect = canvas.getBoundingClientRect();
     const x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
     handleInput(x);
  }, { passive: false });

  // Init
  function init() {
    updatePlayCount();
    
    // Load Best
    const saved = localStorage.getItem(STORAGE_KEY_BEST);
    if (saved) {
        state.bestTime = parseFloat(saved);
        bestEl.textContent = `BEST: ${state.bestTime.toFixed(2)}`;
    }
    
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
    
    // Initial Render
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    state.inputX = canvas.width / 2;
  }

  function startGame() {
    state.running = true;
    overlay.classList.add('hidden');
    initLevel();
    markPlayed();
    requestAnimationFrame(loop);
  }

  function endGame() {
    state.running = false;
    stopAudio();
    
    // Update Best
    if (state.time > state.bestTime) {
        state.bestTime = state.time;
        localStorage.setItem(STORAGE_KEY_BEST, state.bestTime.toFixed(2));
        bestEl.textContent = `BEST: ${state.bestTime.toFixed(2)}`;
    }
    
    overlay.classList.remove('hidden');
    playTone('gameover');
    root.querySelector('h2').textContent = "SEVERED";
    root.querySelector('.tutorial').innerHTML = `SURVIVAL TIME: <span style="font-size:1.5em;color:#fff">${state.time.toFixed(2)}s</span><br>BEST: ${state.bestTime.toFixed(2)}s`;
    startBtn.textContent = "AGAIN";
  }
  
  function stopAudio() {
    // 
  }

  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. 光源（太陽）が左右に移動します。
2. 空中のブロックから地面に落ちる「影」が安全地帯です。
3. マウスまたはタッチ操作で赤い三角形（プレイヤー）を左右に動かします。
4. 白い光に当たるとHPが減ります。影の中に逃げ込み続けてください。

## 実装メモ
- 太陽の位置とオブジェクトの頂点から、地面への射影変換を計算して影を描画。
- 光源が移動することで影が伸び縮みし、ダイナミックに安全地帯が変化する。
- プレイヤー追従は線形補間（Lerp）で滑らかに。
