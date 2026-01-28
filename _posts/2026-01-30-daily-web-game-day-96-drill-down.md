---
title: "毎日ゲームチャレンジ Day 96: Drill Down (ドリル・ダウン)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

96日目は「Drill Down」。
地底深くを目指して掘り進むアクションゲームです。
迫りくる岩盤を避け、燃料を補給しながら、未踏の深度へ到達しましょう！
<!--more-->

<style>
@import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap');

#drill-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  border-radius: 8px;
  background: #321;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  font-family: 'Black+Ops+One', cursive;
  position: relative;
  overflow: hidden;
  border: 4px solid #543;
  color: #fff;
  user-select: none;
}

#drill-canvas {
  width: 100%;
  height: 500px;
  display: block;
}

.dg-ui {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  text-shadow: 2px 2px 0 #000;
  pointer-events: none;
  font-size: 1.2rem;
  z-index: 5;
}

.dg-fuel-bar {
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 100%;
  height: 20px;
  background: #500;
  z-index: 5;
}
.dg-fuel-fill {
  width: 100%;
  height: 100%;
  background: #f00;
  transition: width 0.1s;
}
.dg-fuel-fill.low-fuel {
  animation: blink 0.5s infinite;
}
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}

.dg-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
}
.dg-overlay.hidden { display: none; }

.dg-title {
  font-size: 3rem;
  color: #fb0;
  margin-bottom: 20px;
  text-shadow: 3px 3px 0 #520;
}

.dg-btn {
  background: #fb0;
  border: 4px solid #fff;
  color: #321;
  font-size: 1.5rem;
  padding: 10px 30px;
  font-family: inherit;
  cursor: pointer;
  border-radius: 10px;
}
.dg-btn:hover { transform: scale(1.05); }

</style>

<div id="drill-game">
    <canvas id="drill-canvas" width="400" height="500"></canvas>
    
    <div class="dg-ui">
        <div>DEPTH: <span id="dg-depth">0</span>m</div>
    </div>
    
    <div class="dg-fuel-bar">
        <div id="dg-fuel" class="dg-fuel-fill"></div>
    </div>
    
    <div id="dg-start" class="dg-overlay">
        <div class="dg-title">DRILL DOWN</div>
        <button class="dg-btn" onclick="DrillGame.start()">DIG!</button>
    </div>
    
    <div id="dg-over" class="dg-overlay hidden">
        <div class="dg-title" style="color:#f55;">CRASHED!</div>
        <div style="font-size:1.5rem; margin-bottom:20px;">DEPTH: <span id="dg-final">0</span>m</div>
        <button class="dg-btn" onclick="DrillGame.start()">RETRY</button>
    </div>
</div>

