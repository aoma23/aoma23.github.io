---
title: "毎日ゲームチャレンジ Day 80: ザ・コロッサス (The Colossus)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

80日目は「ザ・コロッサス」。
巨大な幾何学生命体との決戦。
弾幕を避け、コアを攻撃し、圧倒的な破壊力に立ち向かえ！
Experimental シリーズ最終作にふさわしい、派手なボスバトルです。

<style>
#boss-game {
  width: 100%;
  max-width: 600px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 4px;
  background: #111;
  color: #fff;
  font-family: "Impact", sans-serif;
  text-align: center;
  box-shadow: 0 0 40px rgba(255, 50, 50, 0.3);
  position: relative;
  overflow: hidden;
  border: 4px solid #333;
}
#boss-game .game-canvas {
  width: 100%;
  height: auto;
  width: 100%;
  height: auto;
  display: block;
  background: #111;
  cursor: crosshair;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#boss-game .hud {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-size: 1.5rem;
  letter-spacing: 1px;
  z-index: 10;
  text-shadow: 2px 2px 0 #000;
}
#boss-game .boss-hp-bar {
  position: absolute;
  top: 40px;
  left: 50px;
  right: 50px;
  height: 10px;
  background: #333;
  border: 1px solid #fff;
  z-index: 10;
}
#boss-game .boss-hp-fill {
  width: 100%;
  height: 100%;
  background: #f00;
  transition: width 0.2s;
}
#boss-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  overflow-y: auto;
}
#boss-game .start-overlay.hidden { display: none; }
#boss-game h2 {
  font-size: 3rem;
  margin-bottom: 2rem;
  color: #f00;
  text-transform: uppercase;
  letter-spacing: 5px;
  text-shadow: 0 0 20px #f00;
}
#boss-game button.primary {
  border: 4px solid #f00;
  background: #000;
  color: #f00;
  padding: 16px 48px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  font-family: inherit;
  transition: all 0.1s;
}
#boss-game button.primary:hover {
  background: #f00;
  color: #000;
}
@media (max-width: 480px) {
  #boss-game h2 { font-size: 1.8rem; margin-bottom: 1rem; }
  #boss-game p { font-size: 0.9rem; margin-bottom: 1rem; max-width: 90%; }
  #boss-game button.primary { padding: 10px 24px; font-size: 1.1rem; }
  #boss-game .hud { font-size: 1rem; }
  /* min-height removed, handled by canvas size */
}
</style>

