---
title: "毎日ゲームチャレンジ Day 65: キリンのフルーツタワー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

65日目は「キリンのフルーツタワー」。長い首のキリンで高い木から落ちてくるフルーツをキャッチ！左右移動と首の上下でフルーツを集めよう！

<style>
#giraffe-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 28px 52px rgba(15, 23, 42, 0.38);
}
#giraffe-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #giraffe-game .hud {
    font-size: 0.82rem;
  }
}
#giraffe-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: auto;
  aspect-ratio: 460 / 420;
  margin: 0 auto;
  background: linear-gradient(180deg, #7dd3fc 0%, #fde68a 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#giraffe-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#giraffe-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#giraffe-game .share button {
  border: none;
  border-radius: 9999px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #facc15, #f97316);
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(249, 115, 22, 0.32);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#giraffe-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#giraffe-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="giraffe-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">スワイプ/キーでキリンを動かしてフルーツをキャッチ！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('giraffe-game');
  if (!root) return;

  const canvas = root.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const START_BUTTON = {
    x: canvas.width / 2 - 80,
    y: canvas.height / 2 - 30,
    width: 160,
    height: 60
  };

  const storageKey = 'aomagame:best:giraffe';
  const playedKey = 'aomagame:played:giraffe';

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    combo: 0,
    lastCatchTime: 0,
    touchStartX: 0,
    touchStartY: 0,
    giraffe: {
      x: 230,
      y: 340,
      neckHeight: 80,
      targetNeckHeight: 80,
      maxNeckHeight: 150,
      minNeckHeight: 40,
      vx: 0,
      speed: 6
    },
    fruits: [],
    particles: [],
    storageAvailable: false
  };

  const FRUIT_TYPES = [
    { name: 'apple', color: '#ef4444', score: 10, size: 10 },
    { name: 'orange', color: '#f97316', score: 15, size: 12 },
    { name: 'banana', color: '#fbbf24', score: 20, size: 14 },
    { name: 'grape', color: '#a855f7', score: 25, size: 8 }
  ];

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    move: { frequency: 380, duration: 0.08, gain: 0.14 },
    fruit: { frequency: 640, duration: 0.12, gain: 0.2 },
    special: { frequency: 880, duration: 0.15, gain: 0.22 }
  };

  const ensureAudio = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    if (!audioCtx) audioCtx = new Context();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  };

  const playTone = (type) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.fruit;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(env).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  };

  const detectStorage = () => {
    try {
      const testKey = `${storageKey}-test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      state.storageAvailable = true;
    } catch (error) {
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
      bestEl.textContent = `最高: ${state.best}`;
      shareButton.disabled = false;
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
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (typeof key !== 'string' || !key.startsWith('aomagame:played:')) continue;
        const value = Number.parseInt(localStorage.getItem(key) ?? '0', 10);
        if (!Number.isNaN(value) && value > 0) total += 1;
      }
      counterEl.textContent = total;
    } catch (error) {
      counterEl.textContent = '0';
    }
  };

  const markPlayed = () => {
    if (!state.storageAvailable) return;
    try {
      const current = Number.parseInt(localStorage.getItem(playedKey) ?? '0', 10);
      const next = Number.isNaN(current) ? 1 : current + 1;
      localStorage.setItem(playedKey, String(next));
    } catch (error) {
      return;
    }
    updatePlayCount();
  };

  const updateHud = () => {
    const remaining = state.running ? Math.max(0, state.timeLimit - (performance.now() - state.startTime) / 1000) : state.timeLimit;
    timeEl.textContent = `残り: ${remaining.toFixed(1)}秒`;
    scoreEl.textContent = `得点: ${state.score}`;
    bestEl.textContent = `最高: ${state.best}`;
  };

  const spawnFruit = () => {
    const fruitType = FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
    const x = 50 + Math.random() * (canvas.width - 100);
    const speed = 2 + Math.random() * 2;

    state.fruits.push({
      x,
      y: 20,
      vy: speed,
      type: fruitType,
      collected: false
    });
  };

  const createParticles = (x, y, color, count = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 2),
        vy: Math.sin(angle) * (2 + Math.random() * 2) - 1,
        life: 1,
        color
      });
    }
  };

  const checkCatch = () => {
    const headX = state.giraffe.x;
    const headY = state.giraffe.y - state.giraffe.neckHeight - 20;

    for (const fruit of state.fruits) {
      if (fruit.collected) continue;

      const dist = Math.hypot(fruit.x - headX, fruit.y - headY);
      if (dist < 25) {
        fruit.collected = true;

        // 首伸ばしボーナス（首が伸びている時は1.5倍）
        const neckBonus = state.giraffe.neckHeight > 100 ? 1.5 : 1;
        const baseScore = Math.floor(fruit.type.score * neckBonus);

        // コンボシステム
        const now = performance.now();
        if (now - state.lastCatchTime < 2000) {
          state.combo++;
        } else {
          state.combo = 1;
        }
        state.lastCatchTime = now;

        const comboBonus = state.combo > 1 ? (state.combo - 1) * 5 : 0;
        const totalScore = baseScore + comboBonus;

        state.score += totalScore;

        createParticles(fruit.x, fruit.y, fruit.type.color, 10);

        let message = '';
        if (neckBonus > 1) message += '🦒首伸ばし！';
        if (state.combo > 1) message += `🔥×${state.combo}コンボ！`;
        if (fruit.type.score >= 20) {
          playTone('special');
          message += `${fruit.type.name}！`;
        } else {
          playTone('fruit');
        }
        message += `+${totalScore}点`;
        logEl.textContent = message;

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
      }
    }
  };

  const drawGiraffe = () => {
    const g = state.giraffe;

    // 体
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(g.x, g.y, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // スポット
    ctx.fillStyle = '#92400e';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spotX = g.x + Math.cos(angle) * 15;
      const spotY = g.y + Math.sin(angle) * 20;
      ctx.beginPath();
      ctx.arc(spotX, spotY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 首
    const neckWidth = 12;
    const neckTop = g.y - g.neckHeight;

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(g.x - neckWidth / 2, neckTop, neckWidth, g.neckHeight);

    // 首のスポット
    ctx.fillStyle = '#92400e';
    const spots = Math.floor(g.neckHeight / 20);
    for (let i = 0; i < spots; i++) {
      const spotY = neckTop + (i + 1) * 20;
      ctx.beginPath();
      ctx.arc(g.x - 3, spotY, 3, 0, Math.PI * 2);
      ctx.arc(g.x + 3, spotY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 頭
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(g.x, neckTop - 10, 15, 0, Math.PI * 2);
    ctx.fill();

    // 角
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.moveTo(g.x - 8, neckTop - 18);
    ctx.lineTo(g.x - 8, neckTop - 25);
    ctx.arc(g.x - 8, neckTop - 27, 3, 0, Math.PI * 2);
    ctx.moveTo(g.x + 8, neckTop - 18);
    ctx.lineTo(g.x + 8, neckTop - 25);
    ctx.arc(g.x + 8, neckTop - 27, 3, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(g.x - 5, neckTop - 12, 2, 0, Math.PI * 2);
    ctx.arc(g.x + 5, neckTop - 12, 2, 0, Math.PI * 2);
    ctx.fill();

    // 鼻
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(g.x, neckTop - 6, 3, 0, Math.PI * 2);
    ctx.fill();

    // 足
    ctx.fillStyle = '#92400e';
    ctx.fillRect(g.x - 15, g.y + 30, 8, 25);
    ctx.fillRect(g.x + 7, g.y + 30, 8, 25);
  };

  const drawFruit = (fruit) => {
    if (fruit.collected) return;

    ctx.fillStyle = fruit.type.color;
    ctx.beginPath();

    if (fruit.type.name === 'banana') {
      // バナナの形
      ctx.arc(fruit.x, fruit.y, fruit.type.size, 0.3, Math.PI - 0.3);
      ctx.fill();
    } else if (fruit.type.name === 'grape') {
      // ブドウ（小さい円の集まり）
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 2; j++) {
          ctx.beginPath();
          ctx.arc(fruit.x - 4 + j * 8, fruit.y - 4 + i * 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // リンゴとオレンジ
      ctx.arc(fruit.x, fruit.y, fruit.type.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 葉っぱ
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(fruit.x, fruit.y - fruit.type.size, 4, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTrees = () => {
    // 左の木
    ctx.fillStyle = '#78716c';
    ctx.fillRect(30, 60, 15, 100);

    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(37, 50 + i * 20, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // 右の木
    ctx.fillStyle = '#78716c';
    ctx.fillRect(canvas.width - 45, 60, 15, 100);

    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(canvas.width - 37, 50 + i * 20, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawParticles = () => {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      ctx.fillStyle = `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // 重力
      p.life -= 0.02;

      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  };

  const drawStartButton = () => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(202, 138, 4, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const buttonText = state.firstPlay ? 'スタート' : 'リトライ';
    ctx.fillText(buttonText, START_BUTTON.x + START_BUTTON.width / 2, buttonY + START_BUTTON.height / 2);
  };

  const draw = () => {
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#7dd3fc');
    gradient.addColorStop(1, '#fde68a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTrees();

    for (const fruit of state.fruits) {
      drawFruit(fruit);
    }

    drawGiraffe();
    drawParticles();

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('タイムアップ', canvas.width / 2, canvas.height / 2 - 60);
      ctx.font = '16px sans-serif';
      ctx.fillText(`得点: ${state.score}`, canvas.width / 2, canvas.height / 2 - 30);
    }

    if (!state.running && (!state.gameOver || state.showRetryButton)) {
      drawStartButton();
    }
  };

  const gameLoop = () => {
    if (!state.running || state.gameOver) return;

    const elapsed = (performance.now() - state.startTime) / 1000;
    if (elapsed >= state.timeLimit) {
      endGame();
      return;
    }

    // キリンの移動
    state.giraffe.x += state.giraffe.vx;
    state.giraffe.x = Math.max(60, Math.min(canvas.width - 60, state.giraffe.x));

    // 首の高さを滑らかに変更
    const neckDiff = state.giraffe.targetNeckHeight - state.giraffe.neckHeight;
    state.giraffe.neckHeight += neckDiff * 0.15;

    // フルーツの落下
    for (let i = state.fruits.length - 1; i >= 0; i--) {
      state.fruits[i].y += state.fruits[i].vy;
      if (state.fruits[i].y > canvas.height + 20 || state.fruits[i].collected) {
        state.fruits.splice(i, 1);
      }
    }

    // ランダムにフルーツ生成
    if (Math.random() < 0.025) {
      spawnFruit();
    }

    checkCatch();

    draw();
    updateHud();
    requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    state.running = false;
    state.gameOver = true;
    state.showRetryButton = false;
    logEl.textContent = `タイムアップ！得点: ${state.score}`;
    updateHud();
    draw();
    setTimeout(() => {
      state.showRetryButton = true;
      draw();
    }, 1000);
  };

  const isClickOnStartButton = (x, y) => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;
    return x >= START_BUTTON.x && x <= START_BUTTON.x + START_BUTTON.width &&
           y >= buttonY && y <= buttonY + START_BUTTON.height;
  };

  const handleCanvasClick = (x, y) => {
    if (!state.running && isClickOnStartButton(x, y)) {
      markPlayed();
      playTone('start');
      state.running = true;
      state.firstPlay = false;
      state.showRetryButton = false;
      state.gameOver = false;
      state.startTime = performance.now();
      state.score = 0;
      state.combo = 0;
      state.lastCatchTime = 0;
      state.giraffe = {
        x: 230,
        y: 340,
        neckHeight: 80,
        targetNeckHeight: 80,
        maxNeckHeight: 150,
        minNeckHeight: 40,
        vx: 0,
        speed: 6
      };
      state.fruits = [];
      state.particles = [];
      logEl.textContent = '左右スワイプで移動、上下で首を伸縮！';
      gameLoop();
    }
  };

  const handleTouchStart = (x, y) => {
    state.touchStartX = x;
    state.touchStartY = y;
    handleCanvasClick(x, y);
  };

  const handleTouchMove = (x, y) => {
    if (!state.running || state.gameOver) return;

    const dx = x - state.touchStartX;
    const dy = y - state.touchStartY;

    // 左右スワイプ
    if (Math.abs(dx) > 10) {
      if (dx > 0) {
        state.giraffe.vx = state.giraffe.speed;
      } else {
        state.giraffe.vx = -state.giraffe.speed;
      }
    }

    // 上下スワイプ
    if (Math.abs(dy) > 20) {
      if (dy < 0) {
        // 上スワイプ - 首を伸ばす
        state.giraffe.targetNeckHeight = state.giraffe.maxNeckHeight;
      } else {
        // 下スワイプ - 首を縮める
        state.giraffe.targetNeckHeight = state.giraffe.minNeckHeight;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!state.running || state.gameOver) return;
    state.giraffe.vx = 0;
    state.giraffe.targetNeckHeight = 80;
  };

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    handleCanvasClick(x, y);
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    handleTouchStart(x, y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    handleTouchMove(x, y);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleTouchEnd();
  }, { passive: false });

  let keysPressed = {};

  document.addEventListener('keydown', (e) => {
    if (!state.running || state.gameOver) return;
    keysPressed[e.key] = true;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      state.giraffe.vx = -state.giraffe.speed;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      state.giraffe.vx = state.giraffe.speed;
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      state.giraffe.targetNeckHeight = state.giraffe.maxNeckHeight;
      playTone('move');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      state.giraffe.targetNeckHeight = state.giraffe.minNeckHeight;
      playTone('move');
    }
  });

  document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;

    const leftPressed = keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A'];
    const rightPressed = keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D'];
    const upPressed = keysPressed['ArrowUp'] || keysPressed['w'] || keysPressed['W'];
    const downPressed = keysPressed['ArrowDown'] || keysPressed['s'] || keysPressed['S'];

    if (!leftPressed && !rightPressed) {
      state.giraffe.vx = 0;
    } else if (leftPressed) {
      state.giraffe.vx = -state.giraffe.speed;
    } else if (rightPressed) {
      state.giraffe.vx = state.giraffe.speed;
    }

    if (!upPressed && !downPressed) {
      state.giraffe.targetNeckHeight = 80;
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `キリンのフルーツタワーで${state.best}点を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  updateHud();
  draw();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートボタンで60秒のチャレンジ開始。
2. PC：左右キー（A/D）で横移動、上下キー（W/S）で首の高さを変更。
3. スマホ：左右スワイプで移動、上下スワイプで首を伸縮。
4. 首を伸ばしてキャッチすると得点1.5倍！🦒
5. 2秒以内に連続キャッチでコンボボーナス！🔥
6. バナナとブドウは高得点！

## 実装メモ
- スワイプ対応でスマホでも快適プレイ
- 首伸ばしボーナス：首が伸びている時は得点1.5倍
- コンボシステム：連続キャッチでボーナス加算
- パーティクルエフェクトで爽快感アップ
- 4種類のフルーツ（リンゴ、オレンジ、バナナ、ブドウ）

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
