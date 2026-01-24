---
title: "毎日ゲームチャレンジ Day 92: Cyber Drift (サイバードリフト)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

92日目は「Cyber Drift」。
ネオン輝く電脳空間を疾走する、没入感たっぷりの3D風ドライブゲームです。
リッチなサイバーパンクの世界観と、迫りくるスピード感をお楽しみください！

<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

#cyber-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 0;
  border-radius: 12px;
  background: #050510;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
  text-align: center;
  font-family: 'Orbitron', sans-serif;
  user-select: none;
  position: relative;
  overflow: hidden;
  border: 2px solid #00eeee;
  color: #00eeee;
}

#cyber-canvas {
  width: 100%;
  height: 400px;
  background: #000;
  display: block;
}

.cy-ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  text-shadow: 0 0 5px #00eeee;
  pointer-events: none;
  z-index: 10;
}

.cy-score span {
  font-size: 1.5rem;
  font-weight: bold;
}

.cy-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  backdrop-filter: blur(2px);
  transition: opacity 0.3s;
}

.cy-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

.cy-title {
  font-size: 2.2rem;
  background: linear-gradient(90deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  font-weight: 700;
  letter-spacing: 2px;
}

.cy-btn {
  padding: 12px 30px;
  font-size: 1.2rem;
  background: transparent;
  color: #fff;
  border: 2px solid #ff00ff;
  border-radius: 4px;
  cursor: pointer;
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  transition: all 0.2s;
  box-shadow: 0 0 10px #ff00ff;
  pointer-events: auto;
}

.cy-btn:hover {
  background: #ff00ff;
  color: #000;
  box-shadow: 0 0 20px #ff00ff;
}

.cy-msg {
  font-size: 1rem;
  margin-top: 15px;
  color: #ccc;
}

/* CRT Scanline Effect */
#cyber-game::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
  z-index: 5;
  background-size: 100% 2px, 3px 100%;
  pointer-events: none;
}
</style>

<div id="cyber-game">
    <canvas id="cyber-canvas" width="400" height="400"></canvas>
    
    <div class="cy-ui">
        <div class="cy-score">SCORE: <span id="cy-score-val">0</span></div>
        <div class="cy-speed">SPD: <span id="cy-speed-val">0</span>%</div>
    </div>

    <!-- Start/Game Over Overlay -->
    <div id="cy-overlay" class="cy-overlay">
        <div class="cy-title">CYBER DRIFT</div>
        <button class="cy-btn" id="cy-start-btn">IGNITION</button>
        <div class="cy-msg">TAP L/R or DRAG to STEER</div>
    </div>
</div>

