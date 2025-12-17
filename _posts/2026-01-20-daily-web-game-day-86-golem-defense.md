---
title: "毎日ゲームチャレンジ Day 86: ゴーレム・ディフェンス (Golem Defense)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

86日目は「ゴーレム・ディフェンス」。
迫りくる魔物の群れから拠点を守り抜け！
防衛タワーとなる「ゴーレム」を配置して迎撃する、シンプルなタワーディフェンスゲームです。
コスト管理と配置場所が勝負の鍵を握ります。

<style>
#golem-defense {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #34495e;
  color: #ecf0f1;
  font-family: 'Verdana', sans-serif;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #95a5a6;
  position: relative;
  text-align: center;
  user-select: none;
  box-sizing: border-box;
}
#golem-defense *, #golem-defense *::before, #golem-defense *::after {
  box-sizing: inherit;
}
#golem-defense canvas {
  display: block;
  background-color: #2c3e50;
  margin: 0 auto;
  border: 2px solid #7f8c8d;
  border-radius: 4px;
  max-width: 100%;
  height: auto;
}
#golem-defense .ui-header {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
  font-size: 0.9rem;
  font-weight: bold;
  border-bottom: 2px solid #7f8c8d;
  margin-bottom: 10px;
}
#golem-defense .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44, 62, 80, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 6px;
}
#golem-defense .overlay.hidden { display: none; }
#golem-defense h2 {
  color: #f1c40f;
  margin-bottom: 10px;
  font-size: 1.8rem;
  text-shadow: 2px 2px 0 #000;
}
#golem-defense .btn {
  background: #f1c40f;
  color: #2c3e50;
  border: none;
  padding: 12px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  margin-top: 15px;
  box-shadow: 0 4px 0 #d35400;
  transition: transform 0.1s;
}
#golem-defense .btn:active { transform: translateY(4px); box-shadow: none; }
#golem-defense .controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}
#golem-defense .tower-btn {
  background: #95a5a6;
  border: 2px solid #fff;
  border-radius: 4px;
  padding: 5px;
  cursor: pointer;
  width: 80px;
  opacity: 0.7;
}
#golem-defense .tower-btn.selected {
  border-color: #f1c40f;
  opacity: 1;
  background: #7f8c8d;
}
#golem-defense .tower-info { font-size: 0.8rem; display: block; }
#golem-defense .controls.hidden { display: none; }
</style>

<div id="golem-defense">
  <div class="ui-header">
    <span>WAVE: <span id="gd-wave">1</span></span>
    <span style="color:#e74c3c;">HP: <span id="gd-hp">20</span></span>
    <span style="color:#f1c40f;">MANA: <span id="gd-mana">100</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="360" height="360"></canvas>
    <div class="overlay" id="gd-overlay">
      <h2>GOLEM DEFENSE</h2>
      <p style="color:#bdc3c7; line-height:1.6; font-size:0.9rem;">
        マナを消費してゴーレムを配置し、<br>
        魔物の侵攻を阻止せよ！<br>
        <br>
        Wood: 安い・速い・範囲狭い<br>
        Stone: 高い・遅い・範囲広い
      </p>
      <button class="btn" id="gd-start-btn">GAME START</button>
    </div>
  </div>

  <div class="controls">
    <div class="tower-btn selected" id="gd-btn-wood" data-type="wood">
      <div>Wood</div>
      <span class="tower-info">50 Mana</span>
    </div>
    <div class="tower-btn" id="gd-btn-stone" data-type="stone">
      <div>Stone</div>
      <span class="tower-info">120 Mana</span>
    </div>
    <div class="tower-btn" id="gd-btn-slow" style="background:#3498db;">
      <div>Slow</div>
      <span class="tower-info">100 Mana</span>
    </div>
  </div>
</div>

