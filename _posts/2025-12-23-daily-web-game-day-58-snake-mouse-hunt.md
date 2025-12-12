---
title: "毎日ゲームチャレンジ Day 58: ヘビのマウスハント"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

58日目は「ヘビのマウスハント」。60秒以内にできるだけ多くのネズミを捕まえよう！動き回るネズミを追いかけて、食べるごとに体が長くなる！金のネズミは高得点！自分の体に当たるとゲームオーバー！

<style>
#snake-game {
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
#snake-game .hud {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 360px) {
  #snake-game .hud {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (min-width: 400px) {
  #snake-game .hud {
    font-size: 0.82rem;
  }
}
#snake-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: 400px;
  margin: 0 auto;
  background: linear-gradient(180deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#snake-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#snake-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#snake-game .share button {
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
#snake-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#snake-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="snake-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="length">体長: 3</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="400"></canvas>
  <p class="log">60秒で動き回るネズミを追いかけよう！金のネズミは高得点！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('snake-game');
  if (!root) return;

  const canvas = root.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const timeEl = root.querySelector('.time');
  const lengthEl = root.querySelector('.length');
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

  const storageKey = 'aomagame:best:snake';
  const playedKey = 'aomagame:played:snake';

  const SEGMENT_SIZE = 12;

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    gameOverReason: '',
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    snake: [],
    targetX: 230,
    targetY: 200,
    speed: 3,
    mice: [],
    storageAvailable: false,
    keys: { left: false, right: false, up: false, down: false }
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    eat: { frequency: 640, duration: 0.12, gain: 0.2 },
    hit: { frequency: 220, duration: 0.25, gain: 0.2 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.eat;
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
    lengthEl.textContent = `体長: ${state.snake.length}`;
    scoreEl.textContent = `得点: ${state.score}`;
    bestEl.textContent = `最高: ${state.best}`;
  };

  const spawnMouse = () => {
    const x = 30 + Math.random() * (canvas.width - 60);
    const y = 30 + Math.random() * (canvas.height - 60);
    const vx = (Math.random() - 0.5) * 2;
    const vy = (Math.random() - 0.5) * 2;
    const isGolden = Math.random() < 0.15;
    state.mice.push({
      x, y, vx, vy,
      size: 10,
      golden: isGolden,
      caught: false
    });
  };

  const checkMouseEat = () => {
    const head = state.snake[0];
    for (const mouse of state.mice) {
      if (mouse.caught) continue;
      const dist = Math.hypot(mouse.x - head.x, mouse.y - head.y);
      if (dist < 15) {
        mouse.caught = true;
        const points = mouse.golden ? 30 : 10;
        state.score += points;
        playTone('eat');
        if (mouse.golden) {
          logEl.textContent = `金のネズミゲット！+${points}点`;
        } else {
          logEl.textContent = `ネズミゲット！+${points}点`;
        }

        // 体を伸ばす
        const tail = state.snake[state.snake.length - 1];
        state.snake.push({ x: tail.x, y: tail.y });

        // スピード少し上昇
        state.speed = Math.min(6, state.speed + 0.1);

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
        break;
      }
    }
  };

  const checkSelfCollision = () => {
    const head = state.snake[0];
    for (let i = 3; i < state.snake.length; i++) {
      const segment = state.snake[i];
      const dist = Math.hypot(head.x - segment.x, head.y - segment.y);
      if (dist < SEGMENT_SIZE * 0.9) {
        state.running = false;
        state.gameOver = true;
        state.gameOverReason = 'collision';
        state.showRetryButton = false;
        playTone('hit');
        logEl.textContent = '自分の体に当たった！';
        draw();
        window.setTimeout(() => {
          state.showRetryButton = true;
          draw();
        }, 1000);
        return true;
      }
    }
    return false;
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
    ctx.fillStyle = '#eab308';
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

  const drawSnake = () => {
    for (let i = 0; i < state.snake.length; i++) {
      const segment = state.snake[i];

      // 体の色（緑のグラデーション）
      ctx.fillStyle = i === 0 ? '#16a34a' : '#22c55e';
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, SEGMENT_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      // 頭の目
      if (i === 0) {
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(segment.x - 3, segment.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(segment.x + 3, segment.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // 舌
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(segment.x, segment.y + 4);
        ctx.lineTo(segment.x - 2, segment.y + 10);
        ctx.moveTo(segment.x, segment.y + 4);
        ctx.lineTo(segment.x + 2, segment.y + 10);
        ctx.stroke();
      }
    }
  };

  const drawMouse = (mouse) => {
    if (mouse.caught) return;

    const bodyColor = mouse.golden ? '#fbbf24' : '#9ca3af';

    // 体
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(mouse.x, mouse.y, mouse.size, mouse.size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.beginPath();
    ctx.arc(mouse.x - 6, mouse.y - 6, 4, 0, Math.PI * 2);
    ctx.arc(mouse.x + 6, mouse.y - 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(mouse.x - 3, mouse.y - 2, 1.5, 0, Math.PI * 2);
    ctx.arc(mouse.x + 3, mouse.y - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 尻尾
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y + 6);
    ctx.quadraticCurveTo(mouse.x + 10, mouse.y + 10, mouse.x + 15, mouse.y + 5);
    ctx.stroke();
  };

  const draw = () => {
    // 背景
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const mouse of state.mice) {
      drawMouse(mouse);
    }
    drawSnake();

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      const gameOverText = state.gameOverReason === 'timeup' ? 'タイムアップ' : 'ゲームオーバー';
      ctx.fillText(gameOverText, canvas.width / 2, canvas.height / 2 - 60);
      ctx.font = '16px sans-serif';
      ctx.fillText(`得点: ${state.score}`, canvas.width / 2, canvas.height / 2 - 30);
    }

    if (!state.running && (!state.gameOver || state.showRetryButton)) {
      drawStartButton();
    }
  };

  const gameLoop = () => {
    if (!state.running || state.gameOver) return;

    // 時間チェック
    const elapsed = (performance.now() - state.startTime) / 1000;
    if (elapsed >= state.timeLimit) {
      endGame();
      return;
    }

    // キーボード操作
    if (state.keys.left) state.targetX -= 5;
    if (state.keys.right) state.targetX += 5;
    if (state.keys.up) state.targetY -= 5;
    if (state.keys.down) state.targetY += 5;
    state.targetX = Math.max(20, Math.min(canvas.width - 20, state.targetX));
    state.targetY = Math.max(20, Math.min(canvas.height - 20, state.targetY));

    // 頭の移動
    const head = state.snake[0];
    head.x += (state.targetX - head.x) * 0.15;
    head.y += (state.targetY - head.y) * 0.15;

    // 体の追従
    for (let i = 1; i < state.snake.length; i++) {
      const prev = state.snake[i - 1];
      const curr = state.snake[i];
      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      const dist = Math.hypot(dx, dy);

      if (dist > SEGMENT_SIZE) {
        curr.x += (dx / dist) * (dist - SEGMENT_SIZE);
        curr.y += (dy / dist) * (dist - SEGMENT_SIZE);
      }
    }

    // ネズミの移動と壁での反射
    for (let i = state.mice.length - 1; i >= 0; i--) {
      const mouse = state.mice[i];
      if (mouse.caught) {
        state.mice.splice(i, 1);
        continue;
      }

      mouse.x += mouse.vx;
      mouse.y += mouse.vy;

      // 壁で反射
      if (mouse.x <= 20 || mouse.x >= canvas.width - 20) {
        mouse.vx = -mouse.vx;
        mouse.x = Math.max(20, Math.min(canvas.width - 20, mouse.x));
      }
      if (mouse.y <= 20 || mouse.y >= canvas.height - 20) {
        mouse.vy = -mouse.vy;
        mouse.y = Math.max(20, Math.min(canvas.height - 20, mouse.y));
      }
    }

    // ネズミのスポーン（最大7匹まで）
    if (Math.random() < 0.02 && state.mice.filter(m => !m.caught).length < 7) {
      spawnMouse();
    }

    checkMouseEat();
    if (checkSelfCollision()) return;

    draw();
    updateHud();
    requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    state.running = false;
    state.gameOver = true;
    state.gameOverReason = 'timeup';
    state.showRetryButton = false;
    logEl.textContent = `タイムアップ！得点: ${state.score}`;
    updateHud();
    draw();
    window.setTimeout(() => {
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
      state.speed = 3;
      state.targetX = 230;
      state.targetY = 200;
      state.snake = [
        { x: 230, y: 200 },
        { x: 220, y: 200 },
        { x: 210, y: 200 }
      ];
      state.mice = [];
      for (let i = 0; i < 3; i++) {
        spawnMouse();
      }
      logEl.textContent = '60秒で動き回るネズミを追いかけよう！金のネズミは高得点！';
      gameLoop();
    }
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
    handleCanvasClick(x, y);
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!state.running) return;
    const rect = canvas.getBoundingClientRect();
    state.targetX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    state.targetY = ((e.clientY - rect.top) / rect.height) * canvas.height;
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!state.running) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    state.targetX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    state.targetY = ((touch.clientY - rect.top) / rect.height) * canvas.height;
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (!state.running) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = true;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') state.keys.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') state.keys.down = true;
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') state.keys.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') state.keys.down = false;
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `ヘビのマウスハントで${state.best}点を記録！ #aomagame`;
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
2. 上下左右に移動（マウス/タッチ/矢印キー/WASD）で動き回るネズミを追いかけて食べる。
3. 金のネズミは30点、通常のネズミは10点！ネズミを食べると体が長くなり、自分の体に当たるとゲームオーバー。

## 実装メモ
- 60秒の時間制限で高得点を目指すヘビゲーム
- 最大7匹のネズミが画面内を動き回る
- 金のネズミは通常の3倍の得点
- ネズミを食べるごとに体が伸びていく
- 体の追従アルゴリズムで滑らかな動き
- 自分の体に衝突するとゲームオーバー

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
