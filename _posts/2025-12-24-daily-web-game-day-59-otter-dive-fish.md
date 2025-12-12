---
title: "毎日ゲームチャレンジ Day 59: カワウソのダイブフィッシュ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

59日目は「カワウソのダイブフィッシュ」。タイミングよくダイブして泳ぐ魚をキャッチ！金色の魚は高得点、クラゲは避けよう！

<style>
#otter-game {
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
#otter-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #otter-game .hud {
    font-size: 0.82rem;
  }
}
#otter-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: 420px;
  margin: 0 auto;
  background: linear-gradient(180deg, #bae6fd 0%, #0ea5e9 50%, #0369a1 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#otter-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#otter-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#otter-game .share button {
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
#otter-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#otter-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="otter-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">タップでダイブ！魚をキャッチしよう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('otter-game');
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

  const storageKey = 'aomagame:best:otter';
  const playedKey = 'aomagame:played:otter';

  const WATER_LEVEL = 120;
  const GRAVITY = 0.5;
  const DIVE_POWER = -8;

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
    otter: {
      x: 100,
      y: 80,
      vy: 0,
      underwater: false
    },
    fish: [],
    jellyfish: [],
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    dive: { frequency: 380, duration: 0.15, gain: 0.18 },
    surface: { frequency: 480, duration: 0.1, gain: 0.16 },
    catch: { frequency: 640, duration: 0.12, gain: 0.2 },
    golden: { frequency: 880, duration: 0.15, gain: 0.22 },
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.catch;
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

  const spawnFish = () => {
    const y = WATER_LEVEL + 50 + Math.random() * (canvas.height - WATER_LEVEL - 100);
    const isGolden = Math.random() < 0.15;
    const speed = 2 + Math.random() * 2;
    state.fish.push({
      x: canvas.width + 20,
      y,
      vx: -speed,
      golden: isGolden,
      caught: false,
      size: 12
    });
  };

  const spawnJellyfish = () => {
    const y = WATER_LEVEL + 50 + Math.random() * (canvas.height - WATER_LEVEL - 100);
    const speed = 1 + Math.random();
    state.jellyfish.push({
      x: canvas.width + 20,
      y,
      vx: -speed,
      size: 15
    });
  };

  const dive = () => {
    if (!state.running || state.gameOver) return;
    if (!state.otter.underwater) {
      // 水面より上：ダイブ（下向き）
      state.otter.vy = -DIVE_POWER;
      playTone('dive');
    } else {
      // 水中：浮上（上向き）
      state.otter.vy = DIVE_POWER;
      playTone('surface');
    }
  };

  const checkFishCatch = () => {
    for (const fish of state.fish) {
      if (fish.caught || !state.otter.underwater) continue;
      const dist = Math.hypot(fish.x - state.otter.x, fish.y - state.otter.y);
      if (dist < 25) {
        fish.caught = true;
        if (fish.golden) {
          state.score += 30;
          playTone('golden');
          logEl.textContent = '金色の魚！+30点';
        } else {
          state.score += 10;
          playTone('catch');
          logEl.textContent = '魚ゲット！+10点';
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

  const checkJellyfishHit = () => {
    if (!state.otter.underwater) return false;
    for (const jelly of state.jellyfish) {
      const dist = Math.hypot(jelly.x - state.otter.x, jelly.y - state.otter.y);
      if (dist < 30) {
        state.running = false;
        state.gameOver = true;
        state.gameOverReason = 'jellyfish';
        state.showRetryButton = false;
        playTone('hit');
        logEl.textContent = 'クラゲに刺された！';
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

    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(3, 105, 161, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#0ea5e9';
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

  const drawOtter = () => {
    const o = state.otter;

    // 体
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(o.x, o.y, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.arc(o.x, o.y - 18, 14, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.beginPath();
    ctx.arc(o.x - 10, o.y - 24, 5, 0, Math.PI * 2);
    ctx.arc(o.x + 10, o.y - 24, 5, 0, Math.PI * 2);
    ctx.fill();

    // 顔
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(o.x, o.y - 16, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(o.x - 4, o.y - 18, 2, 0, Math.PI * 2);
    ctx.arc(o.x + 4, o.y - 18, 2, 0, Math.PI * 2);
    ctx.fill();

    // 鼻
    ctx.beginPath();
    ctx.arc(o.x, o.y - 14, 2, 0, Math.PI * 2);
    ctx.fill();

    // 尻尾
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(o.x, o.y + 15);
    ctx.quadraticCurveTo(o.x - 10, o.y + 25, o.x - 5, o.y + 35);
    ctx.stroke();
  };

  const drawFish = (fish) => {
    if (fish.caught) return;

    const color = fish.golden ? '#fbbf24' : '#f97316';

    // 体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(fish.x, fish.y, fish.size, fish.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 尾びれ
    ctx.beginPath();
    ctx.moveTo(fish.x + fish.size, fish.y);
    ctx.lineTo(fish.x + fish.size + 8, fish.y - 6);
    ctx.lineTo(fish.x + fish.size + 8, fish.y + 6);
    ctx.closePath();
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(fish.x - fish.size / 2, fish.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawJellyfish = (jelly) => {
    // 傘
    ctx.fillStyle = 'rgba(236, 72, 153, 0.6)';
    ctx.beginPath();
    ctx.arc(jelly.x, jelly.y, jelly.size, Math.PI, 0);
    ctx.fill();

    // 触手
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const offset = (i - 2) * 6;
      ctx.beginPath();
      ctx.moveTo(jelly.x + offset, jelly.y);
      ctx.quadraticCurveTo(jelly.x + offset - 3, jelly.y + 15, jelly.x + offset, jelly.y + 25);
      ctx.stroke();
    }
  };

  const draw = () => {
    // 空
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, 0, canvas.width, WATER_LEVEL);

    // 水面
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(0, WATER_LEVEL, canvas.width, canvas.height - WATER_LEVEL);

    // 水面線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, WATER_LEVEL);
    ctx.lineTo(canvas.width, WATER_LEVEL);
    ctx.stroke();

    for (const fish of state.fish) {
      drawFish(fish);
    }

    for (const jelly of state.jellyfish) {
      drawJellyfish(jelly);
    }

    drawOtter();

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

    const elapsed = (performance.now() - state.startTime) / 1000;
    if (elapsed >= state.timeLimit) {
      endGame();
      return;
    }

    // カワウソの物理演算
    state.otter.vy += GRAVITY;
    state.otter.y += state.otter.vy;

    const wasUnderwater = state.otter.underwater;
    state.otter.underwater = state.otter.y >= WATER_LEVEL;

    if (!wasUnderwater && state.otter.underwater) {
      playTone('dive');
    } else if (wasUnderwater && !state.otter.underwater) {
      playTone('surface');
    }

    // 空中では上限
    if (state.otter.y < 60) {
      state.otter.y = 60;
      state.otter.vy = 0;
    }

    // 水中では下限
    if (state.otter.y > canvas.height - 40) {
      state.otter.y = canvas.height - 40;
      state.otter.vy = 0;
    }

    // 魚とクラゲの移動
    for (let i = state.fish.length - 1; i >= 0; i--) {
      state.fish[i].x += state.fish[i].vx;
      if (state.fish[i].x < -40) {
        state.fish.splice(i, 1);
      }
    }

    for (let i = state.jellyfish.length - 1; i >= 0; i--) {
      state.jellyfish[i].x += state.jellyfish[i].vx;
      if (state.jellyfish[i].x < -40) {
        state.jellyfish.splice(i, 1);
      }
    }

    // ランダムに魚とクラゲを追加
    if (Math.random() < 0.02) {
      spawnFish();
    }
    if (Math.random() < 0.01) {
      spawnJellyfish();
    }

    checkFishCatch();
    if (checkJellyfishHit()) return;

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
      state.otter = {
        x: 100,
        y: 80,
        vy: 0,
        underwater: false
      };
      state.fish = [];
      state.jellyfish = [];
      logEl.textContent = 'タップでダイブ！魚をキャッチしてクラゲを避けよう！';
      gameLoop();
    } else if (state.running && !state.gameOver) {
      dive();
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
      dive();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `カワウソのダイブフィッシュで${state.best}点を記録！ #aomagame`;
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
2. タップ/クリック/スペースキーでダイブ。水中の魚をキャッチしよう。
3. 金色の魚は高得点！クラゲに刺されるとゲームオーバー。

## 実装メモ
- タイミングよくダイブして魚をキャッチするゲーム
- 水面の上下で状態が変化
- クラゲは危険な障害物

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
