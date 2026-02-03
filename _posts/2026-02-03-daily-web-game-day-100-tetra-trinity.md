---
title: "毎日ゲームチャレンジ Day 100: Tetra Trinity (テトラ・トリニティ)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

ついに100日目！！これまでの集大成として、落ち物パズルの「進化系」3種を詰め合わせたスペシャルパッケージをお届けします。

1. **Gravity Trix**: 矢印で重力方向を切替できる可変重力テトリス。  
2. **Pento Master**: 5ブロック構成のペントミノ限定・高難度モード。  
3. **Sand Tris**: 3色の砂ブロックが真下に崩れ、同色で埋まった行だけ消える。ときどき落ちるボムで周囲をまとめて除去。

最後まで走り抜けた記念すべきゲーム、ぜひ遊んでみてください！

<!--more-->

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;700&display=swap');

#game-container {
  width: 100%;
  max-width: 480px;
  margin: 0 auto 14px;
  background: #111;
  color: #fff;
  font-family: 'Inter', sans-serif;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  user-select: none;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  border: 4px solid #777; /* Better visibility */
}

.game-canvas-wrap {
  width: 100%;
  max-height: 420px;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1.6;
  margin: 0 auto;
  background: #000;
  border: 3px solid #888; /* Canvas border */
  touch-action: none;
}

#ui-layer {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.menu-screen {
  background: rgba(0,0,0,0.85);
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  position: absolute;
  top: 0; left: 0;
  z-index: 10;
  transition: opacity 0.3s;
}

.title-text {
  font-family: 'Press Start 2P', cursive;
  font-size: 24px;
  color: #FFD700;
  text-shadow: 4px 4px 0 #FF4500;
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.5;
}

.mode-btn {
  background: #333;
  border: 2px solid #555;
  color: #fff;
  padding: 15px 30px;
  margin: 10px;
  font-size: 16px;
  font-weight: bold;
  width: 240px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  font-family: 'Inter', sans-serif;
  position: relative;
  overflow: hidden;
}

.mode-btn:hover {
  background: #555;
  border-color: #fff;
  transform: scale(1.05);
}

.mode-btn span {
  display: block;
  font-size: 10px;
  color: #aaa;
  margin-top: 4px;
  font-weight: normal;
}

.game-header {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.5);
  pointer-events: none;
}
.game-stats {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  color: #fff;
}
.back-btn {
  pointer-events: auto;
  background: #333;
  border: 1px solid #666;
  color: #fff;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
}

#mobile-controls {
  display: none; /* Shown via JS on touch devices */
  width: 100%;
  padding: 12px 10px 12px;
  box-sizing: border-box;
  pointer-events: auto;
  position: relative;
  background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.45) 100%);
  backdrop-filter: blur(4px);
  z-index: 5;
}
.ctrl-grid {
  display: grid;
  column-gap: 10px;
  row-gap: 0;
  width: 100%;
}

/* Layout A: 1行 L D R A */
#mobile-controls.layout-a .ctrl-grid {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 60px;
}
#mobile-controls.layout-a #btn-l { grid-column:1; grid-row:1; }
#mobile-controls.layout-a #btn-d { grid-column:2; grid-row:1; }
#mobile-controls.layout-a #btn-r { grid-column:3; grid-row:1; }
#mobile-controls.layout-a #btn-a { grid-column:4; grid-row:1; }

/* Layout B: 1行 L R D A */
#mobile-controls.layout-b .ctrl-grid {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: 60px;
}
#mobile-controls.layout-b #btn-l { grid-column:1; grid-row:1; }
#mobile-controls.layout-b #btn-r { grid-column:2; grid-row:1; }
#mobile-controls.layout-b #btn-d { grid-column:3; grid-row:1; }
#mobile-controls.layout-b #btn-a { grid-column:4; grid-row:1; }

