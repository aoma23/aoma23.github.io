---
title: "毎日ゲームチャレンジ Day 98: Stealth Shade (ステルス・シェイド)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

98日目は「Stealth Shade」。
監視カメラの視界を避け、闇に紛れてゴールを目指すステルスアクションゲームです。
タイミングを見極め、一瞬の隙をついて駆け抜けろ！
<!--more-->

<style>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

#ss-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  border-radius: 4px;
  background: #111;
  box-shadow: 0 0 20px #000;
  font-family: 'Courier Prime', monospace;
  position: relative;
  overflow: hidden;
  color: #0f0;
  user-select: none;
  border: 2px solid #050;
}

#ss-canvas {
  width: 100%;
  height: 400px;
  display: block;
  background: #000;
}

.ss-ui {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  text-shadow: 0 0 5px #0f0;
}

.ss-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,20,0,0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  transition: opacity 0.3s;
}
.ss-overlay.hidden {
    opacity: 0;
    pointer-events: none;
}

.ss-btn {
  background: #000;
  border: 2px solid #0f0;
  color: #0f0;
  padding: 10px 30px;
  font-size: 1.2rem;
  font-family: inherit;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: 0 0 10px #0f0;
}
.ss-btn:hover {
    background: #0f0;
    color: #000;
}

</style>

<div id="ss-game">
    <canvas id="ss-canvas" width="400" height="400"></canvas>
    
    <div class="ss-ui">
        <div>LEVEL <span id="ss-lvl">1</span></div>
        <div>TIME <span id="ss-time">0</span></div>
    </div>
    
    <div id="ss-start" class="ss-overlay">
        <h1 style="color:#0f0; font-size: 2.5rem; margin-bottom:10px;">STEALTH<br>SHADE</h1>
        <p>AVOID THE RED LIGHT</p>
        <button class="ss-btn" onclick="StealthShade.start()">MISSION START</button>
    </div>
    
    <div id="ss-over" class="ss-overlay hidden">
        <h1 style="color:#f00; font-size:2.5rem;">DETECTED</h1>
        <button class="ss-btn" style="border-color:#f00; color:#f00; box-shadow:0 0 10px #f00;" onclick="StealthShade.start()">RETRY</button>
    </div>
    
    <div id="ss-win" class="ss-overlay hidden">
        <h1 style="color:#ff0; font-size:2rem;">MISSION<br>COMPLETE</h1>
        <button class="ss-btn" onclick="StealthShade.nextLevel()">NEXT LEVEL</button>
    </div>
</div>

