---
title: "毎日ゲームチャレンジ Day 50: ゴールデンブレイク"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-49-soldier-rush-final/' | relative_url }}">ソルジャーラッシュFINAL</a>

50日目は記念のレトロゲーム「ゴールデンブレイク」。パドルでボールを跳ね返して50個の金ブロックを全て破壊しよう！6種類のパワーアップを駆使して制限時間内のクリアを目指してください。

<style>
#golden-break-game {
  max-width: 480px;
  margin: 16px auto;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.38);
}
#golden-break-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #golden-break-game .hud {
    font-size: 0.82rem;
  }
}
#golden-break-game .hud span {
  white-space: nowrap;
}
#golden-break-game .game-canvas-container {
  margin: 0 auto;
  background: rgba(30, 41, 59, 0.6);
  padding: 8px;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
  display: flex;
  justify-content: center;
  position: relative;
}
#golden-break-game .game-canvas {
  border-radius: 8px;
  background: #0c0a09;
  display: block;
  max-width: 100%;
  height: auto;
  cursor: none;
  touch-action: none;
}
#golden-break-game .start-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.85);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
#golden-break-game .start-overlay.visible {
  opacity: 1;
  pointer-events: all;
}
#golden-break-game .start-overlay button {
  border: none;
  border-radius: 9999px;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  pointer-events: all;
}
#golden-break-game .start-overlay button:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.4);
}
#golden-break-game .log {
  min-height: 20px;
  color: #f8fafc;
  margin-top: 10px;
  font-size: 0.85rem;
  line-height: 1.4;
}
#golden-break-game .share {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
#golden-break-game .share button {
  border: none;
  border-radius: 9999px;
  padding: 8px 20px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #facc15, #f97316);
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(249, 115, 22, 0.32);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#golden-break-game .share button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#golden-break-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 32px rgba(249, 115, 22, 0.4);
}
</style>

