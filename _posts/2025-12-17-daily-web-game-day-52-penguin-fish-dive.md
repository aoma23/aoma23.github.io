---
title: "毎日ゲームチャレンジ Day 52: ペンギンのフィッシュダイブ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

52日目は「ペンギンのフィッシュダイブ」。上から落ちてくる魚を左右移動でキャッチ！連続キャッチでコンボボーナス！

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
  height: 420px;
  margin: 0 auto;
  background: linear-gradient(180deg, #1e40af 0%, #1e3a8a 100%);
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
    <span class="combo">コンボ: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">左右移動で魚をキャッチ！毒魚は避けよう！</p>
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
  const comboEl = root.querySelector('.combo');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const START_BUTTON = {
    x: canvas.width / 2 - 80,
    y: canvas.height / 2 - 30,
    width: 160,
    height: 60
  };

  const storageKey = 'aomagame:best:penguin';
  const playedKey = 'aomagame:played:penguin';

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    combo: 0,
    fish: [],
    penguinX: 230,
    targetX: 230,
    storageAvailable: false,
    keys: { left: false, right: false }
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    catch: { frequency: 680, duration: 0.1, gain: 0.2 },
    poison: { frequency: 240, duration: 0.2, gain: 0.18 },
    combo: { frequency: 840, duration: 0.08, gain: 0.18 }
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
    comboEl.textContent = `コンボ: ${state.combo}`;
  };

  const spawnFish = () => {
    const x = 30 + Math.random() * (canvas.width - 60);
    const poison = Math.random() < 0.15;
    const size = poison ? 12 : (15 + Math.random() * 10);
    const speed = 1.5 + Math.random() * 1;
    state.fish.push({
      x,
      y: -20,
      size,
      speed,
      poison,
      caught: false
    });
  };

  const checkCatch = () => {
    for (const fish of state.fish) {
      if (fish.caught) continue;
      const dist = Math.hypot(fish.x - state.penguinX, fish.y - 380);
      if (dist < 30) {
        fish.caught = true;
        if (fish.poison) {
          playTone('poison');
          state.score = Math.max(0, state.score - 15);
          state.combo = 0;
          logEl.textContent = '毒魚を食べた！-15点';
        } else {
          const basePoints = Math.floor(fish.size);
          const comboBonus = state.combo * 2;
          const points = basePoints + comboBonus;
          state.score += points;
          state.combo += 1;

          if (state.combo > 1) {
            playTone('combo');
            logEl.textContent = `${state.combo}コンボ！+${points}点`;
          } else {
            playTone('catch');
            logEl.textContent = `キャッチ！+${points}点`;
          }

          if (state.score > state.best) {
            state.best = state.score;
            saveBest();
            shareButton.disabled = false;
          }
        }
        return;
      }
    }
  };

  const drawStartButton = () => {
    // Button background
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, START_BUTTON.y, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    // Button shadow
    ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#60a5fa';
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

  const drawPenguin = () => {
    // 体
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(state.penguinX, 380, 25, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    // 腹
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(state.penguinX, 385, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // くちばし
    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.moveTo(state.penguinX, 375);
    ctx.lineTo(state.penguinX + 10, 380);
    ctx.lineTo(state.penguinX, 385);
    ctx.closePath();
    ctx.fill();

    // 目
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.penguinX - 8, 370, 4, 0, Math.PI * 2);
    ctx.arc(state.penguinX + 8, 370, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(state.penguinX - 8, 370, 2, 0, Math.PI * 2);
    ctx.arc(state.penguinX + 8, 370, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFish = (fish) => {
    if (fish.caught) return;
    ctx.fillStyle = fish.poison ? '#a855f7' : '#3b82f6';
    ctx.beginPath();
    ctx.ellipse(fish.x, fish.y, fish.size, fish.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 尾びれ
    ctx.beginPath();
    ctx.moveTo(fish.x - fish.size, fish.y);
    ctx.lineTo(fish.x - fish.size - 8, fish.y - 6);
    ctx.lineTo(fish.x - fish.size - 8, fish.y + 6);
    ctx.closePath();
    ctx.fill();
  };

  const draw = () => {
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const fish of state.fish) {
      drawFish(fish);
    }

    drawPenguin();

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

    // キーボード操作
    if (state.keys.left) state.targetX -= 5;
    if (state.keys.right) state.targetX += 5;
    state.targetX = Math.max(30, Math.min(canvas.width - 30, state.targetX));

    // ペンギン移動
    state.penguinX += (state.targetX - state.penguinX) * 0.2;

    // 魚の移動
    for (let i = state.fish.length - 1; i >= 0; i--) {
      state.fish[i].y += state.fish[i].speed;
      if (state.fish[i].y > canvas.height + 20) {
        if (!state.fish[i].caught && !state.fish[i].poison) {
          state.combo = 0;
        }
        state.fish.splice(i, 1);
      }
    }

    // ランダムに魚を追加
    if (Math.random() < 0.02) {
      spawnFish();
    }

    checkCatch();
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
    if (!state.running && isClickOnStartButton(x, y)) {
      markPlayed();
      playTone('start');
      state.running = true;
      state.firstPlay = false;
      state.showRetryButton = false;
      state.startTime = performance.now();
      state.score = 0;
      state.combo = 0;
      state.fish = [];
      state.penguinX = 230;
      state.targetX = 230;
      logEl.textContent = '魚をキャッチ！連続でコンボボーナス！';
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
      const text = `ペンギンのフィッシュダイブで${state.best}点を記録！ #aomagame`;
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
2. 上から落ちてくる魚を左右移動（マウス/タッチ/矢印キー）でキャッチ。
3. 連続でキャッチするとコンボボーナスが増加。紫色の毒魚は避けよう！

## 実装メモ
- 上から落ちてくる魚を左右移動でキャッチする仕組み
- 連続キャッチでコンボが増え、ボーナス得点が加算
- 毒魚（紫色）を避ける要素で緊張感を演出

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
