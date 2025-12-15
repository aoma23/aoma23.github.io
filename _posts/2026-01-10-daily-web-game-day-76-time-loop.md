---
title: "毎日ゲームチャレンジ Day 76: タイム・ループ (Time Loop)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

76日目は「タイム・ループ」。
一人では解けないパズルも、過去の自分と協力すれば解けるはず。
行動を記録し、ループを重ねて全てのスイッチを押してください。

<style>
#loop-game {
  width: 100%;
  max-width: 600px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 4px;
  background: #2e2e3a;
  color: #fff;
  font-family: "Courier New", monospace;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  border: 4px double #88f;
  min-height: 380px;
  display: flex; flex-direction: column; justify-content: center;
}
#loop-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  display: block;
  background: #333;
  cursor: default;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#loop-game .hud {
  position: absolute;
  top: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-weight: bold;
  font-size: 1.2rem;
  z-index: 10;
  text-shadow: 1px 1px 0 #000;
}
#loop-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(46, 46, 58, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
#loop-game .start-overlay.hidden { display: none; }
#loop-game button.primary {
  border: 2px solid #bbf;
  background: transparent;
  color: #bbf;
  padding: 8px 24px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
}
  background: #bbf;
  color: #223;
}
#loop-game button.secondary {
  border: 4px solid #f88;
  background: transparent;
  color: #f88;
  padding: 8px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 5px;
  transition: all 0.2s;
  opacity: 0.8;
}
#loop-game button.secondary:hover {
  background: #f88;
  color: #220;
  opacity: 1;
}
#loop-game .btn-group {
    display: flex; gap: 10px; flex-direction: column; align-items: center;
}
#loop-game h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #bbf;
}
#loop-game .controls {
  position: absolute;
  bottom: 20px;
  left: 0; right: 0;
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  z-index: 15;
  pointer-events: none; /* Let clicks pass through if not on btn */
}
#loop-game .d-pad-horiz {
  display: flex;
  gap: 20px;
  pointer-events: auto;
}
#loop-game .action-pad {
  display: flex;
  gap: 20px;
  pointer-events: auto;
}
#loop-game .ctrl-btn {
  width: 70px; height: 70px;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  border-radius: 50%;
  display: flex;
  align-items: center; justify-content: center;
  font-size: 30px;
  cursor: pointer;
  user-select: none;
  color: #fff;
  touch-action: none;
}
#loop-game .ctrl-btn:active, .ctrl-btn.active { background: rgba(255,255,255,0.5); }
#loop-game .action-btn {
  width: 60px; height: 60px;
  border-radius: 50%;
  border: 2px solid #aaa;
  background: rgba(0, 0, 0, 0.5);
  color: #aaa;
  font-weight: bold;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  pointer-events: auto;
}
#loop-game .action-btn:active { background: #555; color: #fff; }

</style>
<style>
@media (max-width: 480px) {
  #loop-game { min-height: 360px; display: flex; flex-direction: column; justify-content: center; }
  #loop-game h2 { font-size: 1.8rem; }
  #loop-game p { font-size: 0.85rem; margin-bottom: 10px; max-width: 90%; }
  #loop-game button.primary { padding: 10px 24px; font-size: 1rem; margin-top: 10px; }
  #loop-game .controls { bottom: 20px; padding: 0 10px; justify-content: space-between; }
  #loop-game .ctrl-btn { width: 50px; height: 50px; font-size: 20px; }
  #loop-game .hud { top: 5px; font-size: 1rem; }
  #loop-game .action-btn { width: 40px; height: 40px; font-size: 10px; }
}
</style>