<script>
const CyberDrift = (() => {
    const canvas = document.getElementById('cyber-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('cy-score-val');
    const speedEl = document.getElementById('cy-speed-val');
    const overlay = document.getElementById('cy-overlay');
    const startBtn = document.getElementById('cy-start-btn');
    const titleEl = document.querySelector('.cy-title');

    // Constants
    const COLORS = {
        bg: '#050510',
        grid: '#00ffff', // Cyan
        gridFar: '#ff00ff', // Pink
        player: '#ffffff',
        enemy: '#ff0055',
        energy: '#00ffaa' // Green-Cyan
    };
    
    // Game State
    let isPlaying = false;
    let score = 0;
    let frame = 0;
    let speed = 0; // 0 to 100 (display), actually affects z-movement
    let baseSpeed = 10;
    
    // Audio
    const Audio = {
        ctx: null,
        isPlaying: false,
        engineOsc: null,
        init() {
            if(!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.setupBGM();
                this.setupEngine();
            } else if(this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.isPlaying = true;
            if(this.engineOsc) this.engineOsc.gain.gain.value = 0.1;
        },
        stop() {
            this.isPlaying = false;
            if(this.engineOsc) this.engineOsc.gain.gain.value = 0;
        },
        setupEngine() {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = 60;
            gain.gain.value = 0;
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            this.engineOsc = { osc, gain };
        },
        updateEngine(speed) {
            if(!this.ctx || !this.engineOsc) return;
            // Pitch modulation by speed
            this.engineOsc.osc.frequency.setTargetAtTime(60 + speed * 2, this.ctx.currentTime, 0.1);
        },
        setupBGM() {
            // Simple Synthwave Bassline
            const makeBass = (t, freq, dur) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.value = freq;
                
                // Filter for "plucky" bass
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, t);
                filter.frequency.exponentialRampToValueAtTime(100, t + dur - 0.05);
                
                gain.gain.setValueAtTime(0.15, t);
                gain.gain.linearRampToValueAtTime(0, t + dur);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(t);
                osc.stop(t + dur);
            };
            
            // Loop
            const loop = () => {
                if(!this.isPlaying) {
                    setTimeout(loop, 500);
                    return;
                }
                const now = this.ctx.currentTime;
                // 120 BPM = 0.5s per beat. 16th notes = 0.125s
                const step = 0.125;
                // F - F - G# - G# - C - C - A# - A# (root notes approx)
                // F1 = 43.65, G#1 = 51.91, C2 = 65.41, A#1 = 58.27
                const seq = [43.65, 43.65, 43.65, 43.65, 51.91, 51.91, 51.91, 51.91, 65.41, 65.41, 65.41, 65.41, 58.27, 58.27, 58.27, 58.27];
                
                seq.forEach((f, i) => {
                    makeBass(now + i * step, f, step);
                });
                
                setTimeout(loop, seq.length * step * 1000); // 2000ms
            };
            loop();
        },
        playItem() {
            if(!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        },
        playCrash() {
             if(!this.ctx) return;
             const bufSize = this.ctx.sampleRate * 0.5; // 0.5 sec
             const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
             const data = buf.getChannelData(0);
             for(let i=0; i<bufSize; i++) data[i] = Math.random()*2-1;
             
             const src = this.ctx.createBufferSource();
             src.buffer = buf;
             const gain = this.ctx.createGain();
             gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
             gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.5);
             
             src.connect(gain);
             gain.connect(this.ctx.destination);
             src.start();
        }
    };
    
    // 3D Projection Settings
    const FOV = 250;
    const CAMERA_HEIGHT = 100;
    const CAMERA_Z_OFFSET = 100; // Distance from camera to screen plane
    const HORIZON_Y = 150; // Vanishing point Y
    
    // Entities
    let player = {
        x: 0, // -1 to 1 range (lane width)
        width: 40,
        height: 20
    };
    
    let objects = []; // { x, z, type, active }
    let particles = [];
    
    // Controls
    let input = { x: 0 }; // Target player x (-1 to 1)

    // Colors & Styles
    function glow(ctx, color, blur) {
        ctx.shadowBlur = blur;
        ctx.shadowColor = color;
    }
    
    function resetGlow(ctx) {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }

    class Object3D {
        constructor(type) {
            this.type = type; // 'enemy' or 'energy'
            this.x = (Math.random() * 2 - 1) * 2; // -2 to 2 spread
            this.z = 2000; // Spawn far away
            this.active = true;
            this.scale = 1;
            
            // Randomly align to lanes roughly
            const lanes = [-0.8, -0.3, 0.3, 0.8];
            this.x = lanes[Math.floor(Math.random() * lanes.length)] + (Math.random() * 0.2 - 0.1);
        }
        
        update() {
            this.z -= (baseSpeed + speed * 0.2);
            
            // Collect/Collide check when near player Z (approx 0)
            if (this.active && this.z < -100 && this.z > -150) {
                // Simple collision based on X distance
                const dist = Math.abs(this.x - player.x);
                if (dist < 0.25) { // Hit
                    if (this.type === 'enemy') {
                        gameOver();
                    } else {
                        collectEnergy(this);
                    }
                }
            }
            
            if (this.z < -200) this.active = false;
        }
        
        draw() {
            if (!this.active || this.z <= -200) return;
            
            const scale = FOV / (FOV + this.z);
            const sx = canvas.width/2 + this.x * (canvas.width/2) * scale * 0.5;
            const sy = HORIZON_Y + CAMERA_HEIGHT * scale;
            
            const size = (this.type === 'enemy' ? 60 : 30) * scale;
            
            ctx.save();
            if (this.type === 'enemy') {
                glow(ctx, COLORS.enemy, 20);
                ctx.fillStyle = COLORS.enemy;
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                
                // Draw a retro pyramid/block
                const h = size;
                const w = size;
                
                ctx.beginPath();
                ctx.moveTo(sx, sy - h);
                ctx.lineTo(sx - w/2, sy);
                ctx.lineTo(sx + w/2, sy);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
            } else {
                glow(ctx, COLORS.energy, 20);
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = COLORS.energy;
                
                // Draw sphere/orb
                ctx.beginPath();
                ctx.arc(sx, sy - size/2, size/2, 0, Math.PI*2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }
    }
    
    function spawnParticles(x, color) {
        for(let i=0; i<10; i++) {
            particles.push({
                x: x,
                y: 0, // screenspace-ish handling logic for particles is simpler
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 1) * 10,
                life: 1.0,
                color: color
            });
        }
    }
    
    function collectEnergy(obj) {
        obj.active = false;
        score += 100;
        speed = Math.min(speed + 5, 100);
        baseSpeed = 10 + (speed / 10);
        Audio.playItem();
        scoreEl.innerText = score;
        speedEl.innerText = Math.floor(speed);
        
        // Flash screen
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.fillRect(0,0, canvas.width, canvas.height);
    }
    
    function gameOver() {
        isPlaying = false;
        Audio.stop();
        Audio.playCrash();
        overlay.classList.remove('hidden');
        titleEl.textContent = "CRASHED";
        startBtn.textContent = "RETRY";
        updatePlayCount();
    }
    
    function drawGrid() {
        // Horizon
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Retro Grid Floor
        ctx.save();
        ctx.beginPath();
        
        // Vertical Lines (Perspective)
        for (let i = -8; i <= 8; i++) {
            const x = i * 200; // World width
            // Project p1 (far) and p2 (near)
            // Far z = 2000, Near z = 0
            
            const scaleFar = FOV / (FOV + 2000);
            const scaleNear = FOV / (FOV + 0);
            
            const xFar = canvas.width/2 + i * (canvas.width/4) * scaleFar * 0.5;
            const yFar = HORIZON_Y + CAMERA_HEIGHT * scaleFar;
            
            const xNear = canvas.width/2 + i * (canvas.width/4) * scaleNear * 0.5;
            const yNear = HORIZON_Y + CAMERA_HEIGHT * scaleNear + 400; // Extend past screen
            
            ctx.moveTo(xFar, yFar);
            ctx.lineTo(xNear, yNear);
        }
        
        // Horizontal Lines (Moving)
        // Shift based on time/speed
        const offset = (frame * baseSpeed) % 200; 
        
        for (let z = 0; z < 2000; z += 200) {
            const dz = z - offset;
            if (dz < 0) continue;
            
            const scale = FOV / (FOV + dz);
            const y = HORIZON_Y + CAMERA_HEIGHT * scale;
            
            // Draw a horizontal line across the screen visible area
            // Ideally should be bounded by the outer perspective lines, but full width looks okay for synthwave style
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        
        glow(ctx, COLORS.grid, 10);
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw Horizon Glow
        const grad = ctx.createLinearGradient(0, HORIZON_Y-50, 0, HORIZON_Y+50);
        grad.addColorStop(0, '#000');
        grad.addColorStop(0.5, '#ff00ff');
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, HORIZON_Y-2, canvas.width, 4);
        
        ctx.restore();
        
        // Draw Sun or Moon (Retro Sun)
        ctx.save();
        const sunY = HORIZON_Y - 50;
        const sunGrad = ctx.createLinearGradient(0, sunY-60, 0, sunY+60);
        sunGrad.addColorStop(0, '#ffff00');
        sunGrad.addColorStop(1, '#ff00ff');
        
        ctx.fillStyle = sunGrad;
        glow(ctx, '#ff00ff', 30);
        ctx.beginPath();
        ctx.arc(canvas.width/2, sunY, 60, 0, Math.PI*2);
        ctx.fill();
        
        // Sun stripes
        ctx.fillStyle = COLORS.bg;
        for(let i=0; i<10; i++) {
            ctx.fillRect(canvas.width/2 - 70, sunY + i*10 - 20, 140, 2 + i);
        }
        ctx.restore();
    }
    
    function drawPlayer() {
        // Player is just a wireframe car at the bottom center
        // Player X affects drawing position
        
        // Smooth lerp for controls
        player.x += (input.x - player.x) * 0.1;
        
        const px = canvas.width/2 + player.x * (canvas.width/2) * 0.5 * 2;
        const py = canvas.height - 50;
        
        ctx.save();
        glow(ctx, COLORS.player, 15);
        ctx.strokeStyle = COLORS.player;
        ctx.lineWidth = 3;
        
        // Draw Car body (Retro style)
        ctx.beginPath();
        // Bottom
        ctx.moveTo(px - 30, py + 10);
        ctx.lineTo(px + 30, py + 10);
        // Sides
        ctx.lineTo(px + 30, py - 5);
        ctx.lineTo(px + 20, py - 5); // Wheel well back
        ctx.lineTo(px + 15, py - 15); // Roof back
        ctx.lineTo(px - 15, py - 15); // Roof front
        ctx.lineTo(px - 20, py - 5); // Front
        ctx.lineTo(px - 30, py - 5);
        ctx.closePath();
        ctx.stroke();
        
        // Engine glow
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(px - 10, py + 11, 5, 2);
        ctx.fillRect(px + 5, py + 11, 5, 2);
        
        ctx.restore();
    }
    
    function loop() {
        if (!isPlaying) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update Game Logic
        frame++;
        Audio.updateEngine(speed);
        
        // Spawn Objects
        if (frame % Math.max(20, 60 - Math.floor(speed/2)) === 0) {
            const r = Math.random();
            const type = r > 0.3 ? 'enemy' : 'energy';
            objects.push(new Object3D(type));
        }
        
        // Sort objects by Z (Painter's algorithm: draw far first)
        objects.sort((a, b) => b.z - a.z);
        
        // Draw
        drawGrid();
        
        objects.forEach(obj => {
            obj.update();
            obj.draw();
        });
        
        // Remove dead objects
        objects = objects.filter(o => o.active);
        
        drawPlayer();
        
        // Speed effect particles
        if (speed > 5) {
            // Add stars/lines
        }

        requestAnimationFrame(loop);
    }
    
    function startGame() {
        score = 0;
        speed = 0;
        baseSpeed = 10;
        frame = 0;
        objects = [];
        particles = [];
        player.x = 0;
        input.x = 0;
        
        scoreEl.innerText = "0";
        speedEl.innerText = "0";
        
        Audio.init();
        
        isPlaying = true;
        overlay.classList.add('hidden');
        loop();
    }
    
    // Inputs
    function handleInput(tx) {
        // tx is -1 to 1
        input.x = Math.max(-1, Math.min(1, tx));
    }
    
    // Mouse / Touch
    canvas.addEventListener('mousemove', (e) => {
        if (!isPlaying) return;
        const rect = canvas.getBoundingClientRect();
        // Map 0 to width -> -1.5 to 1.5
        const normalized = (e.clientX - rect.left) / rect.width;
        handleInput((normalized - 0.5) * 3);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (!isPlaying) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const t = e.touches[0];
        const normalized = (t.clientX - rect.left) / rect.width;
        handleInput((normalized - 0.5) * 3);
    }, {passive: false});

    // Keys
    window.addEventListener('keydown', (e) => {
        if (!isPlaying) return;
        if (e.key === 'ArrowLeft') input.x = -0.8;
        if (e.key === 'ArrowRight') input.x = 0.8;
    });
    
    window.addEventListener('keyup', (e) => {
        if (!isPlaying) return;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') input.x = 0;
    });

    startBtn.addEventListener('click', startGame);

})();

// Global play count tracker
function updatePlayCount() {
    const counterEl = document.querySelector('[data-aomagame-play-count]');
    if (!counterEl) return;
    try {
        localStorage.setItem('aomagame:played:cyber-drift', '1');
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
1. **IGNITION**: タイトル画面をクリックしてスタート。
2. **STEER**: 画面上のマウス移動、または左右キーで車を操作します。スマホの場合はスライド操作です。
3. **AVOID**: ピンク色の障害物（ブロック）を避けてください。当たると即ゲームオーバー！
4. **BOOST**: 緑色のオーブを集めるとスコアアップ＆さらに加速します。

## 実装のポイント
- **Perspective Projection**: `z` 座標を用いてスケールとY座標を計算し、擬似的な奥行きを表現しています。
- **Synthwave Aesthetics**: `GlobalCompositeOperation` や `shadowBlur` を多用し、ネオン管のような発光表現（Glow Effect）をCanvas上で再現しました。
- **Retro Sun**: グラデーションとストライプマスクを用いて、80年代風の「沈まない太陽」を描画しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