/* Layout C: 2行 L R _ A / D(span2) _ A(span2) */
#mobile-controls.layout-c .ctrl-grid {
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 56px);
}
#mobile-controls.layout-c #btn-l { grid-column:1; grid-row:1; }
#mobile-controls.layout-c #btn-r { grid-column:2; grid-row:1; }
#mobile-controls.layout-c #btn-d { grid-column:1 / span 2; grid-row:2; }
#mobile-controls.layout-c #btn-a { 
  grid-column:4; 
  grid-row:1 / span 2; 
  height: 100%; 
  min-height: 0;
  align-self: stretch;
}
.c-btn {
  min-width: 52px; height: 52px;
  background: linear-gradient(145deg, #1f1f1f, #2c2c2c);
  border: 2px solid #5af;
  border-radius: 12px;
  box-shadow: 0 6px 14px rgba(90,175,255,0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #e8f4ff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  user-select: none;
  cursor: pointer;
  transition: transform 0.08s, box-shadow 0.08s;
  position: relative;
}
.c-btn:active {
  transform: translateY(1px) scale(0.98);
  box-shadow: 0 2px 6px rgba(90,175,255,0.25);
}
.c-btn#btn-l { grid-area: l; }
.c-btn#btn-r { grid-area: r; }
.c-btn#btn-d { grid-area: d; }
.c-btn#btn-a { grid-area: a; min-height: 52px; }

.rotate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

#layout-switch {
  position: absolute;
  top: -22px;
  right: -12px;
  left: auto;
  transform: translate(0, 0);
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: #222;
  border: 2px solid #7af;
  color: #7af;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.35);
  pointer-events: auto;
}

.hidden { display: none !important; }
</style>

<div id="game-container">
  <div class="game-canvas-wrap">
    <canvas id="game-canvas" width="400" height="600"></canvas>
  </div>
  
  <div class="game-header hidden" id="game-hud">
    <div class="game-stats">Testing</div>
    <button class="back-btn" onclick="TTGame.menu()">MENU</button>
  </div>
  
  <div id="main-menu" class="menu-screen">
    <div class="title-text">TETRA<br>TRINITY</div>
    <div class="mode-btn" onclick="TTGame.start('gravity')">
      Gravity Trix
      <span>Change Gravity with Arrows</span>
      <span id="hs-gravity" style="color:#7af;font-weight:700;">High Score: 0</span>
    </div>
    <div class="mode-btn" onclick="TTGame.start('pento')">
      Pento Master
      <span>5-Block Hardcore Mode</span>
      <span id="hs-pento" style="color:#7af;font-weight:700;">High Score: 0</span>
    </div>
    <div class="mode-btn" onclick="TTGame.start('sand')">
      Sand Tris
      <span>Satisfying Sand Physics</span>
      <span id="hs-sand" style="color:#7af;font-weight:700;">High Score: 0</span>
    </div>
  </div>
  
  <div id="game-over" class="menu-screen hidden">
    <div class="title-text" style="color:#FF4444; margin-bottom:10px;">GAME OVER</div>
    <div id="final-score" style="font-size:20px; margin-bottom:30px; font-weight:bold;">SCORE: 0</div>
    <div class="mode-btn" onclick="TTGame.retry()">RETRY</div>
    <div class="mode-btn" onclick="TTGame.menu()">MENU</div>
  </div>
  
  <div id="mobile-controls" class="layout-a">
     <div class="ctrl-grid">
        <div class="c-btn" id="btn-l">←</div>
        <div class="c-btn" id="btn-r">→</div>
        <div class="c-btn" id="btn-d">↓</div>
        <div class="c-btn rotate-btn" id="btn-a">⟳
          <div id="layout-switch">⇆</div>
        </div>
     </div>
  </div>
</div>

<script>
const TTGame = (() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const COLS = 10;
  const ROWS = 20;
  let BLOCK = 25; // Block size (updated on resize)
  let W = 400, H = 600;
  const MAX_HEIGHT_PX = 420;

  // State
  let mode = 'menu'; // menu, playing, over
  let currentLogic = null;
  let animationId = null;
  let lastTime = 0;
  let score = 0;
  let gameType = '';
  let highscores = {gravity:0, pento:0, sand:0};
  try {
    highscores = Object.assign(highscores, JSON.parse(localStorage.getItem('tt_highscores') || '{}'));
  } catch(e) {}

  // Audio Controller
  const Audio = {
    ctx: null,
    isPlaying: false,
    currentMode: null,
    timers: [],
    activeNodes: [],
    
    init() {
      if(!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if(this.ctx.state === 'suspended') this.ctx.resume();
    },
    
    tone(freq, type, dur, vol=0.1) {
       if(!this.ctx) return;
       const osc = this.ctx.createOscillator();
       const g = this.ctx.createGain();
       osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
       osc.type = type;
       g.gain.setValueAtTime(vol, this.ctx.currentTime);
       g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
       osc.connect(g);
       g.connect(this.ctx.destination);
       osc.start();
       osc.stop(this.ctx.currentTime + dur);
    },
    
    playRotate() { this.tone(400, 'triangle', 0.1, 0.1); },
    playDrop() { this.tone(200, 'sine', 0.1, 0.2); },
    playClearCombo(lines=1) { 
        const base = 500 + lines*80;
        const types = ['sine','triangle','square'];
        for(let i=0;i<Math.min(lines,4);i++){
          this.tone(base + i*120, types[i%types.length], 0.18, 0.18);
        }
    },
    playOver() { this.tone(100, 'sawtooth', 0.5, 0.3); },
    
    startBGM(mode) {
        this.stopBGM();
        this.isPlaying = true;
        this.currentMode = mode;
        this.bgmLoop();
    },
    
    stopBGM() {
        this.isPlaying = false;
        this.currentMode = null;
        this.timers.forEach(id => clearTimeout(id));
        this.timers = [];
        // stop all active oscillators immediately
        this.activeNodes.forEach(node => {
          try { node.stop(); } catch(e){}
        });
        this.activeNodes = [];
    },
    
    bgmLoop() {
        if(!this.isPlaying || !this.ctx) return;
        const t0 = this.ctx.currentTime;
        const mode = this.currentMode || 'gravity';
        // ロシア民謡調の4小節バリエーション
        const barG1 = [330,392,440,494,440,392,330,294];
        const barG2 = [330,392,440,523,494,440,392,330];
        const barG3 = [392,440,494,523,587,523,494,440];
        const barG4 = [440,494,523,587,523,494,440,392];
        const barP1 = [294,330,392,440,392,330,294,262];
        const barP2 = [294,330,392,440,494,440,392,330];
        const barP3 = [330,392,440,494,523,494,440,392];
        const barP4 = [392,440,494,523,587,523,494,440];
        const barS1 = [262,294,330,349,392,349,330,294];
        const barS2 = [294,330,349,392,440,392,349,330];
        const barS3 = [330,349,392,440,494,440,392,349];
        const barS4 = [349,392,440,494,523,494,440,392];
        const tracks = {
          gravity: {freqs:[...barG1, ...barG2, ...barG3, ...barG4], type:'square', interval:260},
          pento:   {freqs:[...barP1, ...barP2, ...barP3, ...barP4], type:'triangle', interval:270},
          sand:    {freqs:[...barS1, ...barS2, ...barS3, ...barS4], type:'sine', interval:275}
        };
        const tr = tracks[mode] || tracks.gravity;
        tr.freqs.forEach((f,i)=>{
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = tr.type;
          const start = t0 + i * (tr.interval/1000);
          const dur = tr.interval/1000 * 0.8;
          o.frequency.setValueAtTime(f, start);
          g.gain.setValueAtTime(0.03, start);
          g.gain.exponentialRampToValueAtTime(0.002, start + dur);
          o.connect(g); g.connect(this.ctx.destination);
          o.start(start); 
          const stopAt = start + dur;
          o.stop(stopAt);
          this.activeNodes.push(o);
          const cleanId = setTimeout(()=>{
            this.activeNodes = this.activeNodes.filter(n=>n!==o);
          }, (stopAt - this.ctx.currentTime)*1000 + 20);
          this.timers.push(cleanId);
        });
        const loopMs = tr.interval * tr.freqs.length;
        const id = setTimeout(() => this.bgmLoop(), loopMs);
        this.timers.push(id);
    }
  };

  // Inputs
  const keys = {ArrowUp:false, ArrowDown:false, ArrowLeft:false, ArrowRight:false, Space:false, KeyZ:false, KeyX:false, KeyR:false};

  // Tetrominoes
  const SHAPES = {
    I: [[1,1,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]],
    O: [[1,1],[1,1]],
    S: [[0,1,1],[1,1,0]],
    T: [[0,1,0],[1,1,1]],
    Z: [[1,1,0],[0,1,1]]
  };
  const PENTOMINOES = {
    I: [[1,1,1,1,1]],
    L: [[1,0,0,0],[1,1,1,1]],
    P: [[1,1],[1,1],[1,0]],
    R: [[0,1,1],[1,1,0],[0,1,0]],
    S: [[0,1,1,0],[0,0,1,1]], // 4-wide s? actually pento S is weird. using standard naming
    T: [[1,1,1],[0,1,0],[0,1,0]],
    U: [[1,0,1],[1,1,1]],
    V: [[1,0,0],[1,0,0],[1,1,1]],
    W: [[1,0,0],[1,1,0],[0,1,1]],
    X: [[0,1,0],[1,1,1],[0,1,0]],
    Y: [[0,0,1,0],[1,1,1,1]], 
    Z: [[1,1,0],[0,1,0],[0,1,1]]
  };
  
  const COLORS = [
    null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF', '#FF3838', '#FFD166', '#9938FF', '#ffffff'
  ];
  const BOMB_VALUE = 11;

  /* ----------------------------------------------------------------
     Base Logic Class
  ---------------------------------------------------------------- */
  class BaseGame {
    constructor() {
      this.grid = this.createGrid(COLS, ROWS);
      this.piece = null;
      this.score = 0;
      this.gameOver = false;
      this.particles = []; // {x,y,vx,vy,life,color}
      this.dropCounter = 0;
      this.dropInterval = 1000;
    }
    
    createGrid(w, h) {
      return Array.from({length: h}, () => Array(w).fill(0));
    }
    
    start() {
        this.spawnPiece();
    }
    
    // Core Update Loop
    update(dt) {
       // Override
    }
    
    draw(ctx) {
       // Override
    }
    
    spawnPiece() {
        // Override
    }
    
    collide(arena, piece) {
        const m = piece.matrix;
        const o = piece.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    rotate(matrix, dir) {
        const h = matrix.length;
        const w = matrix[0].length;
        // build transposed matrix
        const rotated = Array.from({length: w}, (_, x) =>
          Array.from({length: h}, (_, y) => matrix[h - 1 - y][x])
        );
        if (dir < 0) {
          // reverse for counter-clockwise
          rotated.reverse();
          rotated.forEach(row => row.reverse());
        }
        matrix.length = 0;
        rotated.forEach(row => matrix.push(row));
    }
    
    playerReset() {
        this.spawnPiece();
        this.score = 0;
        this.grid.forEach(row => row.fill(0));
        this.dropCounter = 0;
    }
    
    spawnClearEffect(lines=1) {
        const count = Math.min(80, 20 * lines);
        for(let i=0;i<count;i++){
            this.particles.push({
                x: Math.random()*COLS,
                y: Math.random()*ROWS,
                vx: (Math.random()-0.5)*0.6,
                vy: -Math.random()*0.6,
                life: 500 + Math.random()*600 + lines*80,
                color: `hsla(${Math.floor(Math.random()*60)+40}, 90%, 65%, 0.9)`
            });
        }
    }
    
    updateParticles(dt){
        this.particles.forEach(p => {
            p.x += p.vx * (dt/16);
            p.y += p.vy * (dt/16);
            p.vy += 0.012 * (dt/16);
            p.life -= dt;
        });
        this.particles = this.particles.filter(p => p.life > 0);
    }
    
    drawParticles(ctx, offsetX=0, offsetY=0){
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(offsetX + p.x*BLOCK, offsetY + p.y*BLOCK, BLOCK*0.2, BLOCK*0.2);
        });
    }
  }

  /* ----------------------------------------------------------------
     Mode 1: Gravity Trix
  ---------------------------------------------------------------- */
  class GravityGame extends BaseGame {
      constructor() {
          super();
          this.gravity = {x:0, y:1};
          this.nextGravity = {x:0, y:1};
          this.canChangeGravity = true;
          this.colorIndex = 1;
          this.gravityCooldown = 0; // ms after spawn during which gravity change is locked
      }
      
      createGrid(w, h) {
          // Extra padding for safety
          return Array.from({length: ROWS}, () => Array(COLS).fill(0));
      }

      spawnPiece() {
          const keys = Object.keys(SHAPES);
          const type = keys[Math.floor(Math.random() * keys.length)];
          const matrix = SHAPES[type].map(row => [...row]); // copy
          // Color
          const color = (this.colorIndex++ % 7) + 1;
          matrix.forEach((r,y) => r.forEach((v,x) => { if(v) r[x] = color; }));
          
          this.piece = {
              matrix: matrix,
              pos: {x: (COLS/2 | 0) - (matrix[0].length/2 | 0), y: 0}
          };
          
          // Reset gravity to Down on each spawn for clarity
          this.gravity = {x:0, y:1};
          this.nextGravity = {x:0, y:1};
          this.gravityCooldown = 350; // lock gravity input for ~0.35s
          this.recenterPiece();
          
          if(this.collide(this.grid, this.piece)) {
              this.gameOver = true;
          }
      }
      
      recenterPiece() {
          // ensure piece spawns roughly inside
          const p = this.piece.pos;
          if(p.x < 0) p.x = 0;
          if(p.x > COLS-3) p.x = COLS-3;
          if(p.y < 0) p.y = 0;
          if(p.y > ROWS-3) p.y = ROWS-3;
      }

      update(dt) {
          // Gravity lock window after spawn to prevent residual inputs
          if(this.gravityCooldown > 0) {
              this.gravityCooldown -= dt;
              this.gravity = {x:0, y:1};
              this.nextGravity = {x:0, y:1};
          } else {
              // Gravity Inputs (no upward gravity)
              if(keys.ArrowDown) this.nextGravity = {x:0, y:1};
              else if(keys.ArrowLeft) this.nextGravity = {x:-1, y:0};
              else if(keys.ArrowRight) this.nextGravity = {x:1, y:0};
              this.gravity = this.nextGravity;
          }

          this.gravity = this.nextGravity;

          this.dropCounter += dt;
          
          // Soft Drop (加速は重力が上下のときのみ有効)
          // 横重力中は左右移動で誤加速しないようにする
          let currentInterval = this.dropInterval;
          const g = this.gravity;
          if (g.y !== 0 && (
              (g.y > 0 && keys.ArrowDown) ||
              (g.y < 0 && keys.ArrowUp))) {
             currentInterval = 50; 
          }
          
          if (this.dropCounter > currentInterval) {
              this.drop();
          }
      }
      
      input(action) {
          if(!this.piece) return;
          // Contextual Movement: perpendicular to gravity
          let dx = 0, dy = 0;
          const g = this.gravity;
          
          // "Move" inputs (WASD mapped to mapped Logic)
          // Simplified: Regular Arrow keys control GRAVITY (as per prompt)
          // How to MOVE piece? Let's use WASD or a modifier?
          // Wait, user on mobile has on-screen buttons.
          // Let's use specific mappings. 
          // Arrows => Gravity.  WASD => Move.
          // But I only have mapped Arrows globally.
          // Let's change: Arrows = Move Piece. Z/X = Rotate.
          // Special Keys (IJKL?) or UI for Gravity?
          // Prompt: "Arrow keys change gravity...".
          // If arrows change gravity, then piece falls that way.
          // But we need to position the piece to fill holes.
          // Let's assume piece follows gravity, and we can nudge it perpendicular.
          // 画面基準で左右に動かす（重力方向に依存しない）
          if (action === 'move_ortho_1') { // Left
              dx = -1;
          }
          if (action === 'move_ortho_2') { // Right
              dx = 1;
          }
          
          if(dx!==0 || dy!==0) {
              this.piece.pos.x += dx;
              this.piece.pos.y += dy;
              if (this.collide(this.grid, this.piece)) {
                  this.piece.pos.x -= dx;
                  this.piece.pos.y -= dy;
              }
          }
          
          if (action === 'rotate') {
              this.rotate(this.piece.matrix, 1);
              if (this.collide(this.grid, this.piece)) {
                  this.rotate(this.piece.matrix, -1);
              } else {
                  Audio.playRotate();
              }
          }
      }
      
      drop() {
          if(!this.piece) return;
          this.piece.pos.x += this.gravity.x;
          this.piece.pos.y += this.gravity.y;
          
          if (this.collide(this.grid, this.piece)) {
              this.piece.pos.x -= this.gravity.x;
              this.piece.pos.y -= this.gravity.y;
              this.merge();
              Audio.playDrop();
              this.arenaSweep();
              this.spawnPiece();
              this.dropCounter = 0;
          } else {
              this.dropCounter = 0;
          }
      }
      
      merge() {
          this.piece.matrix.forEach((row, y) => {
              row.forEach((value, x) => {
                  if (value !== 0) {
                      // Boundary check
                      const py = y + this.piece.pos.y;
                      const px = x + this.piece.pos.x;
                      if(this.grid[py] && this.grid[py][px] !== undefined) {
                          this.grid[py][px] = value;
                      }
                  }
              });
          });
      }
      
      arenaSweep() {
          let scoreAdd = 0;
          let cleared = 0;
          
          outer: for (let y = this.grid.length - 1; y > 0; --y) {
              for (let x = 0; x < this.grid[y].length; ++x) {
                  if (this.grid[y][x] === 0) continue outer;
              }
              const row = this.grid.splice(y, 1)[0].fill(0);
              this.grid.splice(y, 0, row); 
              scoreAdd += 10;
              cleared += 1;
          }
          if(cleared > 0) {
            Audio.playClearCombo(cleared);
            this.spawnClearEffect(cleared);
          }
          this.score += scoreAdd;
      }
      
      // Custom draw with Gravity Indicator
      draw(ctx) {
          drawMatrix(ctx, this.grid, {x:0, y:0});
          if(this.piece) drawMatrix(ctx, this.piece.matrix, this.piece.pos);
          
          // UI Gravity
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.font = '20px Arial';
          let gText = "↓";
          if(this.gravity.y < 0) gText = "↑";
          if(this.gravity.x < 0) gText = "←";
          if(this.gravity.x > 0) gText = "→";
          ctx.fillText("G: " + gText, 10, 30);
      }
  }

  /* ----------------------------------------------------------------
     Mode 2: Pento Master
  ---------------------------------------------------------------- */
  class PentoGame extends BaseGame {
       constructor() {
          super();
          this.colorIndex = 1;
       }
       spawnPiece() {
           const keys = Object.keys(PENTOMINOES);
           const type = keys[Math.floor(Math.random() * keys.length)];
           const matrix = PENTOMINOES[type].map(row => [...row]);
           const color = (this.colorIndex++ % 7) + 1;
           matrix.forEach((r,y) => r.forEach((v,x) => { if(v) r[x] = color; }));
           
           this.piece = {
               matrix: matrix,
               pos: {x: (COLS/2 | 0) - (matrix[0].length/2 | 0), y: 0}
           };
           
           if(this.collide(this.grid, this.piece)) {
               this.gameOver = true;
           }
       }
       
       update(dt) {
           this.dropCounter += dt;
           
           let interval = this.dropInterval;
           if(keys.ArrowDown) interval = 50;
           
           if (this.dropCounter > interval) {
               this.drop();
           }
       }
       
       input(action) {
           if(!this.piece) return;
           if(action === 'move_left') this.move(-1);
           if(action === 'move_right') this.move(1);
           if(action === 'rotate') this.playerRotate(1);
           if(action === 'drop') this.drop();
       }
       
       move(dir) {
           this.piece.pos.x += dir;
           if(this.collide(this.grid, this.piece)) {
               this.piece.pos.x -= dir;
           }
       }
       
       playerRotate(dir) {
           const pos = this.piece.pos.x;
           this.rotate(this.piece.matrix, dir);
           const kicks = [0, 1, -1, 2, -2];
           let success = false;
           for(const k of kicks) {
               this.piece.pos.x = pos + k;
               if(!this.collide(this.grid, this.piece)) { success = true; break; }
           }
           if(!success) {
               this.rotate(this.piece.matrix, -dir);
               this.piece.pos.x = pos;
           } else {
               Audio.playRotate();
           }
       }
       
       drop() {
           this.piece.pos.y++;
           if (this.collide(this.grid, this.piece)) {
               this.piece.pos.y--;
               this.merge();
               Audio.playDrop();
               this.arenaSweep();
               this.spawnPiece();
               this.dropCounter = 0;
           } else {
               this.dropCounter = 0;
           }
       }
       
       merge() {
           this.piece.matrix.forEach((row, y) => {
               row.forEach((value, x) => {
                   if (value !== 0) this.grid[y + this.piece.pos.y][x + this.piece.pos.x] = value;
               });
           });
       }
       
       arenaSweep() {
           let rowCount = 1;
           let cleared = 0;
           outer: for (let y = this.grid.length - 1; y > 0; --y) {
               for (let x = 0; x < this.grid[y].length; ++x) {
                   if (this.grid[y][x] === 0) continue outer;
               }
               const row = this.grid.splice(y, 1)[0].fill(0);
               this.grid.unshift(row);
               ++y;
               this.score += rowCount * 10;
               cleared += 1;
               rowCount *= 2;
           }
           if(cleared>0){
             Audio.playClearCombo(cleared);
             this.spawnClearEffect(cleared);
           }
       }
       
       draw(ctx) {
           drawMatrix(ctx, this.grid, {x:0, y:0});
           if(this.piece) drawMatrix(ctx, this.piece.matrix, this.piece.pos);
       }
  }

  /* ----------------------------------------------------------------
     Mode 3: Sand Tris
  ---------------------------------------------------------------- */
  class SandGame extends PentoGame { // Inherit basic move/drop from Pento (rename internal logic later if needed)
      constructor() {
          super();
          // Use normal shapes for sand logic
          this.SHAPES = SHAPES; 
          this.settleSteps = 4;
          this.palette = [1,2,3]; // 3 colors
          this.bombChance = 0.15;
          this.pendingBombs = []; // bombs to trigger on rotate
      }

      isBombPiece(piece=this.piece){
          return piece && piece.matrix.length===1 && piece.matrix[0].length===1 && piece.matrix[0][0]===BOMB_VALUE;
      }
      
      spawnPiece() {
           // 15%でボムを落とす
           if(Math.random() < this.bombChance) {
              this.piece = { matrix: [[BOMB_VALUE]], pos: {x: COLS/2|0, y:0} };
              return;
           }
           const keys = Object.keys(SHAPES);
           const type = keys[Math.floor(Math.random() * keys.length)];
           const matrix = SHAPES[type].map(row => [...row]);
           const color = this.palette[Math.floor(Math.random()*this.palette.length)];
           matrix.forEach((r,y) => r.forEach((v,x) => { if(v) r[x] = color; }));
           
           this.piece = {
               matrix: matrix,
               pos: {x: (COLS/2 | 0) - (matrix[0].length/2 | 0), y: 0}
           };
           
           if(this.collide(this.grid, this.piece)) {
               this.gameOver = true;
           }
      }
      
      // Add Sand Physics in Update
      update(dt) {
          super.update(dt);
          for(let i=0;i<this.settleSteps;i++) this.updateSand();
          this.arenaSweep(); // rows may完成 after砂が落ちてから
      }
      
      merge() {
          const placedBombs = [];
          this.piece.matrix.forEach((row, y) => {
              row.forEach((value, x) => {
                  if (value !== 0) {
                      const gy = y + this.piece.pos.y;
                      const gx = x + this.piece.pos.x;
                      if(this.grid[gy] && this.grid[gy][gx] !== undefined) {
                          this.grid[gy][gx] = value; 
                          if(value === BOMB_VALUE) placedBombs.push({x:gx,y:gy});
                      }
                  }
              });
          });
          // 爆発処理
          placedBombs.forEach(b=>{
              for(let dy=-1; dy<=1; dy++){
                  for(let dx=-1; dx<=1; dx++){
                      const ny = b.y + dy, nx = b.x + dx;
                      if(ny>=0 && ny<ROWS && nx>=0 && nx<COLS){
                          this.grid[ny][nx] = 0;
                      }
                  }
              }
              Audio.playClearCombo(2);
              this.spawnClearEffect(2);
          });
      }
      
      updateSand() {
          // Simple falling-sand: straight down only
          for(let y = ROWS-2; y >= 0; y--) {
              for(let x = 0; x < COLS; x++) {
                  const v = this.grid[y][x];
                  if(v === 0) continue;
                  if(v === BOMB_VALUE) continue; // bombs handled in drop()
                  if(this.grid[y+1][x] === 0) {
                      this.grid[y+1][x] = v; this.grid[y][x] = 0; continue;
                  }
              }
          }
      }

      explodeBomb(x,y){
          for(let dy=-1; dy<=1; dy++){
              for(let dx=-1; dx<=1; dx++){
                  const ny = y + dy, nx = x + dx;
                  if(ny>=0 && ny<ROWS && nx>=0 && nx<COLS){
                      this.grid[ny][nx] = 0;
                  }
              }
          }
          Audio.playClearCombo(2);
          this.spawnClearEffect(2);
      }

      settleAll(iter=ROWS*2){
          for(let i=0;i<iter;i++) this.updateSand();
      }

      collide(arena, piece){
          if(this.isBombPiece(piece)) return false; // bombs ignore collisions
          return BaseGame.prototype.collide.call(this, arena, piece);
      }

      drop() {
          if(this.isBombPiece()){
              this.piece.pos.y += 1;
              if(this.piece.pos.y >= ROWS-1){
                  this.piece.pos.y = ROWS-1;
                  this.merge();
                  this.explodeBomb(this.piece.pos.x, this.piece.pos.y);
                  this.settleAll();
                  this.arenaSweep();
                  this.spawnPiece();
              }
              this.dropCounter = 0; // reset so落下速度は通常と同じ
              return;
          }
          // default behavior for normal pieces
          super.drop();
      }

      input(action){
          if(!this.piece) return;
          if(action === 'rotate'){
              // if current piece is bomb, trigger explosion at current pos
              if(this.isBombPiece()){
                 const gx = this.piece.pos.x;
                 const gy = this.piece.pos.y;
                 // place bomb then explode
                 this.merge();
                 this.explodeBomb(gx,gy);
                 this.settleAll();
                 this.arenaSweep();
                 this.spawnPiece();
                 return;
              }
          }
          // fallback to parent behavior
          super.input(action);
      }
      
      // Override sweep for Sand rules: Full row of any color?
      arenaSweep() {
           // Clear only rows that are full AND single-color
           let cleared = 0;
           for(let y = 0; y < ROWS; y++) {
               const first = this.grid[y][0];
               if(first === 0) continue;
               let sameColor = true;
               for(let x = 1; x < COLS; x++) {
                   if(this.grid[y][x] !== first) { sameColor = false; break; }
               }
               if(sameColor) {
                   // Clear line
                   this.grid[y].fill(0);
                   cleared++;
                   this.score += 100;
               }
           }
           if(cleared>0){
              Audio.playClearCombo(cleared);
              this.spawnClearEffect(cleared);
           }
           // No need to unshift rows, sand physics will collapse everything
      }
  }

  /* ----------------------------------------------------------------
     Render Helpers
  ---------------------------------------------------------------- */
  function drawRoundedBlock(ctx, x, y, size, color){
      const r = Math.min(size * 0.35, size/2 - 1);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + size - r, y);
      ctx.quadraticCurveTo(x + size, y, x + size, y + r);
      ctx.lineTo(x + size, y + size - r);
      ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
      ctx.lineTo(x + r, y + size);
      ctx.quadraticCurveTo(x, y + size, x, y + size - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
      // subtle top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(x + 2, y + 2, size - 4, Math.max(3, size * 0.14));
  }

  function drawMatrix(ctx, matrix, offset) {
      matrix.forEach((row, y) => {
          row.forEach((value, x) => {
              if (value !== 0) {
                  const cx = (x + offset.x) * BLOCK;
                  const cy = (y + offset.y) * BLOCK;
                  const color = COLORS[value % COLORS.length] || '#fff';
                  const useRounded = (gameType === 'sand' && value !== BOMB_VALUE);
                  if(useRounded){
                      drawRoundedBlock(ctx, cx+0.5, cy+0.5, BLOCK-1, color);
                  } else {
                      ctx.fillStyle = color;
                      ctx.fillRect(cx, cy, BLOCK-1, BLOCK-1);
                      // Bevel
                      ctx.fillStyle = 'rgba(255,255,255,0.3)';
                      ctx.fillRect(cx, cy, BLOCK-1, 4);
                      ctx.fillRect(cx, cy, 4, BLOCK-1);
                  }
              }
          });
      });
  }

  /* ----------------------------------------------------------------
     Main Game Controller
  ---------------------------------------------------------------- */
  function start(modeType) {
      mode = 'playing';
      gameType = modeType;
      document.getElementById('main-menu').classList.add('hidden');
      document.getElementById('game-over').classList.add('hidden');
      document.getElementById('game-hud').classList.remove('hidden');
      document.getElementById('mobile-controls').style.display = isMobile() ? 'block' : 'none';
      
      score = 0;
      
      Audio.stopBGM();
      Audio.init();
      Audio.startBGM(modeType);
      
      if(modeType === 'gravity') currentLogic = new GravityGame();
      else if(modeType === 'pento') currentLogic = new PentoGame();
      else currentLogic = new SandGame();
      
      currentLogic.start();
      
      if(!animationId) update();
  }
  
  function menu() {
      mode = 'menu';
      document.getElementById('main-menu').classList.remove('hidden');
      document.getElementById('game-over').classList.add('hidden');
      document.getElementById('game-hud').classList.add('hidden');
      document.getElementById('mobile-controls').style.display = 'none';
      Audio.stopBGM();
      currentLogic = null;
      updateHighscoreUI();
  }
  
  function retry() {
      start(gameType);
  }
  
  function gameOver() {
      mode = 'over';
      document.getElementById('game-over').classList.remove('hidden');
      document.getElementById('final-score').textContent = "SCORE: " + score;
      document.getElementById('mobile-controls').style.display = 'none';
      Audio.stopBGM();
      if(score > (highscores[gameType] || 0)) {
         highscores[gameType] = score;
         localStorage.setItem('tt_highscores', JSON.stringify(highscores));
      }
      updateHighscoreUI();
  }
  
  function update(time = 0) {
      const dt = time - lastTime;
      lastTime = time;
      
      if(mode === 'playing' && currentLogic) {
          currentLogic.update(dt);
          currentLogic.updateParticles(dt);
          score = currentLogic.score;
          document.querySelector('.game-stats').textContent = `Score: ${score}`;
          
          if(currentLogic.gameOver) {
              gameOver();
          }
      }
      
      draw();
      animationId = requestAnimationFrame(update);
  }
  
  function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0,0,W,H);
      
      if(mode === 'playing' && currentLogic) {
          // Center canvas content roughly
          ctx.save();
          // The grid is 10x20. BLOCK=25 -> 250x500.
          // Canvas is 400x600.
          const offsetX = (W - COLS*BLOCK)/2;
          const offsetY = (H - ROWS*BLOCK)/2;
          
          ctx.translate(offsetX, offsetY);
          
          // Border
          ctx.strokeStyle = '#333';
          ctx.strokeRect(0,0, COLS*BLOCK, ROWS*BLOCK);
          
          // Bg grid
          ctx.strokeStyle = '#111';
          ctx.beginPath();
          for(let i=0; i<=COLS; i++) { ctx.moveTo(i*BLOCK,0); ctx.lineTo(i*BLOCK, ROWS*BLOCK); }
          for(let i=0; i<=ROWS; i++) { ctx.moveTo(0, i*BLOCK); ctx.lineTo(COLS*BLOCK, i*BLOCK); }
          ctx.stroke();
          
          currentLogic.draw(ctx);
          currentLogic.drawParticles(ctx, offsetX, offsetY);
          
          ctx.restore();
      }
  }
  
  /* ----------------------------------------------------------------
     Input Handling
  ---------------------------------------------------------------- */
  window.addEventListener('keydown', e => {
      if(keys[e.code] !== undefined) keys[e.code] = true;
      let consumed = false;
      if(mode === 'playing' && currentLogic) {
        // Common inputs
        if(e.code === 'KeyZ' || e.code === 'ControlLeft') { currentLogic.input('rotate'); consumed = true; }
        if(e.code === 'Space') { currentLogic.input('drop'); consumed = true; } // Hard drop
        
        // Mode specific mapping
        if(gameType === 'gravity') {
            // 左右キーでも一歩移動できるようにする（Gravity変更と同居させる）
            if(e.code === 'KeyA' || e.code === 'ArrowLeft') { currentLogic.input('move_ortho_1'); consumed = true; }
            if(e.code === 'KeyD' || e.code === 'ArrowRight') { currentLogic.input('move_ortho_2'); consumed = true; }
        } else {
            if(e.code === 'ArrowLeft' || e.code === 'KeyA') { currentLogic.input('move_left'); consumed = true; }
            if(e.code === 'ArrowRight' || e.code === 'KeyD') { currentLogic.input('move_right'); consumed = true; }
            if(e.code === 'ArrowDown' || e.code === 'KeyS') { currentLogic.input('drop'); consumed = true; }
            if(e.code === 'ArrowUp' || e.code === 'KeyW') { currentLogic.input('rotate'); consumed = true; }
        }
      }
      // Prevent page scroll when using game keys
      const preventList = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyW','KeyA','KeyS','KeyD'];
      if(consumed || preventList.includes(e.code)) {
        e.preventDefault();
      }
  });
  
  window.addEventListener('keyup', e => {
      if(keys[e.code] !== undefined) keys[e.code] = false;
  });
  
  // Click/Tap to rotate
  canvas.addEventListener('click', e => {
      if(mode === 'playing' && currentLogic) {
          currentLogic.input('rotate');
      }
  });
  
  // Mobile touch with holding support
  function setupTouch(id, codes) {
      const el = document.getElementById(id);
      if(!el) return;
      el.addEventListener('touchstart', (e) => { 
          e.preventDefault(); 
          codes.forEach(code => {
            if(code === 'rotate') {
              if(currentLogic) currentLogic.input('rotate');
            } else {
              if(currentLogic) {
                if(gameType === 'gravity') {
                  // Gravityモード: 重力変更も許可しつつ、横移動を即時実行
                  keys[code] = true; // 重力方向の更新に利用
                  if(code === 'ArrowLeft' || code === 'KeyA') currentLogic.input('move_ortho_1');
                  if(code === 'ArrowRight' || code === 'KeyD') currentLogic.input('move_ortho_2');
                  if(code === 'ArrowDown' || code === 'KeyS') currentLogic.input('drop');
                } else {
                  keys[code] = true;
                  if(code === 'ArrowLeft' || code === 'KeyA') currentLogic.input('move_left');
                  if(code === 'ArrowRight' || code === 'KeyD') currentLogic.input('move_right');
                  if(code === 'ArrowDown' || code === 'KeyS') currentLogic.input('drop');
                }
              }
            }
          });
      });
      el.addEventListener('touchend', (e) => { 
          e.preventDefault(); 
          codes.forEach(code => {
            if(code !== 'rotate') keys[code] = false;
          });
      });
  }
  
  // Mappings
  // D-pad maps to single logical keys to防止ダブル入力 on mobile
  setupTouch('btn-l', ['ArrowLeft']);
  setupTouch('btn-r', ['ArrowRight']);
  setupTouch('btn-d', ['ArrowDown']);
  setupTouch('btn-a', ['rotate']); // rotate only
  
  // Move mobile controls below the canvas to avoid overlap
  const mobileControls = document.getElementById('mobile-controls');
  if(mobileControls && canvas.parentElement) {
    canvas.parentElement.insertAdjacentElement('afterend', mobileControls);
  }

  // Layout switcher for mobile controls (3 patterns)
  const layouts = ['layout-a','layout-b','layout-c'];
  let layoutIndex = 0; // default layout-a (L D R A)
  const layoutSwitch = document.getElementById('layout-switch');
  function applyLayout(idx){
      layoutIndex = (idx + layouts.length) % layouts.length;
      mobileControls.classList.remove(...layouts);
      mobileControls.classList.add(layouts[layoutIndex]);
  }
  if(layoutSwitch){
      const handleToggle = (e) => { 
          if(e) { e.preventDefault(); e.stopPropagation(); }
          applyLayout(layoutIndex+1); 
      };
      layoutSwitch.addEventListener('click', handleToggle);
      layoutSwitch.addEventListener('touchstart', handleToggle);
  }
  applyLayout(layoutIndex);
  
  // Resize handling for responsive canvas & crisp rendering
  function resizeCanvas() {
      const wrap = canvas.parentElement;
      const width = wrap.clientWidth;
      const deviceRatio = window.devicePixelRatio || 1;
      // limit height for mobile: choose smaller block size if height would exceed MAX_HEIGHT_PX
      BLOCK = Math.floor(Math.min(width / COLS, MAX_HEIGHT_PX / ROWS));
      const pixelW = COLS * BLOCK;
      const pixelH = ROWS * BLOCK;
      canvas.width = pixelW * deviceRatio;
      canvas.height = pixelH * deviceRatio;
      canvas.style.width = pixelW + 'px';
      canvas.style.height = pixelH + 'px';
      ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
      W = pixelW;
      H = pixelH;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function updateHighscoreUI() {
      const g = document.getElementById('hs-gravity');
      const p = document.getElementById('hs-pento');
      const s = document.getElementById('hs-sand');
      if(g) g.textContent = `High Score: ${highscores.gravity||0}`;
      if(p) p.textContent = `High Score: ${highscores.pento||0}`;
      if(s) s.textContent = `High Score: ${highscores.sand||0}`;
  }
  updateHighscoreUI();

  return { start, menu, retry };
})();
</script>

## 実装のポイント
- **3-in-1 Engine**: `BaseGame`を継承し、可変重力の`GravityGame`、ペントミノ専用の`PentoGame`、砂挙動とボムを持つ`SandGame`を切替実装。
- **Gravity Reset & Lock**: 新ピース出現時は重力を必ず下に戻し、約0.35秒は重力変更入力をロックして誤作動を防止。
- **Sand Logic**: 3色ランダムの砂ブロックが直下に崩れるだけのシンプル挙動。同色で埋まった行だけ消去し、時折落ちるボムが着地時に周囲8マスを爆破して道を開く。
- **FX & Audio**: ライン消去数に応じてスパークの粒子量と効果音を強化。モードごとのBGMをループ再生し、再スタート時は重複しないよう制御。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
