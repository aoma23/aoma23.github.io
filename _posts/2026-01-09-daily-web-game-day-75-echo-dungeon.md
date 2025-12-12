---
title: "毎日ゲームチャレンジ Day 75: エコー・ダンジョン (Echo Dungeon)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

75日目は「エコー・ダンジョン」。
完全な暗闇の中、頼りになるのは「音」だけ。
タップして音を発し、その反響（エコー）で壁の位置を確かめながら迷宮の出口を探せ。

<style>
#echo-game {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 8px;
  background: #000;
  color: #fff;
  font-family: serif;
  text-align: center;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  border: 1px solid #333;
}
#echo-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: block;
  background: #000;
  cursor: crosshair;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#echo-game .hud {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: center;
  pointer-events: none;
  font-size: 1.2rem;
  letter-spacing: 2px;
  color: #fff;
  mix-blend-mode: difference;
  z-index: 10;
}
#echo-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
#echo-game .start-overlay.hidden { display: none; }
#echo-game h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #fff;
  font-weight: normal;
  letter-spacing: 5px;
  border-bottom: 1px solid #fff;
  padding-bottom: 10px;
}
#echo-game button.primary {
  border: 1px solid #fff;
  background: transparent;
  color: #fff;
  padding: 16px 40px;
  font-size: 1rem;
  cursor: pointer;
  letter-spacing: 2px;
  transition: background 0.3s;
}
#echo-game button.primary:hover {
  background: #fff;
  color: #000;
}
</style>