<script>
const StealthShade = (() => {
    const canvas = document.getElementById('ss-canvas');
    const ctx = canvas.getContext('2d');
    const lvlEl = document.getElementById('ss-lvl');
    const timeEl = document.getElementById('ss-time');
    const startEl = document.getElementById('ss-start');
    const overEl = document.getElementById('ss-over');
    const winEl = document.getElementById('ss-win');
    
    let state = 'title'; 
    let level = 1;
    let frame = 0;
    
    let player = {x: 20, y: 380, w: 16, h: 16, vx: 0, vy: 0};
    let goal = {x: 360, y: 20, w: 30, h: 30};
    let walls = [];
    let cameras = [];
    
    let keys = {u:false, d:false, l:false, r:false};
    
    // Audio
    const Audio = {
        ctx: null,
        init() {
            if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if(this.ctx.state === 'suspended') this.ctx.resume();
        },
        playAlert() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.linearRampToValueAtTime(1200, t+0.1);
            osc.type = 'sawtooth';
            g.gain.setValueAtTime(0.2, t);
            g.gain.linearRampToValueAtTime(0, t+0.5);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+0.5);
        },
        playWin() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.setValueAtTime(900, t+0.2);
            g.gain.setValueAtTime(0.1, t);
            g.gain.linearRampToValueAtTime(0, t+0.6);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+0.6);
        }
    };
    
    function init() {
        window.addEventListener('keydown', e => {
            if(e.key === 'ArrowUp') keys.u = true;
            if(e.key === 'ArrowDown') keys.d = true;
            if(e.key === 'ArrowLeft') keys.l = true;
            if(e.key === 'ArrowRight') keys.r = true;
        });
        window.addEventListener('keyup', e => {
            if(e.key === 'ArrowUp') keys.u = false;
            if(e.key === 'ArrowDown') keys.d = false;
            if(e.key === 'ArrowLeft') keys.l = false;
            if(e.key === 'ArrowRight') keys.r = false;
        });
        
        // Touch controls (virtual joystick simulation)
        // Touch controls (virtual joystick)
        // Touch controls: Hybrid (Joystick + Tap)
        let touchStart = {x:0, y:0};
        let touchMoved = false;

        const handleTouch = (x, y) => {
            const rect = canvas.getBoundingClientRect();
            // relative to canvas center
            const cx = rect.width/2;
            const cy = rect.height/2;
            const tx = x - rect.left;
            const ty = y - rect.top;
            
            keys.u=keys.d=keys.l=keys.r=false;
            
            // Simple 4-way direction from center
            if(Math.abs(tx-cx) > Math.abs(ty-cy)) {
                if(tx < cx) keys.l = true;
                else keys.r = true;
            } else {
                if(ty < cy) keys.u = true;
                else keys.d = true;
            }
        };
        
        canvas.addEventListener('touchstart', e => {
            e.preventDefault();
            touchMoved = false;
            touchStart.x = e.touches[0].clientX;
            touchStart.y = e.touches[0].clientY;
            
            // Immediate move on tap
            handleTouch(touchStart.x, touchStart.y);
        }, {passive:false});
        
        canvas.addEventListener('touchmove', e => {
            e.preventDefault();
            const x = e.touches[0].clientX;
            const y = e.touches[0].clientY;
            
            const dx = x - touchStart.x;
            const dy = y - touchStart.y;
            
            if(Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                touchMoved = true;
                keys.u=keys.d=keys.l=keys.r=false;
                if(Math.abs(dx) > Math.abs(dy)) {
                   if(dx>0) keys.r = true; else keys.l = true;
                } else {
                   if(dy>0) keys.d = true; else keys.u = true;
                }
            }
        }, {passive:false});
        
        canvas.addEventListener('touchend', () => {
             keys.u=keys.d=keys.l=keys.r=false;
        });
        
        requestAnimationFrame(loop);
    }
    
    function start() {
        Audio.init();
        level = 1;
        setupLevel();
    }
    
    function nextLevel() {
        level++;
        setupLevel();
    }
    
    function setupLevel() {
        state = 'playing';
        startEl.classList.add('hidden');
        overEl.classList.add('hidden');
        winEl.classList.add('hidden');
        lvlEl.textContent = level;
        frame = 0;
        
        player.x = 20; player.y = 360;
        
        goal.x = 350; goal.y = 20;
        
        walls = [];
        cameras = [];
        
        // Gen procedural level
        // Border
        walls.push({x:0,y:0,w:400,h:10});
        walls.push({x:0,y:390,w:400,h:10});
        walls.push({x:0,y:0,w:10,h:400});
        walls.push({x:390,y:0,w:10,h:400});
        
        // Obstacles
        for(let i=0; i<3 + level; i++) {
            walls.push({
                x: 50 + Math.random() * 300,
                y: 50 + Math.random() * 300,
                w: 30 + Math.random() * 50,
                h: 30 + Math.random() * 50
            });
        }
        
        // Cameras
        for(let i=0; i<2 + Math.floor(level/2); i++) {
            cameras.push({
                x: 100 + Math.random() * 200,
                y: 100 + Math.random() * 200,
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.05,
                range: 120,
                fov: 0.8
            });
        }
    }
    
    function gameOver() {
        state = 'over';
        overEl.classList.remove('hidden');
        Audio.playAlert();
        try { localStorage.setItem('aomagame:played:stealth-shade', '1'); } catch(e){}
    }
    
    function win() {
        state = 'win';
        winEl.classList.remove('hidden');
        Audio.playWin();
    }
    
    function loop() {
        if(state === 'playing') update();
        draw();
        requestAnimationFrame(loop);
    }
    
    function update() {
        frame++;
        const speed = 3;
        if(keys.u) player.y -= speed;
        if(keys.d) player.y += speed;
        if(keys.l) player.x -= speed;
        if(keys.r) player.x += speed;
        
        // Wall collision
        walls.forEach(w => {
            if(player.x < w.x + w.w && player.x + player.w > w.x &&
               player.y < w.y + w.h && player.y + player.h > w.y) {
                   // Push back (simple)
                   if(keys.u) player.y += speed;
                   if(keys.d) player.y -= speed;
                   if(keys.l) player.x += speed;
                   if(keys.r) player.x -= speed;
               }
        });
        
        // Goal
        if(player.x < goal.x + goal.w && player.x + player.w > goal.x &&
           player.y < goal.y + goal.h && player.y + player.h > goal.y) {
               win();
        }
        
        // Camera detection
        // Raycast?
        cameras.forEach(c => {
            c.angle += c.speed;
            
            // Check if player is in cone
            const dx = (player.x + player.w/2) - c.x;
            const dy = (player.y + player.h/2) - c.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < c.range) {
                const angleToPlayer = Math.atan2(dy, dx);
                let angleDiff = angleToPlayer - c.angle;
                // Normalize angle
                while(angleDiff <= -Math.PI) angleDiff += Math.PI*2;
                while(angleDiff > Math.PI) angleDiff -= Math.PI*2;
                
                if(Math.abs(angleDiff) < c.fov/2) {
                    // In cone!
                    // Check Line of Sight (Raycast to walls)
                    let visible = true;
                    // Simple wall check for center ray
                    // Proper raycast is heavy, we'll just check if any wall INTERSECTS the line seg (c.x,c.y) -> (p.x, p.y)
                    // ... Skipping complex LoS for simplicity, just assume visible if in cone
                    gameOver();
                }
            }
        });
        
        timeEl.textContent = Math.floor(frame / 60);
    }
    
    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0,0,400,400);
        
        // Grid
        ctx.strokeStyle = '#020';
        ctx.beginPath();
        for(let i=0; i<400; i+=40) {
            ctx.moveTo(i,0); ctx.lineTo(i,400);
            ctx.moveTo(0,i); ctx.lineTo(400,i);
        }
        ctx.stroke();
        
        // Goal
        ctx.fillStyle = '#ff0';
        ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
        
        // Walls
        ctx.fillStyle = '#050';
        ctx.strokeStyle = '#0a0';
        walls.forEach(w => {
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.strokeRect(w.x, w.y, w.w, w.h);
        });
        
        // Cameras
        cameras.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            
            // Draw Cone
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'; // Darker red
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.arc(0, 0, c.range, c.angle - c.fov/2, c.angle + c.fov/2);
            ctx.fill();
            
            // Body
            ctx.fillStyle = '#fff';
            ctx.fillRect(-5, -5, 10, 10);
            
            ctx.restore();
        });
        
        // Player
        ctx.fillStyle = '#0f0';
        ctx.shadowColor = '#0f0';
        ctx.shadowBlur = 5;
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.shadowBlur = 0;
    }
    
    init();
    return { start, nextLevel };
})();
</script>

## 遊び方
1. **MOVE**: 矢印キー、または画面の上下左右エリアをタップして移動します。
2. **AVOID**: 回転する監視カメラの「赤い視界」に入らないように注意してください。
3. **GOAL**: 黄色いエリアに到達すればクリア。次のレベルへ進みます。
4. **STEALTH**: 視界に入った瞬間、即ゲームオーバーです。慎重に、かつ大胆に動きましょう。

## 実装のポイント
- **View Cone Detection**: カメラの位置からプレイヤーへのベクトルと、カメラの向きベクトルとの角度差（内積など）を計算し、プレイヤーが扇形の視界内に入っているかを判定しています。
- **Procedural Level**: レベルが進むにつれて壁やカメラの配置がランダムに生成され、毎回異なる潜入ルートを楽しむことができます。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
