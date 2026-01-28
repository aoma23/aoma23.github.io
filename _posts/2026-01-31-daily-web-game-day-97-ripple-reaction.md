---
title: "毎日ゲームチャレンジ Day 97: Ripple Reaction (リップル・リアクション)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

97日目は「Ripple Reaction」。
波紋を広げて連鎖反応を起こすパズルアクションです。
たった一回のクリックから、画面いっぱいの光の連鎖を作り出しましょう。
<!--more-->

<style>
@import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;700&display=swap');

#ripple-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  border-radius: 12px;
  background: #001;
  box-shadow: 0 10px 30px rgba(0,0,50,0.5);
  font-family: 'Josefin Sans', sans-serif;
  position: relative;
  overflow: hidden;
  color: #fff;
  user-select: none;
  border: 1px solid #224;
}

#ripple-canvas {
  width: 100%;
  height: 400px;
  display: block;
  cursor: crosshair;
}

.rr-ui {
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

.rr-level-info {
  font-size: 1.2rem;
  color: #aaf;
}

.rr-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,10,0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  transition: opacity 0.5s;
}
.rr-overlay.hidden {
    opacity: 0;
    pointer-events: none;
}

.rr-btn {
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 10px 40px;
  font-size: 1.2rem;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 20px;
  font-family: inherit;
  transition: all 0.3s;
}
.rr-btn:hover {
    background: #fff;
    color: #000;
    box-shadow: 0 0 20px #fff;
}

</style>

<div id="ripple-game">
    <canvas id="ripple-canvas" width="400" height="400"></canvas>
    
    <div class="rr-ui">
        <div>LVL: <span id="rr-lvl">1</span></div>
        <div>TARGET: <span id="rr-req">5</span></div>
        <div>CLEARED: <span id="rr-curr">0</span></div>
    </div>
    
    <div id="rr-msg" class="rr-overlay">
        <h1 style="font-size: 2.5rem; margin-bottom: 10px; text-shadow: 0 0 10px #0af;">RIPPLE</h1>
        <p>CLICK TO START CHAIN REACTION</p>
        <button class="rr-btn" onclick="RippleR.start()">START</button>
    </div>
</div>

<script>
const RippleR = (() => {
    const canvas = document.getElementById('ripple-canvas');
    const ctx = canvas.getContext('2d');
    const msgEl = document.getElementById('rr-msg');
    
    const uiLvl = document.getElementById('rr-lvl');
    const uiReq = document.getElementById('rr-req');
    const uiCurr = document.getElementById('rr-curr');
    
    let particles = [];
    let ripples = [];
    let state = 'start'; // start, playing, result
    let level = 1;
    let clearedCount = 0;
    let required = 5;
    let hasClicked = false;
    
    // Audio
    const Audio = {
        ctx: null,
        init() {
            if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if(this.ctx.state === 'suspended') this.ctx.resume();
        },
        playPop(pitch) {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            
            // Pentatonic scaleish
            const freq = 200 + (pitch % 10) * 50;
            
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq + 100, t + 0.1);
            
            g.gain.setValueAtTime(0.1, t);
            g.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t + 0.3);
        },
        playWin() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.setValueAtTime(880, t+0.2);
            g.gain.setValueAtTime(0.1, t);
            g.gain.linearRampToValueAtTime(0, t+1.0);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+1.0);
        }
    };
    
    function init() {
        canvas.addEventListener('click', onClick);
        loop();
    }
    
    function start() {
        level = 1;
        setupLevel();
        msgEl.classList.add('hidden');
    }
    
    function setupLevel() {
        state = 'playing';
        hasClicked = false;
        clearedCount = 0;
        
        const pCount = 20 + level * 5;
        required = Math.floor(pCount * 0.4); // 40% clear rate needed
        
        uiLvl.textContent = level;
        uiReq.textContent = required;
        uiCurr.textContent = 0;
        
        particles = [];
        ripples = [];
        
        for(let i=0; i<pCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random()-0.5) * 2,
                vy: (Math.random()-0.5) * 2,
                color: `hsl(${Math.random()*360}, 80%, 70%)`
            });
        }
    }
    
    function onClick(e) {
        if(state !== 'playing' || hasClicked) return;
        
        Audio.init();
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        createRipple(x, y);
        hasClicked = true;
    }
    
    function createRipple(x, y) {
        ripples.push({
            x, y,
            r: 0,
            maxR: 40,
            life: 1.0, // 1.0 to 0
            growing: true
        });
        Audio.playPop(clearedCount);
    }
    
    function loop() {
        ctx.fillStyle = '#001';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        
        if(state === 'playing') {
            update();
        }
        
        draw();
        
        requestAnimationFrame(loop);
    }
    
    function update() {
        // Move particles
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if(p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if(p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });
        
        // Update Ripples
        let activeRipples = false;
        for(let i=ripples.length-1; i>=0; i--) {
            let r = ripples[i];
            activeRipples = true;
            
            if(r.growing) {
                r.r += 0.5;
                if(r.r >= r.maxR) r.growing = false;
            } else {
                r.life -= 0.01;
                if(r.life <= 0) {
                    ripples.splice(i, 1);
                    continue;
                }
            }
            
            // Check collisions with particles
            for(let j=particles.length-1; j>=0; j--) {
                let p = particles[j];
                const dx = p.x - r.x;
                const dy = p.y - r.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if(dist < r.r) {
                    // Hit!
                    createRipple(p.x, p.y);
                    particles.splice(j, 1);
                    clearedCount++;
                    uiCurr.textContent = clearedCount;
                }
            }
        }
        
        // Check end condition
        if(hasClicked && !activeRipples) {
            // End of chain
            if(clearedCount >= required) {
                // Next level
                state = 'result';
                Audio.playWin();
                setTimeout(() => {
                    level++;
                    setupLevel();
                }, 1500);
            } else {
                // Failed
                state = 'result';
                msgEl.innerHTML = '<h2 style="color:#f55">GAME OVER</h2><p>Chain Failed</p><button class="rr-btn" onclick="RippleR.start()">RETRY</button>';
                msgEl.classList.remove('hidden');
                try { localStorage.setItem('aomagame:played:ripple-reaction', '1'); } catch(e){}
            }
        }
    }
    
    function draw() {
        ctx.lineWidth = 2;
        
        // Draw Particles
        particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fill();
        });
        
        // Draw Ripples
        ripples.forEach(r => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${r.life})`;
            ctx.fillStyle = `rgba(255, 255, 255, ${r.life * 0.1})`;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI*2);
            ctx.fill();
            ctx.stroke();
        });
    }
    
    init();
    return { start };
})();
</script>

## 遊び方
1. **AIM**: 画面内を漂うカラフルな粒子（パーティクル）を狙います。
2. **CLICK**: 画面を1回だけクリックして、波紋（Ripple）を作り出します。
3. **CHAIN**: 波紋に触れた粒子は新しい波紋となり、連鎖反応が起こります。
4. **CLEAR**: 画面右上の「TARGET」数以上の粒子を消せばクリア！次のレベルへ進みます。

## 実装のポイント
- **Chain Reaction**: 当たり判定処理において、粒子が消滅すると同時に新しい波紋オブジェクト配列に追加される再帰的な構造を持っています。
- **Life Cycle**: 各波紋には「拡大フェーズ」と「消滅フェーズ（Life減少）」があり、限られた時間内でのみ連鎖が有効になるよう調整しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
