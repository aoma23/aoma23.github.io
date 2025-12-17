---
title: "毎日ゲームチャレンジ Day 87: ハンターズ・エイム (Hunter's Aim)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

87日目は「ハンターズ・エイム」。
弓矢を引いて、風を読み、遠くの的を射抜くシューティングゲームです。
ドラッグで弓を引き絞り、指を離して発射！
次々と現れる的を正確に狙い撃ちましょう。

<style>
#hunters-aim {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #5d4037;
  color: #efebe9;
  font-family: 'Verdana', sans-serif;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #8d6e63;
  position: relative;
  text-align: center;
  user-select: none;
  touch-action: none; 
}
#hunters-aim canvas {
  display: block;
  background-color: #87ceeb; /* Sky blue */
  margin: 0 auto;
  border: 2px solid #3e2723;
  border-radius: 4px;
}
#hunters-aim .ui-header {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
  font-size: 0.9rem;
  font-weight: bold;
  border-bottom: 2px solid #8d6e63;
  margin-bottom: 10px;
}
#hunters-aim .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(93, 64, 55, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 6px;
}
#hunters-aim .overlay.hidden { display: none; }
#hunters-aim h2 {
  color: #ffeb3b;
  margin-bottom: 10px;
  font-size: 1.8rem;
  text-shadow: 2px 2px 0 #000;
}
#hunters-aim .btn {
  background: #ffeb3b;
  color: #3e2723;
  border: none;
  padding: 12px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  margin-top: 15px;
  box-shadow: 0 4px 0 #fbc02d;
}
#hunters-aim .btn:active { transform: translateY(4px); box-shadow: none; }
</style>

<div id="hunters-aim">
  <div class="ui-header">
    <span>SCORE: <span id="ha-score">0</span></span>
    <span>TIME: <span id="ha-time">60</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="360" height="400"></canvas>
    <div class="overlay" id="ha-overlay">
      <h2>HUNTER'S AIM</h2>
      <p style="color:#dcedc8; line-height:1.6; font-size:0.9rem;">
        スワイプ/ドラッグで弓を引き、<br>
        的を狙って離して発射！<br>
        <br>
        風向きに注意して、<br>
        制限時間内に高得点を目指せ！
      </p>
      <button class="btn" id="ha-start-btn">HUNT START</button>
    </div>
  </div>
  <p style="font-size:0.8rem; opacity:0.7; margin-top:5px;">中心に近いほど高得点！</p>
</div>

