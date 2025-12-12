---
title: "毎日ゲームチャレンジ Day 53: カンガルーのホップレース"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

53日目は「カンガルーのホップレース」。自動で進むカンガルーをジャンプ操作！岩や穴を避けてコインを集めよう！

<style>
#kangaroo-game {
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
#kangaroo-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #kangaroo-game .hud {
    font-size: 0.82rem;
  }
}
#kangaroo-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: 320px;
  margin: 0 auto;
  background: linear-gradient(180deg, #fcd34d 0%, #eab308 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#kangaroo-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#kangaroo-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#kangaroo-game .share button {
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
#kangaroo-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#kangaroo-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="kangaroo-game">
  <div class="hud">
    <span class="distance">距離: 0m</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="320"></canvas>
  <p class="log">タップまたはスペースキーでジャンプ！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('kangaroo-game');
  if (!root) return;

  const canvas = root.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const distanceEl = root.querySelector('.distance');
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

  const storageKey = 'aomagame:best:kangaroo';
  const playedKey = 'aomagame:played:kangaroo';

  const GROUND_Y = 260;
  const GRAVITY = 0.5;
  const JUMP_POWER = -12;

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    score: 0,
    best: 0,
    distance: 0,
    kangaroo: {
      x: 100,
      y: GROUND_Y,
      vy: 0,
      width: 30,
      height: 40,
      jumping: false
    },
    obstacles: [],
    coins: [],
    scrollSpeed: 4,
    storageAvailable: false,
    keys: { space: false }
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    jump: { frequency: 480, duration: 0.1, gain: 0.18 },
    coin: { frequency: 780, duration: 0.08, gain: 0.2 },
    hit: { frequency: 180, duration: 0.3, gain: 0.2 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.jump;
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
    distanceEl.textContent = `距離: ${Math.floor(state.distance)}m`;
    scoreEl.textContent = `得点: ${state.score}`;
    bestEl.textContent = `最高: ${state.best}`;
  };

  const jump = () => {
    if (!state.running || state.gameOver) return;
    if (!state.kangaroo.jumping) {
      state.kangaroo.vy = JUMP_POWER;
      state.kangaroo.jumping = true;
      playTone('jump');
    }
  };

  const spawnObstacle = () => {
    const type = Math.random() > 0.5 ? 'rock' : 'hole';
    state.obstacles.push({
      type,
      x: canvas.width,
      y: GROUND_Y,
      width: type === 'rock' ? 30 : 50,
      height: type === 'rock' ? 30 : 20
    });
  };

  const spawnCoin = () => {
    const y = GROUND_Y - 50 - Math.random() * 80;
    state.coins.push({
      x: canvas.width,
      y,
      size: 12,
      collected: false
    });
  };

  const checkCollision = () => {
    const k = state.kangaroo;

    for (const obs of state.obstacles) {
      if (obs.x < k.x + k.width && obs.x + obs.width > k.x) {
        if (obs.type === 'rock') {
          if (k.y + k.height > obs.y) {
            return true;
          }
        } else if (obs.type === 'hole') {
          if (k.y + k.height >= GROUND_Y && k.x + k.width > obs.x && k.x < obs.x + obs.width) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const checkCoinCollect = () => {
    const k = state.kangaroo;
    for (const coin of state.coins) {
      if (coin.collected) continue;
      const dist = Math.hypot(coin.x - (k.x + k.width / 2), coin.y - (k.y + k.height / 2));
      if (dist < 20) {
        coin.collected = true;
        state.score += 10;
        playTone('coin');
        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
      }
    }
  };

  const drawStartButton = () => {
    // リトライボタンは下に配置
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    // Button background
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    // Button shadow
    ctx.shadowColor = 'rgba(217, 119, 6, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Button text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const buttonText = state.firstPlay ? 'スタート' : 'リトライ';
    ctx.fillText(buttonText, START_BUTTON.x + START_BUTTON.width / 2, buttonY + START_BUTTON.height / 2);
  };

  const drawKangaroo = () => {
    const k = state.kangaroo;

    // 体
    ctx.fillStyle = '#92400e';
    ctx.fillRect(k.x, k.y, k.width, k.height);

    // 頭
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(k.x + k.width / 2, k.y - 5, 12, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.fillRect(k.x + 5, k.y - 15, 5, 12);
    ctx.fillRect(k.x + k.width - 10, k.y - 15, 5, 12);

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(k.x + k.width / 2 - 4, k.y - 5, 2, 0, Math.PI * 2);
    ctx.arc(k.x + k.width / 2 + 4, k.y - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // 尻尾
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(k.x, k.y + k.height - 10);
    ctx.quadraticCurveTo(k.x - 15, k.y + k.height - 20, k.x - 10, k.y + k.height);
    ctx.stroke();
  };

  const drawObstacle = (obs) => {
    if (obs.type === 'rock') {
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(obs.x, obs.y - obs.height, obs.width, obs.height);
    } else if (obs.type === 'hole') {
      ctx.fillStyle = '#422006';
      ctx.fillRect(obs.x, GROUND_Y, obs.width, obs.height);
    }
  };

  const drawCoin = (coin) => {
    if (coin.collected) return;
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  const draw = () => {
    // 空
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(0, 0, canvas.width, GROUND_Y);

    // 地面
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    for (const obs of state.obstacles) {
      drawObstacle(obs);
    }

    for (const coin of state.coins) {
      drawCoin(coin);
    }

    drawKangaroo();

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

    state.distance += 0.1;

    // カンガルーの物理演算
    state.kangaroo.vy += GRAVITY;
    state.kangaroo.y += state.kangaroo.vy;

    if (state.kangaroo.y >= GROUND_Y) {
      state.kangaroo.y = GROUND_Y;
      state.kangaroo.vy = 0;
      state.kangaroo.jumping = false;
    }

    // 障害物とコインの移動
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      state.obstacles[i].x -= state.scrollSpeed;
      if (state.obstacles[i].x + state.obstacles[i].width < 0) {
        state.obstacles.splice(i, 1);
      }
    }

    for (let i = state.coins.length - 1; i >= 0; i--) {
      state.coins[i].x -= state.scrollSpeed;
      if (state.coins[i].x < -20) {
        state.coins.splice(i, 1);
      }
    }

    // ランダムに障害物とコイン追加
    if (Math.random() < 0.015) {
      spawnObstacle();
    }
    if (Math.random() < 0.01) {
      spawnCoin();
    }

    // 衝突判定
    if (checkCollision()) {
      state.running = false;
      state.gameOver = true;
      state.showRetryButton = false;
      playTone('hit');
      logEl.textContent = `ゲームオーバー！距離: ${Math.floor(state.distance)}m`;
      draw();
      window.setTimeout(() => {
        state.showRetryButton = true;
        draw();
      }, 1000);
      return;
    }

    checkCoinCollect();
    draw();
    updateHud();
    requestAnimationFrame(gameLoop);
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
      state.score = 0;
      state.distance = 0;
      state.obstacles = [];
      state.coins = [];
      state.kangaroo.y = GROUND_Y;
      state.kangaroo.vy = 0;
      state.kangaroo.jumping = false;
      logEl.textContent = 'ジャンプで障害物を避けてコインを集めよう！';
      gameLoop();
    } else if (state.running && !state.gameOver) {
      jump();
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

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (!state.keys.space) {
        state.keys.space = true;
        jump();
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      state.keys.space = false;
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `カンガルーのホップレースで${state.best}点を記録！ #aomagame`;
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
1. スタートボタンでゲーム開始。カンガルーが自動で右へ進みます。
2. タップまたはスペースキーでジャンプ。岩を飛び越え、穴を避けよう。
3. コインを集めて得点アップ。障害物に当たるとゲームオーバー！

## 実装メモ
- ジャンプ操作で岩を飛び越え、穴を避ける仕組み
- 自動スクロールで障害物が次々に登場
- コイン収集要素で得点を稼ぐゲーム性

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
