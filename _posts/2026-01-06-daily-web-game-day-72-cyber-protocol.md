---
title: "毎日ゲームチャレンジ Day 72: サイバー・プロトコル (Cyber Protocol)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

72日目は「サイバー・プロトコル」。
貴方は凄腕ハッカー。
流れるコードの中からパターンを見つけ出し、セキュリティを突破せよ！

<style>
#hack-game {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 8px;
  background: #000;
  color: #0f0;
  font-family: "Courier New", monospace;
  text-align: center;
  box-shadow: 0 0 30px rgba(0, 255, 0, 0.2);
  position: relative;
  overflow: hidden;
  border: 1px solid #0f0;
}
#hack-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  display: block;
  background: #000;
  cursor: pointer; /* Interaction */
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#hack-game .hud {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 0 0 5px #0f0;
  z-index: 10;
}
#hack-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
#hack-game .start-overlay.hidden { display: none; }
#hack-game h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #0f0;
  text-shadow: 0 0 10px #0f0;
  text-transform: uppercase;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}
#hack-game button.primary {
  border: 1px solid #0f0;
  background: #000;
  color: #0f0;
  padding: 16px 32px;
  font-size: 1.2rem;
  font-family: inherit;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 0 10px rgba(0,255,0,0.3);
}
#hack-game button.primary:hover {
  background: #0f0;
  color: #000;
  box-shadow: 0 0 20px rgba(0,255,0,0.8);
}
#hack-game .virtual-pad {
  position: absolute;
  bottom: 20px;
  left: 0; right: 0;
  display: flex;
  justify-content: center;
  gap: 12px;
  z-index: 15;
}
#hack-game .pad-btn {
  width: 60px;
  height: 60px;
  border: 1px solid #0f0;
  background: rgba(0, 20, 0, 0.8);
  color: #0f0;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  user-select: none;
  font-family: inherit;
  box-shadow: 0 0 5px rgba(0,255,0,0.2);
}
#hack-game .pad-btn:active {
  background: #0f0;
  color: #000;
}
</style>