<script>
(() => {
    const root = document.querySelector('#hunters-aim');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = root.querySelector('#ha-score');
    const timeEl = root.querySelector('#ha-time');
    const overlay = root.querySelector('#ha-overlay');
    const startBtn = root.querySelector('#ha-start-btn');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
    const PLAYED_KEY = 'aomagame:played:hunters-aim';

    // State
    let isPlaying = false;
    let score = 0;
    let timeLeft = 60;
    
    // Physics
    let arrow = { x: 0, y: 0, vx: 0, vy: 0, active: false, stick: false };
    let targets = []; // { x, y, r, points, hit }
    let wind = 0; // -3 to 3
    
    // Input
    let dragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragCurr = { x: 0, y: 0 };
    
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
             // Bow twang
             osc.frequency.setValueAtTime(200, now);
             osc.frequency.exponentialRampToValueAtTime(600, now+0.1);
             gain.gain.setValueAtTime(0.2, now);
             gain.gain.linearRampToValueAtTime(0, now+0.15);
             osc.start(now);
             osc.stop(now+0.2);
        } else if (type === 'hit') {
             // Thud
             osc.type = 'triangle';
             osc.frequency.setValueAtTime(300, now);
             gain.gain.setValueAtTime(0.3, now);
             gain.gain.exponentialRampToValueAtTime(0.01, now+0.1);
             osc.start(now);
             osc.stop(now+0.1);
        }
    }

    function init() {
        startBtn.addEventListener('click', startGame);
        
        // Touch/Mouse
        canvas.addEventListener('mousedown', onDown);
        canvas.addEventListener('mousemove', onMove);
        canvas.addEventListener('mouseup', onUp);
        canvas.addEventListener('mouseleave', onUp);
        
        canvas.addEventListener('touchstart', e => { e.preventDefault(); onDown(e.touches[0]); }, {passive:false});
        canvas.addEventListener('touchmove', e => { e.preventDefault(); onMove(e.touches[0]); }, {passive:false});
        canvas.addEventListener('touchend', e => { e.preventDefault(); onUp(); });
        
        draw();
    }

    function startGame() {
        ensureAudio();
        isPlaying = true;
        score = 0;
        timeLeft = 60;
        arrow = { x: 0, y: 0, vx: 0, vy: 0, active: false };
        targets = [];
        spawnTarget();
        changeWind();
        
        scoreEl.innerText = score;
        timeEl.innerText = timeLeft;
        overlay.classList.add('hidden');
        markPlayed();
        loop();
        
        // Timer
        const tInt = setInterval(() => {
            if (!isPlaying) { clearInterval(tInt); return; }
            timeLeft--;
            timeEl.innerText = timeLeft;
            if (timeLeft <= 0) {
                gameOver();
                clearInterval(tInt);
            }
        }, 1000);
    }
    
    function changeWind() {
        wind = (Math.random() - 0.5) * 0.1; 
        if(Math.random()<0.3) wind = 0;
    }
    
    function spawnTarget() {
        // Random pos in upper 60%
        const x = 50 + Math.random() * (canvas.width - 100);
        const y = 50 + Math.random() * 200;
        targets.push({ x, y, r: 25, hit: false, moveX: (Math.random()-0.5)*2 });
    }

    function onDown(e) {
        if (!isPlaying || arrow.active) return;
        const pos = getPos(e);
        // Drag start area: Bottom center
        const bx = canvas.width / 2;
        const by = canvas.height - 50;
        
        // Dist check? Allow anywhere for ease
        dragging = true;
        dragStart = { x: pos.x, y: pos.y };
        dragCurr = { x: pos.x, y: pos.y };
    }
    
    function onMove(e) {
        if (!dragging) return;
        const pos = getPos(e);
        dragCurr = { x: pos.x, y: pos.y };
    }
    
    function onUp() {
        if (!dragging) return;
        dragging = false;
        
        // Pull vector
        const dx = dragStart.x - dragCurr.x;
        const dy = dragStart.y - dragCurr.y;
        
        // Only shoot if pulled down/back enough
        if (dy > 20) {
            playSound('shoot');
            arrow.active = true;
            arrow.stick = false;
            arrow.x = canvas.width / 2;
            arrow.y = canvas.height - 50;
            
            // Power multiplier
            const power = Math.min(Math.sqrt(dx*dx + dy*dy) * 0.15, 15);
            const angle = Math.atan2(-dy, -dx) + Math.PI; // Invert drag
           
            arrow.vx = (dx * 0.15); // Simple launch
            arrow.vy = (dy * 0.15) * -1; // Upwards
        }
    }
    
    function getPos(e) {
        const r = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (canvas.width / r.width),
            y: (e.clientY - r.top) * (canvas.height / r.height)
        };
    }

    function update() {
        if (!isPlaying) return;
        
        // Targets
        targets.forEach(t => {
            if (t.hit) return;
            // Move targets a bit?
            t.x += t.moveX;
            if (t.x < 30 || t.x > canvas.width - 30) t.moveX *= -1;
        });
        
        // Arrow
        if (arrow.active && !arrow.stick) {
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;
            
            // Gravity & Wind
            arrow.vy += 0.2;
            arrow.vx += wind;
            
            // OOB
            if (arrow.y > canvas.height || arrow.x < 0 || arrow.x > canvas.width) {
                arrow.active = false; // Miss
            }
            
            // Hit Check
            // Check tip of arrow
            const tipX = arrow.x + arrow.vx;
            const tipY = arrow.y + arrow.vy;
            
            for(let t of targets) {
                if(t.hit) continue;
                const dx = tipX - t.x;
                const dy = tipY - t.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < t.r) {
                    // HIT!
                    playSound('hit');
                    t.hit = true;
                    arrow.stick = true; // Stop arrow
                    
                    // Points based on accuracy
                    let pts = 100;
                    if (dist < t.r * 0.3) pts = 500; // Bullseye
                    else if (dist < t.r * 0.6) pts = 200;
                    
                    score += pts;
                    scoreEl.innerText = score;
                    
                    setTimeout(() => {
                        targets = targets.filter(_t => _t !== t);
                        arrow.active = false;
                        spawnTarget();
                        changeWind();
                    }, 500);
                    break;
                }
            }
        }
    }

    function draw() {
        // Sky
        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Ground - Grass
        ctx.fillStyle = '#7cb342';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        
        // Wind Indicator
        ctx.fillStyle = '#fff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        let wText = "WIND: ";
        if (Math.abs(wind) < 0.02) wText += "NONE";
        else wText += (wind > 0 ? ">>" : "<<") + " " + Math.floor(Math.abs(wind)*100);
        ctx.fillText(wText, 10, 20);

        // Target
        targets.forEach(t => {
             if (t.hit) ctx.globalAlpha = 0.5;
             
             // Outer White
             ctx.fillStyle = '#fff';
             ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.fill();
             
             // Black ring
             ctx.fillStyle = '#000';
             ctx.beginPath(); ctx.arc(t.x, t.y, t.r*0.8, 0, Math.PI*2); ctx.fill();
             
             // Blue ring
             ctx.fillStyle = '#0288d1';
             ctx.beginPath(); ctx.arc(t.x, t.y, t.r*0.6, 0, Math.PI*2); ctx.fill();
             
             // Red ring
             ctx.fillStyle = '#d32f2f';
             ctx.beginPath(); ctx.arc(t.x, t.y, t.r*0.4, 0, Math.PI*2); ctx.fill();
             
             // Yellow Bullseye
             ctx.fillStyle = '#fbc02d';
             ctx.beginPath(); ctx.arc(t.x, t.y, t.r*0.2, 0, Math.PI*2); ctx.fill();
             
             ctx.globalAlpha = 1.0;
        });
        
        // Player (Bow)
        const bx = canvas.width / 2;
        const by = canvas.height - 50;
        
        // Drag line logic
        if (dragging) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(dragCurr.x, dragCurr.y);
            ctx.stroke();
            
            // Drawn Bow visualization?
            // Simple line from dragStart to dragCurr
        }
        
        // Simple Bow Graphic
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bx, by, 20, Math.PI, 0); // Upper half
        ctx.stroke();

        // Arrow
        if (arrow.active) {
            ctx.save();
            ctx.translate(arrow.x, arrow.y);
            ctx.rotate(Math.atan2(arrow.vy, arrow.vx));
            
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(-15, -1, 30, 2); // Shaft
            ctx.fillStyle = '#9e9e9e'; 
            ctx.beginPath(); ctx.moveTo(15, -3); ctx.lineTo(20, 0); ctx.lineTo(15, 3); ctx.fill(); // Tip
            
            ctx.restore();
        }
    }
    
    function gameOver() {
        isPlaying = false;
        overlay.classList.remove('hidden');
        root.querySelector('h2').innerText = "TIME UP!";
        root.querySelector('p').innerHTML = `SCORE: ${score}`;
        startBtn.innerText = "AGAIN";
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
1. 画面下部（弓のあたり）をタップ／クリックして、手前に引っ張るようにドラッグします。
2. 引っ張る距離と角度で、矢の強さと方向が決まります。
3. 指を離すと発射！ 風の影響を計算に入れて、的（ターゲット）を狙いましょう。
4. 中心の黄色い部分に当てると高得点（500点）です！

## 実装メモ
- マウス/タッチ操作による「引っ張って離す（Pull & Release）」物理挙動。
- 重力と風の影響を受ける放物線運動のシミュレーション。
- Canvasによる的の描画と当たり判定。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
