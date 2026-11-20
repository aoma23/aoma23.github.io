---
title: "毎日ゲームチャレンジ Day 90: ザ・ラスト・ボス (The Last Boss)"
og_image: "/assets/images/games/day90_og.png"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

90日目は「ザ・ラスト・ボス」。
冒険者養成の10日間、その最後を飾るのは、魔王との決戦です。
コマンドを選択して戦う、王道のターン制バトル。
攻撃、回復、魔法を駆使して、強大な敵を打ち倒してください！

<style>
#last-boss {
  width: 100%;
  max-width: 480px;
  margin: 24px auto;
  padding: 5px;
  border-radius: 8px;
  background: #000;
  color: #fff;
  font-family: 'Courier New', monospace;
  box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
  border: 4px double #fff;
  position: relative;
  user-select: none;
}
#last-boss canvas {
  display: block;
  background-color: #111;
  margin: 0 auto;
  border-bottom: 2px solid #fff;
  width: 100%;
  height: auto;
}
#last-boss .ui-area {
  padding: 10px;
  background: #222;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
#last-boss .status-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: bold;
}
#last-boss .hp-bar-container {
  width: 100px;
  height: 10px;
  background: #555;
  display: inline-block;
  margin-left: 5px;
}
#last-boss .hp-bar {
  height: 100%;
  background: #2ecc71;
  width: 100%;
  transition: width 0.3s;
}
#last-boss .menu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
#last-boss .cmd-btn {
  background: #000;
  color: #fff;
  border: 2px solid #fff;
  padding: 10px;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
}
#last-boss .cmd-btn:hover { background: #333; }
#last-boss .cmd-btn:disabled { border-color: #555; color: #555; cursor: default; }
#last-boss .cmd-btn.special { border-color: #f1c40f; color: #f1c40f; }

#last-boss .msg-window {
  position: absolute;
  top: 180px; left: 20px; right: 20px;
  background: rgba(0,0,0,0.8);
  border: 2px solid #fff;
  padding: 10px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 1.1rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}
#last-boss .msg-window.show { opacity: 1; }

#last-boss .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
}
#last-boss .overlay.visible { display: flex; }
#last-boss .overlay h1 { color: #e74c3c; font-size: 1.8rem; margin-bottom: 20px; }
#last-boss .start-btn {
  padding: 15px 40px;
  font-size: 1.5rem;
  background: #e74c3c;
  color: #fff;
  border: 2px solid #fff;
  cursor: pointer;
  font-family: inherit;
}
</style>

<div id="last-boss">
  <div style="position:relative;">
    <canvas width="480" height="260"></canvas>
    <div class="msg-window" id="lb-msg"></div>
  </div>

  <div class="ui-area">
    <div class="status-row">
      <div>
        HERO <span style="font-size:0.8em;color:#aaa;">LV 99</span><br>
        HP <span id="lb-hp-val">500</span>
        <div class="hp-bar-container"><div class="hp-bar" id="lb-hp-bar"></div></div>
      </div>
      <div>
        MP <span id="lb-mp-val">100</span>
      </div>
    </div>
    
    <div class="menu-grid" id="lb-menu">
      <button class="cmd-btn" onclick="LB.act('attack')">🗡 FIGHT</button>
      <button class="cmd-btn" onclick="LB.act('heal')">✨ HEAL (15MP)</button>
      <button class="cmd-btn" onclick="LB.act('fire')">🔥 FIRE (10MP)</button>
      <button class="cmd-btn special" onclick="LB.act('limit')" id="lb-limit-btn" disabled>⚡ LIMIT BREAK</button>
    </div>
  </div>
  
  <div class="overlay visible" id="lb-overlay">
    <h1>THE LAST BOSS</h1>
    <button class="start-btn" onclick="LB.start()">BATTLE START</button>
  </div>
</div>

