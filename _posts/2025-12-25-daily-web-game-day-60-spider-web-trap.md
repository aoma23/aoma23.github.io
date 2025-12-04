---
title: "毎日ゲームチャレンジ Day 60: クモのウェブトラップ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-59-otter-dive-fish/' | relative_url }}">カワウソのダイブフィッシュ</a>

60日目は「クモのウェブトラップ」。クリックで糸を張って飛んでくる虫を捕獲！蜂に刺されないように気をつけて！

<style>
#spider-game {
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
#spider-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #spider-game .hud {
    font-size: 0.82rem;
  }
}
#spider-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: 420px;
  margin: 0 auto;
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#spider-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#spider-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#spider-game .share button {
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
#spider-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#spider-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="spider-game">
  <div class="hud">
    <span class="time">残り: 60.0秒</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
    <span class="health">巣HP: 100</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">クリックで糸を張って虫を捕獲！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('spider-game');
  if (!root) return;

  const canvas = root.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const healthEl = root.querySelector('.health');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const START_BUTTON = {
    x: canvas.width / 2 - 80,
    y: canvas.height / 2 - 30,
    width: 160,
    height: 60
  };

  const storageKey = 'aomagame:best:spider';
  const playedKey = 'aomagame:played:spider';

  const SPIDER_X = canvas.width / 2;
  const SPIDER_Y = 50;

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
    health: 100,
    combo: 0,
    webs: [],
    insects: [],
    bees: [],
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    web: { frequency: 340, duration: 0.08, gain: 0.15 },
    catch: { frequency: 540, duration: 0.1, gain: 0.18 },
    combo: { frequency: 740, duration: 0.12, gain: 0.2 },
    bee: { frequency: 680, duration: 0.15, gain: 0.18 },
    damage: { frequency: 220, duration: 0.2, gain: 0.18 }
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
    healthEl.textContent = `巣HP: ${state.health}`;
  };

  const createWeb = (x, y) => {
    playTone('web');
    state.webs.push({
      x,
      y,
      life: 180,
      maxLife: 180
    });
  };

  const spawnInsect = () => {
    const x = Math.random() * canvas.width;
    const y = -20;
    const vx = (Math.random() - 0.5) * 2;
    const vy = 1.5 + Math.random();
    const type = Math.random() > 0.3 ? 'fly' : 'butterfly';
    const points = type === 'butterfly' ? 15 : 5;
    state.insects.push({
      x, y, vx, vy,
      type,
      points,
      caught: false,
      size: 8
    });
  };

  const spawnBee = () => {
    const x = Math.random() * canvas.width;
    const y = -20;
    const vx = (Math.random() - 0.5) * 3;
    const vy = 2 + Math.random();
    state.bees.push({
      x, y, vx, vy,
      size: 10,
      damage: 15
    });
  };

  const checkInsectCatch = () => {
    let caught = false;
    for (const insect of state.insects) {
      if (insect.caught) continue;
      for (const web of state.webs) {
        const dist = Math.hypot(insect.x - web.x, insect.y - web.y);
        if (dist < 40) {
          insect.caught = true;
          state.combo += 1;
          const comboBonus = Math.floor(state.combo / 3) * 5;
          const totalPoints = insect.points + comboBonus;
          state.score += totalPoints;

          if (state.combo >= 3) {
            playTone('combo');
            logEl.textContent = `${state.combo}コンボ！+${totalPoints}点`;
          } else {
            playTone('catch');
            logEl.textContent = `捕獲！+${totalPoints}点`;
          }

          if (state.score > state.best) {
            state.best = state.score;
            saveBest();
            shareButton.disabled = false;
          }
          caught = true;
          break;
        }
      }
    }
    return caught;
  };

  const checkBeeCatch = () => {
    for (const bee of state.bees) {
      for (const web of state.webs) {
        const dist = Math.hypot(bee.x - web.x, bee.y - web.y);
        if (dist < 40) {
          playTone('bee');
          state.health = Math.max(0, state.health - bee.damage);
          state.combo = 0;
          logEl.textContent = `蜂に刺された！-${bee.damage}HP コンボ切れ`;
          bee.y = canvas.height + 100; // 画面外へ

          if (state.health <= 0) {
            state.running = false;
            state.gameOver = true;
            state.gameOverReason = 'damaged';
            state.showRetryButton = false;
            playTone('damage');
            logEl.textContent = '巣が破壊された！';
            draw();
            window.setTimeout(() => {
              state.showRetryButton = true;
              draw();
            }, 1000);
            return true;
          }
          break;
        }
      }
    }
    return false;
  };

  const drawStartButton = () => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(107, 114, 128, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#9ca3af';
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

  const drawSpider = () => {
    // 体
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(SPIDER_X, SPIDER_Y, 12, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.arc(SPIDER_X, SPIDER_Y - 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // 脚（左右対称に4本ずつ、計8本）
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // 左側の4本
    for (let i = 0; i < 4; i++) {
      const yOffset = -8 + i * 5;
      ctx.beginPath();
      ctx.moveTo(SPIDER_X - 12, SPIDER_Y + yOffset);
      ctx.lineTo(SPIDER_X - 22, SPIDER_Y + yOffset - 8);
      ctx.lineTo(SPIDER_X - 28, SPIDER_Y + yOffset - 6);
      ctx.stroke();
    }

    // 右側の4本
    for (let i = 0; i < 4; i++) {
      const yOffset = -8 + i * 5;
      ctx.beginPath();
      ctx.moveTo(SPIDER_X + 12, SPIDER_Y + yOffset);
      ctx.lineTo(SPIDER_X + 22, SPIDER_Y + yOffset - 8);
      ctx.lineTo(SPIDER_X + 28, SPIDER_Y + yOffset - 6);
      ctx.stroke();
    }

    // 目
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(SPIDER_X - 3, SPIDER_Y - 11, 2, 0, Math.PI * 2);
    ctx.arc(SPIDER_X + 3, SPIDER_Y - 11, 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawWeb = (web) => {
    const alpha = web.life / web.maxLife;
    ctx.strokeStyle = `rgba(226, 232, 240, ${alpha * 0.9})`;
    ctx.lineWidth = 2;

    // 放射状の糸
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(web.x, web.y);
      ctx.lineTo(web.x + Math.cos(angle) * 40, web.y + Math.sin(angle) * 40);
      ctx.stroke();
    }

    // 同心円の糸
    for (let r = 10; r <= 40; r += 10) {
      ctx.beginPath();
      ctx.arc(web.x, web.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // クモからの糸
    ctx.strokeStyle = `rgba(226, 232, 240, ${alpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(SPIDER_X, SPIDER_Y);
    ctx.lineTo(web.x, web.y);
    ctx.stroke();
  };

  const drawInsect = (insect) => {
    if (insect.caught) return;

    if (insect.type === 'butterfly') {
      // 蝶
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.ellipse(insect.x - 5, insect.y, 6, 8, -0.3, 0, Math.PI * 2);
      ctx.ellipse(insect.x + 5, insect.y, 6, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.fillRect(insect.x - 1, insect.y - 6, 2, 12);
    } else {
      // ハエ
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(insect.x, insect.y, insect.size, insect.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 羽
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.beginPath();
      ctx.ellipse(insect.x - 5, insect.y - 3, 4, 6, -0.3, 0, Math.PI * 2);
      ctx.ellipse(insect.x + 5, insect.y - 3, 4, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const drawBee = (bee) => {
    // 体
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(bee.x, bee.y, bee.size, bee.size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 黒いストライプ
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bee.x - bee.size, bee.y - 3);
    ctx.lineTo(bee.x + bee.size, bee.y - 3);
    ctx.moveTo(bee.x - bee.size, bee.y + 3);
    ctx.lineTo(bee.x + bee.size, bee.y + 3);
    ctx.stroke();

    // 羽
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.ellipse(bee.x - 6, bee.y - 8, 6, 4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(bee.x + 6, bee.y - 8, 6, 4, 0.3, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = () => {
    // 背景
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const web of state.webs) {
      drawWeb(web);
    }

    drawSpider();

    for (const insect of state.insects) {
      drawInsect(insect);
    }

    for (const bee of state.bees) {
      drawBee(bee);
    }

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

    // クモの巣の寿命
    for (let i = state.webs.length - 1; i >= 0; i--) {
      state.webs[i].life -= 1;
      if (state.webs[i].life <= 0) {
        state.webs.splice(i, 1);
      }
    }

    // 虫の移動
    for (let i = state.insects.length - 1; i >= 0; i--) {
      state.insects[i].x += state.insects[i].vx;
      state.insects[i].y += state.insects[i].vy;

      if (state.insects[i].y > canvas.height + 20) {
        state.insects.splice(i, 1);
        state.combo = 0;
      }
    }

    // 蜂の移動
    for (let i = state.bees.length - 1; i >= 0; i--) {
      state.bees[i].x += state.bees[i].vx;
      state.bees[i].y += state.bees[i].vy;

      if (state.bees[i].y > canvas.height + 20) {
        state.bees.splice(i, 1);
      }
    }

    // ランダムに虫と蜂を追加
    if (Math.random() < 0.03) {
      spawnInsect();
    }
    if (Math.random() < 0.015) {
      spawnBee();
    }

    const caughtSomething = checkInsectCatch();
    if (!caughtSomething) {
      // 何も捕まえられなかった虫がいたらコンボ切れ
      for (const insect of state.insects) {
        if (insect.y > canvas.height && !insect.caught) {
          state.combo = 0;
          break;
        }
      }
    }

    if (checkBeeCatch()) return;

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
      state.health = 100;
      state.combo = 0;
      state.webs = [];
      state.insects = [];
      state.bees = [];
      logEl.textContent = 'クリックで糸を張って虫を捕獲！蜂に注意！';
      gameLoop();
    } else if (state.running && !state.gameOver) {
      if (state.webs.length < 3) {
        createWeb(x, y);
      } else {
        logEl.textContent = '糸は3本まで！';
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
      const text = `クモのウェブトラップで${state.best}点を記録！ #aomagame`;
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
2. クリック/タップで好きな場所にクモの巣を張る（最大3つ）。
3. 上から落ちてくる虫を捕獲して得点！蜂を捕まえると巣がダメージを受けるので注意！

## 実装メモ
- クリックで任意の場所にクモの巣を張るゲーム
- 連続キャッチでコンボボーナス
- 蜂は捕まえると巣にダメージ、HPが0になるとゲームオーバー
- クモの巣は時間経過で消える

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
