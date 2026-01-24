---
title: "毎日ゲームチャレンジ Day 93: Star Link (スターリンク)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

93日目は「Star Link」。
夜空に輝く星々を一筆書きで繋ぎ、星座を完成させるリラックスパズルゲームです。
美しい光のエフェクトと、心地よい操作感に癒やされてください。

<style>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@300;500&display=swap');

#star-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 0;
  border-radius: 50% 50% 0 0; /* Dome shape somewhat */
  border-radius: 12px;
  background: radial-gradient(circle at bottom, #1a2a6c, #b21f1f, #fdbb2d); /* Sunset? No, let's go deep space */
  background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  text-align: center;
  font-family: 'Quicksand', sans-serif;
  user-select: none;
  position: relative;
  overflow: hidden;
  border: 1px solid #333;
  color: #fff;
  aspect-ratio: 1 / 1.2;
}

#star-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}

.st-ui {
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  pointer-events: none;
  text-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.st-level {
  font-size: 1.5rem;
  letter-spacing: 2px;
  font-weight: 300;
  opacity: 0.8;
}

.st-msg {
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
  font-size: 1rem;
  color: #aaddff;
  opacity: 0;
  transition: opacity 0.5s;
  pointer-events: none;
}

.st-msg.visible {
  opacity: 1;
}

</style>

<div id="star-game">
    <canvas id="star-canvas" width="400" height="480"></canvas>
    
    <div class="st-ui">
        <div class="st-level">CONSTELLATION <span id="st-lvl-val">1</span></div>
    </div>
    
    <div id="st-msg" class="st-msg">Connect all stars!</div>
</div>

<script>
const StarLink = (() => {
    const canvas = document.getElementById('star-canvas');
    const ctx = canvas.getContext('2d');
    const levelEl = document.getElementById('st-lvl-val');
    const msgEl = document.getElementById('st-msg');
    
    let width, height;
    
    // Game State
    let stars = [];
    let path = []; // Array of star indices
    let currentDragLine = null; // {x, y} current pointer pos
    let isDragging = false;
    let level = 1;
    let particles = [];
    let completedAnimation = 0; // 0 to 1
    let isLevelComplete = false;
    
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
             // Ethereal Drone
             const osc = this.ctx.createOscillator();
             const gain = this.ctx.createGain();
             osc.frequency.value = 110; // A2
             osc.type = 'sine';
             
             const osc2 = this.ctx.createOscillator();
             osc2.frequency.value = 164.81; // E3
             osc2.type = 'sine';
             
             const gain2 = this.ctx.createGain();
             
             gain.gain.value = 0.02;
             gain2.gain.value = 0.02;
             
             osc.connect(gain);
             gain.connect(this.ctx.destination);
             osc2.connect(gain2);
             gain2.connect(this.ctx.destination);
             
             osc.start();
             osc2.start();
        },
        playTone(idx) {
            if(!this.ctx) return;
            // Pentatonic scale logic based on index
            const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C major pentatonic
            const freq = scale[idx % scale.length] * (1 + Math.floor(idx/scale.length)*0.5);
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 1.0);
        },
        playWin() {
            if(!this.ctx) return;
            const t = this.ctx.currentTime;
            // Glissando
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.linearRampToValueAtTime(880, t+1);
            
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t+2);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(t+2);
        }
    };
    
    // Consts
    const STAR_RADIUS = 6;
    const TOUCH_RADIUS = 30;
    
    function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        width = canvas.width;
        height = canvas.height;
        if(stars.length === 0) generateLevel();
    }
    
    // Geometry
    function dist(p1, p2) {
        return Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
    }
    
    // Level Generation
    function generateLevel() {
        stars = [];
        path = [];
        isLevelComplete = false;
        completedAnimation = 0;
        levelEl.textContent = level;
        msgEl.classList.add('visible');
        setTimeout(() => msgEl.classList.remove('visible'), 2000);
        
        // Ensure stars are somewhat spread out
        const count = 4 + Math.min(level, 8);
        const padding = 40;
        
        let attempts = 0;
        while(stars.length < count && attempts < 1000) {
            attempts++;
            const s = {
                x: padding + Math.random() * (width - padding*2),
                y: padding + Math.random() * (height - padding*2) + 20, // offset for UI
                id: stars.length
            };
            
            // Check distance from others
            let tooClose = false;
            for(let other of stars) {
                if(dist(s, other) < 60) tooClose = true;
            }
            if(!tooClose) stars.push(s);
        }
        
        // Spawn background twinkles
        createBgStars();
    }
    
    let bgStars = [];
    function createBgStars() {
        bgStars = [];
        for(let i=0; i<50; i++) {
            bgStars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2,
                alpha: Math.random(),
                speed: 0.01 + Math.random() * 0.02
            });
        }
    }
    
    // Interaction
    function getStarAt(x, y) {
        for(let i=0; i<stars.length; i++) {
            if(dist({x,y}, stars[i]) < TOUCH_RADIUS) {
                return i;
            }
        }
        return -1;
    }
    
    function startDrag(e) {
        if(isLevelComplete) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        
        const idx = getStarAt(x, y);
        if(idx !== -1) {
            isDragging = true;
            path = [idx];
            currentDragLine = {x, y};
            spawnPulse(stars[idx]);
            Audio.init();
            Audio.playTone(0);
        }
    }
    
    function onDrag(e) {
        if(!isDragging || isLevelComplete) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        
        currentDragLine = {x, y};
        
        // Trail particles
        if(Math.random() < 0.3) {
            particles.push({
                x: x + (Math.random()-0.5)*10,
                y: y + (Math.random()-0.5)*10,
                vx: (Math.random()-0.5)*0.5,
                vy: (Math.random()-0.5)*0.5,
                life: 1,
                color: '#fff'
            });
        }
        
        const idx = getStarAt(x, y);
        if(idx !== -1) {
            // Logic: Can only move to new star
            // If going back to SECOND to last star, undo last move (backtracking)
            const lastIdx = path[path.length-1];
            
            if (idx !== lastIdx) {
                const prevIdx = path.length >= 2 ? path[path.length-2] : -1;
                
                if (idx === prevIdx) {
                    // Backtrack
                    path.pop();
                    spawnPulse(stars[idx]);
                    Audio.playTone(path.length-1);
                } else if (!path.includes(idx)) {
                    // Add new
                    path.push(idx);
                    spawnPulse(stars[idx]);
                    Audio.playTone(path.length-1);
                    
                    // Check Completion
                    if (path.length === stars.length) {
                        completeLevel();
                    }
                }
            }
        }
    }
    
    function endDrag() {
        if(isLevelComplete) return;
        isDragging = false;
        currentDragLine = null;
        // If not complete, reset path (or keep it? Resetting is standard for one-stroke)
        if (!isLevelComplete) {
            path = [];
        }
    }
    
    function completeLevel() {
        isLevelComplete = true;
        isDragging = false;
        currentDragLine = null;
        Audio.playWin();
        updatePlayCount();
        
        // Celebration particles
        stars.forEach(s => {
            for(let i=0; i<5; i++) spawnPulse(s, true);
        });
        
        setTimeout(() => {
            level++;
            generateLevel();
        }, 2000);
    }
    
    function spawnPulse(star, big=false) {
        particles.push({
            x: star.x,
            y: star.y,
            type: 'pulse',
            life: 1,
            maxSize: big ? 50 : 20,
            color: '#aaddff'
        });
    }

    // Rendering
    function draw() {
        ctx.fillStyle = '#090A0F'; // Cleared by gradient in CSS, but valid for trail
        ctx.clearRect(0,0,width,height);
        
        // Bg Stars
        ctx.fillStyle = '#fff';
        bgStars.forEach(s => {
            ctx.globalAlpha = s.alpha * 0.5 + 0.3 * Math.sin(Date.now() * 0.005 + s.x);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Draw Connections (Path)
        if (path.length > 0) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fff';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(stars[path[0]].x, stars[path[0]].y);
            for(let i=1; i<path.length; i++) {
                ctx.lineTo(stars[path[i]].x, stars[path[i]].y);
            }
            if (currentDragLine && isDragging) {
                ctx.lineTo(currentDragLine.x, currentDragLine.y);
            }
            ctx.stroke();
            
            // Closing line if complete animation
            if (isLevelComplete) {
                // Connect back to start if we want closed loops? 
                // No, just flash the path
                ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(Date.now() * 0.01)*0.5})`;
                ctx.shadowColor = '#00ffff';
                ctx.stroke();
            }
            
            ctx.shadowBlur = 0;
        }
        
        // Draw Stars
        stars.forEach((s, i) => {
            const isVisited = path.includes(i);
            const isLast = path.length > 0 && path[path.length-1] === i;
            
            ctx.shadowBlur = isVisited ? 15 : 0;
            ctx.shadowColor = '#aaddff';
            
            ctx.fillStyle = isVisited ? '#fff' : '#ffffff44';
            
            ctx.beginPath();
            let r = STAR_RADIUS;
            if (isLast) r += Math.sin(Date.now() * 0.01) * 2;
            
            ctx.arc(s.x, s.y, r, 0, Math.PI*2);
            ctx.fill();
            
            // Halo for unvisited
            if (!isVisited) {
                ctx.strokeStyle = '#ffffff22';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(s.x, s.y, STAR_RADIUS + 4 + Math.sin(Date.now()*0.005 + i)*2, 0, Math.PI*2);
                ctx.stroke();
            }
        });
        ctx.shadowBlur = 0;
        
        // Particles
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i];
            p.life -= 0.02;
            if(p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }
            
            if (p.type === 'pulse') {
                ctx.strokeStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.lineWidth = 2;
                ctx.beginPath();
                let r = (1 - p.life) * p.maxSize;
                ctx.arc(p.x, p.y, r, 0, Math.PI*2);
                ctx.stroke();
            } else {
                p.x += p.vx;
                p.y += p.vy;
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        
        requestAnimationFrame(draw);
    }
    
    // Init
    window.addEventListener('resize', resize);
    
    canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
    
    canvas.addEventListener('touchstart', startDrag, {passive: false});
    window.addEventListener('touchmove', onDrag, {passive: false});
    window.addEventListener('touchend', endDrag);
    
    setTimeout(resize, 100); // Initial call
    requestAnimationFrame(draw);
    
    return {};
})();

function updatePlayCount() {
    // ...existing logic...
    const counterEl = document.querySelector('[data-aomagame-play-count]');
    if (!counterEl) return;
    try {
        localStorage.setItem('aomagame:played:star-link', '1');
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
1. **CONNECT**: 光っている星（どれでもOK）からドラッグを開始します。
2. **DRAW**: そのまま指を離さずに、画面上の「全ての星」を一筆書きで繋いでください。
3. **COMPLETE**: 全部の星を繋ぐと星座が完成し、次のレベルに進めます。
4. **RELAX**: 時間制限はありません。失敗したら指を離してやり直せます。

## 実装のポイント
- **Generative Art**: 星の配置は毎回ランダムに生成され、二度と同じ星座は現れません。
- **Glowing Path**: `shadowBlur`を使用した発光表現と、ドラッグ時のパーティクルで魔法のような書き心地を目指しました。
- **Interactive**: マウス/タッチ操作に吸い付くようなUI判定と、戻ったときの「取り消し（Backtrack）」機能を実装しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
