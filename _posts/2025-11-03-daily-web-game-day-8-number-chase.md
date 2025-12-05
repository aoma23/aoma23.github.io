---
title: "毎日ゲームチャレンジ Day 8: ナンバーチェイス"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-7-mini-minesweeper/' | relative_url }}">5×5ミニマインスイーパー</a>

8日目は数字を追いかけるスピード勝負「ナンバーチェイス」。1から20までの数字タイルを順番にタップして、すべての数字を最速で取り切るタイムアタックです。指とマウスの精度を鍛える短距離走のようなゲームに仕上げました。

<style>
#number-chase-game {
  width: min(520px, 100%);
  max-width: 520px;
  margin: 24px auto;
  padding: clamp(16px, 5vw, 28px);
  border-radius: 18px;
  background: linear-gradient(145deg, #0ea5e9, #2563eb);
  color: #fff;
  box-shadow: 0 28px 48px rgba(14, 165, 233, 0.35);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  box-sizing: border-box;
}
#number-chase-game .hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #number-chase-game .hud {
    font-size: 0.82rem;
  }
}
#number-chase-game .grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-auto-rows: minmax(56px, 1fr);
  gap: 10px;
  margin: 0 auto 18px;
}
#number-chase-game button.tile {
  border: none;
  border-radius: 16px;
  padding: 18px 0;
  background: rgba(15, 23, 42, 0.12);
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, background 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
  font-variant-numeric: tabular-nums;
}
#number-chase-game button.tile:active:not(.disabled) {
  transform: scale(0.97);
}
#number-chase-game button.tile.correct {
  background: #22c55e;
  color: #fff;
  box-shadow: inset 0 0 12px rgba(15, 23, 42, 0.2);
}
#number-chase-game button.tile.disabled {
  background: rgba(15, 23, 42, 0.08);
  color: rgba(15, 23, 42, 0.35);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
