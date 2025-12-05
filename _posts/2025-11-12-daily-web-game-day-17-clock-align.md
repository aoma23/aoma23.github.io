---
title: "毎日ゲームチャレンジ Day 17: クロックアライン"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-16-vector-escape/' | relative_url }}">ネビュラ・シューター</a>

17日目は回転する針を揃える「クロックアライン」。中心から伸びる針が自動回転するので、ジャストタイミングで停止させてターゲット角度に合わせます。素早い判断と繰り返しの精度が勝負どころです。

<style>
#clock-align-game {
  max-width: 460px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: #f8fafc;
  color: #0f172a;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.18);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#clock-align-game .hud {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #clock-align-game .hud {
    font-size: 0.82rem;
  }
}
#clock-align-game .dial {
  position: relative;
  width: min(88vw, 320px);
  aspect-ratio: 1 / 1;
  margin: 0 auto 18px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(148, 163, 184, 0.18), rgba(148, 163, 184, 0.05));
  border: 6px solid rgba(148, 163, 184, 0.4);
}
#clock-align-game .needle,
#clock-align-game .target {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 6px;
  height: 48%;
  transform-origin: center bottom;
  border-radius: 8px;
}
#clock-align-game .needle {
  background: linear-gradient(180deg, #22d3ee, #2563eb);
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.3);
}
#clock-align-game .target {
  background: rgba(248, 113, 113, 0.7);
  pointer-events: none;
}
#clock-align-game .start,
#clock-align-game .stop {
  width: 48%;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#clock-align-game .start {
  background: #38bdf8;
  color: #0f172a;
}
#clock-align-game .stop {
  background: #f97316;
  color: #fff;
}
#clock-align-game .start:hover:not(:disabled),
#clock-align-game .stop:hover:not(:disabled) {
  transform: translateY(-1px);
}
#clock-align-game button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#clock-align-game .controls {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}
#clock-align-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#clock-align-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#clock-align-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbcfe8, #f472b6);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(244, 114, 182, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#clock-align-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(244, 114, 182, 0.45);
}
#clock-align-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="clock-align-game">
  <div class="hud">
    <span class="angle">目標角度:0°</span>
    <span class="score">ベスト精度:--°</span>
    <span class="count"></span>
  </div>
  <div class="dial">
    <div class="target"></div>
    <div class="needle"></div>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
    <button type="button" class="stop" disabled>ストップ</button>
  </div>
  <p class="log">スタートすると針が回転します。狙いを定めてストップ！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('clock-align-game');
  if (!root) {
    return;
  }

  const needleEl = root.querySelector('.needle');
  const targetEl = root.querySelector('.target');
  const startButton = root.querySelector('.start');
  const stopButton = root.querySelector('.stop');
  const angleEl = root.querySelector('.angle');
  const scoreEl = root.querySelector('.score');
  const countEl = root.querySelector('.count');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:clock-align';
  const playedKey = 'aomagame:played:clock-align';

  let targetAngle = 0;
  let currentAngle = 0;
  let angularVelocity = 0;
  let animationId = null;
  let running = false;
  let bestAccuracy = null;
  let attempts = 0;
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
      return;
    }
    const storedBest = localStorage.getItem(storageKey);
    if (storedBest) {
      const value = Number.parseFloat(storedBest);
      if (!Number.isNaN(value) && value >= 0) {
        bestAccuracy = value;
        shareButton.disabled = false;
      }
    }
    const storedAttempts = localStorage.getItem(`${storageKey}:attempts`);
    if (storedAttempts) {
      const value = Number.parseInt(storedAttempts, 10);
      if (!Number.isNaN(value) && value > 0) {
        attempts = value;
      }
    }
    updateHud();
  };

  const saveBest = () => {
    if (!storageAvailable || bestAccuracy === null) {
      return;
    }
    localStorage.setItem(storageKey, String(bestAccuracy));
  };

  const saveAttempts = () => {
    if (!storageAvailable) {
      return;
    }
    localStorage.setItem(`${storageKey}:attempts`, String(attempts));
  };

  const updateHud = () => {
    angleEl.textContent = `目標角度:${targetAngle}°`;
    scoreEl.textContent = `ベスト精度:${bestAccuracy === null ? '--' : bestAccuracy.toFixed(1)}°`;
    countEl.textContent = `: ${attempts}`;
    shareButton.disabled = bestAccuracy === null;
  };

  const resetDial = () => {
    targetAngle = Math.floor(Math.random() * 360);
    targetEl.style.transform = `translate(-50%, -100%) rotate(${targetAngle}deg)`;
    currentAngle = Math.random() * 360;
    needleEl.style.transform = `translate(-50%, -100%) rotate(${currentAngle}deg)`;
    angularVelocity = (Math.random() * 180 + 90) * (Math.random() < 0.5 ? 1 : -1);
    updateHud();
  };

  const step = (timestamp) => {
    if (!running) {
      return;
    }
    if (!needleEl.dataset.last) {
      needleEl.dataset.last = String(timestamp);
    }
    const last = Number(needleEl.dataset.last);
    const delta = (timestamp - last) / 1000;
    needleEl.dataset.last = String(timestamp);
    currentAngle = (currentAngle + angularVelocity * delta + 360) % 360;
    needleEl.style.transform = `translate(-50%, -100%) rotate(${currentAngle}deg)`;
    animationId = requestAnimationFrame(step);
  };

  const startGame = () => {
    markPlayed();
    attempts += 1;
    saveAttempts();
    resetDial();
    running = true;
    needleEl.dataset.last = '';
    logEl.textContent = '狙いを定めてストップボタンを押そう！';
    startButton.disabled = true;
    stopButton.disabled = false;
    animationId = requestAnimationFrame(step);
  };

  const stopGame = () => {
    if (!running) {
      return;
    }
    running = false;
    stopButton.disabled = true;
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    cancelAnimationFrame(animationId);
    animationId = null;

    const diff = Math.min(Math.abs(targetAngle - currentAngle), 360 - Math.abs(targetAngle - currentAngle));
    logEl.textContent = `結果: ずれ ${diff.toFixed(1)}°。`;
    if (bestAccuracy === null || diff < bestAccuracy) {
      bestAccuracy = diff;
      saveBest();
      shareButton.disabled = false;
      logEl.textContent += ' ベスト記録を更新しました！';
    }
    updateHud();
  };

  startButton.addEventListener('click', () => {
    startGame();
  });

  stopButton.addEventListener('click', () => {
    stopGame();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestAccuracy === null) {
        return;
      }
      const text = `クロックアラインで誤差 ${bestAccuracy.toFixed(1)}° を達成！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
  updateHud();
})();
</script>

## 遊び方
1. スタートを押すと針が自動回転し、目標角度が表示されます。
2. 針が目標角度に重なったと思ったタイミングでストップを押します。
3. 誤差が小さいほどスコア更新のチャンス。繰り返して精度を磨きましょう。

## 実装メモ
- 乱数で角度と速度を生成し、`requestAnimationFrame`で針を滑らかに回転。
- ストップ後は角度差を算出し、ベスト誤差を更新するとシェアボタンを有効化。
- もローカルに記録し、上達具合が分かりやすい HUD を用意しました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
