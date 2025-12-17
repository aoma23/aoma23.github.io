---
title: "毎日ゲームチャレンジ Day 84: ポーション・ブリュワー (Potion Brewer)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

84日目は「ポーション・ブリュワー」。
あなたは新米錬金術師。
注文通りの色完璧なポーションを調合しなければなりません。
赤・青・緑・光・闇の5つの素材を釜に投入し、理想の色を作り出しましょう！
色彩感覚が試されるパズルゲームです。

<style>
#potion-brewer {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #2b2b2b;
  color: #eee;
  font-family: 'Georgia', serif;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #8e44ad;
  position: relative;
  text-align: center;
  user-select: none;
}
#potion-brewer canvas {
  display: block;
  background-color: #1a1a1a;
  margin: 0 auto;
  border: 2px solid #555;
  border-radius: 4px;
}
#potion-brewer .ui-header {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
  font-size: 1.1rem;
  font-weight: bold;
  border-bottom: 2px solid #555;
  margin-bottom: 10px;
}
#potion-brewer .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(43, 43, 43, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 6px;
}
#potion-brewer .overlay.hidden { display: none; }
#potion-brewer h2 {
  color: #9b59b6;
  margin-bottom: 5px;
  font-size: 1.5rem;
  text-shadow: 2px 2px 0 #000;
}
#potion-brewer .btn {
  background: #9b59b6;
  color: #fff;
  border: none;
  padding: 8px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  margin-top: 10px;
  font-family: inherit;
  box-shadow: 0 4px 0 #6c3483;
  transition: transform 0.1s, box-shadow 0.1s;
}
#potion-brewer .btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #6c3483;
}
#potion-brewer .controls {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  margin-top: 10px;
}
#potion-brewer .ingredient {
  height: 50px;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  border: 2px solid rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  text-shadow: 0 1px 2px #000;
}
#potion-brewer .ingredient:active { transform: scale(0.95); }
#potion-brewer .mix-btn {
  grid-column: span 5;
  background: #e67e22;
  color: #fff;
  font-size: 1.2rem;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 0 #d35400;
}
#potion-brewer .mix-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #d35400;
}
#potion-brewer .reset-btn {
  grid-column: span 5;
  background: #7f8c8d;
  color: #fff;
  padding: 5px;
  margin-top: 5px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}
#potion-brewer .controls.hidden { display: none; }
</style>

<div id="potion-brewer">
  <div class="ui-header">
    <span>SCORE: <span id="pb-score">0</span></span>
    <span style="font-size:0.9em; color:#aaa;">BEST: <span id="pb-best">0</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="360" height="280"></canvas>
    
    <div class="overlay" id="pb-overlay">
      <h2>POTION BREWER</h2>
      <p style="color:#ccc; margin-bottom:10px; line-height:1.4; font-size: 0.9rem;">
        注文通りの色を作れ！<br>
        5つの素材を釜に入れて混ぜ合わせます。<br>
        <br>
        <span style="color:#e74c3c">赤</span> <span style="color:#2ecc71">緑</span> <span style="color:#3498db">青</span> <span style="color:#fff">明</span> <span style="color:#555">暗</span><br>
        <br>
        色が近いほど高得点！
      </p>
      <button class="btn" id="pb-start-btn">START BREWING</button>
    </div>
  </div>

  <div class="controls">
    <div class="ingredient" style="background:#e74c3c;" data-color="r">R</div>
    <div class="ingredient" style="background:#2ecc71;" data-color="g">G</div>
    <div class="ingredient" style="background:#3498db;" data-color="b">B</div>
    <div class="ingredient" style="background:#ecf0f1; color:#333;" data-color="w">W</div>
    <div class="ingredient" style="background:#2c3e50;" data-color="k">Bk</div>
    <button class="mix-btn" id="pb-submit-btn">SERVE POTION!</button>
    <button class="reset-btn" id="pb-reset-btn">Throw away (Reset)</button>
  </div>
</div>

