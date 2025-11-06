---
title: "毎日Webゲームチャレンジ Day 11: ビートバー・チャレンジ"
categories:
  - game
tags:
  - aomagame
---

11日目はタイミング命の「ビートバー・チャレンジ」。往復するバーが判定ゾーンに入った瞬間にクリックして、連続成功をどこまで伸ばせるか挑戦します。リズム感と集中力を同時に鍛えられるワンボタンゲームです。

<style>
#beat-bar-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f172a, #1f2937);
  color: #f8fafc;
  box-shadow: 0 28px 44px rgba(15, 23, 42, 0.45);
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#beat-bar-game .hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  font-weight: 700;
}
#beat-bar-game .arena {
  position: relative;
  height: 120px;
  border-radius: 16px;
  background: rgba(148, 163, 184, 0.1);
  overflow: hidden;
  margin-bottom: 18px;
}
#beat-bar-game .zone {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 80px;
  left: calc(50% - 40px);
  background: rgba(34, 197, 94, 0.18);
  border: 2px dashed rgba(34, 197, 94, 0.6);
}
#beat-bar-game .bar {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  border-radius: 12px;
  background: linear-gradient(180deg, #38bdf8, #0ea5e9);
  box-shadow: 0 10px 26px rgba(14, 165, 233, 0.35);
}
#beat-bar-game .controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}
#beat-bar-game button {
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#beat-bar-game .tap {
  background: #38bdf8;
  color: #0f172a;
  box-shadow: 0 14px 28px rgba(56, 189, 248, 0.35);
}
#beat-bar-game .tap:hover:not(:disabled) {
  transform: translateY(-1px);
}
#beat-bar-game .start {
  background: rgba(248, 250, 252, 0.12);
  color: #f8fafc;
}
#beat-bar-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
}
#beat-bar-game button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#beat-bar-game .log {
  margin-top: 16px;
  text-align: center;
  font-size: 0.95rem;
}
#beat-bar-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#beat-bar-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(249, 115, 22, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#beat-bar-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(249, 115, 22, 0.45);
}
#beat-bar-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="beat-bar-game">
  <div class="hud">
    <span class="streak">連続成功: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="speed">スピード: 1.6s</span>
  </div>
  <div class="arena">
    <div class="zone"></div>
    <div class="bar"></div>
  </div>
  <div class="controls">
    <button type="button" class="tap" disabled>タイミングタップ</button>
    <button type="button" class="start">スタート</button>
  </div>
  <p class="log">スタートでバーが動き始めます。ゾーンに重なった瞬間にタップ！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('beat-bar-game');
  if (!root) {
    return;
  }

  const barEl = root.querySelector('.bar');
  const zoneEl = root.querySelector('.zone');
  const streakEl = root.querySelector('.streak');
  const bestEl = root.querySelector('.best');
  const speedEl = root.querySelector('.speed');
  const tapButton = root.querySelector('.tap');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:beat-bar';
  const playedKey = 'aomagame:played:beat-bar';

  let animationId = null;
  let running = false;
  let direction = 1;
  let position = 0;
  let lastTimestamp = 0;
  let speed = 1.6;
  let streak = 0;
  let best = 0;
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


  const zoneRect = () => zoneEl.getBoundingClientRect();
  const barRect = () => barEl.getBoundingClientRect();

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
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return;
    }
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value > 0) {
      best = value;
      bestEl.textContent = `ベスト: ${best}`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || best <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(best));
  };

  const updateHud = () => {
    streakEl.textContent = `連続成功: ${streak}`;
    bestEl.textContent = `ベスト: ${best}`;
    speedEl.textContent = `スピード: ${speed.toFixed(1)}s`;
    shareButton.disabled = best <= 0;
  };

  const resetBar = () => {
    const arenaWidth = root.querySelector('.arena').clientWidth;
    position = Math.random() < 0.5 ? 0 : arenaWidth - barEl.offsetWidth;
    direction = Math.random() < 0.5 ? 1 : -1;
    barEl.style.left = `${position}px`;
  };

  const loop = (timestamp) => {
    if (!running) {
      return;
    }
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const arenaWidth = root.querySelector('.arena').clientWidth;
    const maxPosition = arenaWidth - barEl.offsetWidth;
    const distancePerMs = (arenaWidth / (speed * 1000));
    position += direction * distancePerMs * delta;

    if (position <= 0) {
      position = 0;
      direction = 1;
    } else if (position >= maxPosition) {
      position = maxPosition;
      direction = -1;
    }

    barEl.style.left = `${position}px`;
    animationId = requestAnimationFrame(loop);
  };

  const startGame = () => {
    markPlayed();
    running = true;
    streak = 0;
    speed = 1.6;
   updateHud();
   tapButton.disabled = false;
   startButton.disabled = true;
   logEl.textContent = '判定ゾーンに重なった瞬間を狙ってタップ！';
   resetBar();
   lastTimestamp = 0;
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  };

  const stopGame = () => {
    running = false;
    tapButton.disabled = true;
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    cancelAnimationFrame(animationId);
    animationId = null;
  };

  const isHit = () => {
    const zone = zoneRect();
    const bar = barRect();
    return bar.left >= zone.left && bar.right <= zone.right;
  };

  tapButton.addEventListener('click', () => {
    if (!running) {
      return;
    }
    if (isHit()) {
      streak += 1;
      logEl.textContent = 'ナイス！連続成功を伸ばそう。';
      if (speed > 0.5) {
        speed = Math.max(0.5, speed - 0.1);
      } else {
        speed = 0.5 + Math.random() * 0.3;
      }
      if (streak > best) {
        best = streak;
        saveBest();
        shareButton.disabled = false;
}
      updateHud();
      resetBar();
    } else {
      logEl.textContent = '惜しい！連続成功はリセット。';
      streak = 0;
      speed = 1.6;
      updateHud();
    }
  });

  startButton.addEventListener('click', () => {
    if (running) {
      return;
    }
    startGame();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (best <= 0) {
        return;
      }
      const text = `ビートバー・チャレンジで連続成功 ${best} を達成！ #aomagame`;
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
1. スタートを押すとバーが左右に往復し始めます。
2. バーが中央の判定ゾーンに完全に重なった瞬間を狙って「タイミングタップ」を押します。
3. 連続成功数を伸ばすほどバーのスピードが上がっていくので、集中して記録を狙ってください。

## 実装メモ
- `requestAnimationFrame`でバーの位置を更新し、往復運動の速度をプレイ状況に合わせて調整。
- 判定はバーとゾーンの矩形を比較して、完全に重なった時だけ成功とみなすシビアな設定。
- 成功するたびに速度を少しずつ上げ、緊張感が続くようゲームテンポを設計しました。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
