---
title: "毎日ゲームチャレンジ Day 89: ミミック・サーチ (Mimic Search)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

89日目は「ミミック・サーチ」。
ダンジョンの宝箱には魔物（ミミック）が潜んでいることがあります。
最初に中身を確認し、シャッフルされた宝箱の中から「本物の財宝」を見つけ出してください。
動体視力と記憶力が試される、シェルゲーム風パズルです！

<style>
#mimic-search {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #2c2c54;
  color: #f7f1e3;
  font-family: 'Verdana', sans-serif;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #474787;
  position: relative;
  text-align: center;
  user-select: none;
  box-sizing: border-box;
}
#mimic-search canvas {
  display: block;
  background-color: #40407a;
  margin: 0 auto;
  border: 2px solid #2c2c54;
  border-radius: 4px;
  width: 100%;
  height: auto;
}
#mimic-search .ui-header {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
  font-size: 1.1rem;
  font-weight: bold;
  border-bottom: 2px solid #474787;
  margin-bottom: 10px;
}
#mimic-search .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44, 44, 84, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 6px;
}
#mimic-search .overlay.hidden { display: none; }
#mimic-search h2 {
  color: #ffb142;
  margin-bottom: 5px;
  font-size: 1.5rem;
  text-shadow: 2px 2px 0 #000;
}
#mimic-search .btn {
  background: #ffb142;
  color: #2c2c54;
  border: none;
  padding: 8px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  margin-top: 10px;
  box-shadow: 0 4px 0 #cc8e35;
  transition: transform 0.1s;
}
#mimic-search .btn:active { transform: translateY(4px); box-shadow: none; }
#mimic-search .message {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 10px #000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
}
#mimic-search .message.show { opacity: 1; }
</style>

<div id="mimic-search">
  <div class="ui-header">
    <span>LEVEL: <span id="ms-level">1</span></span>
    <span>SCORE: <span id="ms-score">0</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="360" height="240"></canvas>
    <div class="message" id="ms-msg"></div>
    
    <div class="overlay" id="ms-overlay">
      <h2>MIMIC SEARCH</h2>
      <p style="color:#d1ccc0; line-height:1.6;">
        どれが本物の宝箱？<br>
        <br>
        最初に中身が一瞬見えます。<br>
        シャッフルを目で追って、<br>
        <span style="color:#ffb142; font-weight:bold;">財宝</span> を当ててください。<br>
        <span style="color:#ff5252; font-weight:bold;">ミミック</span> を開けるとゲームオーバー！
      </p>
      <button class="btn" id="ms-start-btn">GAME START</button>
    </div>
  </div>
</div>