<div id="boss-game">
  <canvas class="game-canvas" width="600" height="450"></canvas>
  <div class="hud">
    <div class="score">SCORE: 0</div>
    <div class="hp">HP: 100%</div>
  </div>
  <div class="boss-hp-bar"><div class="boss-hp-fill"></div></div>
  
  <div class="start-overlay">
    <h2>THE COLOSSUS</h2>
    <p style="margin-bottom:20px;color:#ccc;font-family:sans-serif">
      [MOUSE/TOUCH] Move & Auto-Fire<br>
      Avoid Red Bullets.<br>
      Destroy the Core.
    </p>
    <button class="primary" id="bg-start-btn">ENGAGE</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('boss-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = root.querySelector('.score');
  const playerHpEl = root.querySelector('.hp');
  const bossHpFill = root.querySelector('.boss-hp-fill');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('bg-start-btn');
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

    if (type === 'shoot') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'damage') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(50, now);
      osc.frequency.linearRampToValueAtTime(20, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (type === 'boss_fire') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'explosion') {
      // Noise
      const bufferSize = audioCtx.sampleRate * 1.0;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0; i<bufferSize; i++) data[i] = Math.random()*2-1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noiseGain.gain.setValueAtTime(0.5, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
      noise.start(now);
    }
  };

  const state = {
    running: false,
    score: 0,
    player: { x: 300, y: 400, r: 5, hp: 100, maxHp: 100 },
    boss: { x: 300, y: 100, r: 40, hp: 1000, maxHp: 1000, phase: 1, angle: 0 },
    pBullets: [],
    eBullets: [],
    particles: [],
    shake: 0,
    rafId: null,
    gamePhase: 'stage', // stage, warning, boss
    warningTimer: 0,
    enemies: []
  };

  function spawnParticle(x, y, color, speed) {
      const angle = Math.random() * Math.PI * 2;
      const v = Math.random() * speed;
      state.particles.push({
          x, y, 
          vx: Math.cos(angle)*v, 
          vy: Math.sin(angle)*v,
          life: 1.0,
          color
      });
  }

  function update() {
    // Player Fire
    if (state.running && state.frame % 8 === 0) {
        state.pBullets.push({x: state.player.x, y: state.player.y - 10, vy: -15});
        playTone('shoot');
    }

    // Phase Manager
    if (state.gamePhase === 'stage') {
        // Spawn Zako
        if (state.frame % 60 === 0) {
            const x = 50 + Math.random() * (canvas.width - 100);
            state.enemies.push({x, y: -20, vx: (Math.random()-0.5)*2, vy: 3, hp: 3, r: 15});
        }
        
        // Progression
        if (state.frame > 900) { // 15 seconds
            state.gamePhase = 'warning';
            state.warningTimer = 180;
            // Clear enemies? No let them stay
        }
    } else if (state.gamePhase === 'warning') {
        state.warningTimer--;
        if (state.warningTimer <= 0) {
            state.gamePhase = 'boss';
            playTone('boss_fire');
        }
    } else if (state.gamePhase === 'boss') {
        // Boss Logic
        bossLogic();
    }
    
    // Update Zako Enemies
    for(let i=state.enemies.length-1; i>=0; i--) {
        const e = state.enemies[i];
        e.x += e.vx;
        e.y += e.vy;
        
        // Zako Fire
        if (state.frame % 100 === 0 && Math.random() < 0.3) {
             state.eBullets.push({x: e.x, y: e.y, vx: 0, vy: 5, r: 5});
        }

        if (e.y > canvas.height + 20) { state.enemies.splice(i, 1); continue; }
        
        // Hit Player check (Body collision)
        const dx = e.x - state.player.x;
        const dy = e.y - state.player.y;
        if (dx*dx + dy*dy < (state.player.r + e.r)**2) {
             state.player.hp -= 20;
             state.enemies.splice(i, 1);
             state.shake = 10;
             playTone('damage');
             spawnParticle(e.x, e.y, '#aa0', 5);
             if (state.player.hp <= 0) gameOver();
             continue;
        }
    }

    // Update Player Bullets (Hit Boss AND Enemies)
    for(let i=state.pBullets.length-1; i>=0; i--) {
        const b = state.pBullets[i];
        b.y += b.vy;
        if (b.y < -10) { state.pBullets.splice(i, 1); continue; }
        
        let hit = false;
        // Hit Boss
        if (state.gamePhase === 'boss') {
            const dx = b.x - state.boss.x;
            const dy = b.y - state.boss.y;
            if (dx*dx + dy*dy < (state.boss.r + 5)**2) {
                state.boss.hp -= 10;
                state.score += 10;
                hit = true;
                spawnParticle(b.x, b.y, '#f0f', 5);
                checkBossPhase();
            }
        }
        
        // Hit Enemies
        if (!hit) {
            for(let j=state.enemies.length-1; j>=0; j--) {
                const e = state.enemies[j];
                const dx = b.x - e.x;
                const dy = b.y - e.y;
                if (dx*dx + dy*dy < (e.r + 5)**2) {
                    e.hp -= 10;
                    hit = true;
                    spawnParticle(b.x, b.y, '#ff0', 3);
                    if (e.hp <= 0) {
                        state.enemies.splice(j, 1);
                        state.score += 50;
                        playTone('hit');
                        spawnParticle(e.x, e.y, '#fa0', 5);
                    }
                    break;
                }
            }
        }
        
        if (hit) state.pBullets.splice(i, 1);
    }
    
    // Enemy Bullets
    updateEnemyBullets();
    
    // Particles
    updateParticles();
    
    // UI
    scoreEl.textContent = "SCORE: " + state.score;
    playerHpEl.textContent = "HP: " + Math.max(0, state.player.hp) + "%";
    
    if (state.gamePhase === 'boss') {
        bossHpFill.parentElement.style.display = 'block';
        const hpPct = Math.max(0, state.boss.hp / state.boss.maxHp) * 100;
        bossHpFill.style.width = hpPct + "%";
    } else {
        bossHpFill.parentElement.style.display = 'none';
    }
    
    if (state.shake > 0) state.shake *= 0.9;
    
    state.frame++;
  }

  function bossLogic() {
     // Boss Phase Logic
    state.boss.angle += 0.02;
    state.boss.y = 100 + Math.sin(state.frame * 0.02) * 20;

    // Boss Fire
    let fireRate = 20;
    if (state.boss.phase === 2) fireRate = 10;
    if (state.boss.phase === 3) fireRate = 5;

    if (state.frame % fireRate === 0) {
        // Pattern
        const cx = state.boss.x;
        const cy = state.boss.y;
        
        playTone('boss_fire');

        if (state.boss.phase === 1) {
            // Fan Spread
            for(let i=-2; i<=2; i++) {
                const angle = Math.PI/2 + i*0.2;
                state.eBullets.push({x: cx, y: cy, vx: Math.cos(angle)*4, vy: Math.sin(angle)*4, r: 6});
            }
        } else if (state.boss.phase === 2) {
             // Spiral
             const arms = 4;
             for(let i=0; i<arms; i++) {
                 const angle = state.boss.angle + (Math.PI*2/arms)*i;
                 state.eBullets.push({x: cx, y: cy, vx: Math.cos(angle)*5, vy: Math.sin(angle)*5, r: 6});
             }
        } else {
             // Chaos
             for(let i=0; i<3; i++) {
                 const angle = Math.random() * Math.PI; // Downwards mostly
                 state.eBullets.push({x: cx, y: cy, vx: Math.cos(angle)*6, vy: Math.sin(angle)*6, r: 8});
             }
        }
    }
  }

  function checkBossPhase() {
        if (state.boss.hp < 600 && state.boss.phase === 1) state.boss.phase = 2;
        if (state.boss.hp < 300 && state.boss.phase === 2) state.boss.phase = 3;
        if (state.boss.hp <= 0) {
            bossDefeated();
        }
  }
  
  function updateEnemyBullets() {
    for(let i=state.eBullets.length-1; i>=0; i--) {
        const b = state.eBullets[i];
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -20 || b.x > canvas.width+20 || b.y > canvas.height+20) {
            state.eBullets.splice(i, 1); continue;
        }
        
        // Hit Player
        const dx = b.x - state.player.x;
        const dy = b.y - state.player.y;
        if (dx*dx + dy*dy < (state.player.r + b.r)**2) {
            state.player.hp -= 10;
            state.eBullets.splice(i, 1);
            state.shake = 10;
            playTone('damage');
            if (state.player.hp <= 0) gameOver();
        }
    }
  }
  
  function updateParticles() {
    for(let i=state.particles.length-1; i>=0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) state.particles.splice(i, 1);
    }
  }

  function draw() {
    // Shake
    let sx = 0, sy = 0;
    if (state.shake > 1) {
        sx = (Math.random()-0.5) * state.shake;
        sy = (Math.random()-0.5) * state.shake;
    }

    ctx.save();
    ctx.translate(sx, sy);
    
    // BG
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear
    
    // Grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<canvas.width; i+=50) { ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); }
    for(let i=0; i<canvas.height; i+=50) { ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); }
    ctx.stroke();

    // Player
    ctx.fillStyle = '#0ff';
    ctx.beginPath();
    ctx.moveTo(state.player.x, state.player.y - 10);
    ctx.lineTo(state.player.x - 8, state.player.y + 8);
    ctx.lineTo(state.player.x + 8, state.player.y + 8);
    ctx.fill();
    // Core
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 3, 0, Math.PI*2);
    ctx.fill();

    // Player Bullets
    ctx.fillStyle = '#aff';
    state.pBullets.forEach(b => {
        ctx.fillRect(b.x - 2, b.y, 4, 10);
    });

    // Boss
    if (state.gamePhase === 'boss' && state.boss.hp > 0) {
        drawBoss();
    }
    
    // Enemies
    state.enemies.forEach(e => {
        ctx.fillStyle = '#ff0';
        ctx.beginPath();
        ctx.moveTo(e.x, e.y + e.r);
        ctx.lineTo(e.x - e.r, e.y - e.r);
        ctx.lineTo(e.x + e.r, e.y - e.r);
        ctx.fill();
    });
    
    // Warning
    if (state.gamePhase === 'warning') {
        if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = '#f00';
            ctx.font = '40px Impact';
            ctx.fillText('WARNING', canvas.width/2 - 70, canvas.height/2);
        }
    }
    
    // Enemy Bullets
    ctx.fillStyle = '#f44';
    state.eBullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    });
    
    // Particles
    state.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });

    ctx.restore();
  }
  
  function drawBoss() {
      const b = state.boss;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.sin(state.frame * 0.05) * 0.1); // Idle sway
      
      // Modules
      // Rotating ring
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 60, state.boss.angle, state.boss.angle + Math.PI*1.5);
      ctx.stroke();
      
      // Core Body
      ctx.fillStyle = b.phase === 3 ? '#a00' : '#444';
      ctx.beginPath();
      // Hexagon
      for(let i=0; i<6; i++) {
          const a = i * Math.PI/3;
          ctx.lineTo(Math.cos(a)*40, Math.sin(a)*40);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Eye
      ctx.fillStyle = '#f00';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f00';
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.restore();
  }

  function loop() {
    if (state.running) update();
    draw();
    if (state.running || state.boss.hp <= 0) {
        state.rafId = requestAnimationFrame(loop);
    } else {
        state.rafId = null;
    }
  }

  // Inputs
  function handleInput(x, y) {
      if (!state.running) return;
      state.player.x += (x - state.player.x) * 0.2; // Lerp
      state.player.y += (y - state.player.y) * 0.2; // Removed offset to allow full reach
      // Clamp
      if (state.player.x < 10) state.player.x = 10;
      if (state.player.x > canvas.width - 10) state.player.x = canvas.width - 10;
      if (state.player.y < 10) state.player.y = 10;
      if (state.player.y > canvas.height - 10) state.player.y = canvas.height - 10;
  }

  canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      handleInput((e.clientX - r.left)*scale, (e.clientY - r.top)*scale);
  });
  
  canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      handleInput((e.touches[0].clientX - r.left)*scale, (e.touches[0].clientY - r.top)*scale);
  }, {passive:false});
  
  // Touch Start (Activate Audio)
  canvas.addEventListener('touchstart', ensureAudio, {passive:false});
  window.addEventListener('mousedown', ensureAudio);

  function init() {
    // Dynamic Height for Mobile to fill screen
    if (window.innerWidth < 600) {
        // Calculate aspect ratio
        let ratio = window.innerHeight / window.innerWidth;
        // Cap ratio to prevent game becoming too easy on very tall screens
        if (ratio > 1.6) ratio = 1.6;
        
        canvas.height = Math.floor(600 * ratio);
        if (canvas.height < 600) canvas.height = 600; 
    } else {
        canvas.height = 450; // Standard 4:3 for PC
    }
    
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
  }

  function startGame() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    
    state.running = true;
    state.score = 0;
    state.frame = 0;
    state.player.x = canvas.width / 2;
    state.player.y = canvas.height - 100; // Start at bottom
    state.player.hp = 100;
    state.boss.hp = 1000;
    state.boss.maxHp = 1000;
    state.boss.phase = 1;
    state.pBullets = [];
    state.eBullets = [];
    state.particles = [];
    state.enemies = [];
    state.gamePhase = 'stage';
    state.warningTimer = 0;
    
    scoreEl.textContent = "SCORE: 0";
    overlay.classList.add('hidden');
    markPlayed();
    state.rafId = requestAnimationFrame(loop);
  }

  function bossDefeated() {
      state.running = false;
      playTone('explosion');
      state.boss.hp = 0;
      
      // Big Explosion FX
      for(let i=0; i<50; i++) spawnParticle(state.boss.x, state.boss.y, '#fa0', 10);
      state.shake = 50;
      draw(); // Render explosion
      
      setTimeout(() => {
          overlay.classList.remove('hidden');
          root.querySelector('h2').textContent = "TARGET DESTROYED";
          root.querySelector('p').innerHTML = `MISSION COMPLETE<br>SCORE: ${state.score}`;
          startBtn.textContent = "AGAIN";
      }, 2000);
  }
  
  function gameOver() {
      state.running = false;
      overlay.classList.remove('hidden');
      root.querySelector('h2').textContent = "MISSION FAILED";
      root.querySelector('p').innerHTML = `SCORE: ${state.score}`;
      startBtn.textContent = "RETRY";
  }

  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. マウスまたはタッチで自機（青い戦闘機）を操作します。
2. 自機は自動で弾を発射します。
3. 画面上部の赤い巨大ボス「コロッサス」のコアを狙って撃ってください。
4. ボスは3段階に変形・攻撃パターンが変化します。赤い弾幕（敵弾）には当たらないように注意してください。
5. ボスのHPを0にすれば勝利です。

## 実装メモ
- HTML5 Canvasを使った弾幕シューティング（Bullet Hell）。
- オブジェクトプーリング技法は簡易実装ですが、配列操作で数百個の弾を制御。
- `Phase` 変数によるボスのステートマシン管理（行動パターンの切り替え）。
- 画面シェイク（Shake）演出で、被弾や爆発の衝撃を表現。