<script>
(() => {
    const root = document.querySelector('#golem-defense');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const waveEl = root.querySelector('#gd-wave');
    const hpEl = root.querySelector('#gd-hp');
    const manaEl = root.querySelector('#gd-mana');
    const overlay = root.querySelector('#gd-overlay');
    const startBtn = root.querySelector('#gd-start-btn');
    const woodBtn = root.querySelector('#gd-btn-wood');
    const stoneBtn = root.querySelector('#gd-btn-stone');
    const slowBtn = root.querySelector('#gd-btn-slow');
    const controls = root.querySelector('.controls');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
    const PLAYED_KEY = 'aomagame:played:golem-defense';

    // Game Constants
    const GRID_SIZE = 40; // 9x9 grid
    const MAP_W = 9;
    const MAP_H = 9;
    
    // Path: Array of grid coordinates [x,y]
    // Simple winding path
    const PATH = [
        [0, 1], [1, 1], [2, 1], [2, 2], [2, 3],
        [3, 3], [4, 3], [5, 3], [5, 2], [5, 1],
        [6, 1], [7, 1], [7, 2], [7, 3], [7, 4],
        [7, 5], [6, 5], [5, 5], [4, 5], [3, 5],
        [3, 6], [3, 7], [4, 7], [5, 7], [6, 7],
        [7, 7], [8, 7]
    ];

    const TOWERS = {
        wood: { name:'Wood', cost:50, range: 2.5, damage: 20, rate: 30, color:'#27ae60', maxLife: 900 }, // 15 sec
        stone: { name:'Stone', cost:120, range: 4.5, damage: 80, rate: 60, color:'#7f8c8d', maxLife: 1350 } // 22.5 sec
    };

    // State
    let isPlaying = false;
    let frame = 0;
    let hp = 20;
    let mana = 100;
    let wave = 1;
    let selectedType = 'wood';
    
    let towers = [];
    let enemies = [];
    let projectiles = [];
    let particles = [];
    let waveState = 'spawning'; // spawning, defending, next
    let spawnTimer = 0;
    let enemiesToSpawn = 0;
    let slowTimer = 0;
    
    // Cooldown Map: Key="x,y", Value=frames remaining
    let cooldownMap = {};
    const COOLDOWN_TIME = 3600; // 60 sec cooldown after tower break
    
    // Audio
    let audioCtx = null;
    const ensureAudio = () => {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return;
        if (!audioCtx) audioCtx = new C();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    };

    function playSound(type) {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        if (type === 'shoot') {
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now+0.1);
        } else if (type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now+0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now+0.1);
        } else if (type === 'build') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(600, now+0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now+0.2);
        } else if (type === 'damage') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now+0.3);
        }
    }

    function init() {
        startBtn.addEventListener('click', startGame);
        
        // Tower selection
        woodBtn.addEventListener('click', () => selectTower('wood'));
        stoneBtn.addEventListener('click', () => selectTower('stone'));
        slowBtn.addEventListener('click', activateSlow);
        
        // Canvas interaction
        canvas.addEventListener('mousedown', onCanvasClick);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            onCanvasClick(mouseEvent);
        }, {passive:false});
        
        controls.classList.add('hidden');

        draw();
    }

    function selectTower(type) {
        selectedType = type;
        woodBtn.classList.toggle('selected', type === 'wood');
        stoneBtn.classList.toggle('selected', type === 'stone');
    }

    function activateSlow() {
        if (!isPlaying) return;
        const COST = 100;
        if (mana >= COST) {
            mana -= COST;
            slowTimer = 300; // 5 seconds (60fps)
            playSound('build');
            updateUI();
        }
    }

    function startGame() {
        ensureAudio();
        isPlaying = true;
        hp = 20;
        mana = 150;
        wave = 1;
        towers = [];
        enemies = [];
        projectiles = [];
        particles = [];
        cooldownMap = {};
        slowTimer = 0;
        
        startWave();
        updateUI();
        overlay.classList.add('hidden');
        controls.classList.remove('hidden');
        markPlayed();
        loop();
    }

    function startWave() {
        waveState = 'spawning';
        enemiesToSpawn = 5 + Math.floor(wave * 1.5);
        spawnTimer = 0;
    }

    function onCanvasClick(e) {
        if (!isPlaying) return;
        ensureAudio();
        const rect = canvas.getBoundingClientRect();
        const ScaleX = canvas.width / rect.width;
        const ScaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * ScaleX;
        const y = (e.clientY - rect.top) * ScaleY;
        
        const gx = Math.floor(x / GRID_SIZE);
        const gy = Math.floor(y / GRID_SIZE);
        
        // Validate placement
        // 1. Check bounds
        if (gx < 0 || gx >= MAP_W || gy < 0 || gy >= MAP_H) return;
        
        // 2. Check path collision
        if (PATH.some(p => p[0] === gx && p[1] === gy)) return; // On Road
        
        if (towers.some(t => t.x === gx && t.y === gy)) return;
        
        // 4. Check Cooldown
        if (cooldownMap[`${gx},${gy}`] > 0) return;
        
        // 5. Check Cost
        const cost = TOWERS[selectedType].cost;
        if (mana >= cost) {
            mana -= cost;
            playSound('build');
            towers.push({
                x: gx,
                y: gy,
                type: selectedType,
                cd: 0,
                life: TOWERS[selectedType].maxLife,
                ...TOWERS[selectedType] // copy stats
            });
            updateUI();
        }
    }

    function update() {
        if (!isPlaying) return;
        frame++;

        // Spawner
        if (slowTimer > 0) slowTimer--;
        if (waveState === 'spawning') {
            if (frame % 60 === 0) { // 1 sec interval
                if (enemiesToSpawn > 0) {
                    spawnEnemy();
                    enemiesToSpawn--;
                } else {
                    waveState = 'defending';
                }
            }
        } else if (waveState === 'defending') {
            if (enemies.length === 0 && enemiesToSpawn === 0) {
                // Bonus Mana
                mana += Math.min(wave * 50, 500);
                wave++;
                startWave();
                updateUI();
            }
        }
        
        // Cooldowns
        for(let key in cooldownMap) {
            cooldownMap[key]--;
            if (cooldownMap[key] <= 0) delete cooldownMap[key];
        }

        // Enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            
            // Move along path
            // e.pIndex is current target node index
            const target = PATH[e.pIndex];
            if (!target) {
                // Reached End
                hp -= 1;
                playSound('damage');
                enemies.splice(i, 1);
                updateUI();
                if (hp <= 0) gameOver();
                continue;
            }
            
            // Pixel coords target
            const tx = target[0] * GRID_SIZE + GRID_SIZE/2;
            const ty = target[1] * GRID_SIZE + GRID_SIZE/2;
            
            const dx = tx - e.ax;
            const dy = ty - e.ay;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            const realSpeed = (slowTimer > 0) ? e.speed * 0.5 : e.speed;

            if (dist < realSpeed) {
                // Arrived at node
                e.pIndex++;
                e.ax = tx;
                e.ay = ty;
            } else {
                e.ax += (dx/dist) * realSpeed;
                e.ay += (dy/dist) * realSpeed;
            }
        }
        
        // Towers
        towers.forEach(t => {
            if (t.cd > 0) t.cd--;
            else {
                // Find target
                // Closest or First? First usually better for TD logic
                // Check range (grid distance)
                let target = null;
                // Simple Euclidean in pixels
                // Tower center
                const tx = t.x * GRID_SIZE + GRID_SIZE/2;
                const ty = t.y * GRID_SIZE + GRID_SIZE/2;
                const rangePx = t.range * GRID_SIZE;
                
                for(let e of enemies) {
                     const dist = Math.sqrt((e.ax - tx)**2 + (e.ay - ty)**2);
                     if (dist <= rangePx) {
                         target = e;
                         break;
                     }
                }
                
                if (target) {
                    // Shoot
                    playSound('shoot');
                    projectiles.push({
                        x: tx, y: ty,
                        tx: target.ax, ty: target.ay, // Lock on pos for simplicity or homing?
                        target: target, // Homing
                        speed: 8,
                        damage: t.damage,
                        color: t.type === 'wood' ? '#f1c40f' : '#ecf0f1'
                    });
                    t.cd = t.rate;
                }
            }
        });
        
        // Tower Decay
        for(let i=towers.length-1; i>=0; i--) {
            towers[i].life--;
            if(towers[i].life <= 0) {
                // Break
                const t = towers[i];
                spawnParticles(t.x*GRID_SIZE+GRID_SIZE/2, t.y*GRID_SIZE+GRID_SIZE/2, '#7f8c8d');
                playSound('hit'); // Break sound
                cooldownMap[`${t.x},${t.y}`] = COOLDOWN_TIME;
                towers.splice(i, 1);
            }
        }
        
        // Projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            
            // Homing logic update if target alive
            let tx = p.tx;
            let ty = p.ty;
            
            if (p.target && enemies.includes(p.target)) {
                tx = p.target.ax;
                ty = p.target.ay;
            } else {
                // Target dead, continue to last known pos? Or fizzle?
                // Just continue to tx/ty
            }
            
            const dx = tx - p.x;
            const dy = ty - p.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < p.speed) {
                // Hit
                if (p.target && enemies.includes(p.target)) {
                    p.target.hp -= p.damage;
                    playSound('hit');
                    spawnParticles(p.target.ax, p.target.ay, '#e74c3c');
                    if (p.target.hp <= 0) {
                        const idx = enemies.indexOf(p.target);
                        if(idx > -1) {
                            enemies.splice(idx, 1);
                            mana += p.target.reward;
                            updateUI();
                        }
                    }
                }
                projectiles.splice(i, 1);
            } else {
                p.x += (dx/dist) * p.speed;
                p.y += (dy/dist) * p.speed;
            }
        }
        
        updateParticles();
    }
    
    function spawnEnemy() {
        // Stats scale with wave
        const hpBase = 50 + wave * 20;
        const speedBase = 1.5 + (wave * 0.1);
        const startPos = PATH[0];
        
        let type = 'normal';
        const r = Math.random();
        
        // Wave 4+: Fast enemies (20%)
        if (wave >= 4 && r < 0.2) type = 'fast';
        // Wave 7+: Heavy enemies (20%) - takes priority if r is low range but let's split
        // Simple logic:
        if (wave >= 7) {
            if (r < 0.2) type = 'heavy';
            else if (r < 0.4) type = 'fast';
        } else if (wave >= 4) {
             if (r < 0.3) type = 'fast';
        }
        
        let stats = {
            hp: hpBase, maxHp: hpBase, speed: speedBase, reward: 10,
            color: '#9b59b6', radius: 8
        };
        
        if (type === 'fast') {
            stats.hp = hpBase * 0.6;
            stats.maxHp = stats.hp;
            stats.speed = speedBase * 1.8;
            stats.reward = 15;
            stats.color = '#e67e22';
            stats.radius = 6;
        } else if (type === 'heavy') {
            stats.hp = hpBase * 3.0;
            stats.maxHp = stats.hp;
            stats.speed = speedBase * 0.6;
            stats.reward = 25;
            stats.color = '#c0392b'; // Dark Red
            stats.radius = 11;
        }

        enemies.push({
            pIndex: 1, // Moving to index 1
            ax: startPos[0] * GRID_SIZE + GRID_SIZE/2,
            ay: startPos[1] * GRID_SIZE + GRID_SIZE/2,
            ...stats
        });
    }
    
    function spawnParticles(x, y, color) {
        for(let i=0; i<5; i++) {
            particles.push({
                x, y,
                vx: (Math.random()-0.5)*4,
                vy: (Math.random()-0.5)*4,
                life: 1.0, color
            });
        }
    }
    
    function updateParticles() {
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.1;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function updateUI() {
        waveEl.innerText = wave;
        hpEl.innerText = Math.max(0, hp);
        manaEl.innerText = mana;
    }

    function draw() {
        // BG
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Path
        ctx.fillStyle = '#34495e';
        PATH.forEach(p => {
             ctx.fillRect(p[0]*GRID_SIZE, p[1]*GRID_SIZE, GRID_SIZE, GRID_SIZE);
        });
        
        // Base (Last Path Node)
        const end = PATH[PATH.length-1];
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(end[0]*GRID_SIZE + 5, end[1]*GRID_SIZE + 5, GRID_SIZE-10, GRID_SIZE-10);
        
        // Grid Lines (Subtle)
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        for(let i=0; i<=9; i++) {
            ctx.moveTo(i*GRID_SIZE, 0); ctx.lineTo(i*GRID_SIZE, canvas.height);
            ctx.moveTo(0, i*GRID_SIZE); ctx.lineTo(canvas.width, i*GRID_SIZE);
        }
        ctx.stroke();
        
        // Cooldowns (Blocked)
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)';
        ctx.strokeStyle = '#e74c3c';
        ctx.lineWidth = 2;
        for(let key in cooldownMap) {
            const [cx, cy] = key.split(',').map(Number);
            const px = cx * GRID_SIZE;
            const py = cy * GRID_SIZE;
            ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
            
            // X mark
            ctx.beginPath();
            ctx.moveTo(px + 10, py + 10); ctx.lineTo(px + GRID_SIZE - 10, py + GRID_SIZE - 10);
            ctx.moveTo(px + GRID_SIZE - 10, py + 10); ctx.lineTo(px + 10, py + GRID_SIZE - 10);
            ctx.stroke();
        }

        // Towers
        towers.forEach(t => {
            const px = t.x*GRID_SIZE;
            const py = t.y*GRID_SIZE;
            
            // Base
            ctx.fillStyle = t.color;
            ctx.fillRect(px+2, py+2, GRID_SIZE-4, GRID_SIZE-4);
            
            // Turret
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(px + GRID_SIZE/2, py + GRID_SIZE/2, 6, 0, Math.PI*2);
            ctx.fill();
            
            // Life Bar
            const lp = t.life / t.maxLife;
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(px+5, py+GRID_SIZE-6, GRID_SIZE-10, 4);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(px+5, py+GRID_SIZE-6, (GRID_SIZE-10)*lp, 4);
        });
        
        // Enemies
        enemies.forEach(e => {
            ctx.fillStyle = (slowTimer > 0) ? '#3498db' : e.color;
            ctx.beginPath();
            ctx.arc(e.ax, e.ay, e.radius, 0, Math.PI*2);
            ctx.fill();
            
            // HP Bar
            const pct = e.hp / e.maxHp;
            const barW = 16;
            const barY = e.ay - e.radius - 8;
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(e.ax - barW/2, barY, barW, 4);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(e.ax - barW/2, barY, barW * pct, 4);
        });
        
        // Projectiles
        projectiles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fill();
        });
        
        // Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, 3, 3);
        });
        ctx.globalAlpha = 1.0;
        
        // Selection Highlight (Ghost)
        if (isPlaying && selectedType) {
            // Need mouse pos tracking... 
            // Skipping ghost for simplicity on mobile, or could add stored mouse pos.
        }
    }
    
    function gameOver() {
        isPlaying = false;
        overlay.classList.remove('hidden');
        controls.classList.add('hidden');
        root.querySelector('h2').innerText = "GAME OVER";
        root.querySelector('p').innerHTML = `REACHED WAVE ${wave}`;
        startBtn.innerText = "RETRY";
    }

    function loop() {
        if (isPlaying) {
            update();
            draw();
            requestAnimationFrame(loop);
        }
    }

    // Play Count Logic
    function updatePlayCount() {
        const counterEl = getPlayCountEl();
        if (!counterEl) return;
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('aomagame:played:')) {
                     const val = parseInt(localStorage.getItem(key)||'0', 10);
                     if (val > 0) total++;
                }
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
1. **Wood (50 Mana)** または **Stone (120 Mana)** のゴーレムを選び、道以外の場所に配置します。
2. ゴーレムは範囲内の敵を自動攻撃します。
3. 敵を倒すとマナが手に入ります。ウェーブ（波）ごとに敵が強くなります。
4. 拠点のHPが0になる前に、どれだけ長く生き残れるか挑戦しましょう！

## 実装メモ
- パス（道）を配列で定義し、敵がそれに沿って移動するロジック。
- グリッドベースの座標管理と、射程距離計算による自動攻撃システム。
- 簡易的なウェーブ管理システムの実装。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
