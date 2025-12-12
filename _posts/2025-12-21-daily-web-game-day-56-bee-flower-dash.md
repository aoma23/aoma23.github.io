---
title: "毎日ゲームチャレンジ Day 56: ハチのフラワーダッシュ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

56日目は「ハチのフラワーダッシュ」。自由に飛び回って花々を訪れて蜜を集めよう！スズメバチを避けながら制限時間内に高得点を狙え！

<style>
#bee-game {
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
#bee-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #bee-game .hud {
    font-size: 0.82rem;
  }
}
#bee-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: 400px;
  margin: 0 auto;
  background: linear-gradient(180deg, #bae6fd 0%, #7dd3fc 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#bee-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#bee-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#bee-game .share button {
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
#bee-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#bee-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="bee-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="400"></canvas>
  <p class="log">自由に飛び回って花を訪れて蜜を集めよう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('bee-game');
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

  const storageKey = 'aomagame:best:bee';
  const playedKey = 'aomagame:played:bee';

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    beeX: 230,
    beeY: 200,
    targetX: 230,
    targetY: 200,
    flowers: [],
    wasps: [],
    storageAvailable: false,
    keys: { left: false, right: false, up: false, down: false }
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    collect: { frequency: 740, duration: 0.1, gain: 0.2 },
    golden: { frequency: 980, duration: 0.12, gain: 0.22 },
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.collect;
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

  const spawnFlower = () => {
    const x = 30 + Math.random() * (canvas.width - 60);
    const y = 50 + Math.random() * (canvas.height - 100);
    const isGolden = Math.random() < 0.15;
    state.flowers.push({
      x,
      y,
      size: 20,
      golden: isGolden,
      collected: false
    });
  };

  const spawnWasp = () => {
    const x = Math.random() > 0.5 ? -20 : canvas.width + 20;
    const y = 50 + Math.random() * (canvas.height - 100);
    const speed = 1.5 + Math.random() * 1;
    state.wasps.push({
      x,
      y,
      vx: x < 0 ? speed : -speed,
      vy: (Math.random() - 0.5) * 2,
      size: 18
    });
  };

  const checkFlowerCollect = () => {
    for (const flower of state.flowers) {
      if (flower.collected) continue;
      const dist = Math.hypot(flower.x - state.beeX, flower.y - state.beeY);
      if (dist < 25) {
        flower.collected = true;
        if (flower.golden) {
          state.score += 30;
          playTone('golden');
          logEl.textContent = '金色の花！+30点';
        } else {
          state.score += 10;
          playTone('collect');
          logEl.textContent = '蜜ゲット！+10点';
        }

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
        return;
      }
    }
  };

  const checkWaspHit = () => {
    for (const wasp of state.wasps) {
      const dist = Math.hypot(wasp.x - state.beeX, wasp.y - state.beeY);
      if (dist < 25) {
        state.running = false;
        state.gameOver = true;
        state.showRetryButton = false;
        playTone('hit');
        logEl.textContent = 'スズメバチに刺された！';
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

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
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

  const drawBee = () => {
    // 体（黄色と黒のストライプ）
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(state.beeX, state.beeY, 12, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 黒いストライプ
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(state.beeX - 12, state.beeY - 5);
    ctx.lineTo(state.beeX + 12, state.beeY - 5);
    ctx.moveTo(state.beeX - 12, state.beeY + 5);
    ctx.lineTo(state.beeX + 12, state.beeY + 5);
    ctx.stroke();

    // 羽
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(state.beeX - 8, state.beeY - 12, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(state.beeX + 8, state.beeY - 12, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(state.beeX - 4, state.beeY - 4, 2, 0, Math.PI * 2);
    ctx.arc(state.beeX + 4, state.beeY - 4, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFlower = (flower) => {
    if (flower.collected) return;

    const color = flower.golden ? '#fbbf24' : '#ec4899';
    const centerColor = flower.golden ? '#f59e0b' : '#fde047';

    // 花びら
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = flower.x + Math.cos(angle) * 10;
      const y = flower.y + Math.sin(angle) * 10;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 中心
    ctx.fillStyle = centerColor;
    ctx.beginPath();
    ctx.arc(flower.x, flower.y, 6, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawWasp = (wasp) => {
    // 体（黒と黄色）
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(wasp.x, wasp.y, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 黄色のストライプ
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(wasp.x - 10, wasp.y - 3, 20, 3);
    ctx.fillRect(wasp.x - 10, wasp.y + 3, 20, 3);

    // 羽
    ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
    ctx.beginPath();
    ctx.ellipse(wasp.x - 7, wasp.y - 10, 7, 4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(wasp.x + 7, wasp.y - 10, 7, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = () => {
    // 空
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const flower of state.flowers) {
      drawFlower(flower);
    }

    for (const wasp of state.wasps) {
      drawWasp(wasp);
    }

    drawBee();

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2 - 60);
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

    // キーボード操作
    if (state.keys.left) state.targetX -= 6;
    if (state.keys.right) state.targetX += 6;
    if (state.keys.up) state.targetY -= 6;
    if (state.keys.down) state.targetY += 6;
    state.targetX = Math.max(20, Math.min(canvas.width - 20, state.targetX));
    state.targetY = Math.max(20, Math.min(canvas.height - 20, state.targetY));

    // ハチ移動
    state.beeX += (state.targetX - state.beeX) * 0.2;
    state.beeY += (state.targetY - state.beeY) * 0.2;

    // スズメバチの移動
    for (let i = state.wasps.length - 1; i >= 0; i--) {
      state.wasps[i].x += state.wasps[i].vx;
      state.wasps[i].y += state.wasps[i].vy;

      // 画面外に出たら削除
      if (state.wasps[i].x < -40 || state.wasps[i].x > canvas.width + 40 ||
          state.wasps[i].y < -40 || state.wasps[i].y > canvas.height + 40) {
        state.wasps.splice(i, 1);
      }
    }

    // 花とスズメバチをランダム追加
    if (Math.random() < 0.015 && state.flowers.filter(f => !f.collected).length < 8) {
      spawnFlower();
    }
    if (Math.random() < 0.01) {
      spawnWasp();
    }

    checkFlowerCollect();
    if (checkWaspHit()) return;

    draw();
    updateHud();
    requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    state.running = false;
    state.gameOver = true;
    state.showRetryButton = false;
    logEl.textContent = `ゲーム終了！得点: ${state.score}`;
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
      state.beeX = 230;
      state.beeY = 200;
      state.targetX = 230;
      state.targetY = 200;
      state.flowers = [];
      state.wasps = [];
      logEl.textContent = '花を訪れて蜜を集めよう！スズメバチに注意！';

      // 初期の花を配置
      for (let i = 0; i < 5; i++) {
        spawnFlower();
      }

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
      const text = `ハチのフラワーダッシュで${state.best}点を記録！ #aomagame`;
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
2. 自由に飛び回って（マウス/タッチ/矢印キー/WASD）花を訪れて蜜を集める。
3. 金色の花は高得点！スズメバチに刺されるとゲームオーバー。

## 実装メモ
- 上下左右自由に飛び回って花を訪れて蜜を集めるゲーム
- 金色の花は通常の3倍の得点
- ランダムに飛んでくるスズメバチを避ける必要がある

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