<div id="echo-game">
  <canvas class="game-canvas" width="500" height="500"></canvas>
  <div class="hud">
    <div class="status">LEVEL 1</div>
  </div>
  
  <div class="start-overlay">
    <h2>ECHO DUNGEON</h2>
    <p style="margin-bottom:30px;color:#aaa">
      Tap/Click to Ping<br>
      Follow the Echo<br>
      Find the Exit
    </p>
    <button class="primary" id="ed-start-btn">ENTER DARKNESS</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('echo-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const statusEl = root.querySelector('.status');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('ed-start-btn');
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

    if (type === 'ping') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'goal') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.0);
      osc.start(now);
      osc.stop(now + 1.0);
    } else if (type === 'step') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(50, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'bump') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'battery_low') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  const state = {
    running: false,
    level: 1,
    battery: 100,
    maxBattery: 100,
    player: { x: 0, y: 0, r: 8 },
    goal: { x: 0, y: 0, r: 15 },
    map: [], // Grid 20x20
    tileSize: 25,
    pings: [], // {x, y, r, alpha}
    targetPos: null, // For movement
    msg: "",
    msgTimer: 0,
    bumpFlash: 0
  };

  const COLS = 20;
  const ROWS = 20;

  function generateMap() {
    // Randomized Prim's Algo or simple random walk?
    // Let's use simple logic: Fill walls, carve rooms/paths.
    const map = [];
    for(let y=0; y<ROWS; y++) {
        const row = [];
        for(let x=0; x<COLS; x++) {
            row.push(1); // Wall
        }
        map.push(row);
    }
    
    // Carve path from 1,1
    let x = 1, y = 1;
    let pathLen = 30 + state.level * 10;
    map[y][x] = 0;
    state.player.x = x * state.tileSize + state.tileSize/2;
    state.player.y = y * state.tileSize + state.tileSize/2;

    const dirs = [[0,1], [0,-1], [1,0], [-1,0]];
    
    for(let i=0; i<pathLen; i++) {
        const d = dirs[Math.floor(Math.random()*4)];
        x += d[0];
        y += d[1];
        if (x < 1) x = 1; if (x >= COLS-1) x = COLS-2;
        if (y < 1) y = 1; if (y >= ROWS-1) y = ROWS-2;
        map[y][x] = 0; // Empty
    }
    
    // Place goal at last pos
    state.goal.x = x * state.tileSize + state.tileSize/2;
    state.goal.y = y * state.tileSize + state.tileSize/2;
    
    // Add random noise holes
    for(let i=0; i<30; i++) {
        const rx = Math.floor(Math.random()*(COLS-2))+1;
        const ry = Math.floor(Math.random()*(ROWS-2))+1;
        map[ry][rx] = 0;
    }
    
    state.map = map;
    state.pings = [];
    state.targetPos = null;
  }

  function update() {
    if (state.targetPos) {
        const dx = state.targetPos.x - state.player.x;
        const dy = state.targetPos.y - state.player.y;
        const bs = state.tileSize / 2; // bound size for center
        
        // Move towards target
        const speed = 2;
        if (Math.abs(dx) > speed || Math.abs(dy) > speed) {
            const angle = Math.atan2(dy, dx);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Collision Check (Simple Tile based)
            // Next Pos
            const nx = state.player.x + vx;
            const ny = state.player.y + vy;
            
            // Convert to coordinates
            const cx = Math.floor(nx / state.tileSize);
            const cy = Math.floor(ny / state.tileSize);
            
            // Check center point collision (Keep it simple)
            // If inside wall, stop
            if (state.map[cy] && state.map[cy][cx] === 1) {
                // Hit wall
                playTone('bump');
                state.targetPos = null;
                state.bumpFlash = 1.0;
                showMessage("WALL HIT");
            } else {
                state.player.x = nx;
                state.player.y = ny;
            }
        } else {
            state.targetPos = null;
        }
    }
    
    // Battery Check
    if (state.battery <= 0) {
        state.battery = 0;
        gameOver();
    }
    
    // Flash decay
    if (state.bumpFlash > 0) state.bumpFlash -= 0.1;
    if (state.msgTimer > 0) state.msgTimer -= 0.05;

    // Pings
    for(let i=state.pings.length-1; i>=0; i--) {
        const p = state.pings[i];
        p.r += 3; // Speed of sound
        p.life -= 0.01;
        if (p.life <= 0) state.pings.splice(i, 1);
    }

    // Goal
    const gdx = state.player.x - state.goal.x;
    const gdy = state.player.y - state.goal.y;
    if (Math.sqrt(gdx*gdx + gdy*gdy) < state.goal.r + state.player.r) {
        state.level++;
        playTone('goal');
        statusEl.textContent = `LEVEL ${state.level}`;
        generateMap();
        // Battery Reward
        state.battery = Math.min(state.maxBattery, state.battery + 30);
        showMessage("DEPTH CLEARED - BATTERY RECHARGED");
        
        statusEl.textContent = `LEVEL ${state.level}`;
        generateMap();
        // Auto Ping to show start
        state.pings.push({x: state.player.x, y: state.player.y, r: 0, life: 1.0});
    }
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Map Walls ONLY if touched by Ping
    // How to optimize? 
    // Iterate tilemap. If tile is wall (1), check dist to all active pings.
    // If abs(dist - ping.r) < 20 (Wave width), draw it with ping.alpha.
    
    // We only access tiles near pings? No, map is small (20x20=400). Brute force is fine.
    
    // Pre-calculate visible tiles to avoid overdraw?
    // Let's iterate grid.
    
    for(let y=0; y<ROWS; y++) {
        for(let x=0; x<COLS; x++) {
            if (state.map[y][x] === 1) { // Wall
                // Center of tile
                const tx = x * state.tileSize + state.tileSize/2;
                const ty = y * state.tileSize + state.tileSize/2;
                
                let visibility = 0;
                
                // Check pings
                for(const p of state.pings) {
                    const dx = tx - p.x;
                    const dy = ty - p.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    // Wave thickness approx 30px
                    const waveDist = Math.abs(dist - p.r);
                    if (waveDist < 30) {
                        // Intensity based on closeness to wave front and life
                        const intensity = (1.0 - (waveDist/30)) * p.life;
                        visibility = Math.max(visibility, intensity);
                    }
                }
                
                if (visibility > 0.05) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${visibility})`;
                    ctx.fillRect(x*state.tileSize, y*state.tileSize, state.tileSize, state.tileSize);
                }
            } else {
                // Floor (Maybe faint outline?)
            }
        }
    }

    // Goal (Always slightly visible? Or only on ping?)
    // Making goal pulse faintly
    const pulse = (Math.sin(Date.now()*0.005)+1)*0.1 + 0.1;
    ctx.fillStyle = `rgba(0, 255, 255, ${pulse})`;
    ctx.beginPath();
    ctx.arc(state.goal.x, state.goal.y, state.goal.r, 0, Math.PI*2);
    ctx.fill();

    // Check visibility for goal from pings
    let goalVis = 0;
    for(const p of state.pings) {
        const dx = state.goal.x - p.x;
        const dy = state.goal.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (Math.abs(dist - p.r) < 30) goalVis = Math.max(goalVis, p.life);
    }
    if (goalVis > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${goalVis})`;
        ctx.beginPath();
        ctx.arc(state.goal.x, state.goal.y, state.goal.r, 0, Math.PI*2);
        ctx.fill();
    }


    // Player (Always visible locally)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI*2);
    ctx.fill();
    
    // Target Line
    if (state.targetPos && state.running) {
        ctx.strokeStyle = '#333';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(state.player.x, state.player.y);
        ctx.lineTo(state.targetPos.x, state.targetPos.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Ping Waves Visualization (The ring itself)
    state.pings.forEach(p => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${p.life * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.stroke();
    });
    
    // Wall Bump Flash
    if (state.bumpFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${state.bumpFlash * 0.5})`;
        ctx.fillRect(state.player.x - 20, state.player.y - 20, 40, 40);
    }
    
    // Message
    if (state.msgTimer > 0) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Serif';
        ctx.textAlign = 'center';
        ctx.fillText(state.msg, canvas.width/2, canvas.height - 50);
    }
    
    // Battery Bar
    const barW = 200;
    const barH = 10;
    const barX = (canvas.width - barW) / 2;
    const barY = 40;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    
    const pct = state.battery / state.maxBattery;
    ctx.fillStyle = pct < 0.3 ? '#f00' : '#0f0';
    ctx.fillRect(barX, barY, barW * pct, barH);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Courier New';
    ctx.fillText("SONAR BATTERY", canvas.width/2, barY - 5);
  }
  
  function showMessage(txt) {
      state.msg = txt;
      state.msgTimer = 2.0;
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Inputs
  function handleInput(x, y) {
    if (!state.running) return;
    
    // 1. Move or Ping?
    // Let's say: Click near player = Ping. Click far = Move to there.
    
    const dx = x - state.player.x;
    const dy = y - state.player.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    playTone('step');
    
    if (dist < 30) {
        // Ping
        state.battery -= 5; // Cost
        playTone('ping');
        state.pings.push({x: state.player.x, y: state.player.y, r: 0, life: 1.0});
    } else {
        // Ping AND Move?
        state.battery -= 5; // Cost
        playTone('ping');
        state.pings.push({x: state.player.x, y: state.player.y, r: 0, life: 1.0});
        state.targetPos = {x, y};
    }
  }

  canvas.addEventListener('mousedown', e => {
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      handleInput((e.clientX - r.left)*scale, (e.clientY - r.top)*scale);
  });
  
  canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      handleInput((e.touches[0].clientX - r.left)*scale, (e.touches[0].clientY - r.top)*scale);
  }, {passive:false});

  function init() {
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
  }

  function startGame() {
    state.running = true;
    state.running = true;
    state.level = 1;
    state.battery = 100;
    statusEl.textContent = "LEVEL 1";
    overlay.classList.add('hidden');
    
    generateMap();
    markPlayed();
    
    // Initial Ping
    state.pings.push({x: state.player.x, y: state.player.y, r: 0, life: 1.0});
    
    requestAnimationFrame(loop);
  }
  
  function gameOver() {
      state.running = false;
      playTone('battery_low');
      overlay.classList.remove('hidden');
      root.querySelector('h2').textContent = "SIGNAL LOST";
      root.querySelector('p').innerHTML = `DEPTH REACHED: LEVEL ${state.level}<br>BATTERY DEPLETED`;
      startBtn.textContent = "RECHARGE & RETRY";
  }

  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. 画面は真っ暗ですが、あなたはそこにいます。
2. 画面内をタップ/クリックすると、その場所へ移動しようとします。
3. 同時に「音（Ping）」が発せられ、波紋が広がります。
4. 波紋が壁に当たると、一瞬だけ壁が白く浮かび上がります。
5. 反響を頼りに壁を避け、青く光るゴールを探してください。

## 実装メモ
- 「視覚」を制限し「聴覚（エコー）」を視覚化するという実験的なデザイン。
- 衝突判定はタイルグリッドベースで簡易化。
- 描画時に全タイルと全波紋の距離計算を行っているが、マップサイズ(20x20)が小さいため高フレームレートを維持可能。