<div id="hack-game">
  <canvas class="game-canvas" width="400" height="500"></canvas>
  <div class="hud">
    <div class="level">LVL: 1</div>
    <div class="best">BEST: 1</div>
    <div class="timer">00.00</div>
  </div>
  
  <div class="virtual-pad">
    <button class="pad-btn" data-key="0">1</button>
    <button class="pad-btn" data-key="1">2</button>
    <button class="pad-btn" data-key="2">3</button>
    <button class="pad-btn" data-key="3">4</button>
  </div>

  <div class="start-overlay">
    <h2>CYBER<br>PROTOCOL</h2>
    <p style="margin-bottom:20px;color:#cfc">
      DECRYPT THE SEQUENCE<br>
      Match the numbers before timeout.
    </p>
    <button class="primary" id="cp-start-btn">CONNECT</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('hack-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');

  const lvlEl = root.querySelector('.level');
  const bestEl = root.querySelector('.best');
  const timerEl = root.querySelector('.timer');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('cp-start-btn');
  const padBtns = root.querySelectorAll('.pad-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  let audioCtx = null;
  const ensureAudio = () => {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    if (!audioCtx) audioCtx = new C();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  };

  const playTone = (type) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'type') { // Typing sound
      osc.type = 'square';
      osc.frequency.setValueAtTime(600 + Math.random()*200, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };

  // Matrix Rain
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = Array(columns).fill(1);
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  const state = {
    running: false,
    level: 1,
    timeLeft: 0,
    sequence: [],
    inputIndex: 0,
    msg: "READY",
    flash: 0,
    msg: "READY",
    flash: 0,
    score: 0,
    bestLevel: 1
  };
  
  const STORAGE_KEY_BEST = 'aomagame:best:cyberprotocol';

  function generateSequence(len) {
    const seq = [];
    for(let i=0; i<len; i++) {
        seq.push(Math.floor(Math.random() * 4)); // 0-3
    }
    return seq;
  }

  function update(dt) {
    if (!state.running) return;

    state.timeLeft -= dt;
    timerEl.textContent = state.timeLeft.toFixed(2);

    if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        gameOver();
    }
    
    // Flash decay
    if (state.flash > 0) state.flash -= 0.1;
  }

  function draw() {
    // 1. Matrix Rain Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0f0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    // 2. UI Overlay
    // 2. UI Overlay
    // Sequence Rendering with Wrap
    const charsPerRow = 10;
    const spacing = 30;
    const rowHeight = 40;
    const totalRows = Math.ceil(state.sequence.length / charsPerRow);
    
    const boxW = 340;
    const boxH = Math.max(140, totalRows * rowHeight + 40);
    const bx = (canvas.width - boxW)/2;
    const by = 130;

    // Box BG
    ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, boxW, boxH);

    // Sequence
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 24px Courier New';
    
    state.sequence.forEach((val, i) => {
        let color = '#555'; 
        if (i < state.inputIndex) color = '#0f0'; 
        else if (i === state.inputIndex) color = '#fff'; 

        ctx.fillStyle = color;
        
        const row = Math.floor(i / charsPerRow);
        const col = i % charsPerRow;
        
        // Center each row
        const itemsInThisRow = (row === totalRows - 1) 
                               ? ((state.sequence.length - 1) % charsPerRow) + 1
                               : charsPerRow;
        
        const rowWidth = (itemsInThisRow - 1) * spacing;
        const rowStartX = canvas.width / 2 - rowWidth / 2;
        
        const x = rowStartX + col * spacing;
        const y = by + 40 + row * rowHeight;

        // Draw Number 1-4
        ctx.fillText(val + 1, x, y);
        
        // Draw underline for current
        if (i === state.inputIndex) {
            ctx.fillRect(x - 10, y + 15, 20, 3);
        }
    });

    // Message
    if (state.msg) {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Courier New';
        ctx.fillText(state.msg, canvas.width/2, by - 25);
    }
    
    // Screen Flash
    if (state.flash > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${state.flash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function loop() {
    if (!state.running && !state.gameOver) return; // if gameover, still draw rain? Nah
    
    if (state.running) {
        update(1/60);
    }
    draw(); // Always draw rain if possible? Or stop
    if (state.running || state.gameOver) requestAnimationFrame(loop);
  }

  function nextLevel() {
    state.level++;
    lvlEl.textContent = `LVL: ${state.level}`;
    // Increase length: 3, 5, 7, 9, 11...
    // At level 10 -> 21 (3 rows roughly)
    const len = 3 + (state.level - 1) * 2;
    state.sequence = generateSequence(len);
    state.inputIndex = 0;
    state.timeLeft += 2.0 + (len * 0.3); // Bonus time (reduced per feedback)
    state.msg = "ACCESS GRANTED";
    state.flash = 0.5;
    playTone('success');
  }

  function checkInput(val) {
    if (!state.running) return;
    
    if (val === state.sequence[state.inputIndex]) {
        state.inputIndex++;
        playTone('type');
        if (state.inputIndex >= state.sequence.length) {
            nextLevel();
        }
    } else {
        // Penalty? Or Reset level?
        // Let's Penalty Time
        state.timeLeft -= 2.0;
        state.msg = "ERROR - TIME PENALTY";
        state.flash = 0.2;
        playTone('fail');
        
        // Shake logic could be added
        if (state.timeLeft < 0) state.timeLeft = 0;
    }
  }

  // Inputs
  function handleKey(dx) {
    checkInput(dx);
  }

  padBtns.forEach(btn => {
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleKey(parseInt(btn.dataset.key));
        btn.style.background = '#0f0';
        btn.style.color = '#000';
        setTimeout(() => {
            btn.style.background = 'rgba(0, 20, 0, 0.8)';
            btn.style.color = '#0f0';
        }, 100);
    });
    btn.addEventListener('click', (e) => { // Desktop click
        handleKey(parseInt(btn.dataset.key));
    });
  });

  window.addEventListener('keydown', e => {
     if (!state.running) return;
     if (e.key === '1') handleKey(0);
     if (e.key === '2') handleKey(1);
     if (e.key === '3') handleKey(2);
     if (e.key === '4') handleKey(3);
  });

  function init() {
    updatePlayCount();
    
    // Load Best
    const saved = localStorage.getItem(STORAGE_KEY_BEST);
    if (saved) {
        state.bestLevel = parseInt(saved);
        bestEl.textContent = `BEST: ${state.bestLevel}`;
    }
    
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
    
    // Initial Bg
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function startGame() {
    state.running = true;
    state.gameOver = false;
    overlay.classList.add('hidden');
    
    state.level = 1;
    state.timeLeft = 20.0;
    lvlEl.textContent = "LVL: 1";
    state.sequence = generateSequence(3);
    state.inputIndex = 0;
    state.msg = "DECRYPT START";
    
    markPlayed();
    requestAnimationFrame(loop);
  }

  function gameOver() {
    state.running = false;
    state.gameOver = true;
    overlay.classList.remove('hidden');
    playTone('fail');
    // Check Best
    if (state.level > state.bestLevel) {
        state.bestLevel = state.level;
        localStorage.setItem(STORAGE_KEY_BEST, state.bestLevel);
        bestEl.textContent = `BEST: ${state.bestLevel}`;
    }
    
    root.querySelector('h2').textContent = "SYSTEM LOCKED";
    root.querySelector('p').innerHTML = `LEVEL REACHED: ${state.level}<br>BEST RECORD: ${state.bestLevel}<br>ACCESS DENIED`;
    startBtn.textContent = "RETRY";
  }

  function updatePlayCount() { /* 省略 */ }
  function markPlayed() { /* 省略 */ }

  init();

})();
</script>

## 遊び方
1. 画面に表示される数字（1, 2, 3, 4）の順番通りに、下のボタンまたはキーボードを押してください。
2. 正しく入力するとカチカチと進みます。
3. 間違えると時間が減ります（TIME PENALTY）。
4. 時間切れになる前にコードを解読し、レベルを上げていきましょう。

## 実装メモ
- キャンバス背景に「マトリックス・レイン」エフェクトを描画（半透明の黒を重ねることで残像表現）。
- 数字配列を生成し、入力と比較するシンプルなロジック。
- 1234キーまたは画面タップに対応。
