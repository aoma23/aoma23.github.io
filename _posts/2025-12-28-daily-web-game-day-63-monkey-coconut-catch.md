---
title: "毎日ゲームチャレンジ Day 63: サルのココナッツキャッチ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-62-penguin-ice-slide/' | relative_url }}">ペンギンのアイススライド</a>

63日目は「サルのココナッツキャッチ」。木から落ちてくるココナッツをキャッチしよう！黄金のココナッツは高得点、落とすと減点だ！

<style>
#monkey-game {
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
#monkey-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #monkey-game .hud {
    font-size: 0.82rem;
  }
}
#monkey-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: auto;
  aspect-ratio: 460 / 420;
  margin: 0 auto;
  background: linear-gradient(180deg, #dbeafe 0%, #86efac 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#monkey-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#monkey-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#monkey-game .share button {
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
#monkey-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#monkey-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="monkey-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">左右移動でココナッツをキャッチ！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('monkey-game');
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

  const storageKey = 'aomagame:best:monkey';
  const playedKey = 'aomagame:played:monkey';

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    monkey: {
      x: 230,
      y: 360,
      vx: 0,
      size: 20,
      speed: 8
    },
    coconuts: [],
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    catch: { frequency: 640, duration: 0.12, gain: 0.2 },
    golden: { frequency: 880, duration: 0.15, gain: 0.22 },
    miss: { frequency: 180, duration: 0.2, gain: 0.18 }
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

  const spawnCoconut = () => {
    const x = 50 + Math.random() * (canvas.width - 100);
    const isGolden = Math.random() < 0.2;
    const speed = 2 + Math.random() * 2;

    state.coconuts.push({
      x,
      y: 20,
      vy: speed,
      golden: isGolden,
      caught: false,
      missed: false
    });
  };

  const checkCatch = () => {
    for (const coconut of state.coconuts) {
      if (coconut.caught || coconut.missed) continue;

      const dist = Math.hypot(coconut.x - state.monkey.x, coconut.y - state.monkey.y);
      if (dist < 30) {
        coconut.caught = true;
        if (coconut.golden) {
          state.score += 30;
          playTone('golden');
          logEl.textContent = '黄金のココナッツ！+30点';
        } else {
          state.score += 10;
          playTone('catch');
          logEl.textContent = 'ココナッツゲット！+10点';
        }

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
      } else if (coconut.y > canvas.height - 20) {
        coconut.missed = true;
        state.score = Math.max(0, state.score - 5);
        playTone('miss');
        logEl.textContent = '落とした！-5点';
      }
    }
  };

  const drawMonkey = () => {
    const m = state.monkey;

    // 体
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.size, m.size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.arc(m.x, m.y - m.size, m.size * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(m.x - 14, m.y - m.size - 8, 8, 0, Math.PI * 2);
    ctx.arc(m.x + 14, m.y - m.size - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // 顔
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(m.x, m.y - m.size + 4, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(m.x - 6, m.y - m.size, 2, 0, Math.PI * 2);
    ctx.arc(m.x + 6, m.y - m.size, 2, 0, Math.PI * 2);
    ctx.fill();

    // 鼻
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(m.x, m.y - m.size + 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // 腕（キャッチポーズ）
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(m.x - m.size, m.y);
    ctx.lineTo(m.x - m.size - 15, m.y - 15);
    ctx.moveTo(m.x + m.size, m.y);
    ctx.lineTo(m.x + m.size + 15, m.y - 15);
    ctx.stroke();

    // 尻尾
    ctx.beginPath();
    ctx.moveTo(m.x, m.y + m.size * 1.2);
    ctx.quadraticCurveTo(m.x + 25, m.y + m.size, m.x + 30, m.y - 10);
    ctx.stroke();
  };

  const drawCoconut = (coconut) => {
    if (coconut.caught || coconut.missed) return;

    const color = coconut.golden ? '#fbbf24' : '#78350f';

    // ココナッツ本体
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(coconut.x, coconut.y, 12, 0, Math.PI * 2);
    ctx.fill();

    // テクスチャ
    ctx.strokeStyle = coconut.golden ? '#f59e0b' : '#57534e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(coconut.x - 4, coconut.y - 4, 2, 0, Math.PI * 2);
    ctx.arc(coconut.x + 3, coconut.y - 3, 2, 0, Math.PI * 2);
    ctx.arc(coconut.x, coconut.y + 4, 2, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawTree = () => {
    // 木の幹
    ctx.fillStyle = '#78716c';
    ctx.fillRect(20, 0, 20, 80);
    ctx.fillRect(canvas.width - 40, 0, 20, 80);

    // 葉
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(30, 40 + i * 20, 25, 0, Math.PI * 2);
      ctx.arc(canvas.width - 30, 40 + i * 20, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawStartButton = () => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(22, 101, 52, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#22c55e';
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
    gradient.addColorStop(1, '#86efac');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawTree();

    for (const coconut of state.coconuts) {
      drawCoconut(coconut);
    }

    drawMonkey();

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

    // サルの移動
    state.monkey.x += state.monkey.vx;
    state.monkey.x = Math.max(50, Math.min(canvas.width - 50, state.monkey.x));

    // ココナッツの落下
    for (let i = state.coconuts.length - 1; i >= 0; i--) {
      state.coconuts[i].y += state.coconuts[i].vy;
      if (state.coconuts[i].y > canvas.height + 20 || state.coconuts[i].caught || state.coconuts[i].missed) {
        state.coconuts.splice(i, 1);
      }
    }

    // ランダムにココナッツ生成
    if (Math.random() < 0.025) {
      spawnCoconut();
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
      state.monkey = {
        x: 230,
        y: 360,
        vx: 0,
        size: 20,
        speed: 8
      };
      state.coconuts = [];
      logEl.textContent = 'ココナッツをキャッチしよう！';
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

    // サルの位置を直接更新
    state.monkey.x = Math.max(state.monkey.size, Math.min(canvas.width - state.monkey.size, x));
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
  }, { passive: false });

  let keysPressed = {};

  document.addEventListener('keydown', (e) => {
    if (!state.running || state.gameOver) return;
    keysPressed[e.key] = true;

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      state.monkey.vx = -state.monkey.speed;
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      state.monkey.vx = state.monkey.speed;
    }
  });

  document.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;

    const leftPressed = keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A'];
    const rightPressed = keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D'];

    if (!leftPressed && !rightPressed) {
      state.monkey.vx = 0;
    } else if (leftPressed) {
      state.monkey.vx = -state.monkey.speed;
    } else if (rightPressed) {
      state.monkey.vx = state.monkey.speed;
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `サルのココナッツキャッチで${state.best}点を記録！ #aomagame`;
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
2. 左右キー（A/D）でサルを移動。
3. 落ちてくるココナッツをキャッチ！黄金のココナッツは高得点。
4. 落とすと減点されるので注意！

## 実装メモ
- 上から落ちてくるココナッツをキャッチ
- 黄金のココナッツは高得点
- 落とすと減点システム

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