#number-chase-game button.tile.shake {
  animation: number-chase-shake 0.24s ease;
}
@keyframes number-chase-shake {
  10% { transform: translateX(-4px); }
  30% { transform: translateX(4px); }
  50% { transform: translateX(-3px); }
  70% { transform: translateX(3px); }
  90% { transform: translateX(-2px); }
  100% { transform: translateX(0); }
}
#number-chase-game .start {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1.05rem;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
#number-chase-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 26px rgba(15, 23, 42, 0.25);
}
#number-chase-game .start:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
#number-chase-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#number-chase-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#number-chase-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fde68a, #f97316);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(249, 115, 22, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#number-chase-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 36px rgba(249, 115, 22, 0.45);
}
#number-chase-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="number-chase-game">
  <div class="hud">
    <span class="timer">タイム:0.00秒</span>
    <span class="best">最高:--秒</span>
  </div>
  <div class="grid"></div>
  <button type="button" class="start">スタート</button>
  <p class="log">スタートボタンを押すと計測が始まります。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('number-chase-game');
  if (!root) {
    return;
  }

  const timerEl = root.querySelector('.timer');
  const bestEl = root.querySelector('.best');
  const gridEl = root.querySelector('.grid');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:number-chase';
  const playedKey = 'aomagame:played:number-chase';

  let sequence = [];
  let expected = 1;
  let startTime = 0;
  let elapsed = 0;
  let timerId = null;
  let bestTime = null;
  let running = false;
  let storageAvailable = false;
  let audioCtx = null;
  const soundMap = {
    start: { frequency: 540, duration: 0.18, gain: 0.22 },
    tap: { frequency: 760, duration: 0.08, gain: 0.2 },
    miss: { frequency: 280, duration: 0.16, gain: 0.24 },
    complete: { frequency: 920, duration: 0.2, gain: 0.24 }
  };

  const ensureAudio = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) {
      return null;
    }
    if (!audioCtx) {
      audioCtx = new Context();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  };

  const playTone = (type) => {
    const ctx = ensureAudio();
    if (!ctx) {
      return;
    }
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.tap;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(gain, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(envelope).connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  };

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
      bestEl.textContent = '最高:--秒';
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      bestEl.textContent = '最高:--秒';
      return;
    }
    const value = Number.parseFloat(stored);
    if (!Number.isNaN(value) && value > 0) {
      bestTime = value;
      bestEl.textContent = `最高:${bestTime.toFixed(2)}秒`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || bestTime === null) {
      return;
    }
    localStorage.setItem(storageKey, String(bestTime));
  };

  const updateTimer = () => {
    if (!running) {
      return;
    }
    elapsed = (performance.now() - startTime) / 1000;
    timerEl.textContent = `タイム:${elapsed.toFixed(2)}秒`;
  };

  const stopTimer = () => {
    running = false;
    if (timerId) {
      cancelAnimationFrame(timerId);
      timerId = null;
    }
  };

  const loop = () => {
    updateTimer();
    if (running) {
      timerId = requestAnimationFrame(loop);
    }
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const renderGrid = () => {
    gridEl.innerHTML = '';
    sequence = shuffle(Array.from({ length: 20 }, (_, idx) => idx + 1));
    sequence.forEach((value) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile disabled';
      button.textContent = value;
      gridEl.appendChild(button);
    });
  };

  const startGame = () => {
    markPlayed();
    expected = 1;
    renderGrid();
    playTone('start');
    Array.from(gridEl.children).forEach((tile) => {
      tile.classList.remove('disabled', 'correct');
      tile.addEventListener('pointerdown', tileHandler, { passive: false });
    });
    startButton.disabled = true;
    shareButton.disabled = bestTime === null;
    running = true;
    startTime = performance.now();
    timerEl.textContent = 'タイム:0.00秒';
    logEl.textContent = '数字を1から順番にタップ！';
    loop();
  };

  const finishGame = () => {
    stopTimer();
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    Array.from(gridEl.children).forEach((tile) => {
      tile.removeEventListener('pointerdown', tileHandler);
    });
    if (bestTime === null || elapsed < bestTime) {
      bestTime = elapsed;
      bestEl.textContent = `最高:${bestTime.toFixed(2)}秒`;
      saveBest();
      logEl.textContent = `クリア！タイムは ${elapsed.toFixed(2)} 秒。ベスト更新です！`;
      shareButton.disabled = false;
      playTone('complete');
    } else {
      logEl.textContent = `クリア！タイムは ${elapsed.toFixed(2)} 秒。次はベスト更新を狙いましょう。`;
      playTone('complete');
    }
  };

  const tileHandler = (event) => {
    if (!running) {
      return;
    }
    event.preventDefault();
    const button = event.currentTarget;
    const value = Number(button.textContent);
    if (value !== expected) {
      button.classList.add('shake');
      setTimeout(() => button.classList.remove('shake'), 260);
      playTone('miss');
      return;
    }
    button.classList.add('correct');
    expected += 1;
    playTone('tap');
    if (expected > 20) {
      finishGame();
    }
  };

  startButton.addEventListener('click', () => {
    if (running) {
      return;
    }
    renderGrid();
    startGame();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestTime === null) {
        return;
      }
      const text = `ナンバーチェイスでベスト ${bestTime.toFixed(2)} 秒を記録！ #aomagame`;
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
  renderGrid();
})();
</script>

## 遊び方
1. スタートを押すと1から20までの数字タイルが並びます。
2. 1→2→3…と昇順で素早くタップしていきます。
3. 20まで押し切ったらゴール。タイム短縮を目指してください。

## 実装メモ
- ボードは毎回シャッフルし、左右の視線移動が必要になるよう構成しました。
- 経過時間は`requestAnimationFrame`で更新して、滑らかなタイマー表示を実現。
- ベストタイムをHUDに表示し、自己記録がすぐ分かるUIにしています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