<script>
const LB = (() => {
    const root = document.querySelector('#last-boss');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const msgEl = root.querySelector('#lb-msg');
    const hpVal = root.querySelector('#lb-hp-val');
    const mpVal = root.querySelector('#lb-mp-val');
    const hpBar = root.querySelector('#lb-hp-bar');
    const menu = root.querySelector('#lb-menu');
    const overlay = root.querySelector('#lb-overlay');
    const limitBtn = root.querySelector('#lb-limit-btn');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
    const PLAYED_KEY = 'aomagame:played:last-boss';

    // State
    const MAX_HP = 500;
    const MAX_MP = 100;
    let hero = { hp: MAX_HP, mp: MAX_MP, limit: 0 };
    let boss = { hp: 2000, maxHp: 2000, state: 'idle', shake: 0 };
    let turn = 'player'; // player, busy, enemy
    let effects = []; // particles
    
    // Check local storage for cumulative level?? 
    // Nah, standalone for simplicity.
    
    // Audio
    let audioCtx = null;
    function ensureAudio() {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return;
        if (!audioCtx) audioCtx = new C();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    }
    
    function playTone(freq, type, dur, vol=0.1) {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, audioCtx.currentTime);
        g.gain.setValueAtTime(vol, audioCtx.currentTime);
        g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start();
        o.stop(audioCtx.currentTime + dur);
    }
    
    function playFanfare() {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const melody = [523.25, 523.25, 523.25, 523.25, 415.30, 466.16, 523.25, 0, 523.25]; // C C C C G# A# C - C
        const rhythm = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.9, 1.0];
        const duration = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.3, 0.1, 0.6];
        
        melody.forEach((note, i) => {
            if (note > 0) {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'square';
                o.frequency.setValueAtTime(note, now + rhythm[i]);
                g.gain.setValueAtTime(0.1, now + rhythm[i]);
                g.gain.linearRampToValueAtTime(0, now + rhythm[i] + duration[i]);
                o.connect(g);
                g.connect(audioCtx.destination);
                o.start(now + rhythm[i]);
                o.stop(now + rhythm[i] + duration[i]);
            }
        });
    }

    function start() {
        ensureAudio();
        hero = { hp: MAX_HP, mp: MAX_MP, limit: 0 };
        boss = { hp: 2000, maxHp: 2000, state: 'idle', shake: 0 };
        turn = 'player';
        updateUI();
        overlay.classList.remove('visible');
        markPlayed();
        
        showMessage("魔王が現れた！");
        setTimeout(() => { hideMessage(); loop(); }, 2000);
    }
    
    function act(type) {
        if (turn !== 'player') return;
        turn = 'busy'; // Lock input immediately
        updateUI(); // Disable buttons visual
        
        let dmg = 0;
        let cost = 0;
        let anim = '';
        
        if (type === 'attack') {
            dmg = 40 + Math.floor(Math.random()*20);
            if (Math.random() < 0.15) {
                dmg = Math.floor(dmg * 2);
                showMessage("会心の一撃！！！");
                playTone(600, 'square', 0.1); // High pitch for crit start
                setTimeout(() => playTone(800, 'square', 0.2), 100);
            } else {
                playTone(150, 'sawtooth', 0.1); // Normal hit
            }
            anim = 'slash';
        } else if (type === 'heal') {
            cost = 15;
            if (hero.mp < cost) { showMessage("Not enough MP!"); return; }
            hero.mp -= cost;
            const heal = 200;
            hero.hp = Math.min(MAX_HP, hero.hp + heal);
            addEffect('heal', 100, 200);
            playTone(800, 'sine', 0.5);
            showMessage("HP回復！");
            updateUI();
            nextTurn(1000);
            return;
        } else if (type === 'fire') {
            cost = 10;
            if (hero.mp < cost) { showMessage("Not enough MP!"); return; }
            hero.mp -= cost;
            dmg = 100 + Math.floor(Math.random()*40);
            anim = 'fire';
            playTone(100, 'sawtooth', 0.5); // Boom
        } else if (type === 'limit') {
            dmg = 500;
            hero.limit = 0;
            anim = 'limit';
            playTone(50, 'square', 1.0);
        }
        
        
        // turn = 'busy'; // Previously set at top
        updateUI();
        
        if (anim === 'slash') addEffect('slash', 240, 100);
        if (anim === 'fire') addEffect('fire', 240, 100);
        if (anim === 'limit') {
            addEffect('slash', 240, 100);
            setTimeout(() => addEffect('fire', 240, 100), 200);
        }
        
        setTimeout(() => {
            boss.hp -= dmg;
            boss.shake = 20;
            showMessage(`${dmg} ポイントのダメージ！`);
            updateUI();
            
            // Limit Charge
            if (type !== 'limit') hero.limit += 20;
            
            if (boss.hp <= 0) {
                boss.hp = 0;
                setTimeout(win, 1000);
            } else {
                nextTurn(1500);
            }
        }, 500);
    }
    
    function nextTurn(delay) {
        setTimeout(() => {
            turn = 'enemy';
            hideMessage();
            enemyAction();
        }, delay);
    }
    
    function enemyAction() {
        if (boss.hp <= 0) return;
        
        showMessage("魔王の攻撃！");
        setTimeout(() => {
            // Boss Logic
            let dmg = 0;
            const action = Math.random();
            
            if (boss.hp < boss.maxHp * 0.3) {
                 // Phase 2:
                 // Wait: 10%, Desperation: 25%, Normal: 65%
                 if (action < 0.1) {
                     dmg = 0;
                     showMessage("魔王は不敵に笑っている...");
                 } else if (action < 0.4) { // 0.1 + 0.3
                     dmg = 150;
                     showMessage("魔王は暴れまわっている！");
                     playTone(80, 'sawtooth', 0.8); // Heavy sound
                 } else {
                     dmg = 80 + Math.floor(Math.random()*40);
                 }
            } else {
                 // Phase 1 (Normal)
                 if (action < 0.2) {
                    dmg = 0;
                    showMessage("魔王は不敵に笑っている...");
                 } else {
                    dmg = 80 + Math.floor(Math.random()*40);
                 }
            }
            
            if (dmg > 0) {
                setTimeout(() => {
                    hero.hp -= dmg;
                    playTone(100, 'noise', 0.3);
                    boss.shake = 5; // self shake?
                    // Screen flash?
                    ctx.fillStyle = 'red';
                    ctx.fillRect(0,0,canvas.width,canvas.height);
                    
                    showMessage(`${dmg} のダメージを受けた！`);
                    updateUI();
                    
                    hero.limit += 10;
                    
                    if (hero.hp <= 0) {
                        hero.hp = 0;
                        setTimeout(lose, 1000);
                    } else {
                        setTimeout(() => {
                            turn = 'player';
                            hideMessage();
                            updateUI();
                        }, 1500);
                    }
                }, 1000);
            } else {
                 setTimeout(() => {
                    turn = 'player';
                    hideMessage();
                    updateUI();
                }, 1500);
            }
        }, 1000);
    }
    
    function win() {
        showMessage("魔王を倒した！");
        playFanfare();
        boss.state = 'dead'; // fade out
        setTimeout(() => {
            overlay.classList.add('visible');
            overlay.querySelector('h1').innerText = "CONGRATULATIONS!";
            overlay.querySelector('button').innerText = "The Adventurer's Tale - Fin";
            overlay.querySelector('button').onclick = () => location.reload();
        }, 3000);
    }
    
    function lose() {
        showMessage("全滅した...");
        setTimeout(() => {
            overlay.classList.add('visible');
            overlay.querySelector('h1').innerText = "GAME OVER";
            overlay.querySelector('button').innerText = "Try Again";
            overlay.querySelector('button').onclick = start;
        }, 2000);
    }

    function updateUI() {
        hpVal.innerText = hero.hp;
        mpVal.innerText = hero.mp;
        const pct = Math.max(0, (hero.hp / MAX_HP) * 100);
        hpBar.style.width = pct + '%';
        hpBar.style.background = pct < 30 ? '#e74c3c' : '#2ecc71';
        
        limitBtn.disabled = hero.limit < 100;
        // Limit Button Style
        if (hero.limit >= 100) {
            limitBtn.innerText = "⚡ LIMIT BREAK";
            limitBtn.style.color = "#f1c40f";
            limitBtn.style.borderColor = "#f1c40f";
        } else {
            limitBtn.innerText = "⚡ LIMIT BREAK";
            limitBtn.style.color = "#555";
            limitBtn.style.borderColor = "#555";
        }
        
        // Disable all buttons if not player turn
        const btns = menu.querySelectorAll('.cmd-btn');
        btns.forEach(b => {
             // For limit btn, disable if not player turn OR limit not ready
            if (b.id === 'lb-limit-btn') {
                 b.disabled = (turn !== 'player' || hero.limit < 100);
            } else {
                 b.disabled = (turn !== 'player');
            }
        });
    }
    
    function showMessage(txt) {
        msgEl.innerText = txt;
        msgEl.classList.add('show');
    }
    
    function hideMessage() {
        msgEl.classList.remove('show');
    }
    
    // Effects System
    function addEffect(type, x, y) {
        effects.push({ type, x, y, life: 1.0 });
    }
    
    function draw() {
        // BG
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Stars/Space
        ctx.fillStyle = '#fff';
        for(let i=0; i<50; i++) {
             if(Math.random()<0.01) ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 1, 1);
        }
        
        // Boss
        if (boss.state !== 'dead') {
            let bx = 240;
            let by = 130;
            if (boss.shake > 0) {
                bx += (Math.random()-0.5) * boss.shake;
                by += (Math.random()-0.5) * boss.shake;
                boss.shake *= 0.9;
                if (boss.shake < 0.5) boss.shake = 0;
            }
            
            // Draw Boss Sprite (Canvas Shapes)
            ctx.save();
            ctx.translate(bx, by);
            
            // Aura
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#8e44ad';
            
            // Body
            if (boss.hp < boss.maxHp * 0.3) {
                 ctx.fillStyle = '#c0392b'; // Red Body (Enraged)
                 ctx.shadowColor = '#e74c3c';
            } else {
                 ctx.fillStyle = '#2c3e50';
            }

            ctx.beginPath();
            ctx.moveTo(0, -60);
            ctx.lineTo(40, -20);
            ctx.lineTo(20, 60);
            ctx.lineTo(-20, 60);
            ctx.lineTo(-40, -20);
            ctx.fill();
            
            // Eyes
            if (boss.hp < boss.maxHp * 0.3) ctx.fillStyle = '#f1c40f'; // Yellow Eyes
            else ctx.fillStyle = '#e74c3c';
            
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(-15, -10, 5, 0, Math.PI*2);
            ctx.arc(15, -10, 5, 0, Math.PI*2);
            ctx.fill();
            
            // Horns
            ctx.fillStyle = '#f1c40f';
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.moveTo(-20, -50); ctx.lineTo(-40, -80); ctx.lineTo(-10, -50);
            ctx.moveTo(20, -50); ctx.lineTo(40, -80); ctx.lineTo(10, -50);
            ctx.fill();
            
            ctx.restore();
        }
        
        // Effects
        for(let i=effects.length-1; i>=0; i--) {
            let e = effects[i];
            e.life -= 0.05;
            
            ctx.save();
            ctx.translate(e.x, e.y);
            
            if (e.type === 'slash') {
                ctx.strokeStyle = `rgba(255, 255, 255, ${e.life})`;
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.moveTo(-50 + (1-e.life)*100, -50 + (1-e.life)*100);
                ctx.lineTo(50 - (1-e.life)*100, 50 - (1-e.life)*100);
                ctx.stroke();
            } else if (e.type === 'fire') {
                 ctx.fillStyle = `rgba(231, 76, 60, ${e.life})`;
                 ctx.beginPath();
                 ctx.arc(0, 0, 50 * (1-e.life) + 20, 0, Math.PI*2);
                 ctx.fill();
            }
            
            ctx.restore();
            
            if (e.life <= 0) effects.splice(i,1);
        }
        
        requestAnimationFrame(draw);
    }
    
    // Play Count
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
    
    // Init
    draw();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
    } else {
        updatePlayCount();
    }
    
    return { start, act };
})();
</script>

## 遊び方
1. **BATTLE START** で戦闘開始。
2. コマンドを選んでください。
    - **FIGHT**: 通常攻撃
    - **HEAL**: HPを回復 (MP消費)
    - **FIRE**: 強力な炎魔法 (MP消費)
    - **LIMIT BREAK**: ダメージを受けたり与えたりするとゲージが溜まり、満タンになると使える必殺技。
3. 魔王の攻撃に耐え、HPを0にすれば勝利です。

## 実装メモ
- 古き良きコマンド選択式RPGの戦闘システム。
- `Canvas` によるエフェクト演出とボスの描画。
- 状態機械（プレイヤー待機、アニメーション中、敵ターン）によるターン制御。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
