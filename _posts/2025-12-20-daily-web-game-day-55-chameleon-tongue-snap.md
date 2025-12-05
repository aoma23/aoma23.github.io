---
title: "毎日ゲームチャレンジ Day 55: カメレオンのタンスナップ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-54-squirrel-nut-catch/' | relative_url }}">リスのナッツキャッチ</a>

55日目は「カメレオンのタンスナップ」。クリックした方向に舌を伸ばして虫をキャッチ！蜂は避けよう！

<style>
#chameleon-game {
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
#chameleon-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #chameleon-game .hud {
    font-size: 0.82rem;
  }
}
#chameleon-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: 420px;
  margin: 0 auto;
  background: linear-gradient(180deg, #93c5fd 0%, #bae6fd 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: crosshair;
  touch-action: none;
}
#chameleon-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#chameleon-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#chameleon-game .share button {
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
#chameleon-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#chameleon-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="chameleon-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">画面をクリックで舌を伸ばして虫をキャッチ！蜂は避けよう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('chameleon-game');
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

  const storageKey = 'aomagame:best:chameleon';
  const playedKey = 'aomagame:played:chameleon';

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    insects: [],
    chameleonX: 100,
    chameleonY: 260,
    tongue: null,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    shoot: { frequency: 440, duration: 0.08, gain: 0.16 },
    catch: { frequency: 720, duration: 0.1, gain: 0.2 },
    bee: { frequency: 240, duration: 0.2, gain: 0.18 }
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

  const spawnInsect = () => {
    const rand = Math.random();
    let type = 'butterfly';
    if (rand < 0.25) type = 'bee';
    else if (rand < 0.5) type = 'beetle';

    const x = 30 + Math.random() * (canvas.width - 60);
    const y = 30 + Math.random() * 360;
    const vx = (Math.random() - 0.5) * 3;
    const vy = (Math.random() - 0.5) * 2;

    state.insects.push({ type, x, y, vx, vy, caught: false });
  };

  const shootTongue = (targetX, targetY) => {
    if (state.tongue) return;
    playTone('shoot');
    const dx = targetX - state.chameleonX;
    const dy = targetY - state.chameleonY;
    const dist = Math.hypot(dx, dy);
    state.tongue = {
      x: state.chameleonX,
      y: state.chameleonY,
      targetX,
      targetY,
      length: 0,
      maxLength: Math.min(dist, 200),
      extending: true
    };
  };

  const checkTongueCatch = () => {
    if (!state.tongue || !state.tongue.extending) return;

    const tongueEndX = state.chameleonX + Math.cos(Math.atan2(
      state.tongue.targetY - state.chameleonY,
      state.tongue.targetX - state.chameleonX
    )) * state.tongue.length;

    const tongueEndY = state.chameleonY + Math.sin(Math.atan2(
      state.tongue.targetY - state.chameleonY,
      state.tongue.targetX - state.chameleonX
    )) * state.tongue.length;

    for (const insect of state.insects) {
      if (insect.caught) continue;
      const dist = Math.hypot(insect.x - tongueEndX, insect.y - tongueEndY);
      if (dist < 15) {
        insect.caught = true;
        state.tongue.extending = false;

        if (insect.type === 'bee') {
          state.score = Math.max(0, state.score - 15);
          playTone('bee');
          logEl.textContent = '蜂を捕まえた！-15点';
        } else if (insect.type === 'beetle') {
          state.score += 15;
          playTone('catch');
          logEl.textContent = 'カブトムシ！+15点';
        } else {
          state.score += 8;
          playTone('catch');
          logEl.textContent = '蝶をキャッチ！+8点';
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
    // Button background
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, START_BUTTON.y, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    // Button shadow
    ctx.shadowColor = 'rgba(22, 163, 74, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, START_BUTTON.y, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Button text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const buttonText = state.firstPlay ? 'スタート' : 'リトライ';
    ctx.fillText(buttonText, START_BUTTON.x + START_BUTTON.width / 2, START_BUTTON.y + START_BUTTON.height / 2);
  };

  const drawChameleon = () => {
    // 体
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.ellipse(state.chameleonX, state.chameleonY, 30, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.ellipse(state.chameleonX + 25, state.chameleonY - 5, 20, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(state.chameleonX + 30, state.chameleonY - 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(state.chameleonX + 32, state.chameleonY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTongue = () => {
    if (!state.tongue) return;
    const angle = Math.atan2(
      state.tongue.targetY - state.chameleonY,
      state.tongue.targetX - state.chameleonX
    );
    const endX = state.chameleonX + Math.cos(angle) * state.tongue.length;
    const endY = state.chameleonY + Math.sin(angle) * state.tongue.length;

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(state.chameleonX + 40, state.chameleonY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(endX, endY, 6, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawInsect = (insect) => {
    if (insect.caught) return;

    if (insect.type === 'butterfly') {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(insect.x - 6, insect.y, 8, 10, -0.3, 0, Math.PI * 2);
      ctx.ellipse(insect.x + 6, insect.y, 8, 10, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(insect.x, insect.y - 5);
      ctx.lineTo(insect.x, insect.y + 5);
      ctx.stroke();
    } else if (insect.type === 'bee') {
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(insect.x - 8, insect.y - 5, 16, 10);
      ctx.fillStyle = '#000';
      ctx.fillRect(insect.x - 4, insect.y - 5, 3, 10);
      ctx.fillRect(insect.x + 2, insect.y - 5, 3, 10);
      ctx.beginPath();
      ctx.ellipse(insect.x - 10, insect.y, 6, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(insect.x + 10, insect.y, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (insect.type === 'beetle') {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(insect.x, insect.y, 10, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(insect.x, insect.y - 10);
      ctx.lineTo(insect.x, insect.y + 10);
      ctx.stroke();
    }
  };

  const draw = () => {
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const insect of state.insects) {
      drawInsect(insect);
    }

    drawTongue();
    drawChameleon();

    if (!state.running && (state.firstPlay || state.showRetryButton)) {
      drawStartButton();
    }
  };

  const gameLoop = () => {
    if (!state.running) return;

    const elapsed = (performance.now() - state.startTime) / 1000;
    if (elapsed >= state.timeLimit) {
      endGame();
      return;
    }

    // 舌のアニメーション
    if (state.tongue) {
      if (state.tongue.extending) {
        state.tongue.length += 15;
        if (state.tongue.length >= state.tongue.maxLength) {
          state.tongue.extending = false;
        }
      } else {
        state.tongue.length -= 20;
        if (state.tongue.length <= 0) {
          state.tongue = null;
        }
      }
    }

    // 虫の移動
    for (let i = state.insects.length - 1; i >= 0; i--) {
      state.insects[i].x += state.insects[i].vx;
      state.insects[i].y += state.insects[i].vy;

      if (state.insects[i].x < 0 || state.insects[i].x > canvas.width) {
        state.insects[i].vx *= -1;
      }
      if (state.insects[i].y < 0 || state.insects[i].y > canvas.height - 30) {
        state.insects[i].vy *= -1;
      }

      if (state.insects[i].caught) {
        state.insects.splice(i, 1);
      }
    }

    // ランダムに虫を追加
    if (Math.random() < 0.015) {
      spawnInsect();
    }

    checkTongueCatch();
    draw();
    updateHud();
    requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    state.running = false;
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
    return x >= START_BUTTON.x && x <= START_BUTTON.x + START_BUTTON.width &&
           y >= START_BUTTON.y && y <= START_BUTTON.y + START_BUTTON.height;
  };

  const handleCanvasClick = (x, y) => {
    if (!state.running) {
      if (isClickOnStartButton(x, y)) {
        markPlayed();
        playTone('start');
        state.running = true;
        state.firstPlay = false;
        state.showRetryButton = false;
        state.startTime = performance.now();
        state.score = 0;
        state.insects = [];
        state.tongue = null;
        logEl.textContent = 'クリックで舌を伸ばして虫をキャッチ！蜂は避けよう！';
        gameLoop();
      }
    } else {
      shootTongue(x, y);
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

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `カメレオンのタンスナップで${state.best}点を記録！ #aomagame`;
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
2. 画面上を飛び回る虫をクリック/タップした方向に舌を伸ばしてキャッチ。
3. 蝶は8点、カブトムシは15点。蜂は捕まえると減点なので避けよう！

## 実装メモ
- クリック/タップした方向に舌を伸ばす仕組み
- 3種類の虫（蝶・蜂・カブトムシ）で得点が異なる
- 蜂は捕まえると減点になる避けるべき存在

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
