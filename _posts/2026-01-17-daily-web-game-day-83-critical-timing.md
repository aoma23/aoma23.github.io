---
title: "毎日ゲームチャレンジ Day 83: クリティカル・タイミング (Critical Timing)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

83日目は「クリティカル・タイミング」。
RPGのバトル、その「一瞬」だけを切り取ったアクションゲームです。
流れてくるバーをタイミングよく止めて、会心の一撃（クリティカル）を叩き込め！
敵の攻撃もタイミングよく防御（パリィ）して、被害を最小限に抑えましょう。

<style>
#critical-timing {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #2d3436;
  color: #dfe6e9;
  font-family: 'Rubik', sans-serif;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #00cec9;
  position: relative;
  text-align: center;
  user-select: none;
  touch-action: manipulation;
}
#critical-timing canvas {
  display: block;
  background-color: #000;
  margin: 0 auto;
  border: 2px solid #636e72;
  border-radius: 4px;
  width: 100%;
  height: auto;
}
#critical-timing .ui-header {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
  font-size: 1.1rem;
  font-weight: bold;
  border-bottom: 2px solid #636e72;
  margin-bottom: 10px;
}
#critical-timing .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(45, 52, 54, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 6px;
}
#critical-timing .overlay.hidden { display: none; }
#critical-timing h2 {
  color: #00cec9;
  margin-bottom: 5px;
  font-size: 1.5rem;
  text-shadow: 2px 2px 0 #000;
  text-transform: uppercase;
}
#critical-timing .btn {
  background: #00cec9;
  color: #2d3436;
  border: none;
  padding: 8px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 30px;
  margin-top: 8px;
  font-family: inherit;
  box-shadow: 0 4px 15px rgba(0, 206, 201, 0.4);
  transition: transform 0.1s, box-shadow 0.1s;
}
#critical-timing .btn:active {
  transform: scale(0.95);
  box-shadow: 0 2px 5px rgba(0, 206, 201, 0.4);
}
#critical-timing .action-btn {
  width: 90%;
  height: 80px;
  margin: 10px auto 0;
  background: #ff7675;
  color: #fff;
  font-size: 1.8rem;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 6px 0 #d63031;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}
#critical-timing .action-btn:active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #d63031;
  background: #d63031;
}
#critical-timing .action-btn.defend {
  background: #74b9ff;
  box-shadow: 0 6px 0 #0984e3;
}
#critical-timing .action-btn.defend:active {
  background: #0984e3;
  box-shadow: 0 2px 0 #0984e3;
}
#critical-timing .action-btn.hidden { display: none; }

#critical-timing .msg { color: #b2bec3; line-height: 1.4; margin-bottom: 10px; font-size: 0.9rem; }
.shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>

<div id="critical-timing">
  <div class="ui-header">
    <span>KILLS: <span id="ct-score">0</span></span>
    <span style="font-size:0.9em; color:#aaa;">BEST: <span id="ct-best">0</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="360" height="240"></canvas>
    
    <div class="overlay" id="ct-overlay">
      <h2>CRITICAL TIMING</h2>
      <p class="msg">
        バーが中心のエリアに重なる瞬間に<br>
        ボタンをタップせよ！<br>
        <br>
        <span style="color:#ff7675">赤: 攻撃</span> / <span style="color:#74b9ff">青: 防御</span><br>
        敵が光ったら攻撃が来るぞ！
      </p>
      <button class="btn" id="ct-start-btn">BATTLE START</button>
    </div>
  </div>

  <button class="action-btn" id="ct-action-btn">ATTACK!</button>
</div>

