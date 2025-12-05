---
title: "毎日ゲームチャレンジ Day 54: リスのナッツキャッチ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-53-kangaroo-hop-race/' | relative_url }}">カンガルーのホップレース</a>

54日目は「リスのナッツキャッチ」。木から落ちるどんぐりをキャッチ！金のどんぐりは高得点、腐ったどんぐりは減点だ！

<style>
#squirrel-game {
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
#squirrel-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #squirrel-game .hud {
    font-size: 0.82rem;
  }
}
#squirrel-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: 420px;
  margin: 0 auto;
  background: linear-gradient(180deg, #86efac 0%, #4ade80 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#squirrel-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#squirrel-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#squirrel-game .share button {
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
#squirrel-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#squirrel-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="squirrel-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
    <span class="lives">ライフ: 3</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">左右移動でどんぐりをキャッチ！落とすとライフ減少！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('squirrel-game');
  if (!root) return;

  const canvas = root.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const livesEl = root.querySelector('.lives');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const START_BUTTON = {
    x: canvas.width / 2 - 80,
    y: canvas.height / 2 - 30,
    width: 160,
    height: 60
  };

  const storageKey = 'aomagame:best:squirrel';
  const playedKey = 'aomagame:played:squirrel';

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    lives: 3,
    nuts: [],
    squirrelX: 230,
    targetX: 230,
    storageAvailable: false,
    keys: { left: false, right: false }
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    catch: { frequency: 640, duration: 0.1, gain: 0.2 },
    golden: { frequency: 880, duration: 0.12, gain: 0.22 },
    rotten: { frequency: 220, duration: 0.2, gain: 0.18 },
    miss: { frequency: 320, duration: 0.15, gain: 0.16 }
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
    livesEl.textContent = `ライフ: ${state.lives}`;
  };

  const spawnNut = () => {
    const x = 30 + Math.random() * (canvas.width - 60);
    const rand = Math.random();
    let type = 'normal';
    if (rand < 0.1) type = 'golden';
    else if (rand < 0.2) type = 'rotten';

    const speed = 2 + Math.random() * 1.5;
    state.nuts.push({
      x,
      y: -20,
      type,
      speed,
      caught: false
    });
  };

  const checkCatch = () => {
    for (const nut of state.nuts) {
      if (nut.caught) continue;
      const dist = Math.hypot(nut.x - state.squirrelX, nut.y - 380);
      if (dist < 30) {
        nut.caught = true;
        if (nut.type === 'golden') {
          state.score += 20;
          playTone('golden');
          logEl.textContent = '金のどんぐり！+20点';
        } else if (nut.type === 'rotten') {
          state.score = Math.max(0, state.score - 10);
          playTone('rotten');
          logEl.textContent = '腐ったどんぐり！-10点';
        } else {
          state.score += 5;
          playTone('catch');
          logEl.textContent = 'キャッチ！+5点';
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

  const drawStartButton = () => {
    // リトライボタンは下に配置
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    // Button background
    ctx.fillStyle = '#9333ea';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    // Button shadow
    ctx.shadowColor = 'rgba(147, 51, 234, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#a855f7';
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

  const drawSquirrel = () => {
    // 体
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(state.squirrelX, 380, 20, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.arc(state.squirrelX, 360, 15, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.beginPath();
    ctx.arc(state.squirrelX - 10, 352, 5, 0, Math.PI * 2);
    ctx.arc(state.squirrelX + 10, 352, 5, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(state.squirrelX - 5, 358, 2, 0, Math.PI * 2);
    ctx.arc(state.squirrelX + 5, 358, 2, 0, Math.PI * 2);
    ctx.fill();

    // 尻尾
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(state.squirrelX, 400);
    ctx.quadraticCurveTo(state.squirrelX + 30, 390, state.squirrelX + 25, 350);
    ctx.quadraticCurveTo(state.squirrelX + 20, 340, state.squirrelX + 30, 330);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#b45309';
    ctx.stroke();
  };

  const drawNut = (nut) => {
    if (nut.caught) return;

    if (nut.type === 'golden') {
      ctx.fillStyle = '#fbbf24';
    } else if (nut.type === 'rotten') {
      ctx.fillStyle = '#4b5563';
    } else {
      ctx.fillStyle = '#92400e';
    }

    // どんぐり本体
    ctx.beginPath();
    ctx.ellipse(nut.x, nut.y, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // 帽子
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(nut.x, nut.y - 8, 8, 0, Math.PI, true);
    ctx.fill();
  };

  const draw = () => {
    // 背景
    ctx.fillStyle = '#86efac';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 地面
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 400, canvas.width, 20);

    for (const nut of state.nuts) {
      drawNut(nut);
    }

    drawSquirrel();

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
    state.targetX = Math.max(30, Math.min(canvas.width - 30, state.targetX));

    // リス移動
    state.squirrelX += (state.targetX - state.squirrelX) * 0.2;

    // どんぐりの移動
    for (let i = state.nuts.length - 1; i >= 0; i--) {
      state.nuts[i].y += state.nuts[i].speed;
      if (state.nuts[i].y > canvas.height + 20) {
        if (!state.nuts[i].caught && state.nuts[i].type === 'normal') {
          state.lives -= 1;
          playTone('miss');
          if (state.lives <= 0) {
            state.running = false;
            state.gameOver = true;
            state.showRetryButton = false;
            logEl.textContent = 'ライフ0！ゲームオーバー';
            draw();
            window.setTimeout(() => {
              state.showRetryButton = true;
              draw();
            }, 1000);
            return;
          } else {
            logEl.textContent = `どんぐりを落とした！ライフ残り${state.lives}`;
          }
        }
        state.nuts.splice(i, 1);
      }
    }

    // ランダムにどんぐりを追加
    if (Math.random() < 0.02) {
      spawnNut();
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
      state.lives = 3;
      state.nuts = [];
      state.squirrelX = 230;
      state.targetX = 230;
      logEl.textContent = 'どんぐりをキャッチ！金は高得点、腐ったのは減点！';
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
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!state.running) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    state.targetX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (!state.running) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = true;
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') state.keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') state.keys.right = false;
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `リスのナッツキャッチで${state.best}点を記録！ #aomagame`;
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
2. 上から落ちてくるどんぐりを左右移動（マウス/タッチ/矢印キー）でキャッチ。
3. 金のどんぐりは高得点、腐ったどんぐりは減点。通常どんぐりを落とすとライフ減少！

## 実装メモ
- 上から落ちるどんぐりを左右移動でキャッチ
- 3種類のどんぐり（通常・金・腐敗）で得点に変化
- 通常どんぐりを落とすとライフ減少、0になるとゲームオーバー

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
