---
title: "毎日ゲームチャレンジ Day 77: マグネット・コア (Magnet Core)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-76-time-loop/' | relative_url }}">タイム・ループ</a>

77日目は「マグネット・コア」。
N極(赤)とS極(青)を切り替え、金属片を操れ。
敵には直接攻撃できません。周囲のゴミ（デブリ）を引き寄せ、弾き飛ばしてぶつけるのです！

<style>
#magnet-game {
  width: 100%;
  max-width: 600px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 50%;
  background: #222;
  color: #fff;
  font-family: "Arial Black", sans-serif;
  text-align: center;
  box-shadow: 0 0 20px rgba(100, 100, 255, 0.2);
  position: relative;
  overflow: hidden;
  border: 4px solid #444;
  aspect-ratio: 1 / 1;
}
#magnet-game .game-canvas {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  display: block;
  background: radial-gradient(#333 0%, #111 80%);
  cursor: none;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: 50%;
}
#magnet-game .hud {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  font-size: 3rem;
  color: rgba(255,255,255,0.1);
  z-index: 5;
}
#magnet-game .start-overlay {
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
#magnet-game .start-overlay.hidden { display: none; }
#magnet-game h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, #f88, #88f);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
#magnet-game button.primary {
  border: none;
  background: #fff;
  color: #000;
  padding: 16px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 30px;
  box-shadow: 0 0 10px rgba(255,255,255,0.5);
  transition: transform 0.2s;
}
#magnet-game button.primary:hover {
  transform: scale(1.1);
}
</style>