<script>
(() => {
    const root = document.querySelector('#critical-timing');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = root.querySelector('#ct-score');
    const bestEl = root.querySelector('#ct-best');
    const overlay = root.querySelector('#ct-overlay');
    const startBtn = root.querySelector('#ct-start-btn');
    const actionBtn = root.querySelector('#ct-action-btn');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

    const PLAYED_KEY = 'aomagame:played:critical-timing';
    const BEST_KEY = 'aomagame:best:critical-timing';

    // Game Constants
    const BAR_WIDTH = 300;
    const BAR_HEIGHT = 20;
    const CRIT_ZONE_WIDTH = 40;
    const HIT_ZONE_WIDTH = 100;
    
    // State
    let state = 'title'; // title, player_turn, enemy_turn_wait, enemy_attack, gameover
    let kills = 0;
    let bestKills = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
    let hp = 3;
    let maxHp = 3;
    let enemyHp = 3;
    let enemyMaxHp = 3;
    
    // Timing Bar State
    let barX = 0;
    let barSpeed = 5;
    let barDir = 1;
    let barActive = false;
    
    // Enemy Animation
    let enemyScale = 1;
    let enemyFlash = 0;
    let message = "";
    let messageTimer = 0;
    let shakeTimer = 0;

    let rafId = null;
    
    // Audio
    let audioCtx = null;
    const ensureAudio = () => {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return;
        if (!audioCtx) audioCtx = new C();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    };

    const playSound = (type) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'crit') { // High pitch ping
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'hit') { // Standard hit
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'miss') { // Low thud
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'block') { // Metallic Clang
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'damage') { // Damage noise
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.3);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    };

    function init() {
        bestEl.textContent = bestKills;
        startBtn.addEventListener('click', startGame);
        actionBtn.addEventListener('mousedown', handleAction);
        actionBtn.addEventListener('touchstart', (e) => { e.preventDefault(); handleAction(); }, {passive:false});
        
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Hide button initially
        actionBtn.classList.add('hidden');
    }

    function startGame() {
        ensureAudio();
        kills = 0;
        hp = 3;
        state = 'player_turn';
        overlay.classList.add('hidden');
        actionBtn.classList.remove('hidden'); // Show button
        markPlayed();
        spawnEnemy();
        
        if (rafId) cancelAnimationFrame(rafId);
        loop();
    }
    
    function spawnEnemy() {
        enemyMaxHp = 2 + Math.floor(kills / 2);
        enemyHp = enemyMaxHp;
        // Reset timing bar
        barSpeed = 3 + Math.min(kills * 0.5, 12);
        startPlayerTurn();
    }
    
    function startPlayerTurn() {
        state = 'player_turn';
        barActive = true;
        barX = 0;
        barDir = 1;
        
        // Update UI
        actionBtn.innerText = "ATTACK!";
        actionBtn.className = "action-btn"; // Reset class (red)
        message = "PLAYER TURN";
        messageTimer = 30;
    }
    
    function startEnemyTurn() {
        state = 'enemy_turn_wait';
        barActive = false;
        
        message = "ENEMY TURN";
        messageTimer = 30;
        
        actionBtn.innerText = "WAIT...";
        actionBtn.className = "action-btn defend";
        actionBtn.style.opacity = "0.5";
        
        // Random wait before attack
        setTimeout(() => {
            if (state === 'gameover') return;
            state = 'enemy_attack';
            barActive = true;
            barX = 0;
            // Enemy timing is usually faster!
            barDir = 1; 
            
            actionBtn.innerText = "DEFEND!";
            actionBtn.style.opacity = "1";
            enemyFlash = 20; // Visual cue
            
        }, 1000 + Math.random() * 1000);
    }

    function handleAction() {
        if (state === 'gameover' || !barActive) return;
        ensureAudio();
        
        barActive = false;
        
        // Calculate Distance from Center
        // Canvas center x = 180. Bar width 300.
        // Bar Left = 30. Bar Right = 330.
        // Center = 180.
        // Cursor X relative to bar start (0..300)
        
        // Center of bar track is 150 (half of 300)
        // distance = Math.abs(barX - 150)
        
        const dist = Math.abs(barX - 150);
        const isCrit = dist < (CRIT_ZONE_WIDTH / 2);
        const isHit = dist < (HIT_ZONE_WIDTH / 2);
        
        if (state === 'player_turn') {
            if (isCrit) {
                // CRITICAL
                playSound('crit');
                enemyHp -= 2;
                message = "CRITICAL!!";
                enemyScale = 0.8; // Shrink effect
                spawnParticles(180, 100, '#ff0', 20);
            } else if (isHit) {
                // HIT
                playSound('hit');
                enemyHp -= 1;
                message = "HIT!";
                enemyScale = 0.9;
                spawnParticles(180, 100, '#fff', 10);
            } else {
                // MISS
                playSound('miss');
                message = "MISS...";
            }
            
            messageTimer = 60;
            
            if (enemyHp <= 0) {
                kills++;
                scoreEl.textContent = kills;
                message = "ENEMY DEFEATED!";
                enemyScale = 0; // Vanish
                spawnParticles(180, 100, '#e74c3c', 50); // Boom
                enemyFlash = 20; // Flash effect uses this too, but we can add screen flash
                // Just use enemyFlash for screen flash trigger in draw
                enemyHp = 0;
                playSound('damage'); // Explosion sound?
                
                setTimeout(spawnEnemy, 1000);
                // Heal small amount
                hp = Math.min(hp + 1, maxHp);
            } else {
                setTimeout(startEnemyTurn, 1000);
            }
            
        } else if (state === 'enemy_attack') {
            if (isCrit) {
                // PERFECT BLOCK (Counter?)
                playSound('block');
                message = "PERFECT BLOCK!";
                spawnParticles(180, 200, '#0ff', 15);
                // Deal 1 damage counter?
                enemyHp -= 1;
                if (enemyHp <= 0) {
                    kills++;
                    scoreEl.textContent = kills;
                    setTimeout(spawnEnemy, 1000);
                    return;
                }
            } else if (isHit) {
                // GUARD
                playSound('block');
                message = "GUARD!";
                spawnParticles(180, 200, '#ccc', 5);
                // Taking 0 damage or maybe very small chip damage logic?
            } else {
                // FAIL
                playSound('damage');
                hp--;
                message = "OUCH!";
                root.classList.add('shake');
                setTimeout(()=>root.classList.remove('shake'), 500);
                shakeTimer = 20;
            }
            
            messageTimer = 60;
            if (hp <= 0) {
                gameOver();
            } else {
                setTimeout(startPlayerTurn, 1000);
            }
        }
    }
    
    // Auto-fail handler for timeout
    function handleAutoFail() {
        playSound('miss');
        if (state === 'player_turn') {
            message = "TOO SLOW!";
            setTimeout(startEnemyTurn, 1000);
        } else if (state === 'enemy_attack') {
            message = "UNGUARDED!";
            hp--;
            root.classList.add('shake');
            setTimeout(()=>root.classList.remove('shake'), 500);
            if (hp <= 0) gameOver();
            else setTimeout(startPlayerTurn, 1000);
        }
    }

    function update() {
        if (barActive) {
            barX += barSpeed * barDir;
            if (barX >= 300) {
                barDir = -1;
            } else if (barX <= 0 && barDir === -1) {
                // Return trip complete -> MISS/FAIL
                barActive = false;
                barX = 0;
                handleAutoFail();
            }
        }
        
        enemyScale += (1 - enemyScale) * 0.1;
        if (messageTimer > 0) messageTimer--;
        if (enemyFlash > 0) enemyFlash--;
        if (shakeTimer > 0) {
            shakeTimer--;
            // Shake canvas offset
        }
    }
    
    function draw() {
        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let shX = 0, shY = 0;
        if (shakeTimer > 0) {
            shX = (Math.random()-0.5)*10;
            shY = (Math.random()-0.5)*10;
        }
        
        ctx.save();
        ctx.translate(shX, shY);
        
        // Background Grid
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,canvas.height/2); } // Floor only?
        ctx.stroke();
        
        // Enemy
        if (state !== 'gameover') {
            const ex = 180;
            const ey = 100;
            ctx.save();
            ctx.translate(ex, ey);
            ctx.scale(enemyScale, enemyScale);
            
            if (enemyFlash > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
                ctx.fillStyle = '#fff';
            } else {
                ctx.fillStyle = '#e74c3c';
            }
            
            // Draw Enemy Shape (Monster)
            ctx.beginPath();
            ctx.moveTo(-30, -30);
            ctx.lineTo(30, -30);
            ctx.lineTo(40, 0);
            ctx.lineTo(20, 40);
            ctx.lineTo(-20, 40);
            ctx.lineTo(-40, 0);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(-20, -15, 10, 10);
            ctx.fillRect(10, -15, 10, 10);
            ctx.fillStyle = '#000';
            ctx.fillRect(-18, -13, 4, 4);
            ctx.fillRect(12, -13, 4, 4);
            
            // HP Bar
            ctx.fillStyle = '#555';
            ctx.fillRect(-40, -50, 80, 8);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(-40, -50, 80 * (enemyHp/enemyMaxHp), 8);
            
            ctx.restore();
        }
        
        // Player HP (Bottom Left)
        for(let i=0; i<maxHp; i++) {
            ctx.fillStyle = i < hp ? '#00b894' : '#555';
            ctx.beginPath();
            ctx.arc(30 + i*25, 200, 10, 0, Math.PI*2);
            ctx.fill();
        }

        // Timing Bar UI
        const barY = 160;
        const barLeft = 30; // canvas width 360, bar width 300. margin 30.
        
        // Track
        ctx.fillStyle = '#333';
        ctx.fillRect(barLeft, barY, 300, 20);
        
        // Crit Zone (Center)
        ctx.fillStyle = '#fdcb6e'; // Gold
        ctx.fillRect(barLeft + 150 - CRIT_ZONE_WIDTH/2, barY, CRIT_ZONE_WIDTH, 20);
        
        // Hit Zone
        ctx.fillStyle = '#636e72'; // Gray
        ctx.globalAlpha = 0.5;
        ctx.fillRect(barLeft + 150 - HIT_ZONE_WIDTH/2, barY, HIT_ZONE_WIDTH, 20);
        ctx.globalAlpha = 1.0;
        
        // Center Line
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(barLeft + 150, barY - 5);
        ctx.lineTo(barLeft + 150, barY + 25);
        ctx.stroke();
        
        // Moving Cursor
        // barX is 0..300
        ctx.fillStyle = barActive ? '#00cec9' : '#555';
        ctx.beginPath();
        ctx.moveTo(barLeft + barX, barY - 5);
        ctx.lineTo(barLeft + barX + 10, barY - 15);
        ctx.lineTo(barLeft + barX - 10, barY - 15);
        ctx.fill();
        
        // Message
        if (messageTimer > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px sans-serif';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 4;
            ctx.fillText(message, 180, 80);
            ctx.shadowBlur = 0;
        }
        
        // Particles
        drawParticles(ctx);
        
        ctx.restore();
    }
    
    // Simple Particle System
    let particles = [];
    function spawnParticles(x, y, color, count) {
        for(let i=0; i<count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            particles.push({
                x, y, 
                vx: Math.cos(angle)*speed, 
                vy: Math.sin(angle)*speed,
                life: 1.0,
                color
            });
        }
    }
    
    function drawParticles(ctx) {
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.life -= 0.05;
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            } else {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 4, 4);
                ctx.globalAlpha = 1.0;
            }
        }
    }

    function gameOver() {
        state = 'gameover';
        barActive = false;
        actionBtn.classList.add('hidden'); // Hide button
        
        if (kills > bestKills) {
            bestKills = kills;
            localStorage.setItem(BEST_KEY, bestKills);
            bestEl.textContent = bestKills;
            message = "NEW RECORD!";
        } else {
            message = "GAME OVER";
        }
        messageTimer = 1000; // Stay
        
        setTimeout(() => {
            overlay.classList.remove('hidden');
            root.querySelector('h2').innerText = "DEFEATED";
            root.querySelector('p').innerHTML = `討伐数: ${kills}<br>連戦記録を伸ばそう！`;
            startBtn.innerText = "RETRY";
        }, 1500);
    }
    
    function loop() {
        update();
        draw();
        rafId = requestAnimationFrame(loop);
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
1. バトルが始まると、ターン制で進行します。
2. **自分のターン**: タイミングバーが動きます。バーが中心の黄色いエリアに来た瞬間に「ATTACK」ボタンを押して攻撃します。
3. **敵のターン**: 敵が光った後、バーが動きます。中心に来た瞬間に「DEFEND」ボタンを押して防御します。
4. 失敗するとダメージを受けます。HPがなくなる前に敵を倒し続け、何体倒せるか挑戦しましょう！

## 実装メモ
- シンプルなリズム・タイミングアクションゲーム。
- `Canvas` の描画ループ内でバーの位置を更新し、ボタン押下時の距離判定で成功/失敗を分岐。
- 敵のHPは討伐数に応じて上昇、バーの速度も加速します。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
