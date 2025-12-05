---
title: "毎日ゲームチャレンジ Day 4: 星キャッチ・ラン"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-3-mental-math-sprint/' | relative_url }}">30秒暗算スプリント</a>

4日目はアクション要素のある「星キャッチ・ラン」。キャンバス上で左右に動くバーを操作し、上から降ってくる流れ星を制限時間内に集めます。マウスでもタッチでも遊べるように操作系を整え、アニメーションは`requestAnimationFrame`で滑らかに描画しています。

<style>
#catch-stars-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 24px;
  border-radius: 18px;
  background: #0f172a;
  color: #e2e8f0;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
}
#catch-stars-game canvas {
  border-radius: 12px;
  width: 100%;
  display: block;
  margin: 0 auto 16px;
  background: radial-gradient(circle at 50% 25%, rgba(148, 163, 184, 0.2), rgba(15, 23, 42, 0.9));
}
#catch-stars-game .hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-weight: bold;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #catch-stars-game .hud {
    font-size: 0.82rem;
  }
}
#catch-stars-game .best {
  font-weight: 700;
}
#catch-stars-game button {
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  touch-action: manipulation;
}
#catch-stars-game button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(34, 211, 238, 0.35);
}
#catch-stars-game button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
#catch-stars-game .log {
  text-align: center;
  margin-top: 12px;
  font-size: 0.95rem;
  color: #cbd5f5;
}
#catch-stars-game .actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
#catch-stars-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #fcd34d, #f97316);
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(251, 191, 36, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  touch-action: manipulation;
}
#catch-stars-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(251, 191, 36, 0.45);
}
#catch-stars-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="catch-stars-game">
  <div class="hud">
    <span class="timer">残り30.0秒</span>
    <span class="score">得点:0</span>
    <span class="best">最高:0</span>
  </div>
  <canvas width="360" height="240"></canvas>
  <button type="button" class="start">スタート</button>
  <p class="log">星を落とさずキャッチし続けられるか挑戦！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストスコアをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('catch-stars-game');
  if (!root) {
    return;
  }

  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const startBtn = root.querySelector('.start');
  const timerEl = root.querySelector('.timer');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:catch-stars';
  const playedKey = 'aomagame:played:catch-stars';
  let bestScore = 0;
  let storageAvailable = false;

  const updatePlayCount = () => {
    const counterEl = getPlayCountEl();
    if (!counterEl) {
      return;
    }
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (typeof key !== 'string' || !key.startsWith('aomagame:played:')) {
          continue;
        }
        const value = Number.parseInt(localStorage.getItem(key) ?? '0', 10);
        if (!Number.isNaN(value) && value > 0) {
          total += 1;
        }
      }
      counterEl.textContent = total;
    } catch (error) {
      counterEl.textContent = '0';
    }
  };

  const markPlayed = () => {
    if (!storageAvailable) {
      return;
    }
    try {
      const current = Number.parseInt(localStorage.getItem(playedKey) ?? '0', 10);
      const next = Number.isNaN(current) ? 1 : current + 1;
      localStorage.setItem(playedKey, String(next));
    } catch (error) {
      return;
    }
    updatePlayCount();
  };


  const state = {
    running: false,
    timeLeft: 30,
    lastTime: null,
    lastSpawn: 0,
    spawnInterval: 900,
    score: 0,
    playerX: canvas.width / 2,
    playerWidth: 80,
    items: [],
  };

  const updateTimerText = () => {
    timerEl.textContent = `残り${state.timeLeft.toFixed(1)}秒`;
  };

  const updateScoreText = () => {
    scoreEl.textContent = `得点:${state.score}`;
  };

  const updateBestDisplay = () => {
    if (bestEl) {
      bestEl.textContent = `最高:${bestScore}`;
    }
    if (shareButton) {
      shareButton.disabled = bestScore <= 0;
    }
  };

  const detectStorage = () => {
    try {
      const testKey = `${storageKey}-test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      storageAvailable = true;
    } catch (error) {
      storageAvailable = false;
    }
  };

  const loadBest = () => {
    if (!storageAvailable) {
      updateBestDisplay();
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      updateBestDisplay();
      return;
    }
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value > 0) {
      bestScore = value;
    }
    updateBestDisplay();
  };

  const saveBest = () => {
    if (!storageAvailable || bestScore <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(bestScore));
  };

  const openShareWindow = () => {
    if (bestScore <= 0) {
      return;
    }
    const text = `星キャッチ・ランでベストスコア ${bestScore} 個を記録！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  const spawnStar = () => {
    state.items.push({
      x: 20 + Math.random() * (canvas.width - 40),
      y: -20,
      speed: 70 + Math.random() * 60,
      size: 14 + Math.random() * 8,
    });
  };

  const clampPlayer = () => {
    const half = state.playerWidth / 2;
    state.playerX = Math.max(half, Math.min(canvas.width - half, state.playerX));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player bar
    ctx.fillStyle = '#f8fafc';
    const playerY = canvas.height - 18;
    const half = state.playerWidth / 2;
    ctx.fillRect(state.playerX - half, playerY, state.playerWidth, 8);

    // Draw stars
    state.items.forEach((star) => {
      ctx.beginPath();
      ctx.fillStyle = '#facc15';
      ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });
  };

  const stopGame = (message) => {
    state.running = false;
    startBtn.disabled = false;
    startBtn.textContent = 'もう一度';
    state.items = [];
    state.lastTime = null;
    const previousBest = bestScore;
    if (state.score > bestScore) {
      bestScore = state.score;
      saveBest();
    }
    updateBestDisplay();
    if (state.score > previousBest) {
      logEl.textContent = `${message} ベスト更新！`;
    } else {
      logEl.textContent = message;
    }
  };

  const update = (deltaMs) => {
    const delta = deltaMs / 1000;
    state.timeLeft = Math.max(0, state.timeLeft - delta);

    state.items.forEach((star) => {
      star.y += star.speed * delta;
    });

    const playerY = canvas.height - 18;
    const catchZone = playerY;
    const half = state.playerWidth / 2;

    state.items = state.items.filter((star) => {
      if (star.y >= catchZone && star.y <= catchZone + 16) {
        const distance = Math.abs(star.x - state.playerX);
        if (distance <= half + star.size / 2) {
          state.score += 1;
          updateScoreText();
          return false;
        }
      }
      return star.y < canvas.height + 40;
    });

    if (state.timeLeft <= 0) {
      stopGame(`30秒終了！キャッチした星は${state.score}個でした。`);
    }
  };

  const loop = (timestamp) => {
    if (!state.running) {
      return;
    }
    if (state.lastTime === null) {
      state.lastTime = timestamp;
      requestAnimationFrame(loop);
      return;
    }

    const delta = timestamp - state.lastTime;
    state.lastTime = timestamp;

    if (timestamp - state.lastSpawn > state.spawnInterval) {
      spawnStar();
      state.lastSpawn = timestamp;
      state.spawnInterval = Math.max(420, state.spawnInterval * 0.985);
    }

    update(delta);
    draw();
    updateTimerText();

    requestAnimationFrame(loop);
  };

  const startGame = () => {
    markPlayed();
    state.running = true;
    state.timeLeft = 30;
    state.score = 0;
    state.items = [];
    state.spawnInterval = 900;
    state.lastTime = null;
    state.lastSpawn = performance.now();
    updateScoreText();
    updateTimerText();
    logEl.textContent = '星をキャッチしてスコアを伸ばそう！';
    startBtn.disabled = true;
    startBtn.textContent = 'プレイ中';
    requestAnimationFrame(loop);
  };

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.playerX = ((event.clientX - rect.left) / rect.width) * canvas.width;
    clampPlayer();
  });

  canvas.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    state.playerX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    clampPlayer();
    event.preventDefault();
  }, { passive: false });

  window.addEventListener('keydown', (event) => {
    if (!state.running) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      state.playerX -= 18;
      clampPlayer();
    } else if (event.key === 'ArrowRight') {
      state.playerX += 18;
      clampPlayer();
    }
  });

  startBtn.addEventListener('click', () => {
    if (!state.running) {
      startGame();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestScore <= 0) {
        return;
      }
      openShareWindow();
    });
  }

  detectStorage();
  loadBest();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }

  draw();
  updateTimerText();
  updateScoreText();
})();
</script>

## 遊び方
1. スタートボタンで30秒のカウントダウンと同時に流れ星が降り始めます。
2. バーをマウス移動・タッチ操作・矢印キーで左右に動かし、星が地面に落ちる前にキャッチ。
3. 捕まえた数がスコアになります。落としてしまってもゲームは継続するので最後まで粘りましょう。

## 実装メモ
- 落下速度と出現間隔を徐々に調整して終盤ほどテンポアップ。
- 衝突判定はシンプルな距離判定で実装し、ループ内で配列をフィルタして管理。
- 描画のたびに背景を塗り直し、スコアや残り時間もUIパネルとして表示しています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