<div id="loop-game">
  <canvas class="game-canvas" width="600" height="340"></canvas>
  <div class="hud">
    <div class="loop-count">LOOP: 1/3</div>
    <div class="timer">REC: 0s</div>
  </div>
  
  <div class="controls">
    <div class="d-pad-horiz">
      <div class="ctrl-btn" data-key="ArrowLeft">←</div>
      <div class="ctrl-btn" data-key="ArrowRight">→</div>
    </div>
    
    <!-- Center Utils -->
    <div style="display:flex; gap:10px; align-items:center;">
        <div class="action-btn" id="tl-reset-btn">RST</div>
        <div class="action-btn" id="tl-skip-btn" style="border-color:#8f8; color:#8f8;">SKIP</div>
    </div>

    <div class="action-pad">
      <div class="ctrl-btn" data-key="ArrowUp" style="border-color:#f88; color:#f88">J</div>
    </div>
  </div>

  <div class="start-overlay">
    <h2>TIME LOOP</h2>
    <p style="margin-bottom:20px;color:#ccc">
      Cooperate with your past self.<br>
      Loop 1: Press Button A<br>
      Loop 2: Press Button B<br>
      Door Opens.
    </p>
    <div class="btn-group">
        <button class="primary" id="tl-start-btn">START RECORDING</button>
        <button class="secondary hidden" id="tl-restart-btn">RESTART GAME</button>
        <button class="primary hidden" id="tl-retry-level-btn">RETRY LEVEL</button>
    </div>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('loop-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const loopEl = root.querySelector('.loop-count');
  const timerEl = root.querySelector('.timer');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('tl-start-btn');
  const retryBtn = document.getElementById('tl-retry-level-btn');
  const restartBtn = document.getElementById('tl-restart-btn');
  const resetBtn = document.getElementById('tl-reset-btn');
  const skipBtn = document.getElementById('tl-skip-btn');
  const ctrlBtns = root.querySelectorAll('.ctrl-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
  const PLAYED_KEY = 'aomagame:played:time-loop';

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

    if (type === 'jump') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.1);
      osc.frequency.setValueAtTime(659, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'switch') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  };

  // Game Logic
  const TILE_SIZE = 40;
  const PLAYER_SIZE = 30;
  
  const state = {
    running: false,
    level: 1,
    loop: 1, // 1, 2, 3
    maxLoops: 3,
    frame: 0,
    maxFrames: 300, // 5 seconds? Let's say 10s = 600 frames
    recordings: [], // [ [frame0State, frame1State...], ... ] for previous loops
    currentRecording: [], // [frame0State...]
    player: { x: 0, y: 0, vx: 0, vy: 0, grounded: false },
    keys: { up: false, down: false, left: false, right: false },
    levelData: null,
    doorOpen: false,
    finished: false
  };

  // Simple Physics
  const GRAVITY = 0.5;
  const JUMP = -10;
  const SPEED = 4;

  const MAPS = [
    // Level 1: 2 Buttons
    [
      "W.............W",
      "W.............W",
      "W.............W",
      "W.............W",
      "W..A.......B..W",
      "WWWWWWWWWWWWWWW",
      "WWWWWWWWWWWWWWW"
    ],
    // Level 2: 3 Buttons, platforms
    [
        "W.............W",
        "W..A..........W",
        "WWWWW.........W",
        "W.........B...W",
        "W.......WWWW..W",
        "W..C..........W",
        "WWWWWWWWWWWWWWW"
    ],
    // Level 3: The Cage (3 switches, more platforms)
    [
        "W.............W",
        "W..A.......B..W",
        "W..WWW...WWW..W",
        "W.............W",
        "W......C......W",
        "WWWWWWWWWWWWWWW"
    ],
    // Level 4: The Tower (User Request)
    [
        "W.............W",
        "W..........C..W",
        "W..A..........W",
        "W..WWW....WW..W",
        "W.......W.....W",
        "W.............W",
        "WWWWWWWWWWW..BW",
        "W.............W"
    ]
  ];

  function loadLevel(lvlIdx) {
    const strMap = MAPS[lvlIdx % MAPS.length];
    const map = [];
    const switches = [];
    let startX = 50, startY = 50;
    
    // Parse
    for(let r=0; r<strMap.length; r++) {
        const row = strMap[r];
        for(let c=0; c<row.length; c++) {
            const ch = row[c];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            
            if (ch === 'W') {
                map.push({x, y, type: 'wall'});
            } else if (ch === 'A' || ch === 'B' || ch === 'C') {
                switches.push({x: x+5, y: y+30, w: 30, h: 10, id: ch, pressed: false});
            }
        }
    }
    
    state.levelData = {
        map, 
        switches, 
        startX: 50, 
        startY: 150, 
        exit: {x: 500, y: 140, w: 40, h: 60}
    };
    
    // Determine max frames based on level size? Constant 15s = 900f
    state.maxFrames = 900;
    
    // Dynamic Max Loops: 1 per switch + 1 for clearing
    // Level 1: 2 switches -> 3 loops
    // Level 2: 3 switches -> 4 loops! (Fix for unsolvable issue)
    state.maxLoops = switches.length + 1;
  }

  function resetLoop() {
    state.frame = 0;
    state.currentRecording = [];
    state.player.x = state.levelData.startX;
    state.player.y = state.levelData.startY;
    state.player.vx = 0;
    state.player.vy = 0;
    
    // Reset switches
    state.levelData.switches.forEach(s => s.pressed = false);
  }

  function update() {
    if (state.frame >= state.maxFrames) {
        finishLoop();
        return;
    }

    // 1. Move Player
    state.player.vy += GRAVITY;
    if (state.player.vy > 12) state.player.vy = 12; // Terminal Velocity to prevent tunneling
    
    if (state.keys.left) state.player.vx = -SPEED;
    else if (state.keys.right) state.player.vx = SPEED;
    else state.player.vx = 0;
    
    if (state.keys.up && state.player.grounded) {
        state.player.vy = JUMP;
        state.player.grounded = false;
        playTone('jump');
    }

    state.player.x += state.player.vx;
    state.player.y += state.player.vy;
    
    // Collision Wall
    state.player.grounded = false;
    checkWallCollision(state.player);

    // 2. Record State
    state.currentRecording.push({
        x: state.player.x,
        y: state.player.y,
        vx: state.player.vx, // for animation
        grounded: state.player.grounded
    });

    // 3. Replay Ghosts and Check Switches
    // Reset switch state to re-evaluate every frame
    const switchStatus = {}; // id -> bool
    state.levelData.switches.forEach(s => switchStatus[s.id] = false);

    // Helper to check rect overlap
    const checkSwitch = (entityRect) => {
        state.levelData.switches.forEach(s => {
            if (rectOverlap(entityRect, s)) {
                switchStatus[s.id] = true;
            }
        });
    };

    // Check Current Player
    checkSwitch({x: state.player.x, y: state.player.y, w: PLAYER_SIZE, h: PLAYER_SIZE});

    // Check Ghosts
    state.recordings.forEach(rec => {
        if (state.frame < rec.length) {
            const frameData = rec[state.frame];
            checkSwitch({x: frameData.x, y: frameData.y, w: PLAYER_SIZE, h: PLAYER_SIZE});
        }
    });

    // Update Switch Visuals
    let allPressed = true;
    state.levelData.switches.forEach(s => {
        const wasPressed = s.pressed;
        s.pressed = switchStatus[s.id];
        if (!s.pressed) allPressed = false;
        if (s.pressed && !wasPressed) playTone('switch');
    });
    
    state.doorOpen = allPressed;
    
    // Check Exit
    if (state.doorOpen) {
        if (rectOverlap(
            {x: state.player.x, y: state.player.y, w: PLAYER_SIZE, h: PLAYER_SIZE},
            state.levelData.exit
        )) {
            // Level Clear logic?
            // Actually, if door opens, that implies success?
            // Let's require reaching exit.
            winLevel();
            return;
        }
    }

    state.frame++;
    
    // UI
    const timeLeft = ((state.maxFrames - state.frame) / 60).toFixed(1);
    timerEl.textContent = `REC: ${timeLeft}s`;
    
    if (state.loop <= state.maxLoops) {
        loopEl.textContent = `LOOP: ${state.loop}/${state.maxLoops}`;
    }
  }
  
  function checkWallCollision(ent) {
      // Very simple AABB vs Tiles
      // ent: {x, y, vx, vy, ...} size PLAYER_SIZE
      const pad = 2; // epsilon
      const rect = {x: ent.x + pad, y: ent.y + pad, w: PLAYER_SIZE - pad*2, h: PLAYER_SIZE - pad*2};
      
      state.levelData.map.forEach(w => {
          if (rectOverlap(rect, {x: w.x, y: w.y, w: TILE_SIZE, h: TILE_SIZE})) {
              // Resolve
              // Determine direction?
              // Simple: reset to prev?
              // This is tricky. Let's do simple floor/ceil/wall check.
              
              // Only floors for simplicity in this MVP?
              // If vy > 0 and was above...
              // Let's cheat: simple platformer logic is hard in single block.
              
              // Resolve Y
              const prevY = ent.y - ent.vy;
              const tolerance = 15.0; // Allow slight penetration for "was above" check

              // Check if we were generally above the floor
              if (prevY + PLAYER_SIZE <= w.y + tolerance && ent.vy >= 0) {
                  // Hit Top (Floor)
                  ent.y = w.y - PLAYER_SIZE;
                  ent.vy = 0;
                  ent.grounded = true;
              } else if (prevY >= w.y + TILE_SIZE - tolerance && ent.vy <= 0) {
                  // Hit Bottom (Ceiling)
                  ent.y = w.y + TILE_SIZE;
                  ent.vy = 0;
              } else {
                 // Hit Side or deep penetration fallback
                 const prevX = ent.x - ent.vx;
                 if (prevX + PLAYER_SIZE <= w.x + tolerance) {
                     ent.x = w.x - PLAYER_SIZE;
                     ent.vx = 0;
                 } else if (prevX >= w.x + TILE_SIZE - tolerance) {
                     ent.x = w.x + TILE_SIZE;
                     ent.vx = 0;
                 } else {
                     // Fallback: If we are here, we are deep inside.
                     // Push out smallest axis? 
                     // For this game, vertical push is most common fix for floors.
                     if (ent.vy > 0) { // likely falling logic
                        ent.y = w.y - PLAYER_SIZE;
                        ent.vy = 0;
                        ent.grounded = true;
                     }
                 }
              }
          }
      });
      // Screen bounds
      if (ent.x < 0) ent.x = 0;
      if (ent.x > canvas.width - PLAYER_SIZE) ent.x = canvas.width - PLAYER_SIZE;
      if (ent.y > canvas.height) { // Fall death
          // End loop (count as used)
          finishLoop();
      }
  }

  function rectOverlap(r1, r2) {
      return r1.x < r2.x + r2.w && r1.x + r1.w > r2.x &&
             r1.y < r2.y + r2.h && r1.y + r1.h > r2.y;
  }

  function finishLoop() {
    if (state.finished) return;
    
    // Save recording
    state.recordings.push([...state.currentRecording]);
    
    // Next Loop
    if (state.loop < state.maxLoops) {
        state.loop++;
        resetLoop();
        // Feedback
        overlay.classList.remove('hidden');
        root.querySelector('h2').textContent = "LOOP END";
        root.querySelector('p').innerHTML = `Prepare for Loop ${state.loop}.<br>Previous ghosts will replay.`;
        startBtn.textContent = "START NEXT LOOP";
        state.running = false;
    } else {
        // Failed
        state.running = false;
        overlay.classList.remove('hidden');
        root.querySelector('h2').textContent = "TIME PARADOX";
        root.querySelector('p').innerHTML = "Maximum loops reached.<br>Mission Failed.";
        
        // Show options
        startBtn.classList.add('hidden');
        retryBtn.classList.remove('hidden');
        restartBtn.classList.remove('hidden');
        
        retryBtn.onclick = () => {
            retryLevel();
        };
        restartBtn.onclick = () => {
            resetGame();
        };
    }
  }
  
  function winLevel() {
      state.finished = true;
      state.running = false;
      playTone('complete');
      overlay.classList.remove('hidden');
      root.querySelector('h2').textContent = "SEQUENCE SECURED";
      root.querySelector('p').innerHTML = `Level ${state.level} Complete.`;
      
      startBtn.textContent = "NEXT LEVEL";
      
      // Game Clear Check
      if (state.level >= MAPS.length) {
          root.querySelector('h2').textContent = "MISSION COMPLETE";
          root.querySelector('p').innerHTML = `All Levels Cleared!`;
          startBtn.textContent = "PLAY AGAIN";
          startBtn.onclick = resetGame;
          return;
      }
      
      startBtn.onclick = () => {
          state.level++;
          state.recordings = [];
          state.loop = 1;
          state.finished = false;
          loadLevel(state.level - 1);
          startGame();
          startBtn.onclick = startGame; // reset handler
      };
  }

  function retryLevel() {
      state.recordings = [];
      state.loop = 1;
      state.finished = false;
      loadLevel(state.level - 1); // Reload current
      startGame();
  }

  function resetGame() {
    state.level = 1;
    state.recordings = [];
    state.loop = 1;
    state.finished = false;
    loadLevel(0);
    startGame();
  }

  function draw() {
    // BG
    ctx.fillStyle = '#223';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Map
    ctx.fillStyle = '#557';
    state.levelData.map.forEach(w => {
        ctx.fillRect(w.x, w.y, TILE_SIZE, TILE_SIZE);
        // Outline
        ctx.strokeStyle = '#66a';
        ctx.strokeRect(w.x, w.y, TILE_SIZE, TILE_SIZE);
    });

    // Switches
    state.levelData.switches.forEach(s => {
        ctx.fillStyle = s.pressed ? '#0f0' : '#f00';
        ctx.fillRect(s.x, s.y + (s.pressed ? 5 : 0), s.w, s.h - (s.pressed ? 5 : 0));
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(s.id, s.x+10, s.y-5);
    });
    
    // Exit Door
    ctx.fillStyle = state.doorOpen ? '#0ff' : '#444';
    ctx.fillRect(state.levelData.exit.x, state.levelData.exit.y, state.levelData.exit.w, state.levelData.exit.h);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(state.levelData.exit.x, state.levelData.exit.y, state.levelData.exit.w, state.levelData.exit.h);

    // Ghosts
    ctx.globalAlpha = 0.4;
    state.recordings.forEach((rec, idx) => {
        if (state.frame < rec.length) {
            const g = rec[state.frame];
            ctx.fillStyle = '#caf'; // Ghost color
            ctx.fillRect(g.x, g.y, PLAYER_SIZE, PLAYER_SIZE);
            // Label
            ctx.fillStyle = '#fff';
            ctx.fillText(`L${idx+1}`, g.x, g.y - 5);
        }
    });
    ctx.globalAlpha = 1.0;

    // Player
    ctx.fillStyle = '#fff';
    ctx.fillRect(state.player.x, state.player.y, PLAYER_SIZE, PLAYER_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(state.player.x, state.player.y, PLAYER_SIZE, PLAYER_SIZE);
    
    // Timer bar
    const ratio = state.frame / state.maxFrames;
    ctx.fillStyle = '#f00';
    ctx.fillRect(0, canvas.height - 5, canvas.width * ratio, 5);
  }

  function loop() {
    if (state.running) {
        update();
    }
    // Always draw?
    if (state.running || !overlay.classList.contains('hidden')) draw(); // Draw last state behind overlay
    
    requestAnimationFrame(loop);
  }

  // Inputs
  function setKey(k, v) {
      if (k === 'ArrowUp') state.keys.up = v;
      if (k === 'ArrowDown') state.keys.down = v;
      if (k === 'ArrowLeft') state.keys.left = v;
      if (k === 'ArrowRight') state.keys.right = v;
  }
  
  window.addEventListener('keydown', e => setKey(e.code, true));
  window.addEventListener('keyup', e => setKey(e.code, false));

  // Touch UI
  ctrlBtns.forEach(btn => {
      const k = btn.dataset.key;
      const handle = (down) => {
          setKey(k, down);
          if(down) btn.classList.add('active');
          else btn.classList.remove('active');
      };
      
      btn.addEventListener('touchstart', (e) => { e.preventDefault(); handle(true); });
      btn.addEventListener('touchend', (e) => { e.preventDefault(); handle(false); });
      btn.addEventListener('mousedown', (e) => { handle(true); });
      btn.addEventListener('mouseup', (e) => { handle(false); });
      btn.addEventListener('mouseleave', (e) => { handle(false); });
  });
  
  resetBtn.addEventListener('click', () => {
      // Emergency reset current loop
      resetLoop();
  });
  
  skipBtn.addEventListener('click', () => {
      // Fast forward
      if (!state.running || state.finished) return;
      
      // Fill remaining frames with current state
      const remaining = state.maxFrames - state.frame;
      const lastState = {
          x: state.player.x,
          y: state.player.y,
          vx: 0,
          grounded: true
      };
      
      for(let i=0; i<remaining; i++) {
          state.currentRecording.push({...lastState});
      }
      
      state.frame = state.maxFrames; // Will trigger finishLoop next update
  });

  function init() {
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);

    loadLevel(0);
    requestAnimationFrame(loop);
  }

  function startGame() {
    state.running = true;
    overlay.classList.add('hidden');
    // Hide special buttons, show normal start if needed next time (but next time overlay hidden)
    // Actually we need to reset buttons visibility for next pause/start? 
    // Wait, overlay is hidden. When shown again, we set visibility.
    // Ensure default state creates correct buttons?
    startBtn.classList.remove('hidden');
    retryBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    
    resetLoop();
    markPlayed();
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
1. ゲーム開始！[LOOP 1] では、まずスイッチAを踏みに行きましょう。
2. 時間が来ると [LOOP 2] に突入します。
3. すると、**さっきの自分（ゴースト）が現れてスイッチAを踏んでくれます**。
4. その隙に、今の自分はスイッチBを踏みに行きます。
5. 全てのスイッチが同時に押されるとドアが開きます。ドアに入ればクリア！

## 実装メモ
- 入力情報のレコーディングと再生システムを実装。 `state.recordings` に毎フレームの座標を保存し、次ループで描画・当たり判定に使用。
- 時間軸を共有する「過去の自分との協力プレイ」を実現。
- 3ループ以内に解けないとタイムパラドックス（ゲームオーバー）になります。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
