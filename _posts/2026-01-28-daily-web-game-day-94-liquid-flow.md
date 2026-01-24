---
title: "毎日ゲームチャレンジ Day 94: Liquid Flow (リキッド・フロー)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

94日目は「Liquid Flow」。
光り輝く流れる液体を、あなたが描いた線で誘導する物理パズルです。
水の動きを眺めているだけでも楽しい、デジタル砂遊びのような感覚を楽しんでください。

<style>
@import url('https://fonts.googleapis.com/css2?family=Righteous&display=swap');

#flow-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 0;
  border-radius: 12px;
  background: #111;
  box-shadow: 0 10px 40px rgba(0, 255, 200, 0.1);
  text-align: center;
  font-family: 'Righteous', cursive;
  user-select: none;
  position: relative;
  overflow: hidden;
  border: 4px solid #222;
  color: #fff;
}

#flow-canvas {
  width: 100%;
  height: 400px;
  display: block;
  cursor: crosshair;
  background: radial-gradient(#222, #000);
}

.fl-ui {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
}

.fl-score {
  font-size: 1.2rem;
  color: #0ff;
  text-shadow: 0 0 10px #0ff;
}

.fl-tools {
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 15px;
  pointer-events: none; /* children auto */
}

.fl-btn {
  pointer-events: auto;
  background: #333;
  border: 2px solid #555;
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.fl-btn:hover {
  background: #444;
  border-color: #fff;
}

.fl-btn.reset {
  color: #ff5555;
  border-color: #ff5555;
}

.fl-msg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  color: #fff;
  background: rgba(0,0,0,0.8);
  padding: 20px;
  border-radius: 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 10;
  border: 2px solid #0ff;
  box-shadow: 0 0 20px #0ff;
}

.fl-msg.visible {
  opacity: 1;
}

</style>

<div id="flow-game">
    <canvas id="flow-canvas" width="400" height="400"></canvas>
    
    <div class="fl-ui">
        <div class="fl-score">FILLED: <span id="fl-val">0</span>%</div>
    </div>
    
    <div class="fl-tools">
        <button class="fl-btn" onclick="LiquidFlow.clearLines()">CLEAR LINES</button>
        <button class="fl-btn reset" onclick="LiquidFlow.reset()">RESTART</button>
    </div>
    
    <div id="fl-msg" class="fl-msg">COMPLETED!</div>
</div>