<div id="magnet-game">
  <canvas class="game-canvas" width="600" height="600"></canvas>
  <div class="hud">0</div>
  
  <div class="start-overlay">
    <h2>MAGNET CORE</h2>
    <p style="margin-bottom:20px;color:#ccc;font-size:0.9rem">
      [CLICK/TAP] Switch Polarity (Red/Blue)<br>
      Opposite Color Debris destroys Enemy!<br>
      (Red Enemy -> Hit with Blue Debris)<br>
      Defend yourself!
    </p>
    <button class="primary" id="mc-start-btn">ACTIVATE</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('magnet-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const hudEl = root.querySelector('.hud');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('mc-start-btn');
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

    if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'hit') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'die') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  };

  const state = {
    running: false,
    score: 0,
    player: { x: 300, y: 300, r: 15, polarity: 1 }, // 1: Red, -1: Blue
    debris: [], // {x, y, vx, vy, r, polarity, active}
    enemies: [], // {x, y, vx, vy, r, hp}
    spawnTimer: 0,
    loopActive: false
  };

  const ATTRACTION_FORCE = 0.5;
  const REPEL_FORCE = 0.8;
  const DRAG = 0.98;

  function initLevel() {
      state.player.x = canvas.width / 2;
      state.player.y = canvas.height / 2;
      state.debris = [];
      state.enemies = [];
      state.spawnTimer = 0;
      state.score = 0;
      hudEl.textContent = 0;
      
      // Initial Debris
      for(let i=0; i<20; i++) {
          spawnDebris();
      }
  }

  function spawnDebris() {
      const angle = Math.random() * Math.PI * 2;
      const dist = 200 + Math.random() * 100;
      state.debris.push({
          x: 300 + Math.cos(angle) * dist,
          y: 300 + Math.sin(angle) * dist,
          vx: (Math.random()-0.5),
          vy: (Math.random()-0.5),
          r: 5 + Math.random() * 5,
          polarity: Math.random() > 0.5 ? 1 : -1, // Red or Blue debris?
          // Or make distinct debris types?
          // Let's make Player attract ALL debris dependent on mode?
          // If Player is Red, Red debris Repels, Blue Attracts.
          // Debris should have fixed polarity.
          active: true
      });
  }

  function update() {
    state.spawnTimer++;
    if (state.spawnTimer > 100 - Math.min(80, state.score)) {
        // Spawn Enemy
        const angle = Math.random() * Math.PI * 2;
        const dist = 350;
        state.enemies.push({
            x: 300 + Math.cos(angle) * dist,
            y: 300 + Math.sin(angle) * dist,
            x: 300 + Math.cos(angle) * dist,
            y: 300 + Math.sin(angle) * dist,
            vx: 0,
            vy: 0,
            speed: 0.6 + Math.random() * 0.4, // Slower (was ~1.5)
            r: 20, // Slightly larger
            hp: 1,
            polarity: Math.random() > 0.5 ? 1 : -1 // Red or Blue
        });
        
        // Spawn more debris occasionally
        spawnDebris();
        state.spawnTimer = 0;
    }

    // Player (Mouse Follow? Or stationary center?)
    // Let's make stationary center for simplicity, focusing on timing?
    // Or Follow Mouse.
    // "Polarity Switch" is click. "Movement" is mouse.
    const targetX = state.inputX || 300;
    const targetY = state.inputY || 300;
    state.player.x += (targetX - state.player.x) * 0.1;
    state.player.y += (targetY - state.player.y) * 0.1;

    // Debris
    state.debris.forEach(d => {
        // Force F = k / r^2
        const dx = state.player.x - d.x;
        const dy = state.player.y - d.y;
        const distSq = dx*dx + dy*dy;
        const dist = Math.sqrt(distSq);
        
        if (dist > 5) {
            let force = 0;
            // Interaction:
            // Player Polarity vs Debris Polarity
            // If Same (1, 1) -> Repel (+)
            // If Diff (1, -1) -> Attract (-)
            
            // F direction is from debris to player (dx, dy)
            // If Attract, F is positive towards player.
            // If Repel, F is negative (away).
            
            // Logic:
            // Same color -> Repel.
            if (state.player.polarity === d.polarity) {
                force = -REPEL_FORCE * 1000 / distSq;
            } else {
                force = ATTRACTION_FORCE * 1000 / distSq;
            }
            
            d.vx += (dx/dist) * force;
            d.vy += (dy/dist) * force;
        }
        
        d.vx *= DRAG;
        d.vy *= DRAG;
        d.x += d.vx;
        d.y += d.vy;
        
        // Bounds (Wrap or Bounce?)
        // Arena is circular.
        const cdx = d.x - 300;
        const cdy = d.y - 300;
        if (cdx*cdx + cdy*cdy > 300*300) {
            // Bounce back lightly
            d.vx *= -1;
            d.vy *= -1;
            // Push inside
            const ang = Math.atan2(cdy, cdx);
            d.x = 300 + Math.cos(ang) * 290;
            d.y = 300 + Math.sin(ang) * 290;
        }
    });

    // Enemies
    for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        
        // Homing Logic
        const ex = state.player.x - e.x;
        const ey = state.player.y - e.y;
        const ang = Math.atan2(ey, ex);
        e.vx = Math.cos(ang) * e.speed;
        e.vy = Math.sin(ang) * e.speed;
        
        e.x += e.vx;
        e.y += e.vy;
        
        // Collision Player
        const pdx = state.player.x - e.x;
        const pdy = state.player.y - e.y;
        if (pdx*pdx + pdy*pdy < (state.player.r + e.r)**2) {
            gameOver();
            return;
        }
        
        // Collision Debris
        for(let j=0; j<state.debris.length; j++) {
            const d = state.debris[j];
            const ddx = d.x - e.x;
            const ddy = d.y - e.y;
            // Determine Impact Energy
            const dvSq = d.vx*d.vx + d.vy*d.vy;
            
            // If fast enough, kill enemy
            if (ddx*ddx + ddy*ddy < (d.r + e.r)**2) {
                if (dvSq > 5) { // Threshold speed
                    // Color Match Logic: Opposite Polarity destroys
                    if (d.polarity !== e.polarity) {
                        state.enemies.splice(i, 1);
                        playTone('hit');
                        state.score++;
                        hudEl.textContent = state.score;
                        // Bump debris
                        d.vx *= -0.5;
                        d.vy *= -0.5;
                        spawnDebris(); // Reward
                        break;
                    }
                }
            }
        }
        
        // Remove OOB
        if (e.x < -100 || e.x > 700) state.enemies.splice(i, 1);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Gradient BG already

    // Draw Magnetic Fields (Visual Aid)
    ctx.strokeStyle = state.player.polarity === 1 ? 'rgba(255, 100, 100, 0.1)' : 'rgba(100, 100, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 50, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 100, 0, Math.PI*2);
    ctx.stroke();

    // Debris
    state.debris.forEach(d => {
        ctx.fillStyle = d.polarity === 1 ? '#f55' : '#55f';
        ctx.beginPath();
        // Triangle/Shard shape
        ctx.moveTo(d.x + d.r, d.y);
        ctx.lineTo(d.x - d.r/2, d.y + d.r);
        ctx.lineTo(d.x - d.r/2, d.y - d.r);
        ctx.fill();
    });

    // Enemies
    // Enemies
    state.enemies.forEach(e => {
        ctx.fillStyle = e.polarity === 1 ? '#a33' : '#33a'; // Darker Red/Blue
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI*2);
        ctx.fill();
        
        // Outline (Yellow to indicate danger)
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Face
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(e.x - 6, e.y - 4, 4, 0, Math.PI*2);
        ctx.arc(e.x + 6, e.y - 4, 4, 0, Math.PI*2);
        ctx.fill();
    });

    // Player
    ctx.fillStyle = state.player.polarity === 1 ? '#f00' : '#00f';
    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.r, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Core glow
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 5, 0, Math.PI*2);
    ctx.fill();
  }

  function loop() {
    if (state.running) update();
    draw();
    requestAnimationFrame(loop);
  }

  // Inputs
  function handleInput(x, y) {
      if (!state.running) return;
      state.inputX = x;
      state.inputY = y;
  }
  
  function togglePolarity() {
      if (!state.running) return;
      state.player.polarity *= -1;
      playTone('switch');
  }

  canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      handleInput((e.clientX - r.left)*scale, (e.clientY - r.top)*scale);
  });
  canvas.addEventListener('mousedown', togglePolarity);

  canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      handleInput((e.touches[0].clientX - r.left)*scale, (e.touches[0].clientY - r.top)*scale);
  }, {passive:false});
  canvas.addEventListener('touchstart', (e) => {
      // If tap, toggle. If drag, move.
      // Simple: First touch also moves. Tap logic separate?
      // Let's just say touchstart triggers toggle too? Or clutter?
      // Let's use multi-touch or tap to toggle.
      // Simplest: Tap = Toggle.
      ensureAudio();
      togglePolarity();
      // Update pos
      const r = canvas.getBoundingClientRect();
      const scale = canvas.width/r.width;
      handleInput((e.touches[0].clientX - r.left)*scale, (e.touches[0].clientY - r.top)*scale);

  }, {passive:false});

  function init() {
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
    
    // Initial Render
    state.inputX = 300; state.inputY = 300;
  }

  function startGame() {
    state.running = true;
    initLevel();
    overlay.classList.add('hidden');
    markPlayed();
    if (!state.loopActive) {
        state.loopActive = true;
        requestAnimationFrame(loop);
    }
  }

  function gameOver() {
    state.running = false;
    playTone('die');
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "CORE BREACH";
    root.querySelector('p').innerHTML = `DEFEATED ENEMIES: <span style="font-size:1.5em">${state.score}</span>`;
    startBtn.textContent = "REBOOT";
  }

  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. マウスまたはタッチで赤いコア（自機）を動かします。
2. クリック/タップで自機の極性を**「赤（N極）」**と**「青（S極）」**に切り替えます。
3. 周囲のデブリ（ゴミ）は、**自分と違う色なら引き寄せ、同じ色なら弾き飛ばします**。
4. 迫りくる黄色い敵に、弾き飛ばしたデブリを勢いよくぶつけて倒してください。
5. 敵に触れるとゲームオーバーです。

## 実装メモ
- クーロン力（$F = k q_1 q_2 / r^2$）を模した物理挙動を実装。
- タップするだけで「吸い寄せ」「発射」を直感的に行えるワンボタン操作のアクション。
- デブリの勢い（速度の2乗）が一定以上でないと敵を倒せないようにし、ただ当てるだけでなく「強く弾き飛ばす」ことを要求するバランス調整。
