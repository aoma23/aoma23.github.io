---
title: "毎日ゲームチャレンジ Day 51: キリンのハイリーチ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

51日目は「キリンのハイリーチ」。左右から流れてくる木の葉っぱを、キリンの首を伸ばしてキャッチ！高い位置ほど高得点です。

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
  height: 420px;
  margin: 0 auto;
  background: linear-gradient(180deg, #87ceeb 0%, #98d8c8 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
  display: block;
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
  <p class="log">画面をクリック/タップで首を伸ばして葉っぱをキャッチ！</p>
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
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    trees: [],
    giraffePosY: 350,
    giraffeNeckExtend: 0,
    targetNeckExtend: 0,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    catch: { frequency: 720, duration: 0.12, gain: 0.2 },
    miss: { frequency: 280, duration: 0.15, gain: 0.18 }
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

  const spawnTree = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const leafY = 50 + Math.random() * 250;
    const speed = 1.2 + Math.random() * 0.8;
    state.trees.push({
      side,
      x: side === 'left' ? -60 : canvas.width + 60,
      leafY,
      speed: side === 'left' ? speed : -speed,
      caught: false
    });
  };

  const checkCatch = () => {
    const giraffeHeadY = state.giraffePosY - state.giraffeNeckExtend;
    const giraffeX = canvas.width / 2;

    for (const tree of state.trees) {
      if (tree.caught) continue;
      const dist = Math.hypot(tree.x - giraffeX, tree.leafY - giraffeHeadY);
      if (dist < 25) {
        tree.caught = true;
        const heightScore = Math.floor((300 - tree.leafY) / 10);
        const points = 10 + heightScore;
        state.score += points;
        playTone('catch');
        logEl.textContent = `キャッチ！+${points}点`;
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
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, START_BUTTON.y, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    // Button shadow
    ctx.shadowColor = 'rgba(217, 119, 6, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#d97706';
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

  const drawGiraffe = () => {
    const baseX = canvas.width / 2;
    const baseY = state.giraffePosY;
    const headY = baseY - 40 - state.giraffeNeckExtend;

    // 体
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(baseX - 20, baseY, 40, 60);

    // 首
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.lineTo(baseX, headY);
    ctx.stroke();

    // 頭
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(baseX, headY, 15, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(baseX + 5, headY - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTree = (tree) => {
    // 幹
    ctx.fillStyle = '#92400e';
    ctx.fillRect(tree.x - 10, tree.leafY + 20, 20, 200);

    // 葉っぱ
    if (!tree.caught) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(tree.x, tree.leafY, 15, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = () => {
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = '#98d8c8';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

    for (const tree of state.trees) {
      drawTree(tree);
    }

    drawGiraffe();

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

    // 首の伸縮アニメーション
    if (state.giraffeNeckExtend < state.targetNeckExtend) {
      state.giraffeNeckExtend += 15;
      if (state.giraffeNeckExtend > state.targetNeckExtend) {
        state.giraffeNeckExtend = state.targetNeckExtend;
      }
    } else if (state.giraffeNeckExtend > state.targetNeckExtend) {
      state.giraffeNeckExtend -= 15;
      if (state.giraffeNeckExtend < state.targetNeckExtend) {
        state.giraffeNeckExtend = state.targetNeckExtend;
      }
    }

    // 木の移動
    for (let i = state.trees.length - 1; i >= 0; i--) {
      state.trees[i].x += state.trees[i].speed;
      if (state.trees[i].x < -100 || state.trees[i].x > canvas.width + 100) {
        state.trees.splice(i, 1);
      }
    }

    // ランダムに木を追加
    if (Math.random() < 0.015) {
      spawnTree();
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
    if (!state.running) {
      if (isClickOnStartButton(x, y)) {
        markPlayed();
        playTone('start');
        state.running = true;
        state.firstPlay = false;
        state.showRetryButton = false;
        state.startTime = performance.now();
        state.score = 0;
        state.trees = [];
        state.giraffeNeckExtend = 0;
        state.targetNeckExtend = 0;
        logEl.textContent = '葉っぱをキャッチ！高い位置ほど高得点！';
        gameLoop();
      }
    } else {
      state.targetNeckExtend = state.targetNeckExtend === 0 ? 200 : 0;
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
      const text = `キリンのハイリーチで${state.best}点を記録！ #aomagame`;
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
2. 左右から流れてくる木の葉っぱを、画面をクリック/タップで首を伸ばしてキャッチ。
3. 高い位置の葉っぱほど高得点。ベストスコアを目指してキャッチしまくろう！

## 実装メモ
- キリンの首を伸ばすアニメーションで葉っぱをキャッチする仕組み
- 高い位置の葉っぱほど高得点になる計算式を実装
- 左右から流れてくる木の速度をランダム化して難易度調整

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
