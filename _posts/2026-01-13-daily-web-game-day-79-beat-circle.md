---
title: "毎日ゲームチャレンジ Day 79: ビート・サークル (Beat Circle)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

79日目は「ビート・サークル」。
360度から迫りくるビート。
リズム（BGM）に合わせて画面をタップし、完璧なタイミングで迎撃せよ！
※音が鳴ります（リズム重視のため必須）

<style>
#rhythm-game {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 50%;
  background: #000;
  color: #fff;
  font-family: "Helvetica Neue", Arial, sans-serif;
  text-align: center;
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.4);
  position: relative;
  overflow: hidden;
  border: 4px solid #f0f;
  aspect-ratio: 1 / 1;
}
#rhythm-game .game-canvas {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  display: block;
  background: #101;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  border-radius: 50%;
}
#rhythm-game .hud {
  position: absolute;
  top: 50%; /* Center alignment */
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 10;
  mix-blend-mode: lighter;
}
#rhythm-game .score {
  font-size: 3rem;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 10px #f0f;
}
#rhythm-game .combo {
  font-size: 1.2rem;
  color: #0ff;
}
#rhythm-game .msg {
  position: absolute;
  top: 30%; left: 50%; transform: translateX(-50%);
  font-size: 1.5rem;
  color: #ff0;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.1s;
  pointer-events: none;
}
#rhythm-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
  border-radius: 50%;
}
#rhythm-game .start-overlay.hidden { display: none; }
#rhythm-game h2 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #f0f;
  text-transform: uppercase;
  text-shadow: 0 0 20px #f0f;
}
#rhythm-game button.primary {
  border: 2px solid #f0f;
  background: transparent;
  color: #f0f;
  padding: 16px 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 30px;
  text-transform: uppercase;
  transition: all 0.2s;
  box-shadow: 0 0 10px rgba(255,0,255,0.2);
}
#rhythm-game button.primary:hover {
  background: #f0f;
  color: #fff;
  box-shadow: 0 0 30px rgba(255,0,255,0.8);
}
</style>