<script>
const DrillGame = (() => {
    const canvas = document.getElementById('drill-canvas');
    const ctx = canvas.getContext('2d');
    const depthEl = document.getElementById('dg-depth');
    const fuelEl = document.getElementById('dg-fuel');
    const startEl = document.getElementById('dg-start');
    const overEl = document.getElementById('dg-over');
    const finalEl = document.getElementById('dg-final');
    
    let isPlaying = false;
    let frame = 0;
    let lastAlertTime = 0;
    
    // Constants
    const BLOCK_SIZE = 40;
    const COLS = 10;
    const PLAYER_W = 30;
    const PLAYER_H = 40;
    
    // Game State
    let player = { col: 4, x: 200, y: 150 }; // Visual Y position on screen is fixed
    let cameraY = 0; // World Y at top of screen
    let maxDepth = 0;
    let fuel = 100;
    
    let rows = []; 
    let speed = 2.0;

    // Audio
    const Audio = {
        ctx: null,
        init() {
            if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if(this.ctx.state === 'suspended') this.ctx.resume();
        },
        playHit() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.value = 80;
            osc.type = 'sawtooth';
            g.gain.setValueAtTime(0.3, t);
            g.gain.exponentialRampToValueAtTime(0.01, t+0.3);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+0.3);
        },
        playFuel() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(500, t);
            osc.frequency.linearRampToValueAtTime(1000, t+0.1);
            g.gain.setValueAtTime(0.1, t);
            g.gain.linearRampToValueAtTime(0, t+0.1);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+0.1);
        },
        playMove() {
             if(!this.ctx) return;
             // Light click sound
             const t = this.ctx.currentTime;
             const osc = this.ctx.createOscillator();
             const g = this.ctx.createGain();
             osc.frequency.setValueAtTime(300, t);
             osc.frequency.exponentialRampToValueAtTime(100, t+0.05);
             g.gain.setValueAtTime(0.05, t);
             g.gain.linearRampToValueAtTime(0, t+0.05);
             osc.connect(g);
             g.connect(this.ctx.destination);
             g.connect(this.ctx.destination);
             osc.start();
             osc.stop(t+0.05);
        },
        playLowFuel() {
             if(!this.ctx) return;
             const t = this.ctx.currentTime;
             const osc = this.ctx.createOscillator();
             const g = this.ctx.createGain();
             osc.frequency.setValueAtTime(400, t);
             osc.frequency.linearRampToValueAtTime(300, t+0.1);
             g.gain.setValueAtTime(0.1, t);
             g.gain.linearRampToValueAtTime(0, t+0.1);
             osc.connect(g);
             g.connect(this.ctx.destination);
             osc.start();
             osc.stop(t+0.1);
        }
    };
    
    function init() {
        // Controls: Grid Movement
        const move = (dir) => {
            if(!isPlaying) return;
            let next = player.col + dir;
            if(next >= 0 && next < COLS) {
                player.col = next;
                Audio.playMove(); // Audio feedback
            }
        };

        const handleInput = (x) => {
            const rect = canvas.getBoundingClientRect();
            if(x - rect.left < 200) move(-1);
            else move(1);
        };
        
        // Touch / Click
        canvas.addEventListener('touchstart', e => { 
            e.preventDefault(); // Prevent scrolling/double tap zoom
            handleInput(e.touches[0].clientX); 
        }, {passive:false});
        
        canvas.addEventListener('mousedown', e => {
            handleInput(e.clientX);
        });
        
        // Keyboard
        window.addEventListener('keydown', e => {
            if(e.key === 'ArrowLeft') move(-1);
            if(e.key === 'ArrowRight') move(1);
        });
        
        // Render loop
        requestAnimationFrame(loop);
    }
    
    function start() {
        Audio.init();
        isPlaying = true;
        fuel = 100;
        cameraY = 0;
        maxDepth = 0;
        speed = 2.5;
        player.col = 4; // Center
        player.x = 4 * BLOCK_SIZE + BLOCK_SIZE/2; // Init X
        player.y = 150; 
        
        rows = [];
        // Generate initial rows
        for(let i=0; i<15; i++) {
            addRow(i * BLOCK_SIZE);
        }
        
        startEl.classList.add('hidden');
        overEl.classList.add('hidden');
        loop();
    }
    
    function addRow(worldY) {
        let blocks = [];
        for(let c=0; c<COLS; c++) {
            let type = 0; // Dirt
            const r = Math.random();
            // Difficulty increases with depth
            const difficulty = Math.min(0.2, cameraY / 15000); // Slower difficulty curve
            
            if(r < 0.08 + difficulty) type = 1; // Rock (Less rocks initially)
            else if(r < 0.13 + difficulty) type = 2; // Fuel
            
            // Safe zone at start
            if(worldY < 300) {
                 if(type === 1) type = 0;
                 if(type === 2 && worldY < 100) type = 0; // No fuel at very top
            }
            blocks.push({type: type});
        }
        rows.push({y: worldY, blocks: blocks});
    }
    
    function gameOver(reason) {
        isPlaying = false;
        
        let msg = "CRASHED!";
        if(reason === "fuel") msg = "OUT OF FUEL!";
        
        overEl.querySelector('.dg-title').textContent = msg;
        finalEl.textContent = Math.floor(maxDepth);
        
        overEl.classList.remove('hidden');
        Audio.playHit();
        try{localStorage.setItem('aomagame:played:drill-down','1');}catch(e){}
    }
    
    function loop() {
        if(isPlaying) update();
        draw();
        
        if(isPlaying) requestAnimationFrame(loop);
    }
    
    function update() {
        // Scroll World
        cameraY += speed;
        speed += 0.0005; // Accelerate very slowly
        maxDepth = cameraY / 10;
        depthEl.textContent = Math.floor(maxDepth);
        
        // Fuel
        fuel -= 0.10; // Lower burn rate
        fuelEl.style.width = Math.max(0, fuel) + '%';
        
        // Low fuel warning
        if(fuel < 20) {
            fuelEl.classList.add('low-fuel');
            if(frame - lastAlertTime > 60) { // Alert every 1 sec approx
                Audio.playLowFuel();
                lastAlertTime = frame;
            }
        } else {
            fuelEl.classList.remove('low-fuel');
        }
        
        if(fuel <= 0) {
            gameOver('fuel');
            return;
        }
        
        // Move Player X (Smooth Latency)
        const targetX = player.col * BLOCK_SIZE + BLOCK_SIZE/2;
        player.x += (targetX - player.x) * 0.3; // Responsive smoothing
        
        // Row Management
        if(rows[0].y < cameraY - 100) {
            rows.shift();
        }
        const lastRow = rows[rows.length-1];
        if(lastRow.y < cameraY + 600) {
            addRow(lastRow.y + BLOCK_SIZE);
        }
        
        // Collision Detection
        // Player is at World Y = cameraY + 150
        // We only check the row that the player is currently IN.
        // Since movement is grid-based logic, we check the block at player.col in the row overlapping player center.
        
        const pWorldY = cameraY + 150;
        
        // Find row overlapping pWorldY
        // Since rows are sorted by Y, we can search or simple math if grid aligned
        // Rows are arbitrary Y blocks, so let's iterate safely
        
        for(let row of rows) {
             // Check if player center is inside this row vertically
             if(pWorldY >= row.y && pWorldY < row.y + BLOCK_SIZE) {
                 // Check the block at player.col
                 const block = row.blocks[player.col];
                 
                 // Also checking neighbors if player X is transitioning?
                 // To prevent clipping through corners while moving, maybe?
                 // But simply checking center point is usually fine for lane games.
                 // Let's check center point against block logic.
                 
                 if(block.type === 1) { // Rock
                     // Hit rock
                     gameOver('rock');
                     return;
                 } else if(block.type === 2) { // Fuel
                     Audio.playFuel();
                     fuel = Math.min(100, fuel + 20);
                     block.type = -1; 
                 } else if(block.type === 0) { // Dirt
                     block.type = -1; // Dig
                 }
             }
             
             // Check vertical Hitbox overlap for Rocks
             // Relaxed hitbox: pTop/pBottom is smaller
             const pTop = pWorldY - 5;
             const pBottom = pWorldY + 5;
             
             if(row.y + BLOCK_SIZE > pTop && row.y < pBottom) {
                 const block = row.blocks[player.col];
                 if(block.type === 1) {
                     // Hit valid rock edge
                     gameOver('rock');
                     return;
                 }
             }
        }
    }
    
    function draw() {
        // Clear
        ctx.fillStyle = '#321';
        ctx.fillRect(0,0,400,500);
        
        // Rows
        rows.forEach(row => {
            const screenY = row.y - cameraY;
            if(screenY < -BLOCK_SIZE || screenY > 500) return;
            
            for(let c=0; c<COLS; c++) {
                const b = row.blocks[c];
                const x = c * BLOCK_SIZE;
                
                if(b.type === 0) { // Dirt
                    ctx.fillStyle = '#754';
                    ctx.fillRect(x, screenY, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.fillStyle = '#643'; // Detail
                    ctx.fillRect(x+5, screenY+5, BLOCK_SIZE-10, BLOCK_SIZE-10);
                } else if(b.type === 1) { // Rock
                    ctx.fillStyle = '#889';
                    ctx.fillRect(x, screenY, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.fillStyle = '#667';
                    ctx.beginPath();
                    ctx.lineTo(x, screenY+BLOCK_SIZE);
                    ctx.lineTo(x+BLOCK_SIZE, screenY);
                    ctx.lineTo(x, screenY);
                    ctx.fill();
                } else if(b.type === 2) { // Fuel
                    ctx.fillStyle = '#543'; // Dirt BG
                    ctx.fillRect(x, screenY, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.fillStyle = '#f00';
                    ctx.beginPath();
                    ctx.arc(x + BLOCK_SIZE/2, screenY + BLOCK_SIZE/2, 12, 0, Math.PI*2);
                    ctx.fill();
                    ctx.fillStyle = '#ff0';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('F', x + BLOCK_SIZE/2, screenY + BLOCK_SIZE/2);
                }
            }
        });
        
        if(isPlaying || !startEl.classList.contains('hidden')) {
            // Player
            const py = 150;
            ctx.save();
            ctx.translate(player.x, py);
            
            if(isPlaying) ctx.translate(Math.random()*2-1, 0);
            
            // Body
            ctx.fillStyle = '#fb0';
            ctx.fillRect(-PLAYER_W/2, -PLAYER_H/2, PLAYER_W, PLAYER_H - 10);
            
            // Drill
            ctx.fillStyle = '#ddd';
            ctx.beginPath();
            ctx.moveTo(-10, PLAYER_H/2 - 10);
            ctx.lineTo(10, PLAYER_H/2 - 10);
            ctx.lineTo(0, PLAYER_H/2 + 5);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    init();
    return { start };
})();
</script>

## 遊び方
1. **MOVE**: 画面の左半分・右半分をタップ、またはキーボードの矢印キーで、ドリルマシンを左右のレーンに移動させます。1タップで1マス移動します。
2. **DIG**: マシンは自動で進みます。茶色の土は掘れますが、灰色の岩盤は避けてください。
3. **FUEL**: 燃料（Fマーク）を取得して、ガス欠を防ぎましょう。
4. **DEPTH**: どこまで深く掘り進めるか、限界に挑戦！

## 実装のポイント
- **Lane System**: 左右の入力で「1コマ（1レーン）」単位で移動するよう変更し、スマートフォンでも正確な操作ができるようにしました。
- **Balanced Difficulty**: 岩の生成パターンや燃料の減少率を調整し、テンポよく深く潜れるようにバランスを改善しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