<script>
(() => {
    const root = document.querySelector('#mimic-search');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const levelEl = root.querySelector('#ms-level');
    const scoreEl = root.querySelector('#ms-score');
    const overlay = root.querySelector('#ms-overlay');
    const startBtn = root.querySelector('#ms-start-btn');
    const msgEl = root.querySelector('#ms-msg');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
    const PLAYED_KEY = 'aomagame:played:mimic-search';

    // Constants
    const CHEST_W = 60;
    const CHEST_H = 50;
    
    // State
    let level = 1;
    let score = 0;
    let chests = []; // { x, y, type: 'treasure'|'mimic', targetX, targetY }
    let gameState = 'idle'; // idle, reveal, hiding, shuffling, picking, result
    let shuffleCount = 0;
    let shuffleMax = 0;
    let shuffleSpeed = 0;
    let hideProgress = 0; // 0 to 1 for hiding animation
    
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
        
        if (type === 'shuffle') {
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now+0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now+0.1);
            osc.start(now);
            osc.stop(now+0.1);
        } else if (type === 'reveal') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now+0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now+0.2);
            osc.start(now);
            osc.stop(now+0.2);
        } else if (type === 'win') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(1200, now+0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now+0.5);
            osc.start(now);
            osc.stop(now+0.5);
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now+0.5);
            osc.start(now);
            osc.stop(now+0.5);
        }
    }

    function init() {
        startBtn.addEventListener('click', startGame);
        canvas.addEventListener('click', onCanvasClick);
        draw();
    }

    function startGame() {
        ensureAudio();
        level = 1;
        score = 0;
        updateUI();
        overlay.classList.add('hidden');
        markPlayed();
        startLevel();
    }

    function startLevel() {
        // Setup Chests
        // Lv1-2: 3 chests (1 treasure)
        // Lv3-5: 4 chests (1 treasure)
        // Lv6+: 5 chests (1 treasure? or 2?) Let's stick to 1 treasure for classic shell game feel.
        
        const count = level < 3 ? 3 : (level < 6 ? 4 : 5);
        chests = [];
        
        // Grid calc
        // Center aligned
        const gap = 20;
        const totalW = count * CHEST_W + (count-1) * gap;
        let startX = (canvas.width - totalW) / 2;
        const startY = canvas.height / 2 - CHEST_H / 2;
        
        for(let i=0; i<count; i++) {
            chests.push({
                x: startX + i * (CHEST_W + gap),
                y: startY,
                type: 'mimic', // default
                targetX: startX + i * (CHEST_W + gap),
                targetY: startY
            });
        }
        
        // Pick winner
        const winnerIdx = Math.floor(Math.random() * count);
        chests[winnerIdx].type = 'treasure';
        
        // Draw Initial
        draw();
        
        // Sequence
        gameState = 'reveal';
        hideProgress = 0;
        playSound('reveal');
        draw();
        
        setTimeout(() => {
            // Animate Hide
            gameState = 'hiding';
            animateHide();
        }, 1000); 
    }
    
    function animateHide() {
        let p = 0;
        function loop() {
            p += 0.05;
            if (p >= 1) p = 1;
            hideProgress = p;
            draw();
            
            if (p < 1) {
                requestAnimationFrame(loop);
            } else {
                gameState = 'shuffling';
                prepareShuffle();
            }
        }
        loop();
    }
    
    function prepareShuffle() {
        shuffleCount = 0;
        shuffleMax = 5 + level * 2;
        shuffleSpeed = Math.max(10, 40 - level * 3); // frames per swap? Or speed px/frame
        // Let's do instant swap moves with animation
        nextShuffleStep();
    }
    
    function nextShuffleStep() {
        if (shuffleCount >= shuffleMax) {
            gameState = 'picking';
            showMessage("PICK!");
            return;
        }
        
        // Pick two indices to swap
        const idx1 = Math.floor(Math.random() * chests.length);
        let idx2 = Math.floor(Math.random() * chests.length);
        while(idx1 === idx2) idx2 = Math.floor(Math.random() * chests.length);
        
        const c1 = chests[idx1];
        const c2 = chests[idx2];
        
        // Swap targets
        const tx1 = c1.x;
        const tx2 = c2.x;
        
        c1.targetX = tx2;
        c2.targetX = tx1;
        
        shuffleCount++;
        playSound('shuffle');
        animateSwap();
    }
    
    function animateSwap() {
        let p = 0;
        // Speed increases with level
        const speed = 0.05 + (level * 0.01);
        
        function loop() {
            p += speed;
            if (p >= 1) p = 1;
            
            chests.forEach(c => {
                if (c.x !== c.targetX) {
                     // Linear Lerp? Or Arc? Arc looks better for shuffling
                     // Simple Linear for now to ensure precision
                     // Actually let's just lerp X.
                     // But we need initial X...
                     // To simplify, let's keep it robust:
                     // We know delta.
                     // Let's just reach target.
                }
            });
            
            // To do proper animation, we need to know Origin and Dest for this specific swap.
            // But doing it globally is hard.
            // Refactor: Just animate all chests towards targetX.
            
            let arrived = true;
            chests.forEach(c => {
                const dx = c.targetX - c.x;
                if (Math.abs(dx) > 1) {
                    arrived = false;
                    c.x += dx * 0.2; // Ease out
                    // Add some Y bounce for visual flair
                    c.y = (canvas.height/2 - CHEST_H/2) - Math.abs(Math.sin(p * Math.PI)) * 20; 
                } else {
                    c.x = c.targetX;
                    c.y = canvas.height/2 - CHEST_H/2;
                }
            });
            
            draw();
            
            if (!arrived) {
                requestAnimationFrame(loop);
            } else {
                // Done this step
                // Small delay?
               setTimeout(nextShuffleStep, 50);
            }
        }
        loop();
    }

    function onCanvasClick(e) {
        if (gameState !== 'picking') return;
        
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width/rect.width);
        const my = (e.clientY - rect.top) * (canvas.height/rect.height);
        
        // Check hit
        for(let c of chests) {
            if (mx >= c.x && mx <= c.x + CHEST_W &&
                my >= c.y && my <= c.y + CHEST_H) {
                
                // Picked
                if (c.type === 'treasure') {
                    // Win
                    playSound('win');
                    score += 100 * level;
                    gameState = 'result';
                    showMessage("FOUND IT!");
                    openChest(c);
                    setTimeout(() => {
                        level++;
                        updateUI();
                        startLevel();
                    }, 2000);
                } else {
                    // Lose
                    playSound('lose');
                    gameState = 'result';
                    openChest(c);
                    showMessage("MIMIC!!");
                    setTimeout(gameOver, 2000);
                }
                break;
            }
        }
    }
    
    function openChest(c) {
        // Just purely visual: force reveal mode basically
        draw(c); // Draw will handle 'result' state logic
    }
    
    function showMessage(text) {
        msgEl.innerText = text;
        msgEl.classList.add('show');
        setTimeout(() => msgEl.classList.remove('show'), 1000);
    }
    
    function updateUI() {
        levelEl.innerText = level;
        scoreEl.innerText = score;
    }

    function draw(highlightChest = null) {
        // BG
        ctx.fillStyle = '#40407a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        chests.forEach(c => {
            const px = c.x;
            const py = c.y;
            
            // Body
            ctx.fillStyle = '#b33939'; // Reddish wood
            ctx.fillRect(px, py, CHEST_W, CHEST_H);
            
            // Trim
            ctx.fillStyle = '#f1c40f'; // Gold
            ctx.fillRect(px, py + 15, CHEST_W, 5); // Band
            ctx.fillRect(px + CHEST_W/2 - 5, py + 15, 10, 10); // Lock
            
            // State: Reveal or Picked
            // State: Reveal or Picked
            // Calculate Diamond Y based on state
            let showDiamond = false;
            let dy = py - 30; // Default floating position (higher than before)
            let alpha = 1.0;
            
            if (gameState === 'reveal') {
                if (c.type === 'treasure') showDiamond = true;
            } else if (gameState === 'hiding') {
                 // Only show Diamond hiding, not Mimics
                 if (c.type === 'treasure') {
                     showDiamond = true;
                     // Lerp from -30 to +20 (into chest)
                     dy = (py - 30) + (hideProgress * 50);
                     if (hideProgress > 0.8) alpha = 1.0 - (hideProgress - 0.8) * 5; // Fade out at end
                 }
            } else if (gameState === 'result' && (c === highlightChest || c.type ==='treasure')) {
                showDiamond = true;
                dy = py - 30; // Float up
            }
            
            if (showDiamond) {
                // Determine content color
                if (c.type === 'treasure') {
                    // Gold Glow
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#f1c40f';
                    ctx.fillStyle = '#f1c40f';
                    ctx.font = '30px sans-serif';
                    ctx.fillText('💎', px + 10, dy);
                    ctx.restore();
                } else {
                    // Mimic
                    ctx.save();
                    ctx.globalAlpha = alpha;
                     ctx.shadowBlur = 10;
                    ctx.shadowColor = '#000';
                    ctx.fillStyle = '#000';
                    ctx.font = '24px sans-serif';
                    ctx.fillText('👿', px + 10, dy);
                    ctx.restore();
                }
                ctx.shadowBlur = 0;
            }
            
            // Draw Front Lip of chest to cover diamond if it goes inside?
            // Simple overlay for 'inside' effect
            if (gameState === 'hiding' && hideProgress > 0.5) {
                 ctx.fillStyle = '#b33939'; 
                 ctx.fillRect(px, py + 10, CHEST_W, CHEST_H - 10);
                 // Redraw trim
                 ctx.fillStyle = '#f1c40f'; 
                 ctx.fillRect(px, py + 15, CHEST_W, 5);
                 ctx.fillRect(px + CHEST_W/2 - 5, py + 15, 10, 10);
            }
        });
    }
    
    function gameOver() {
        overlay.classList.remove('hidden');
        root.querySelector('h2').innerText = "GAME OVER";
        root.querySelector('p').innerHTML = `LEVEL REACHED: ${level}<br>SCORE: ${score}`;
        startBtn.innerText = "TRY AGAIN";
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
1. ゲーム開始時、宝箱の中身が一瞬だけ見えます。**「💎」が入っている宝箱** を覚えてください。
2. 宝箱がシャッフルされます（位置が入れ替わります）。目で見失わないように追いかけてください。
3. "PICK!" と表示されたら、正解の宝箱をタップ／クリックします。
4. 正解なら次のレベルへ、不正解（ミミック「👿」）ならゲームオーバーです。

## 実装メモ
- シェルゲームのロジック実装（配列内のオブジェクト座標の入れ替えアニメーション）。
- `requestAnimationFrame` を使ったスムースな移動補間。
- 状態遷移（公開→シャッフル→選択→結果）の管理。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