<script>
const LiquidFlow = (() => {
    const canvas = document.getElementById('flow-canvas');
    const ctx = canvas.getContext('2d');
    const valEl = document.getElementById('fl-val');
    const msgEl = document.getElementById('fl-msg');
    
    let particles = [];
    let lines = []; // Array of {p1, p2}
    let goal = { x: 200, y: 350, w: 100, h: 40, filled: 0, required: 500 };
    let spawner = { x: 50, y: 50 };
    let frame = 0;
    
    // Audio
    const Audio = {
        ctx: null,
        init() {
            if(!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.setupBGM();
            } else if(this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        },
        setupBGM() {
             // Watery Noise
             const bufferSize = this.ctx.sampleRate * 2;
             const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
             const data = buffer.getChannelData(0);
             for (let i = 0; i < bufferSize; i++) {
                 data[i] = Math.random() * 2 - 1;
             }
             
             const noise = this.ctx.createBufferSource();
             noise.buffer = buffer;
             noise.loop = true;
             
             const filter = this.ctx.createBiquadFilter();
             filter.type = 'lowpass';
             filter.Q.value = 5;
             filter.frequency.value = 400;
             
             // LFO
             const lfo = this.ctx.createOscillator();
             lfo.frequency.value = 0.2;
             const lfoGain = this.ctx.createGain();
             lfoGain.gain.value = 200;
             lfo.connect(lfoGain);
             lfoGain.connect(filter.frequency);
             
             const gain = this.ctx.createGain();
             gain.gain.value = 0.05;
             
             noise.connect(filter);
             filter.connect(gain);
             gain.connect(this.ctx.destination);
             noise.start();
             lfo.start();
        },
        playDraw() {
            if(!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.value = 200 + Math.random()*100;
            osc.type = 'triangle';
            gain.gain.value = 0.05;
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        },
        playFill() {
            if(!this.ctx) return;
            // High pitch blip
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
            gain.gain.value = 0.02;
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        },
        playWin() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            [440, 554, 659, 880].forEach((f, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.frequency.value = f;
                gain.gain.setValueAtTime(0.1, t + i*0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, t + i*0.1 + 1.0);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t + i*0.1);
                osc.stop(t + i*0.1 + 1.0);
            });
        }
    };
    
    // Interaction
    let isDrawing = false;
    let currentLine = null;
    let lastPos = {x:0, y:0};
    
    // Physics Consts
    const GRAVITY = 0.2;
    const FRICTION = 0.98; // Air resistance
    const BOUNCE = 0.5;
    
    function init() {
        reset();
        loop();
        
        canvas.addEventListener('mousedown', startDraw);
        window.addEventListener('mousemove', onDraw);
        window.addEventListener('mouseup', endDraw);
        
        canvas.addEventListener('touchstart', startDraw, {passive: false});
        window.addEventListener('touchmove', onDraw, {passive: false});
        window.addEventListener('touchend', endDraw);
    }
    
    function reset() {
        particles = [];
        lines = [];
        goal.filled = 0;
        frame = 0;
        msgEl.classList.remove('visible');
        
        // Initial setup - Move spawner randomly? 
        spawner.x = 50 + Math.random() * 300;
        spawner.y = 30;
        
        goal.x = 150 + Math.random() * 100;
        goal.y = 320;
    }
    
    function clearLines() {
        lines = [];
    }
    
    function startDraw(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        
        isDrawing = true;
        lastPos = {x, y};
        Audio.init();
    }
    
    function onDraw(e) {
        if(!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        
        // Add line segment if moved enough
        const d = Math.hypot(x - lastPos.x, y - lastPos.y);
        if(d > 5) {
            lines.push({
                p1: {...lastPos},
                p2: {x, y},
                len: d,
                nx: -(y - lastPos.y) / d, // Normal vector
                ny: (x - lastPos.x) / d
            });
            lastPos = {x, y};
            Audio.playDraw();
        }
    }
    
    function endDraw() {
        isDrawing = false;
    }
    
    // Physics
    
    // Line intersection helper
    // Returns distance from point to line segment, if projected point is on segment
    function distToSegment(px, py, l) {
        const dot = (px - l.p1.x) * (l.p2.x - l.p1.x) + (py - l.p1.y) * (l.p2.y - l.p1.y);
        const len2 = l.len * l.len;
        const t = Math.max(0, Math.min(1, dot / len2));
        const projX = l.p1.x + t * (l.p2.x - l.p1.x);
        const projY = l.p1.y + t * (l.p2.y - l.p1.y);
        const dx = px - projX;
        const dy = py - projY;
        return { dist: Math.hypot(dx, dy), nx: dx, ny: dy, t: t };
    }

    function loop() {
        // Clear with fade for trail effect? No, clean clear for fluid look
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        frame++;
        
        // Spawn Particles (Water)
        if(particles.length < 800) { // Limit count
            for(let i=0; i<3; i++) {
                particles.push({
                    x: spawner.x + (Math.random()-0.5)*10,
                    y: spawner.y,
                    vx: (Math.random()-0.5),
                    vy: Math.random() * 2,
                    life: 1000 // Frames to live?
                });
            }
        }
        
        // Draw Goal
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeRect(goal.x - goal.w/2, goal.y, goal.w, goal.h);
        
        // Draw Goal Fill
        const fillH = (goal.filled / goal.required) * goal.h;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(goal.x - goal.w/2, goal.y + goal.h - fillH, goal.w, fillH);
        
        valEl.textContent = Math.floor((goal.filled / goal.required) * 100);
        
        if(goal.filled >= goal.required && !msgEl.classList.contains('visible')) {
            msgEl.classList.add('visible');
            Audio.playWin();
            updatePlayCount();
        }
        
        // Draw Lines
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        lines.forEach(l => {
            ctx.moveTo(l.p1.x, l.p1.y);
            ctx.lineTo(l.p2.x, l.p2.y);
        });
        ctx.stroke();
        
        // Render & Update Particles
        // Use additive blending for "Liquid Light" look
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#0066aa'; 
        
        // Batch draw is faster but we need update per particle
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i];
            
            // Apply Gravity
            p.vy += GRAVITY;
            p.vx *= FRICTION;
            p.vy *= FRICTION;
            
            // Move
            let nextX = p.x + p.vx;
            let nextY = p.y + p.vy;
            
            // Bounce off walls
            if(nextX < 0 || nextX > canvas.width) p.vx *= -0.8;
            nextX = Math.max(0, Math.min(canvas.width, nextX));
            
            // Floor kill + Goal Check
            if(nextY > canvas.height) {
                // Remove
                particles.splice(i, 1);
                continue;
            }
            
            // Goal Collision (Simplified box)
            if(nextY > goal.y && nextY < goal.y + goal.h && Math.abs(nextX - goal.x) < goal.w/2) {
                // In goal!
                goal.filled = Math.min(goal.required, goal.filled + 0.5);
                if(frame % 5 === 0) Audio.playFill();
                particles.splice(i, 1);
                continue;
            }
            
            // Line Collision (Basic)
            // Check lines close to particle
            // Optimization: Grid or only check recent lines? No, brute force for < 1000 particles is fine on Desktop, maybe slow on mobile.
            // Let's optimize: Only check if particle is moving fast enough or near lines?
            // Just optimizing math.
            
            let collided = false;
            for(let l of lines) {
                // Bounding box check first
                const minX = Math.min(l.p1.x, l.p2.x) - 10;
                const maxX = Math.max(l.p1.x, l.p2.x) + 10;
                const minY = Math.min(l.p1.y, l.p2.y) - 10;
                const maxY = Math.max(l.p1.y, l.p2.y) + 10;
                
                if(nextX < minX || nextX > maxX || nextY < minY || nextY > maxY) continue;
                
                // Detailed check
                const res = distToSegment(nextX, nextY, l);
                if(res.dist < 4) { // Particle radius approx
                    // Bounce
                    // Reflect vector: v' = v - 2(v.n)n
                    const dot = p.vx * res.nx/res.dist + p.vy * res.ny/res.dist; // Normal is (nx, ny) normalized
                     // Wait, res.nx/ny are just dx/dy from projection. Normalize them
                    const nx = res.nx / res.dist;
                    const ny = res.ny / res.dist;
                    
                    // Push out
                    nextX += nx * (4 - res.dist);
                    nextY += ny * (4 - res.dist);
                    
                    // Reflect velocity? Or just slide?
                    // Let's slide mostly + little bounce
                    // Reflect
                    const vDotN = p.vx * nx + p.vy * ny;
                    p.vx = (p.vx - 2 * vDotN * nx) * BOUNCE;
                    p.vy = (p.vy - 2 * vDotN * ny) * BOUNCE;
                    
                    collided = true;
                    // Break or continue? One collision per frame is safer for stability
                    break;
                }
            }
            
            p.x = nextX;
            p.y = nextY;
            
            // Draw
            // Instead of circles, draw slashes for velocity? No, circles are better for fluid.
            // Gradient circle
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fill();
        }
        
        ctx.globalCompositeOperation = 'source-over';
        
        // Draw Spawner
        ctx.fillStyle = '#fff';
        ctx.fillRect(spawner.x-10, spawner.y-5, 20, 5);
        
        requestAnimationFrame(loop);
    }
    
    // Start
    setTimeout(init, 100);
    
    return {
        clearLines,
        reset
    };
})();

// Global play count tracker
function updatePlayCount() {
    const counterEl = document.querySelector('[data-aomagame-play-count]');
    if (!counterEl) return;
    try {
        localStorage.setItem('aomagame:played:liquid-flow', '1');
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('aomagame:played:')) {
                const val = parseInt(localStorage.getItem(key)||'0', 10);
                if (val > 0) total++;
            }
        }
        counterEl.textContent = total;
    } catch (e) {
        counterEl.textContent = '0';
    }
}
</script>

## 遊び方
1. **DRAW**: 画面をドラッグして、白い線を描きます。これが液体の通り道（壁）になります。
2. **GUIDE**: 上から落ちてくる液体を線で受け止め、下のカップ（四角い枠）へ誘導してください。
3. **FILL**: カップがいっぱい（100%）になればクリアです！
4. **TRY AGAIN**: 「CLEAR LINES」で線を消したり、「RESTART」で最初からやり直せます。

## 実装のポイント
- **Particle Physics**: 数百個の粒子それぞれに対して、重力・摩擦・線分との衝突判定をリアルタイムに行っています。
- **Additive Blending**: `globalCompositeOperation = 'lighter'` を使用して粒子を描画することで、重なった部分が白く発光するように見え、幻想的な「光る液体」を表現しました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
