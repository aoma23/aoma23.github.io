---
title: "毎日ゲームチャレンジ Day 64: ウサギのジャンプレース"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-63-monkey-coconut-catch/' | relative_url }}">サルのココナッツキャッチ</a>

64日目は「ウサギのジャンプレース」。走るウサギを操作して、障害物をジャンプで飛び越えよう！ニンジンを集めてハイスコアを目指せ！

<style>
#rabbit-game {
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
#rabbit-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #rabbit-game .hud {
    font-size: 0.82rem;
  }
}
#rabbit-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: auto;
  aspect-ratio: 460 / 420;
  margin: 0 auto;
  background: linear-gradient(180deg, #7dd3fc 0%, #86efac 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#rabbit-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#rabbit-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#rabbit-game .share button {
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
#rabbit-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#rabbit-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="rabbit-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">タップかスペースでジャンプ！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('rabbit-game');
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

  const storageKey = 'aomagame:best:rabbit';
  const playedKey = 'aomagame:played:rabbit';

  const GROUND_Y = 340;
  const GRAVITY = 0.8;
  const JUMP_POWER = -16;
  const SCROLL_SPEED = 5;

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    timeLimit: 60,
    startTime: 0,
    score: 0,
    best: 0,
    rabbit: {
      x: 100,
      y: GROUND_Y,
      vy: 0,
      size: 18,
      jumping: false,
      jumpCount: 0
    },
    obstacles: [],
    carrots: [],
    scrollOffset: 0,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    jump: { frequency: 480, duration: 0.12, gain: 0.18 },
    carrot: { frequency: 640, duration: 0.12, gain: 0.2 },
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
    const remaining = state.running ? Math.max(0, state.timeLimit - (performance.now() - state.startTime) / 1000) : state.timeLimit;
    timeEl.textContent = `残り: ${remaining.toFixed(1)}秒`;
    scoreEl.textContent = `得点: ${state.score}`;
    bestEl.textContent = `最高: ${state.best}`;
  };

  const spawnObstacle = () => {
    const type = Math.random() < 0.5 ? 'rock' : 'hole';
    state.obstacles.push({
      type,
      x: canvas.width + 50,
      y: GROUND_Y,
      width: type === 'rock' ? 30 : 40,
      height: type === 'rock' ? 30 : 20,
      passed: false
    });
  };

  const spawnCarrot = () => {
    const airborne = Math.random() < 0.3;
    state.carrots.push({
      x: canvas.width + 50,
      y: airborne ? GROUND_Y - 80 : GROUND_Y - 15,
      collected: false
    });
  };

  const jump = () => {
    if (!state.running) return;
    // 2段ジャンプまで可能
    if (state.rabbit.jumpCount >= 2) return;

    state.rabbit.vy = JUMP_POWER;
    state.rabbit.jumping = true;
    state.rabbit.jumpCount++;
    playTone('jump');
  };

  const checkCollisions = () => {
    for (const obstacle of state.obstacles) {
      if (obstacle.passed) continue;

      const rabbitBottom = state.rabbit.y + state.rabbit.size;
      const rabbitRight = state.rabbit.x + state.rabbit.size;
      const rabbitLeft = state.rabbit.x - state.rabbit.size;

      const obstacleLeft = obstacle.x - obstacle.width / 2;
      const obstacleRight = obstacle.x + obstacle.width / 2;
      const obstacleTop = obstacle.y - obstacle.height;

      const isColliding =
        rabbitRight > obstacleLeft &&
        rabbitLeft < obstacleRight &&
        rabbitBottom > obstacleTop;

      if (isColliding) {
        endGame();
        return;
      }

      if (obstacle.x < state.rabbit.x - state.rabbit.size) {
        obstacle.passed = true;
        state.score += 5;
      }
    }

    for (const carrot of state.carrots) {
      if (carrot.collected) continue;

      const dist = Math.hypot(carrot.x - state.rabbit.x, carrot.y - state.rabbit.y);
      if (dist < 25) {
        carrot.collected = true;
        state.score += 15;
        playTone('carrot');
        logEl.textContent = 'ニンジンゲット！+15点';

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
      }
    }
  };

  const drawRabbit = () => {
    const r = state.rabbit;

    // 体
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, r.size, r.size * 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.arc(r.x, r.y - r.size, r.size * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(r.x - 8, r.y - r.size - 20, 5, 15, -0.2, 0, Math.PI * 2);
    ctx.ellipse(r.x + 8, r.y - r.size - 20, 5, 15, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(r.x - 8, r.y - r.size - 20, 3, 10, -0.2, 0, Math.PI * 2);
    ctx.ellipse(r.x + 8, r.y - r.size - 20, 3, 10, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(r.x - 6, r.y - r.size - 3, 2, 0, Math.PI * 2);
    ctx.arc(r.x + 6, r.y - r.size - 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // 鼻
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(r.x, r.y - r.size + 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // 尻尾
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(r.x + r.size, r.y + 5, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawObstacle = (obstacle) => {
    if (obstacle.type === 'rock') {
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.arc(obstacle.x, obstacle.y - obstacle.height / 2, obstacle.width / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#57534e';
      ctx.beginPath();
      ctx.arc(obstacle.x - 5, obstacle.y - obstacle.height / 2 - 5, 8, 0, Math.PI * 2);
      ctx.arc(obstacle.x + 7, obstacle.y - obstacle.height / 2 + 3, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.ellipse(obstacle.x, obstacle.y - obstacle.height / 2, obstacle.width / 2, obstacle.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.ellipse(obstacle.x, obstacle.y - obstacle.height / 2, obstacle.width / 3, obstacle.height / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawCarrot = (carrot) => {
    if (carrot.collected) return;

    // ニンジン本体
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(carrot.x, carrot.y - 10);
    ctx.lineTo(carrot.x - 5, carrot.y + 5);
    ctx.lineTo(carrot.x + 5, carrot.y + 5);
    ctx.closePath();
    ctx.fill();

    // 葉
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(carrot.x, carrot.y - 10);
    ctx.lineTo(carrot.x - 3, carrot.y - 18);
    ctx.lineTo(carrot.x, carrot.y - 15);
    ctx.lineTo(carrot.x + 3, carrot.y - 18);
    ctx.closePath();
    ctx.fill();
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
    gradient.addColorStop(0, '#7dd3fc');
    gradient.addColorStop(1, '#86efac');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 地面
    ctx.fillStyle = '#78716c';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);

    // 芝生
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 20; i++) {
      const x = (i * 30 + state.scrollOffset) % canvas.width;
      ctx.fillRect(x, GROUND_Y - 3, 5, 3);
    }

    for (const obstacle of state.obstacles) {
      drawObstacle(obstacle);
    }

    for (const carrot of state.carrots) {
      drawCarrot(carrot);
    }

    drawRabbit();

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

    // ウサギの物理演算
    state.rabbit.vy += GRAVITY;
    state.rabbit.y += state.rabbit.vy;

    if (state.rabbit.y >= GROUND_Y) {
      state.rabbit.y = GROUND_Y;
      state.rabbit.vy = 0;
      state.rabbit.jumping = false;
      state.rabbit.jumpCount = 0; // 着地時にジャンプ回数をリセット
    }

    // スクロール
    state.scrollOffset += SCROLL_SPEED;

    // 障害物とニンジンの移動
    for (let i = state.obstacles.length - 1; i >= 0; i--) {
      state.obstacles[i].x -= SCROLL_SPEED;
      if (state.obstacles[i].x < -50) {
        state.obstacles.splice(i, 1);
      }
    }

    for (let i = state.carrots.length - 1; i >= 0; i--) {
      state.carrots[i].x -= SCROLL_SPEED;
      if (state.carrots[i].x < -30) {
        state.carrots.splice(i, 1);
      }
    }

    // ランダムに障害物とニンジンを生成
    if (Math.random() < 0.02) {
      spawnObstacle();
    }
    if (Math.random() < 0.015) {
      spawnCarrot();
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
      state.rabbit = {
        x: 100,
        y: GROUND_Y,
        vy: 0,
        size: 18,
        jumping: false,
        jumpCount: 0
      };
      state.obstacles = [];
      state.carrots = [];
      state.scrollOffset = 0;
      logEl.textContent = 'ジャンプで障害物を飛び越えよう！';
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
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      jump();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `ウサギのジャンプレースで${state.best}点を記録！ #aomagame`;
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
2. タップ/クリック/スペースキーでジャンプ。**2段ジャンプも可能！**
3. 岩と穴を飛び越えて進もう！障害物を越えると得点。
4. ニンジンを集めて追加得点をゲット！

## 実装メモ
- **2段ジャンプ**：空中でもう一度ジャンプ可能で高難度の障害も突破できる！
- ランナーゲームスタイルの横スクロールアクション
- ジャンプで障害物を回避
- ニンジン収集で高得点

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