<div id="golden-break-game">
  <div class="hud">
    <span class="time">時間:120秒</span>
    <span class="score">得点:0</span>
    <span class="golden">金:0/50</span>
    <span class="lives">残機:3</span>
    <span class="best">最高:0</span>
  </div>
  <div class="game-canvas-container">
    <canvas class="game-canvas" width="360" height="450"></canvas>
    <div class="start-overlay visible">
      <button type="button" class="start">スタート</button>
    </div>
  </div>
  <p class="log">50個の金ブロックを全て破壊してクリアを目指そう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('golden-break-game');
  if (!root) return;

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const goldenEl = root.querySelector('.golden');
  const livesEl = root.querySelector('.lives');
  const bestEl = root.querySelector('.best');
  const startButton = root.querySelector('.start');
  const startOverlay = root.querySelector('.start-overlay');
  const canvas = root.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:golden-break';
  const playedKey = 'aomagame:played:golden-break';

  const CANVAS_WIDTH = 360;
  const CANVAS_HEIGHT = 450;
  const PADDLE_WIDTH = 70;
  const PADDLE_HEIGHT = 10;
  const BALL_RADIUS = 5;
  const BLOCK_WIDTH = 32;
  const BLOCK_HEIGHT = 14;
  const BLOCK_PADDING = 4;
  const INITIAL_LIVES = 3;
  const TIME_LIMIT = 120;
  const GOLDEN_TARGET = 50;
  const PADDLE_SPEED = 8;

  const state = {
    running: false,
    startTime: 0,
    score: 0,
    best: 0,
    lives: INITIAL_LIVES,
    goldenBroken: 0,
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 35, width: PADDLE_WIDTH },
    balls: [],
    blocks: [],
    powerups: [],
    lasers: [],
    laserActive: false,
    laserEndTime: 0,
    mouseX: CANVAS_WIDTH / 2,
    keys: { left: false, right: false, space: false },
    storageAvailable: false,
    penalty: 0
  };

  const soundMap = {
    start: { f: 520, d: 0.18, g: 0.22 },
    paddle: { f: 440, d: 0.08, g: 0.15 },
    block: { f: 660, d: 0.1, g: 0.18 },
    golden: { f: 880, d: 0.15, g: 0.22 },
    powerup: { f: 780, d: 0.12, g: 0.2 },
    laser: { f: 950, d: 0.08, g: 0.18 },
    lose: { f: 200, d: 0.25, g: 0.22 },
    win: { f: 1000, d: 0.3, g: 0.25 }
  };

  let audioCtx = null;

  const playTone = (type) => {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return;
      if (!audioCtx) audioCtx = new Context();
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      const { f, d, g } = soundMap[type] ?? soundMap.block;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      const env = audioCtx.createGain();
      env.gain.setValueAtTime(g, now);
      env.gain.exponentialRampToValueAtTime(0.001, now + d);
      osc.connect(env).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + d + 0.05);
    } catch (e) {}
  };

  const detectStorage = () => {
    try {
      const testKey = `${storageKey}-test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      state.storageAvailable = true;
    } catch (e) {
      state.storageAvailable = false;
    }
  };

  const loadBest = () => {
    if (!state.storageAvailable) return;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value >= 0) {
      state.best = value;
      bestEl.textContent = `最高:${state.best}`;
      if (shareButton) shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!state.storageAvailable) return;
    localStorage.setItem(storageKey, String(state.best));
  };

  const updatePlayCount = () => {
    const counterEl = getPlayCountEl();
    if (!counterEl) return;
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (typeof key === 'string' && key.startsWith('aomagame:played:')) {
          const value = Number.parseInt(localStorage.getItem(key) ?? '0', 10);
          if (!Number.isNaN(value) && value > 0) total += 1;
        }
      }
      counterEl.textContent = total;
    } catch (e) {
      counterEl.textContent = '0';
    }
  };

  const markPlayed = () => {
    if (!state.storageAvailable) return;
    try {
      const current = Number.parseInt(localStorage.getItem(playedKey) ?? '0', 10);
      const next = Number.isNaN(current) ? 1 : current + 1;
      localStorage.setItem(playedKey, String(next));
    } catch (e) {}
    updatePlayCount();
  };

  const setLog = (msg) => { logEl.textContent = msg; };

  const updateHud = () => {
    scoreEl.textContent = `得点:${state.score}`;
    goldenEl.textContent = `金:${state.goldenBroken}/${GOLDEN_TARGET}`;
    livesEl.textContent = `残機:${state.lives}`;
    bestEl.textContent = `最高:${state.best}`;
  };

  const initBlocks = () => {
    state.blocks = [];
    const rows = 10, cols = 9, startY = 50;
    const goldenIndices = new Set();
    while (goldenIndices.size < GOLDEN_TARGET) {
      goldenIndices.add(Math.floor(Math.random() * (rows * cols)));
    }
    let idx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        state.blocks.push({
          x: c * (BLOCK_WIDTH + BLOCK_PADDING) + BLOCK_PADDING,
          y: r * (BLOCK_HEIGHT + BLOCK_PADDING) + startY,
          width: BLOCK_WIDTH,
          height: BLOCK_HEIGHT,
          hp: 1,
          type: goldenIndices.has(idx++) ? 'golden' : 'normal'
        });
      }
    }
  };

  const createBall = (x, y, dx, dy, speed) => ({ x, y, dx, dy, speed });

  const addBall = () => {
    const x = CANVAS_WIDTH / 2;
    const y = CANVAS_HEIGHT - 55;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    const speed = 3.5;
    state.balls.push(createBall(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, speed));
  };

  const remainingTime = () => {
    const elapsed = (performance.now() - state.startTime) / 1000;
    return Math.max(0, TIME_LIMIT - elapsed - state.penalty);
  };

  const destroyBlock = (block) => {
    if (block.type === 'golden') {
      state.goldenBroken += 1;
      state.score += 100;
      playTone('golden');
      if (state.goldenBroken >= GOLDEN_TARGET) {
        winGame();
        return true;
      }
    } else {
      state.score += 10;
      playTone('block');
    }

    if (Math.random() < 0.2) {
      const types = ['wide', 'fast', 'slow', 'multiball', 'laser', 'extra'];
      state.powerups.push({
        x: block.x + block.width / 2,
        y: block.y + block.height / 2,
        type: types[Math.floor(Math.random() * types.length)],
        dy: 2
      });
    }
    return false;
  };

  const checkBallCollision = (ball) => {
    // Paddle collision
    if (ball.y + BALL_RADIUS >= state.paddle.y &&
        ball.y - BALL_RADIUS <= state.paddle.y + PADDLE_HEIGHT &&
        ball.x >= state.paddle.x &&
        ball.x <= state.paddle.x + state.paddle.width) {
      const hitPos = (ball.x - state.paddle.x) / state.paddle.width;
      const angle = -Math.PI / 2 - (hitPos - 0.5) * Math.PI * 0.6;
      ball.dx = Math.cos(angle) * ball.speed;
      ball.dy = Math.sin(angle) * ball.speed;
      ball.y = state.paddle.y - BALL_RADIUS;
      playTone('paddle');
    }

    // Block collision
    for (let i = state.blocks.length - 1; i >= 0; i--) {
      const block = state.blocks[i];
      if (ball.x + BALL_RADIUS >= block.x &&
          ball.x - BALL_RADIUS <= block.x + block.width &&
          ball.y + BALL_RADIUS >= block.y &&
          ball.y - BALL_RADIUS <= block.y + block.height) {
        const dx = ball.x - (block.x + block.width / 2);
        const dy = ball.y - (block.y + block.height / 2);
        if (Math.abs(dx) > Math.abs(dy)) {
          ball.dx = -ball.dx;
        } else {
          ball.dy = -ball.dy;
        }
        const shouldEnd = destroyBlock(block);
        state.blocks.splice(i, 1);
        updateHud();
        if (shouldEnd) return;
        break;
      }
    }
  };

  const updateBalls = () => {
    for (let i = state.balls.length - 1; i >= 0; i--) {
      const ball = state.balls[i];
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x - BALL_RADIUS <= 0 || ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
        ball.dx = -ball.dx;
        ball.x = Math.max(BALL_RADIUS, Math.min(CANVAS_WIDTH - BALL_RADIUS, ball.x));
      }
      if (ball.y - BALL_RADIUS <= 0) {
        ball.dy = -ball.dy;
        ball.y = BALL_RADIUS;
      }

      if (ball.y - BALL_RADIUS > CANVAS_HEIGHT) {
        state.balls.splice(i, 1);
        continue;
      }

      checkBallCollision(ball);
    }

    if (state.balls.length === 0) {
      state.lives -= 1;
      state.penalty += 5;
      playTone('lose');
      if (state.lives <= 0) {
        endGame();
      } else {
        setLog(`ミス！残機:${state.lives}`);
        updateHud();
        addBall();
      }
    }
  };

  const applyPowerup = (type) => {
    playTone('powerup');
    switch (type) {
      case 'wide':
        state.paddle.width = Math.min(130, state.paddle.width + 18);
        setLog('パドル拡大！');
        break;
      case 'fast':
        state.balls.forEach(b => {
          b.speed = Math.min(6, b.speed + 0.5);
          const mag = Math.sqrt(b.dx ** 2 + b.dy ** 2);
          b.dx = (b.dx / mag) * b.speed;
          b.dy = (b.dy / mag) * b.speed;
        });
        setLog('ボール加速！');
        break;
      case 'slow':
        state.balls.forEach(b => {
          b.speed = Math.max(2, b.speed - 0.5);
          const mag = Math.sqrt(b.dx ** 2 + b.dy ** 2);
          b.dx = (b.dx / mag) * b.speed;
          b.dy = (b.dy / mag) * b.speed;
        });
        setLog('ボール減速！');
        break;
      case 'multiball':
        if (state.balls.length > 0 && state.balls.length < 10) {
          const base = state.balls[0];
          for (let i = 0; i < 2; i++) {
            const angle = Math.random() * Math.PI - Math.PI / 2;
            state.balls.push(createBall(
              base.x,
              base.y,
              Math.cos(angle) * base.speed,
              Math.sin(angle) * base.speed,
              base.speed
            ));
          }
          setLog('マルチボール！');
        }
        break;
      case 'laser':
        state.laserActive = true;
        state.laserEndTime = performance.now() + 8000;
        setLog('レーザー発射！');
        break;
      case 'extra':
        state.lives = Math.min(9, state.lives + 1);
        updateHud();
        setLog('残機+1！');
        break;
    }
  };

  const updatePowerups = () => {
    for (let i = state.powerups.length - 1; i >= 0; i--) {
      const p = state.powerups[i];
      p.y += p.dy;
      if (p.y >= state.paddle.y && p.y <= state.paddle.y + PADDLE_HEIGHT &&
          p.x >= state.paddle.x && p.x <= state.paddle.x + state.paddle.width) {
        applyPowerup(p.type);
        state.powerups.splice(i, 1);
      } else if (p.y > CANVAS_HEIGHT) {
        state.powerups.splice(i, 1);
      }
    }
  };

  const fireLaser = () => {
    if (!state.laserActive) return;
    playTone('laser');
    state.lasers.push({
      x: state.paddle.x + state.paddle.width / 2 - 2,
      y: state.paddle.y,
      width: 4,
      height: 12,
      dy: -8
    });
  };

  const updateLasers = () => {
    if (state.laserActive && performance.now() > state.laserEndTime) {
      state.laserActive = false;
    }

    for (let i = state.lasers.length - 1; i >= 0; i--) {
      const laser = state.lasers[i];
      laser.y += laser.dy;

      if (laser.y < 0) {
        state.lasers.splice(i, 1);
        continue;
      }

      for (let j = state.blocks.length - 1; j >= 0; j--) {
        const block = state.blocks[j];
        if (laser.x + laser.width >= block.x &&
            laser.x <= block.x + block.width &&
            laser.y + laser.height >= block.y &&
            laser.y <= block.y + block.height) {
          const shouldEnd = destroyBlock(block);
          state.blocks.splice(j, 1);
          state.lasers.splice(i, 1);
          updateHud();
          if (shouldEnd) return;
          break;
        }
      }
    }
  };

  const getPowerupColor = (type) => {
    switch (type) {
      case 'wide': return '#22c55e';
      case 'fast': return '#ef4444';
      case 'slow': return '#3b82f6';
      case 'multiball': return '#a855f7';
      case 'laser': return '#f59e0b';
      case 'extra': return '#ec4899';
      default: return '#64748b';
    }
  };

  const getPowerupLabel = (type) => {
    switch (type) {
      case 'wide': return 'W';
      case 'fast': return 'F';
      case 'slow': return 'S';
      case 'multiball': return 'M';
      case 'laser': return 'L';
      case 'extra': return 'E';
      default: return '?';
    }
  };

  const render = () => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#0c0a09';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Blocks
    state.blocks.forEach(block => {
      if (block.type === 'golden') {
        const gradient = ctx.createLinearGradient(block.x, block.y, block.x, block.y + block.height);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(1, '#f59e0b');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = '#64748b';
      }
      ctx.fillRect(block.x, block.y, block.width, block.height);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(block.x, block.y, block.width, block.height);
    });

    // Powerups
    state.powerups.forEach(p => {
      ctx.fillStyle = getPowerupColor(p.type);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(getPowerupLabel(p.type), p.x, p.y);
    });

    // Lasers
    state.lasers.forEach(laser => {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 8;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      ctx.shadowBlur = 0;
    });

    // Paddle
    const paddleGradient = ctx.createLinearGradient(0, state.paddle.y, 0, state.paddle.y + PADDLE_HEIGHT);
    paddleGradient.addColorStop(0, state.laserActive ? '#fbbf24' : '#38bdf8');
    paddleGradient.addColorStop(1, state.laserActive ? '#f59e0b' : '#0ea5e9');
    ctx.fillStyle = paddleGradient;
    ctx.fillRect(state.paddle.x, state.paddle.y, state.paddle.width, PADDLE_HEIGHT);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(state.paddle.x, state.paddle.y, state.paddle.width, PADDLE_HEIGHT);

    // Balls
    state.balls.forEach(ball => {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251,191,36,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  };

  const winGame = () => {
    state.running = false;
    startOverlay.classList.add('visible');
    playTone('win');
    setLog(`🎉 クリア！全ての金ブロックを破壊！得点:${state.score}`);
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
      if (shareButton) shareButton.disabled = false;
      updateHud();
    }
  };

  const endGame = () => {
    state.running = false;
    startOverlay.classList.add('visible');
    setLog(`ゲームオーバー！得点:${state.score} 金:${state.goldenBroken}/${GOLDEN_TARGET}`);
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
      if (shareButton) shareButton.disabled = false;
      updateHud();
    }
  };

  let lastLaserFire = 0;

  const gameLoop = () => {
    if (!state.running) return;

    const remaining = remainingTime();
    timeEl.textContent = `時間:${Math.floor(remaining)}秒`;
    if (remaining <= 0) {
      endGame();
      return;
    }

    if (state.keys.left) state.paddle.x -= PADDLE_SPEED;
    if (state.keys.right) state.paddle.x += PADDLE_SPEED;
    state.paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - state.paddle.width, state.paddle.x));

    if (state.keys.space && state.laserActive) {
      const now = performance.now();
      if (now - lastLaserFire > 200) {
        fireLaser();
        lastLaserFire = now;
      }
    }

    updateBalls();
    updatePowerups();
    updateLasers();
    render();

    requestAnimationFrame(gameLoop);
  };

  canvas.addEventListener('mousemove', (e) => {
    if (!state.running) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    state.paddle.x = (e.clientX - rect.left) * scaleX - state.paddle.width / 2;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!state.running) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = CANVAS_WIDTH / rect.width;
    state.paddle.x = (touch.clientX - rect.left) * scaleX - state.paddle.width / 2;
  }, { passive: false });

  canvas.addEventListener('click', () => {
    if (state.running && state.laserActive) fireLaser();
  });

  document.addEventListener('keydown', (e) => {
    if (!state.running) return;
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
      e.preventDefault();
      state.keys.left = true;
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
      e.preventDefault();
      state.keys.right = true;
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      state.keys.space = true;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'Left') state.keys.left = false;
    else if (e.key === 'ArrowRight' || e.key === 'Right') state.keys.right = false;
    else if (e.key === ' ' || e.key === 'Spacebar') state.keys.space = false;
  });

  startButton.addEventListener('click', () => {
    if (state.running) return;
    markPlayed();
    playTone('start');
    state.running = true;
    state.startTime = performance.now();
    state.score = 0;
    state.lives = INITIAL_LIVES;
    state.goldenBroken = 0;
    state.penalty = 0;
    state.paddle.width = PADDLE_WIDTH;
    state.paddle.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    state.balls = [];
    state.powerups = [];
    state.lasers = [];
    state.laserActive = false;
    state.keys = { left: false, right: false, space: false };
    initBlocks();
    addBall();
    updateHud();
    startOverlay.classList.remove('visible');
    setLog('パドルを操作して金ブロックを全て破壊！');
    gameLoop();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `ゴールデンブレイクで${state.best}点を記録！ #aomagame`;
      const url = new URL('https://twitter.com/intent/tweet');
      url.searchParams.set('text', text);
      url.searchParams.set('url', window.location.href);
      window.open(url.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  updateHud();
  render();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートでゲーム開始。パドルを操作してボールを跳ね返します。
2. 金色のブロックを50個全て壊したらクリア！
3. パワーアップ（W:拡大/F:加速/S:減速/M:マルチボール/L:レーザー/E:残機+1）を取って有利に。
4. レーザー取得中はスペースキー/クリック/タップで発射可能。
5. 操作: マウス/タッチ/左右キー、制限時間120秒、残機3つ

## 実装メモ
- レトロなブロック崩しにゴールデンブロック50個という明確な目標を設定
- 6種類のパワーアップでプレイに多様性を追加
- マルチボール、レーザー機能で戦略性が大幅に向上
- キーボード、マウス、タッチの3つの操作方法に対応
- スマホ最適化でゲーム画面を1画面内に収め、スタートボタンはオーバーレイ表示

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
