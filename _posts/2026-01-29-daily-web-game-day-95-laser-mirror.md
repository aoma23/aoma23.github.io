---
title: "毎日ゲームチャレンジ Day 95: Laser Mirror (レーザー・ミラー)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

95日目は「Laser Mirror」。
鏡を設置してレーザーをゴールまで導くパズルゲームです。
光の反射法則を利用して、複雑な経路を攻略しましょう。
<!--more-->

<style>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

#lm-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  border-radius: 8px;
  background: #222;
  box-shadow: 0 5px 15px rgba(0,0,0,0.5);
  font-family: 'Share Tech Mono', monospace;
  position: relative;
  overflow: hidden;
  user-select: none;
  border: 1px solid #444;
  color: #eee;
}

.lm-header {
  padding: 10px;
  background: #111;
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #555;
  align-items: center;
}

#lm-canvas {
  width: 100%;
  max-width: 400px;
  height: auto;
  aspect-ratio: 1 / 1;
  background: #151515;
  display: block;
  cursor: pointer;
}

.lm-footer {
  padding: 10px;
  display: flex;
  justify-content: center;
  gap: 20px;
  background: #111;
}

.lm-btn {
  background: #333;
  color: #fff;
  border: 1px solid #666;
  padding: 5px 15px;
  font-family: inherit;
  cursor: pointer;
  border-radius: 4px;
}
.lm-btn:hover { background: #444; border-color: #fff; }
.lm-btn.fire { background: #d00; border-color: #f55; }

.lm-msg {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0,0,0,0.9);
    padding: 20px;
    border: 2px solid #0f0;
    color: #0f0;
    text-align: center;
    display: none;
    z-index: 10;
}
.lm-msg.show { display: block; }

</style>

<div id="lm-game">
    <div class="lm-header">
        <div>LEVEL: <span id="lm-lvl">1</span></div>
        <button class="lm-btn" onclick="LaserMirror.reset()">RESET</button>
    </div>
    
    <canvas id="lm-canvas" width="400" height="400"></canvas>
    
    <div class="lm-footer">
        <button class="lm-btn fire" onclick="LaserMirror.fire()">FIRE LASER</button>
    </div>
    
    <div id="lm-msg" class="lm-msg">
        <h2 style="margin:0 0 10px 0;">SYSTEM ONLINE</h2>
        <p>TARGET ACQUIRED</p>
        <button class="lm-btn" onclick="LaserMirror.nextLevel()">NEXT LEVEL</button>
    </div>
</div>

<script>
const LaserMirror = (() => {
    const canvas = document.getElementById('lm-canvas');
    const ctx = canvas.getContext('2d');
    const lvlEl = document.getElementById('lm-lvl');
    const msgEl = document.getElementById('lm-msg');
    
    const ROWS = 8;
    const COLS = 8;
    const CELL = 50;
    
    let level = 1;
    let grid = []; // 0: empty, 1: mirror1(/), 2: mirror2(\), 3: block
    let start = {c:0, r:0, dir: 1}; // dir: 0N, 1E, 2S, 3W
    let target = {c:7, r:7};
    let firing = false;
    let path = [];
    
    // Audio
    const Audio = {
        ctx: null,
        init() {
            if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if(this.ctx.state === 'suspended') this.ctx.resume();
        },
        playRotate() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(300, t+0.05);
            g.gain.setValueAtTime(0.05, t);
            g.gain.linearRampToValueAtTime(0, t+0.05);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+0.05);
        },
        playLaser() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.linearRampToValueAtTime(800, t+0.3);
            g.gain.setValueAtTime(0.05, t);
            g.gain.linearRampToValueAtTime(0, t+0.3);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+0.3);
        },
        playWin() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.setValueAtTime(880, t+0.1);
            g.gain.setValueAtTime(0.1, t);
            g.gain.linearRampToValueAtTime(0, t+0.5);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+0.5);
        }
    };

    function init() {
        generateLevel();
        draw();
        
        canvas.addEventListener('click', onClick);
    }
    
    function generateLevel() {
        firing = false;
        msgEl.classList.remove('show');
        path = [];
        grid = [];
        
        // Init grid
        for(let r=0; r<ROWS; r++) {
            let row = [];
            for(let c=0; c<COLS; c++) {
                row.push(0);
            }
            grid.push(row);
        }
        
        // Random start/end on edges
        if(Math.random()<0.5) {
             start = {c:0, r: Math.floor(Math.random()*ROWS), dir: 1};
             target = {c:COLS-1, r: Math.floor(Math.random()*ROWS)};
        } else {
             start = {c:Math.floor(Math.random()*COLS), r: 0, dir: 2};
             target = {c:Math.floor(Math.random()*COLS), r: ROWS-1};
        }
        
        // Add random blocks
        let blocks = 3 + Math.floor(level/2);
        for(let i=0; i<blocks; i++) {
            let r = Math.floor(Math.random()*ROWS);
            let c = Math.floor(Math.random()*COLS);
            if((r===start.r && c===start.c) || (r===target.r && c===target.c)) continue;
            grid[r][c] = 3;
        }
        
        draw();
    }
    
    function onClick(e) {
        if(firing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const c = Math.floor(x / CELL);
        const r = Math.floor(y / CELL);
        
        // Check bounds
        if(c<0||c>=COLS||r<0||r>=ROWS) return;
        
        // Check fixed items
        if(r===start.r && c===start.c) return;
        if(r===target.r && c===target.c) return;
        if(grid[r][c] === 3) return; // Fixed block
        
        // Cycle: Empty(0) -> Mirror1(1) -> Mirror2(2) -> Empty(0)
        grid[r][c] = (grid[r][c] + 1) % 3;
        
        Audio.init();
        Audio.playRotate();
        draw();
    }
    
    function fire() {
        if(firing) return;
        Audio.init();
        Audio.playLaser();
        firing = true;
        
        // Trace
        path = [];
        let curr = {c: start.c, r: start.r};
        let dir = start.dir; // 0N, 1E, 2S, 3W
        let steps = 0;
        let hit = false;
        
        path.push({...curr});
        
        while(steps < 100) {
            // Check interaction with CURRENT cell content (where we are)
            // Mirrors reflect
            const cell = grid[curr.r][curr.c];
            
            if(cell === 1) { // / Mirror
                if(dir === 0) dir = 1;      // N -> E
                else if(dir === 1) dir = 0; // E -> N
                else if(dir === 2) dir = 3; // S -> W
                else if(dir === 3) dir = 2; // W -> S
            } else if(cell === 2) { // \ Mirror
                if(dir === 0) dir = 3;      // N -> W
                else if(dir === 1) dir = 2; // E -> S
                else if(dir === 2) dir = 1; // S -> E
                else if(dir === 3) dir = 0; // W -> N
            } else if(cell === 3) { // Block
                 hit = false;
                 break; // Absorb
            }
            
            // Check target
            if(curr.c === target.c && curr.r === target.r) {
                hit = true;
                break;
            }
            
            // Move in new direction
            if(dir === 0) curr.r--;
            if(dir === 1) curr.c++;
            if(dir === 2) curr.r++;
            if(dir === 3) curr.c--;
            
            // Check bounds
            if(curr.c < 0 || curr.c >= COLS || curr.r < 0 || curr.r >= ROWS) break;
            
            path.push({...curr});
            steps++;
        }
        
        draw();
        
        if(hit) {
            Audio.playWin();
            setTimeout(() => {
                msgEl.classList.add('show');
                try { localStorage.setItem('aomagame:played:laser-mirror', '1'); } catch(e){}
            }, 500);
        } else {
            setTimeout(() => { firing = false; path=[]; draw(); }, 1000);
        }
    }
    
    function nextLevel() {
        level++;
        lvlEl.textContent = level;
        generateLevel();
    }
    
    function reset() {
        generateLevel(); // Just regen
    }
    
    function draw() {
        // BG
        ctx.fillStyle = '#151515';
        ctx.fillRect(0,0,400,400);
        
        // Grid lines
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        for(let i=0; i<=ROWS; i++) {
            ctx.beginPath(); ctx.moveTo(0, i*CELL); ctx.lineTo(400, i*CELL); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(i*CELL, 0); ctx.lineTo(i*CELL, 400); ctx.stroke();
        }
        
        // Items
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                const cx = c*CELL + CELL/2;
                const cy = r*CELL + CELL/2;
                
                if(grid[r][c] === 1) { // /
                    ctx.strokeStyle = '#0af';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(cx-15, cy+15);
                    ctx.lineTo(cx+15, cy-15);
                    ctx.stroke();
                } else if(grid[r][c] === 2) { // \
                    ctx.strokeStyle = '#0af';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(cx-15, cy-15);
                    ctx.lineTo(cx+15, cy+15);
                    ctx.stroke();
                } else if(grid[r][c] === 3) {
                    ctx.fillStyle = '#444';
                    ctx.fillRect(c*CELL+5, r*CELL+5, CELL-10, CELL-10);
                }
            }
        }
        
        // Start / End
        ctx.fillStyle = '#0f0';
        ctx.beginPath(); ctx.arc(start.c*CELL+CELL/2, start.r*CELL+CELL/2, 10, 0, Math.PI*2); ctx.fill();
        
        ctx.fillStyle = '#f0f';
        ctx.fillRect(target.c*CELL+10, target.r*CELL+10, CELL-20, CELL-20);
        
        // Path
        if(path.length > 0) {
            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#f00';
            ctx.beginPath();
            
            // Helper to get center
            const gc = (p) => ({x: p.c*CELL+CELL/2, y: p.r*CELL+CELL/2});
            
            let p = gc(path[0]);
            ctx.moveTo(p.x, p.y);
            
            for(let i=1; i<path.length; i++) {
                p = gc(path[i]);
                ctx.lineTo(p.x, p.y);
            }
            
            // Draw to boundary if last step went out?
            // Simplified: just draw stored path
            
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
    
    init(); // Run init
    return {
        fire, reset, nextLevel
    };
})();
</script>

## 遊び方
1. **PLACE**: グリッドをクリックして、鏡（`/` または `\`）を配置したり向きを変えたりします。
2. **PLAN**: 緑の「Start」から発射されるレーザーを、鏡で反射させてピンクの「Target」へ導く経路を作ってください。
3. **FIRE**: 「FIRE LASER」ボタンを押してレーザーを発射！
4. **CLEAR**: レーザーがターゲットに到達すればクリア。次のレベルへ進みます。

## 実装のポイント
- **Grid Reflection**: グリッド上の鏡の向き（`/` or `\`）と、レーザーの入射角（東西南北）の組み合わせに応じた反射ロジックを実装しています。
- **Path Tracing**: 発射前に経路計算を行い、結果を描画することで、試行錯誤しやすいパズル性を実現しました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
