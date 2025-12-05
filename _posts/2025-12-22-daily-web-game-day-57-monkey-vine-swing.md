---
title: "毎日ゲームチャレンジ Day 57: サルのツルスイング"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-56-bee-flower-dash/' | relative_url }}">ハチのフラワーダッシュ</a>

57日目は「サルのツルスイング」。タイミングよくタップしてツルを掴んでジャングルを進もう！バナナをキャッチでボーナス！

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
  height: 400px;
  margin: 0 auto;
  background: linear-gradient(180deg, #86efac 0%, #22c55e 100%);
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
    <span class="distance">つかんだツル: 0</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="400"></canvas>
  <p class="log">タップでツルを掴んでスイング！</p>
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

  const storageKey = 'aomagame:best:monkey';
  const playedKey = 'aomagame:played:monkey';

  const GRAVITY = 0.4;

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    score: 0,
    best: 0,
    vineCount: 0,
    cameraX: 0,
    canGrab: false,
    nextVineId: 0,
    monkey: {
      x: 100,
      y: 300,
      vx: 0,
      vy: 0,
      swinging: false,
      vineId: null,
      angle: 0,
      angularVelocity: 0
    },
    vines: [],
    bananas: [],
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    grab: { frequency: 540, duration: 0.08, gain: 0.18 },
    release: { frequency: 420, duration: 0.1, gain: 0.16 },
    banana: { frequency: 780, duration: 0.12, gain: 0.2 },
    fall: { frequency: 180, duration: 0.3, gain: 0.2 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.grab;
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
    distanceEl.textContent = `つかんだツル: ${state.vineCount}`;
    scoreEl.textContent = `得点: ${state.score}`;
    bestEl.textContent = `最高: ${state.best}`;
  };

  const spawnVine = () => {
    const lastVine = state.vines[state.vines.length - 1];
    const minX = lastVine ? lastVine.x + 140 : 250;
    const x = minX + Math.random() * 60;
    const y = 60 + Math.random() * 60;
    state.vines.push({
      id: state.nextVineId++,
      x,
      y
    });
  };

  const spawnBanana = () => {
    const lastVine = state.vines[state.vines.length - 1];
    if (!lastVine) return;
    const x = lastVine.x + 60 + Math.random() * 60;
    const y = 180 + Math.random() * 100;
    state.bananas.push({
      x,
      y,
      size: 12,
      collected: false
    });
  };

  const grabVine = () => {
    if (state.monkey.swinging) {
      // リリース
      state.monkey.swinging = false;
      state.monkey.vineId = null;
      state.canGrab = true; // リリースしたら掴めるようにする
      playTone('release');
      logEl.textContent = 'リリース！次のツルを掴もう';
    } else {
      // リリースしていなければ掴めない
      if (!state.canGrab) {
        logEl.textContent = 'まずリリースしてください！';
        return;
      }

      // 最も近いツルを掴む
      let closestVine = null;
      let closestDist = 90;

      for (const vine of state.vines) {
        const dist = Math.hypot(vine.x - state.monkey.x, (vine.y + 20) - state.monkey.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestVine = vine;
        }
      }

      if (closestVine) {
        state.monkey.swinging = true;
        state.monkey.vineId = closestVine.id;
        state.vineCount += 1;
        state.canGrab = false; // 掴んだら次のリリースまで掴めない

        // 現在の位置から角度を計算
        const dx = state.monkey.x - closestVine.x;
        const dy = state.monkey.y - (closestVine.y + 20);
        state.monkey.angle = Math.atan2(dx, dy);

        // 現在の速度から角速度を計算
        const length = 100;
        const tangentialVelocity = state.monkey.vx * Math.cos(state.monkey.angle) - state.monkey.vy * Math.sin(state.monkey.angle);
        state.monkey.angularVelocity = tangentialVelocity / length;

        playTone('grab');
        logEl.textContent = `ツルをキャッチ！${state.vineCount}本目`;
      } else {
        logEl.textContent = 'ツルが近くにない！';
      }
    }
  };

  const checkBananaCollect = () => {
    for (const banana of state.bananas) {
      if (banana.collected) continue;
      const dist = Math.hypot(banana.x - state.monkey.x, banana.y - state.monkey.y);
      if (dist < 20) {
        banana.collected = true;
        state.score += 20;
        playTone('banana');
        logEl.textContent = 'バナナゲット！+20点';

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          shareButton.disabled = false;
        }
      }
    }
  };

  const drawStartButton = () => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(22, 163, 74, 0.5)';
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

  const drawMonkey = () => {
    const m = state.monkey;
    const screenX = m.x - state.cameraX;

    // 体
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(screenX, m.y, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.arc(screenX, m.y - 18, 12, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.beginPath();
    ctx.arc(screenX - 10, m.y - 22, 5, 0, Math.PI * 2);
    ctx.arc(screenX + 10, m.y - 22, 5, 0, Math.PI * 2);
    ctx.fill();

    // 顔
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(screenX, m.y - 16, 8, 0, Math.PI * 2);
    ctx.fill();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(screenX - 4, m.y - 18, 2, 0, Math.PI * 2);
    ctx.arc(screenX + 4, m.y - 18, 2, 0, Math.PI * 2);
    ctx.fill();

    // ツルを掴んでいる場合は腕を描画
    if (state.monkey.swinging && state.monkey.vineId !== null) {
      const vine = state.vines.find(v => v.id === state.monkey.vineId);
      if (vine) {
        const vineScreenX = vine.x - state.cameraX;
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(screenX, m.y - 10);
        ctx.lineTo(vineScreenX, vine.y + 20);
        ctx.stroke();
      }
    }

    // 尻尾
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(screenX, m.y + 10);
    ctx.quadraticCurveTo(screenX + 15, m.y + 15, screenX + 10, m.y + 25);
    ctx.stroke();
  };

  const drawVine = (vine) => {
    const screenX = vine.x - state.cameraX;

    // 画面外なら描画しない
    if (screenX < -50 || screenX > canvas.width + 50) return;

    // ツル
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, vine.y + 20);
    ctx.stroke();

    // 掴む部分
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(screenX, vine.y + 20, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBanana = (banana) => {
    if (banana.collected) return;

    const screenX = banana.x - state.cameraX;

    // 画面外なら描画しない
    if (screenX < -50 || screenX > canvas.width + 50) return;

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(screenX, banana.y, banana.size, 0.3, Math.PI - 0.3);
    ctx.arc(screenX - 5, banana.y - 8, banana.size * 0.8, 1, Math.PI + 0.5);
    ctx.fill();
  };

  const draw = () => {
    // 背景
    ctx.fillStyle = '#86efac';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 地面
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 380, canvas.width, 20);

    for (const vine of state.vines) {
      drawVine(vine);
    }

    for (const banana of state.bananas) {
      drawBanana(banana);
    }

    drawMonkey();

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

    // 物理演算
    if (state.monkey.swinging && state.monkey.vineId !== null) {
      // IDで掴んでいるツルを探す
      const vine = state.vines.find(v => v.id === state.monkey.vineId);

      // ツルが見つからない（削除された）場合は落下
      if (!vine) {
        state.monkey.swinging = false;
        state.monkey.vineId = null;
        state.canGrab = true;
      } else {
        const length = 100;
        const gravity = 0.25;

      // 振り子の物理演算
      const angularAcceleration = (-gravity / length) * Math.sin(state.monkey.angle);
      state.monkey.angularVelocity += angularAcceleration;

      // 減衰させる（エネルギーロス）
      state.monkey.angularVelocity *= 0.99;

      // エネルギーを少し追加して揺れを維持
      if (Math.abs(state.monkey.angle) < 1.2) {
        state.monkey.angularVelocity += Math.sign(state.monkey.angularVelocity) * 0.001;
      }

      state.monkey.angle += state.monkey.angularVelocity;

      // 角度を制限（回転を防ぐ）
      state.monkey.angle = Math.max(-1.8, Math.min(1.8, state.monkey.angle));

      // 位置を更新
      state.monkey.x = vine.x + Math.sin(state.monkey.angle) * length;
      state.monkey.y = vine.y + 20 + Math.cos(state.monkey.angle) * length;

        // リリース用の速度を計算（接線方向の速度を大きくして遠くへ飛ぶように）
        const tangentialSpeed = state.monkey.angularVelocity * length * 1.5;
        state.monkey.vx = tangentialSpeed * Math.cos(state.monkey.angle);
        state.monkey.vy = -tangentialSpeed * Math.sin(state.monkey.angle);
      }
    } else {
      // 重力
      state.monkey.vy += GRAVITY;
      state.monkey.x += state.monkey.vx;
      state.monkey.y += state.monkey.vy;

      // 地面衝突
      if (state.monkey.y >= 360) {
        state.running = false;
        state.gameOver = true;
        state.showRetryButton = false;
        playTone('fall');
        logEl.textContent = `落下！${state.vineCount}本のツルを掴んだ！`;
        draw();
        window.setTimeout(() => {
          state.showRetryButton = true;
          draw();
        }, 1000);
        return;
      }
    }

    // カメラをサルに追従（サルを画面の左側1/3あたりに保つ）
    const targetCameraX = state.monkey.x - canvas.width / 3;
    state.cameraX += (targetCameraX - state.cameraX) * 0.1;

    // ツルとバナナの管理
    state.vines = state.vines.filter(v => v.x > state.cameraX - 100);
    state.bananas = state.bananas.filter(b => b.x > state.cameraX - 100);

    while (state.vines.length < 5) {
      spawnVine();
    }

    if (Math.random() < 0.02 && state.bananas.filter(b => !b.collected).length < 3) {
      spawnBanana();
    }

    checkBananaCollect();
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
      state.vineCount = 0;
      state.cameraX = 0;
      state.canGrab = false;
      state.nextVineId = 0;
      state.monkey = {
        x: 100,
        y: 300,
        vx: 0,
        vy: 0,
        swinging: false,
        vineId: null,
        angle: 0,
        angularVelocity: 0
      };
      state.vines = [{ id: state.nextVineId++, x: 100, y: 100 }];
      state.bananas = [];
      state.monkey.swinging = true;
      state.monkey.vineId = 0;
      state.vineCount = 1;

      // 初期角度を設定（少し左に傾ける）
      state.monkey.angle = -0.4;
      state.monkey.angularVelocity = 0.01;

      for (let i = 0; i < 4; i++) {
        spawnVine();
      }

      logEl.textContent = 'タップでツルをリリース→次のツルを掴もう！';
      gameLoop();
    } else if (state.running && !state.gameOver) {
      grabVine();
    }
  };

  let lastClickTime = 0;

  canvas.addEventListener('click', (e) => {
    const now = performance.now();
    if (now - lastClickTime < 200) return; // 重複クリック防止
    lastClickTime = now;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    handleCanvasClick(x, y);
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const now = performance.now();
    if (now - lastClickTime < 200) return; // 重複クリック防止
    lastClickTime = now;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    handleCanvasClick(x, y);
  });

  let spacePressed = false;

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (state.running && !state.gameOver && !spacePressed) {
        spacePressed = true;
        grabVine();
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      spacePressed = false;
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `サルのツルスイングで${state.best}点獲得！ #aomagame`;
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
1. スタートボタンでゲーム開始。サルが最初のツルを掴んでいます。
2. タップ/クリック/スペースキーでツルを離し、次のツルをタイミングよく掴む。
3. バナナをキャッチでボーナス点！地面に落ちるとゲームオーバー。

## 実装メモ
- タイミングよくツルを掴んで離す振り子アクション
- 簡易的な振り子物理演算でスイング動作を実現
- バナナ収集要素でスコアアップ

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