<script>
(() => {
    const root = document.querySelector('#potion-brewer');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = root.querySelector('#pb-score');
    const bestEl = root.querySelector('#pb-best');
    const overlay = root.querySelector('#pb-overlay');
    const startBtn = root.querySelector('#pb-start-btn');
    const submitBtn = root.querySelector('#pb-submit-btn');
    const resetBtn = root.querySelector('#pb-reset-btn');
    const controls = root.querySelector('.controls');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

    const PLAYED_KEY = 'aomagame:played:potion-brewer';
    const BEST_KEY = 'aomagame:best:potion-brewer';

    // State
    let score = 0;
    let bestScore = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
    let targetColor = {r:0, g:0, b:0};
    let currentColor = {r:255, g:255, b:255}; // Water start
    let particles = [];
    let isPlaying = false;
    let resultMessage = "";
    let animationTimer = 0;

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

        if (type === 'drop') {
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1); // Bloop sound
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'success') {
            osc.type = 'triangle'; // Ding
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type === 'bad') {
            osc.type = 'sawtooth'; // Buzz
            osc.frequency.setValueAtTime(150, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'reset') {
            // Splash
            const bufferSize = audioCtx.sampleRate * 0.3;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for(let i=0; i<bufferSize; i++) data[i] = Math.random()*2-1;
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = audioCtx.createGain();
            noise.connect(noiseGain);
            noiseGain.connect(audioCtx.destination);
            noiseGain.gain.setValueAtTime(0.2, now);
            noiseGain.gain.linearRampToValueAtTime(0, now + 0.3);
            noise.start(now);
        }
    };

    function init() {
        bestEl.textContent = bestScore;
        startBtn.addEventListener('click', startGame);
        submitBtn.addEventListener('click', submitPotion);
        resetBtn.addEventListener('click', resetCauldron);
        
        root.querySelectorAll('.ingredient').forEach(btn => {
            btn.addEventListener('click', () => addIngredient(btn.dataset.color));
        });
        
        controls.classList.add('hidden'); // Hide initially
        draw();
    }

    function startGame() {
        ensureAudio();
        score = 0;
        scoreEl.textContent = score;
        isPlaying = true;
        overlay.classList.add('hidden');
        controls.classList.remove('hidden'); // Show controls
        markPlayed();
        nextRound();
    }

    function nextRound() {
        // Generate Target Color
        // Avoid too dark or too white for interest
        targetColor = {
            r: Math.floor(Math.random() * 200) + 20,
            g: Math.floor(Math.random() * 200) + 20,
            b: Math.floor(Math.random() * 200) + 20
        };
        resetCauldron(true);
        resultMessage = "";
    }

    function resetCauldron(silent=false) {
        if(!silent) playSound('reset');
        currentColor = {r:200, g:220, b:255}; // Watery
        draw();
    }

    function addIngredient(type) {
        if (!isPlaying || resultMessage) return;
        ensureAudio();
        playSound('drop');
        
        // Mixing Logic: Moving Weighted Average
        // New = (Old * 9 + Add * 1) / 10
        // This allows gradual approach.
        
        let add = {r:0, g:0, b:0};
        const strength = 0.15; // How much it changes per click
        
        if (type === 'r') add = {r:255, g:0, b:0};
        if (type === 'g') add = {r:0, g:255, b:0};
        if (type === 'b') add = {r:0, g:0, b:255};
        if (type === 'w') add = {r:255, g:255, b:255};
        if (type === 'k') add = {r:0, g:0, b:0};
        
        currentColor.r = currentColor.r * (1-strength) + add.r * strength;
        currentColor.g = currentColor.g * (1-strength) + add.g * strength;
        currentColor.b = currentColor.b * (1-strength) + add.b * strength;
        
        // Particles
        spawnParticles(type);
        draw();
    }
    
    function spawnParticles(type) {
        let color = '#fff';
        if (type === 'r') color = '#e74c3c';
        if (type === 'g') color = '#2ecc71';
        if (type === 'b') color = '#3498db';
        if (type === 'k') color = '#2c3e50';
        
        for(let i=0; i<8; i++) {
            particles.push({
                x: 180 + (Math.random()-0.5)*40,
                y: 180, // Cauldron liquid surface
                vx: (Math.random()-0.5)*2,
                vy: (Math.random()-0.5)*2,
                life: 1.0,
                color
            });
        }
        loop(); // Ensure animation runs
    }
    
    function submitPotion() {
        if (!isPlaying || resultMessage) return;
        
        // Calculate Diff
        // Euclidean distance in RGB
        const dist = Math.sqrt(
            Math.pow(targetColor.r - currentColor.r, 2) + 
            Math.pow(targetColor.g - currentColor.g, 2) + 
            Math.pow(targetColor.b - currentColor.b, 2)
        );
        // Max dist approx 441 (sqrt(255^2 * 3))
        
        let points = 0;
        let msg = "";
        
        // Strict grading
        if (dist < 30) {
            points = 1000; msg = "PERFECT!!"; playSound('success');
        } else if (dist < 60) {
            points = 500; msg = "EXCELLENT!"; playSound('success');
        } else if (dist < 100) {
            points = 100; msg = "GOOD"; playSound('drop');
        } else {
            points = 0; msg = "BAD..."; playSound('bad');
        }
        
        score += points;
        scoreEl.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem(BEST_KEY, bestScore);
            bestEl.textContent = bestScore;
        }
        
        resultMessage = `${msg} (+${points})`;
        draw();
        
        // Next round delay
        setTimeout(() => {
            if (points === 0 && score > 0) {
                // Game Over if failed? Or just continue?
                // Providing a Fail state makes it a game.
                 showGameOver();
            } else {
                nextRound();
                draw();
            }
        }, 1500);
    }
    
    function showGameOver() {
        isPlaying = false;
        overlay.classList.remove('hidden');
        controls.classList.add('hidden'); // Hide controls
        root.querySelector('h2').textContent = "BREWING FINISHED";
        root.querySelector('p').innerHTML = `Final Score: ${score}<br>色彩の達人への道は険しい。`;
        startBtn.textContent = "PLAY AGAIN";
    }

    function loop() {
        if (particles.length > 0) {
            requestAnimationFrame(loop);
            updateParticles();
            draw();
        }
    }
    
    function updateParticles() {
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if(p.life <= 0) particles.splice(i, 1);
        }
    }

    function draw() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Target (Flask)
        drawFlask(60, 100, targetColor, "TARGET");
        
        // Draw Arrow
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.moveTo(130, 130);
        ctx.lineTo(150, 140);
        ctx.lineTo(130, 150);
        ctx.fill();
        
        // Draw Cauldron (Current)
        drawCauldron(250, 160, currentColor);
        
        // Message
        if (resultMessage) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Georgia';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#000';
            ctx.fillText(resultMessage, canvas.width/2, 40);
            ctx.shadowBlur = 0;
        }
        
        // Particles
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;
    }
    
    function drawFlask(x, y, col, label) {
        ctx.save();
        ctx.translate(x, y);
        
        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, -60);
        
        // Glass Shape
        ctx.fillStyle = `rgb(${col.r}, ${col.g}, ${col.b})`;
        ctx.beginPath();
        // Flask body
        ctx.arc(0, 0, 30, 0, Math.PI*2);
        // Neck
        ctx.rect(-10, -50, 20, 30);
        ctx.fill();
        
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-10, -10, 8, 0, Math.PI*2);
        ctx.fill();
        
        // Outline
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI*2);
        ctx.moveTo(-10, -26); ctx.lineTo(-10, -50);
        ctx.moveTo(10, -26); ctx.lineTo(10, -50);
        ctx.moveTo(-10, -50); ctx.lineTo(10, -50);
        ctx.stroke();
        
        ctx.restore();
    }
    
    function drawCauldron(x, y, col) {
        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = '#aaa';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("YOUR MIX", 0, -80);
        
        // Liquid
        ctx.fillStyle = `rgb(${Math.floor(col.r)}, ${Math.floor(col.g)}, ${Math.floor(col.b)})`;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI, false); // Half circle bottom
        ctx.ellipse(0, 0, 50, 15, 0, 0, Math.PI*2); // Top surface
        ctx.fill();
        
        // Cauldron Body (Front mask)
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 52, 0, Math.PI, false);
        ctx.ellipse(0, 0, 52, 17, 0, 0, Math.PI*2);
        ctx.stroke();
        
        // Feet
        ctx.fillStyle = '#333';
        ctx.fillRect(-45, 40, 10, 20);
        ctx.fillRect(35, 40, 10, 20);
        
        ctx.restore();
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
1. **左側のフラスコ** が今回作るべき「ターゲット色」です。
2. **5つのボタン（R/G/B/W/Bk）** を押して、**右側の釜** の色を変化させます。
3. 押すたびに少しずつ色が混ざります。
4. 色が一致した自信がついたら **SERVE POTION!** を押してください。
5. 色の近さに応じてスコアが入ります。失敗（色が遠すぎる）するとゲームオーバーです。

## 実装メモ
- RGB色空間での加法混色・減算混色をシミュレート（実際は加重平均近似）。
- Canvasを使った液体の描画と、直感的なUI。
- ユーグリッド距離による色の類似度判定ロジック。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
