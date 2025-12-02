---
title: "毎日ゲームチャレンジ Day 6: クリックバースト"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-5-memory-beats/' | relative_url }}">メモリービーツ</a>

6日目は指の瞬発力を試す「クリックバースト」。制限時間5秒間で専用ボタンをひたすら連打し、最高記録を目指します。シンプルながら、キーボードやマウスの反発力によってもスコアが変わるので、デバイスごとの違いも楽しめます。

<style>
#click-burst-game {
  max-width: 420px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 16px;
  border: 2px solid #4c1d95;
  background: radial-gradient(circle at top, #a855f7, #7c3aed);
  color: #fff;
  text-align: center;
  box-shadow: 0 24px 48px rgba(124, 58, 237, 0.35);
}
#click-burst-game .hud {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 12px;
  gap: 6px;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #click-burst-game .hud {
    font-size: 0.82rem;
  }
}
#click-burst-game .tap-button {
  width: 100%;
  height: 120px;
  margin-bottom: 18px;
  border: none;
  border-radius: 20px;
  font-size: 2rem;
  font-weight: 800;
  color: #4c1d95;
  background: #f5f3ff;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
#click-burst-game .tap-button:active {
  transform: scale(0.97);
  box-shadow: inset 0 0 18px rgba(76, 29, 149, 0.25);
}
#click-burst-game .tap-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
#click-burst-game .start {
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: #4c1d95;
  background: #ede9fe;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
#click-burst-game .start:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 18px rgba(237, 233, 254, 0.25);
}
#click-burst-game .start:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}
#click-burst-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#click-burst-game .best {
  margin-top: 4px;
  font-size: 0.9rem;
  color: #ddd6fe;
}
#click-burst-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#click-burst-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 28px;
  font-size: 1rem;
  font-weight: 700;
  color: #4c1d95;
  background: linear-gradient(135deg, #fef9c3, #f472b6);
  cursor: pointer;
  box-shadow: 0 16px 34px rgba(244, 114, 182, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
#click-burst-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(244, 114, 182, 0.45);
}
#click-burst-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="click-burst-game">
  <div class="hud">
    <span class="timer">残り5.0秒</span>
    <span class="score">得点:0</span>
  </div>
  <button type="button" class="tap-button" disabled>CLICK!</button>
  <button type="button" class="start">スタート</button>
  <p class="log">スタートボタンを押すと計測が始まります。</p>
  <p class="best">ベストスコア: 0</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストスコアをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('click-burst-game');
  if (!root) {
    return;
  }

  const timerEl = root.querySelector('.timer');
  const scoreEl = root.querySelector('.score');
  const tapButton = root.querySelector('.tap-button');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const bestEl = root.querySelector('.best');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:click-burst';
  const playedKey = 'aomagame:played:click-burst';

  let score = 0;
  let timeLeft = 5;
  let timerId = null;
  let running = false;
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


  const updateTimer = () => {
    timerEl.textContent = `残り${timeLeft.toFixed(1)}秒`;
  };

  const updateScore = () => {
    scoreEl.textContent = `得点:${score}`;
  };

  const updateBestDisplay = () => {
    bestEl.textContent = `ベストスコア: ${best}`;
    if (shareButton) {
      shareButton.disabled = best <= 0;
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
      best = value;
    }
    updateBestDisplay();
  };

  const saveBest = () => {
    if (!storageAvailable || best <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(best));
  };

  const openShareWindow = () => {
    if (best <= 0) {
      return;
    }
    const text = `クリックバーストでベストスコア ${best} 回を記録！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  const stopGame = () => {
    running = false;
    tapButton.disabled = true;
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    const previousBest = best;
    if (score > best) {
      best = score;
      saveBest();
    }
    updateBestDisplay();
    if (score > previousBest) {
      logEl.textContent = `終了！合計 ${score} 回クリックしました。ベスト更新！`;
    } else {
      logEl.textContent = `終了！合計 ${score} 回クリックしました。`;
    }
  };

  const startGame = () => {
    markPlayed();
    score = 0;
    timeLeft = 5;
    updateScore();
    updateTimer();
    logEl.textContent = '全力で連打！キーボードのスペースキーでもOK。';
    running = true;
    tapButton.disabled = false;
    startButton.disabled = true;
    startButton.textContent = '計測中';
    tapButton.focus();

    const startTime = performance.now();
    timerId = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      timeLeft = Math.max(0, 5 - elapsed);
      updateTimer();
      if (timeLeft <= 0) {
        stopGame();
      }
    }, 50);
  };

  tapButton.addEventListener('click', () => {
    if (!running) {
      return;
    }
    score += 1;
    updateScore();
  });

  window.addEventListener('keydown', (event) => {
    if (!running) {
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      tapButton.dispatchEvent(new Event('click'));
    }
  });

  startButton.addEventListener('click', () => {
    if (!running) {
      startGame();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (best <= 0) {
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

  updateTimer();
  updateScore();
})();
</script>

## 遊び方
1. スタートボタンで5秒のカウントダウンが始まり、連打ボタンが有効化。
2. 制限時間内にどれだけ多くクリックできるかを競います。
3. 記録更新を狙って全力で連打しましょう。

## 実装メモ
- 0.05秒間隔で残り時間を更新し、視覚的に滑らかなカウントダウンを実現。
- ゲーム中のみクリックボタンを活性化し、終了時には自動で無効化。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
