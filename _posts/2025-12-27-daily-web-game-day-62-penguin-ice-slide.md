---
title: "毎日ゲームチャレンジ Day 62: ペンギンのアイススライド"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-61-elephant-golf/' | relative_url }}">ゾウのゴルフ</a>

62日目は「ペンギンのアイススライド」。氷の上を滑るペンギンを左右に動かして、魚をゲット！岩や穴を避けながらハイスコアを目指そう！

<style>
#penguin-game {
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
#penguin-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #penguin-game .hud {
    font-size: 0.82rem;
  }
}
#penguin-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: auto;
  aspect-ratio: 460 / 420;
  margin: 0 auto;
  background: linear-gradient(180deg, #dbeafe 0%, #e0f2fe 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#penguin-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#penguin-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#penguin-game .share button {
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
#penguin-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#penguin-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="penguin-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">左右キーかタップで移動！魚をゲットしよう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('penguin-game');
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

  const storageKey = 'aomagame:best:penguin-slide';
  const playedKey = 'aomagame:played:penguin-slide';

  const LANES = [100, 180, 260, 340];
  const SCROLL_SPEED = 4;

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    penguin: {
      laneIndex: 1,
      x: LANES[1],
      y: 320,
      targetX: LANES[1],
      size: 20
    },
    items: [],
    scrollOffset: 0,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    move: { frequency: 380, duration: 0.08, gain: 0.14 },
    fish: { frequency: 640, duration: 0.12, gain: 0.2 },
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.fish;
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

  const spawnItem = () => {
    const type = Math.random();
    let itemType;
    if (type < 0.5) {
      itemType = 'fish';
    } else if (type < 0.65) {
      itemType = 'golden';
    } else if (type < 0.85) {
      itemType = 'rock';
    } else {
      itemType = 'hole';
    }

    const laneIndex = Math.floor(Math.random() * LANES.length);
    state.items.push({
      type: itemType,
      laneIndex,
      x: LANES[laneIndex],
      y: -50,
      collected: false
    });
  };

  const moveLeft = () => {
    if (!state.running || state.gameOver) return;
    if (state.penguin.laneIndex > 0) {
      state.penguin.laneIndex--;
      state.penguin.targetX = LANES[state.penguin.laneIndex];
      playTone('move');
    }
  };

  const moveRight = () => {
    if (!state.running || state.gameOver) return;
    if (state.penguin.laneIndex < LANES.length - 1) {
      state.penguin.laneIndex++;
      state.penguin.targetX = LANES[state.penguin.laneIndex];
      playTone('move');
    }
  };

  const checkCollisions = () => {
    for (const item of state.items) {
      if (item.collected) continue;

      const dist = Math.hypot(item.x - state.penguin.x, item.y - state.penguin.y);
      if (dist < 30) {
        item.collected = true;

        if (item.type === 'fish') {
          state.score += 10;
          playTone('fish');
          logEl.textContent = '魚ゲット！+10点';
        } else if (item.type === 'golden') {
          state.score += 50;
          playTone('golden');
          logEl.textContent = '金の魚！+50点';
        } else if (item.type === 'rock' || item.type === 'hole') {
          endGame();
          return;
        }

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
      }
    }
  };

  const drawPenguin = () => {
    const p = state.penguin;

    // 体
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.size, p.size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 白いお腹
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 5, p.size * 0.6, p.size * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(p.x, p.y - p.size, p.size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x - 6, p.y - p.size - 3, 4, 0, Math.PI * 2);
    ctx.arc(p.x + 6, p.y - p.size - 3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(p.x - 6, p.y - p.size - 3, 2, 0, Math.PI * 2);
    ctx.arc(p.x + 6, p.y - p.size - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // くちばし
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - p.size);
    ctx.lineTo(p.x - 4, p.y - p.size + 6);
    ctx.lineTo(p.x + 4, p.y - p.size + 6);
    ctx.closePath();
    ctx.fill();

    // 足
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(p.x - 8, p.y + p.size * 1.2, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(p.x + 8, p.y + p.size * 1.2, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawItem = (item) => {
    if (item.collected) return;

    if (item.type === 'fish') {
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.ellipse(item.x, item.y, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(item.x + 12, item.y);
      ctx.lineTo(item.x + 18, item.y - 6);
      ctx.lineTo(item.x + 18, item.y + 6);
      ctx.closePath();
      ctx.fill();
    } else if (item.type === 'golden') {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(item.x, item.y, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(item.x + 14, item.y);
      ctx.lineTo(item.x + 20, item.y - 8);
      ctx.lineTo(item.x + 20, item.y + 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(item.x - 4, item.y - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'rock') {
      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(item.x, item.y, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.arc(item.x - 4, item.y - 4, 6, 0, Math.PI * 2);
      ctx.arc(item.x + 6, item.y + 2, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'hole') {
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(item.x, item.y, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(item.x, item.y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawStartButton = () => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    ctx.fillStyle = '#075985';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(7, 89, 133, 0.5)';
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

  const draw = () => {
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#dbeafe');
    gradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 氷のレーン
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < LANES.length; i++) {
      ctx.beginPath();
      ctx.moveTo(LANES[i], 0);
      ctx.lineTo(LANES[i], canvas.height);
      ctx.stroke();
    }

    // アイテム
    for (const item of state.items) {
      drawItem(item);
    }

    drawPenguin();

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

    // ペンギンの滑らかな移動
    const dx = state.penguin.targetX - state.penguin.x;
    state.penguin.x += dx * 0.2;

    // アイテムのスクロール
    state.scrollOffset += SCROLL_SPEED;

    for (let i = state.items.length - 1; i >= 0; i--) {
      state.items[i].y += SCROLL_SPEED;
      if (state.items[i].y > canvas.height + 50) {
        state.items.splice(i, 1);
      }
    }

    // ランダムにアイテム生成
    if (Math.random() < 0.03) {
      spawnItem();
    }

    checkCollisions();

    draw();
    updateHud();
    requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    state.running = false;
    state.gameOver = true;
    state.showRetryButton = false;
    playTone('hit');
    logEl.textContent = `ゲームオーバー！得点: ${state.score}`;
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
      state.penguin = {
        laneIndex: 1,
        x: LANES[1],
        y: 320,
        targetX: LANES[1],
        size: 20
      };
      state.items = [];
      state.scrollOffset = 0;
      logEl.textContent = '魚を集めて障害物を避けよう！';
      gameLoop();
    } else if (state.running && !state.gameOver) {
      if (x < canvas.width / 2) {
        moveLeft();
      } else {
        moveRight();
      }
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

  let touchStartX = 0;

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    touchStartX = x;
    handleCanvasClick(x, y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!state.running || state.gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const x = (touch.clientX - rect.left) * scaleX;

    const deltaX = x - touchStartX;

    if (Math.abs(deltaX) > 30) {
      if (deltaX < 0) {
        moveLeft();
      } else {
        moveRight();
      }
      touchStartX = x;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      moveRight();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `ペンギンのアイススライドで${state.best}点を記録！ #aomagame`;
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
2. 左右キーかタップ（画面左右）でレーン移動。
3. 魚を集めて得点アップ！金の魚は高得点。
4. 岩と穴を避けてハイスコアを目指そう！

## 実装メモ
- 4レーンの氷上スライドアクション
- 魚、金の魚、岩、穴の4種類のアイテム
- スムーズなレーン移動

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