<div id="rhythm-game">
  <canvas class="game-canvas" width="500" height="500"></canvas>
  <div class="hud">
    <div class="score">0</div>
    <div class="combo">x0</div>
  </div>
  <div class="msg">PERFECT!</div>
  
  <div class="start-overlay">
    <h2>BEAT CIRCLE</h2>
    <p style="margin-bottom:20px;color:#ccc;font-size:0.9rem">
      Listen to the Beat.<br>
      Tap ANYWHERE when particles<br>hit the inner circle.<br>
      (Sound Required)
    </p>
    <button class="primary" id="bc-start-btn">DROP THE BEAT</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('rhythm-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = root.querySelector('.score');
  const comboEl = root.querySelector('.combo');
  const msgEl = root.querySelector('.msg');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('bc-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
  const PLAYED_KEY = 'aomagame:played:beat-circle';

  // Audio Engine
  let audioCtx = null;
  const BPM = 120;
  const LOOKAHEAD = 25.0; // ms
  const SCHEDULE_AHEAD_TIME = 2.0; // s (Must be > NOTE_SPEED)
  let nextNoteTime = 0.0;
  let currentBeat = 0;
  let timerID = null;
  
  // Game Logic
  // Notes Queue
  // { time: absoluteTime, angle: rand, hit: false }
  // { time: absoluteTime, angle: rand, hit: false, color: str }
  const notes = [];
  const NOTE_SPEED = 0.9; // Faster (Double speed of 1.8)
  const MAX_STEPS = 64; // 8 Bars * 8 Steps
  // Spawn Radius: 250 (Edge), Hit Radius: 80
  
  const state = {
    running: false,
    score: 0,
    combo: 0,
    maxCombo: 0,
    health: 100,
    particles: [],
    highScore: 0
  };

  const ensureAudio = () => {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    if (!audioCtx) audioCtx = new C();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  };

  // Synth
  const playDrum = (time, type) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'kick') {
          osc.frequency.setValueAtTime(150, time);
          osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
          gain.gain.setValueAtTime(0.8, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
          osc.start(time);
          osc.stop(time + 0.5);
      } else if (type === 'snare') {
          // Noise for snare
          const bufferSize = audioCtx.sampleRate * 0.1;
          const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const data = buffer.getChannelData(0);
          for(let i=0; i<bufferSize; i++) data[i] = Math.random()*2-1;
          const noise = audioCtx.createBufferSource();
          noise.buffer = buffer;
          const noiseGain = audioCtx.createGain();
          noise.connect(noiseGain);
          noiseGain.connect(audioCtx.destination);
          
          noiseGain.gain.setValueAtTime(0.5, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
          noise.start(time);
          
          // Tone
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250, time);
          gain.gain.setValueAtTime(0.2, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
          osc.start(time);
          osc.stop(time + 0.1);
      } else if (type === 'hihat') {
          // High Freq Noise
          // Reuse synth for simplicity - High Square
          osc.type = 'square';
          osc.frequency.setValueAtTime(8000, time);
          gain.gain.setValueAtTime(0.1, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
          osc.start(time);
          osc.stop(time + 0.05);
      }
  };
  
  const playHitSound = () => {
      const time = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, time);
      osc.frequency.exponentialRampToValueAtTime(2000, time + 0.1);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      osc.start(time);
      osc.stop(time + 0.1);
  };

  function scheduler() {
      while (nextNoteTime < audioCtx.currentTime + SCHEDULE_AHEAD_TIME) {
          if (currentBeat < MAX_STEPS) {
              scheduleNote(currentBeat, nextNoteTime);
          }
          nextNote();
      }
      // Continue scheduling until all beats processed + buffer
      if (state.running) {
           if (currentBeat < MAX_STEPS + 4) { // Keep loop alive a bit longer for cleanup
               timerID = setTimeout(scheduler, LOOKAHEAD);
           }
      }
  }

  function nextNote() {
      const secondsPerBeat = 60.0 / BPM;
      nextNoteTime += 0.5 * secondsPerBeat; // 8th notes (0.5 beat)
      currentBeat++;
  }

  function scheduleNote(beatNumber, time) {
      // 8th note resolution.
      // Pattern: Kick on 1, 5. Snare on 3, 7. Hihats on all.
      // 1 bar = 8 x 8th notes. (0-7)
      
      const step = beatNumber % 8;
      
      // Determine if a GAMEPLAY NOTE should spawn and color
      let spawn = false;
      let noteColor = '#0ff';
      
      // Music Playing
      if (step === 0 || step === 4) {
          playDrum(time, 'kick');
          spawn = true;
          noteColor = '#f04'; // Kick = Reddish
      }
      if (step === 2 || step === 6) {
          playDrum(time, 'snare');
          spawn = true;
          noteColor = '#0ff'; // Snare = Cyan
      }
      playDrum(time, 'hihat'); 
      
      // Random Logic
      if (step % 2 !== 0 && Math.random() < 0.3) {
           spawn = true; 
           noteColor = '#ff0'; // Offbeat = Yellow
      }
      
      if (spawn) {
          // Add to Game Queue
          // Note Hit Time = time
          // Note Spawn Time = time - NOTE_SPEED
          // But visual update needs spawn time?
          // We just store target time.
          notes.push({
              time: time,
              angle: Math.random() * Math.PI * 2,
              hit: false,
              processed: false,
              color: noteColor
          });
      }
  }

  function checkInput() {
      if (!state.running) return;
      const now = audioCtx.currentTime;
      
      // Check closest note
      // Needs to be unprocessed
      // Window: +/- 0.15s (150ms)
      
      let hit = false;
      
      for(const n of notes) {
          if (n.processed) continue;
          const diff = Math.abs(n.time - now);
          if (diff < 0.15) {
              // HIT
              n.processed = true;
              n.hit = true;
              hit = true;
              
              // Grading
              let grade = "GOOD";
              let scoreAdd = 100;
              if (diff < 0.05) {
                  grade = "PERFECT!";
                  scoreAdd = 300;
              }
              
              state.combo++;
              if (state.combo > state.maxCombo) state.maxCombo = state.combo;
              
              state.score += scoreAdd * state.combo;
              state.particles.push({x: 0, y: 0, angle: n.angle, life: 1.0, color: '#ff0'}); // visual explosion at hit circle
              
              showMsg(grade);
              playHitSound();
              break; // Only hit one note per tap
          }
      }
      
      if (!hit) {
          // Miss (Tap on empty)
          // Reset combo per feedback
          if (state.combo > 0) {
              msgEl.textContent = "MISS";
              msgEl.style.color = "#f00";
              msgEl.style.opacity = 1;
              setTimeout(() => { msgEl.style.opacity = 0; msgEl.style.color="#ff0"; }, 300);
              state.combo = 0;
              comboEl.textContent = `x${state.combo}`;
          }
      }
  }
  
  function showMsg(txt) {
      msgEl.textContent = txt;
      msgEl.style.opacity = 1;
      setTimeout(() => msgEl.style.opacity = 0, 300);
      scoreEl.textContent = state.score;
      comboEl.textContent = `x${state.combo}`;
  }
  
  function missMsg() {
      msgEl.textContent = "MISS";
      msgEl.style.color = "#f00";
      msgEl.style.opacity = 1;
      setTimeout(() => { msgEl.style.opacity = 0; msgEl.style.color="#ff0"; }, 300);
      state.combo = 0;
      comboEl.textContent = `x${state.combo}`;
  }

  function update() {
     // Check for misses (notes passed limit)
     const now = audioCtx.currentTime;
     notes.forEach(n => {
         if (!n.processed && n.time < now - 0.2) {
             n.processed = true;
             missMsg();
         }
     });
     
     // Remove old notes
     while(notes.length > 0 && notes[0].processed && notes[0].time < now - 1.0) {
         notes.shift();
     }
     
     // Particles
     for(let i=state.particles.length-1; i>=0; i--) {
         state.particles[i].life -= 0.05;
         if (state.particles[i].life <= 0) state.particles.splice(i, 1);
     }
     
     // End game?
     if (currentBeat >= MAX_STEPS && notes.length === 0) { 
         // Finish
         gameOver();
     }
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Clear
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const now = audioCtx ? audioCtx.currentTime : 0;
    
    // Beat Pulse
    // Calculate pulse from time (every beat)
    const beatTime = 60/BPM;
    const phase = (now % beatTime) / beatTime; // 0 to 1
    const scale = 1.0 + Math.pow(1.0 - phase, 2) * 0.1;
    
    // Hit Circle
    const HIT_R = 60; // Reduced from 100 for longer travel path
    ctx.strokeStyle = '#f0f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, HIT_R * scale, 0, Math.PI*2);
    ctx.stroke();
    
    // Notes
    const SPAWN_R = 250; // Canvas Edge (visible immediately)
    
    ctx.fillStyle = '#0ff';
    notes.forEach(n => {
        if (n.processed) return; // Don't draw hit/missed notes
        
        // Progress: 0 (Spawn) -> 1 (Hit) based on time
        // Spawn Time = n.time - NOTE_SPEED
        // Hit Time = n.time
        let progress = 1.0 - (n.time - now) / NOTE_SPEED; 
        
        // If progress < 0, it hasn't spawned yet (shouldn't happen if rendering loop is tight, but notes array has future notes)
        if (progress < 0) return; // Don't draw yet
        
        // If progress 0: R = SPAWN_R
        // If progress 1: R = HIT_R
        
        let r = SPAWN_R - (progress * (SPAWN_R - HIT_R));
        
        if (r < HIT_R) r = HIT_R * 0.9; // Going inside
        
        const x = cx + Math.cos(n.angle) * r;
        const y = cy + Math.sin(n.angle) * r;
        
        ctx.fillStyle = n.color; // Use beat color
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI*2);
        ctx.fill();
        
        // Tail
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const tailR = r + 20;
        ctx.moveTo(x, y);
        ctx.lineTo(cx + Math.cos(n.angle)*tailR, cy + Math.sin(n.angle)*tailR);
        ctx.stroke();
    });
    
    // Particles
    state.particles.forEach(p => {
        const r_dist = HIT_R + (1.0 - p.life) * 50;
        const px = cx + Math.cos(p.angle) * r_dist;
        const py = cy + Math.sin(p.angle) * r_dist;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(px, py, 15 * p.life, 0, Math.PI*2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    });
  }

  function loop() {
    if (state.running) {
        update();
    }
    draw();
    requestAnimationFrame(loop);
  }

  // Inputs
  function handleInput(e) {
      if (!state.running) return;
      e.preventDefault(); // prevent zoom etc
      checkInput();
      
      // Visual feedback at touch pos?
      // Not needed, center focused
  }
  
  canvas.addEventListener('mousedown', handleInput);
  canvas.addEventListener('touchstart', handleInput, {passive:false});
  
  // Key input too
  window.addEventListener('keydown', e => {
      if(e.code === 'Space' || e.key === 'z') checkInput();
  });

  function init() {
    startBtn.addEventListener('click', startGame);
    // Load HS
    try {
        const hs = localStorage.getItem('aomagame_day79_hs');
        if (hs) state.highScore = parseInt(hs, 10);
    } catch(e) {}
  }

  function startGame() {
    ensureAudio();
    if (!audioCtx) return;
    
    state.running = true;
    state.score = 0;
    state.combo = 0;
    notes.length = 0;
    currentBeat = 0;
    
    scoreEl.textContent = "0";
    comboEl.textContent = "x0";
    overlay.classList.add('hidden');
    
    nextNoteTime = audioCtx.currentTime + 1.0; // Start in 1 sec
    
    scheduler();
    markPlayed();
    requestAnimationFrame(loop);
  }
  
  function gameOver() {
      state.running = false;
      overlay.classList.remove('hidden');
      overlay.classList.remove('hidden');
      
      // HS Check
      let isNewRecord = false;
      if (state.score > state.highScore) {
          state.highScore = state.score;
          isNewRecord = true;
          try { localStorage.setItem('aomagame_day79_hs', state.highScore); } catch(e){}
      }
      
      const title = isNewRecord ? "NEW RECORD!" : "TRACK COMPLETE";
      root.querySelector('h2').textContent = title;
      root.querySelector('p').innerHTML = `SCORE: <span style="font-size:1.5em">${state.score}</span><br>HIGH SCORE: ${state.highScore}<br>MAX COMBO: ${state.maxCombo || state.combo}`;
      startBtn.textContent = "REPLAY";
      if (timerID) clearTimeout(timerID);
  }

  function updatePlayCount() {
    const counterEl = getPlayCountEl();
    if (!counterEl) return;
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (typeof key !== 'string' || !key.startsWith('aomagame:played:')) continue;
        const value = parseInt(localStorage.getItem(key) || '0', 10);
        if (!isNaN(value) && value > 0) total++;
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
1. ビート（リズム）に合わせて、青い光の玉が中央のサークルに向かって飛んできます。
2. 光の玉が**中央の紫のリング（判定ライン）に重なった瞬間**に、画面のどこでもいいのでタップ（またはクリック、スペースキー）してください。
3. タイミングが合うとスコア＆コンボが増えます。
3. タイミングが合うとスコア＆コンボが増えます。
4. 全8小節をプレイしてハイスコアを目指しましょう！
5. **※重要：** 音ゲーなので、音を出してプレイしてください。

## 実装メモ
- Web Audio APIの `currentTime` を基準にした高精度スケジューリングシステムを実装。
- シンセサイザー（Oscillator）でリアルタイムにドラム音（Kick, Snare, Hihat）を合成・演奏しています。
- 描画は `time` ベースで補間しているため、ラグがあっても音楽とノーツの位置ズレが最小限になるように設計されています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
