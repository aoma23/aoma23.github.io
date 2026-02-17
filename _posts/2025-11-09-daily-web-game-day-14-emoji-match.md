---
title: "毎日ゲームチャレンジ Day 14: エモジーマッチ"
og_image: "/assets/images/games/day14_og.png"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  

14日目は記憶力に挑む「エモジーマッチ」。裏向きのカードをめくり、同じ絵文字をペアで揃えていく定番のマッチングゲームです。短期記憶と観察力を研ぎ澄まして、最少手数クリアにチャレンジしましょう。

<style>
#emoji-match-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  background: #fef3c7;
  color: #1f2937;
  box-shadow: 0 24px 44px rgba(251, 191, 36, 0.25);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#emoji-match-game .hud {
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
  #emoji-match-game .hud {
    font-size: 0.82rem;
  }
}
#emoji-match-game .board {
  display: grid;
  grid-template-columns: repeat(4, minmax(70px, 1fr));
  gap: 12px;
  margin: 0 auto 18px;
}
#emoji-match-game .card {
  position: relative;
  padding-top: 100%;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(254, 243, 199, 0.9));
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.12);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  touch-action: manipulation;
}
#emoji-match-game .card.revealed,
#emoji-match-game .card.matched {
  transform: translateY(-2px);
  box-shadow: 0 18px 28px rgba(15, 23, 42, 0.18);
}
#emoji-match-game .card.matched {
  background: linear-gradient(135deg, #34d399, #22c55e);
  color: #fff;
}
#emoji-match-game .face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
#emoji-match-game .start {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  background: #f97316;
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#emoji-match-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(249, 115, 22, 0.35);
}
#emoji-match-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#emoji-match-game .log {
  margin-top: 14px;
  font-size: 0.95rem;
  min-height: 24px;
}
#emoji-match-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#emoji-match-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #38bdf8);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(56, 189, 248, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#emoji-match-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(56, 189, 248, 0.45);
}
#emoji-match-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="emoji-match-game">
  <div class="hud">
    <span class="moves">手数:0</span>
    <span class="time">タイム:0.0 秒</span>
    <span class="best">ベスト:-- 秒</span>
  </div>
  <div class="board"></div>
  <button type="button" class="start">スタート</button>
  <p class="log">スタートを押すとカードがシャッフルされます。ペアを揃えましょう。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('emoji-match-game');
  if (!root) {
    return;
  }

  const boardEl = root.querySelector('.board');
  const movesEl = root.querySelector('.moves');
  const timeEl = root.querySelector('.time');
  const bestEl = root.querySelector('.best');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:emoji-match';
  const playedKey = 'aomagame:played:emoji-match';

  const emojis = ['🍎', '🍇', '🍊', '🍒', '🍉', '🍩', '🥨', '🧁'];

  let deck = [];
  let flipped = [];
  let matched = 0;
  let moves = 0;
  let startTime = 0;
  let elapsed = 0;
  let timerId = null;
  let bestTime = null;
  let running = false;
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
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return;
    }
    const value = Number.parseFloat(stored);
    if (!Number.isNaN(value) && value > 0) {
      bestTime = value;
      bestEl.textContent = `ベスト:${bestTime.toFixed(1)} 秒`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || bestTime === null) {
      return;
    }
    localStorage.setItem(storageKey, String(bestTime));
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const updateHud = () => {
    movesEl.textContent = `手数:${moves}`;
    timeEl.textContent = `タイム:${elapsed.toFixed(1)} 秒`;
    bestEl.textContent = `ベスト:${bestTime === null ? '--' : bestTime.toFixed(1)} 秒`;
    shareButton.disabled = bestTime === null;
  };

  const tick = () => {
    if (!running) {
      return;
    }
    elapsed = (performance.now() - startTime) / 1000;
    updateHud();
    timerId = requestAnimationFrame(tick);
  };

  const stopTimer = () => {
    running = false;
    cancelAnimationFrame(timerId);
    timerId = null;
  };

  const finish = () => {
    stopTimer();
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    if (bestTime === null || elapsed < bestTime) {
      bestTime = elapsed;
      saveBest();
      logEl.textContent = `コンプリート！タイムは ${elapsed.toFixed(1)} 秒。ベスト更新です。`;
      shareButton.disabled = false;
    } else {
      logEl.textContent = `コンプリート！タイムは ${elapsed.toFixed(1)} 秒。次はさらに手数を減らそう。`;
    }
  };

  const flipBack = () => {
    flipped.forEach((card) => {
      card.classList.remove('revealed');
      card.querySelector('.face').textContent = '❓';
      card.dataset.locked = 'false';
    });
    flipped = [];
  };

  const handleCardClick = (event) => {
    if (!running) {
      return;
    }
    const card = event.currentTarget;
    if (card.dataset.locked === 'true' || card.classList.contains('matched')) {
      return;
    }
    if (flipped.length === 2) {
      return;
    }
    card.classList.add('revealed');
    card.querySelector('.face').textContent = card.dataset.emoji;
    card.dataset.locked = 'true';
    flipped.push(card);

    if (flipped.length === 2) {
      moves += 1;
      if (flipped[0].dataset.emoji === flipped[1].dataset.emoji) {
        flipped.forEach((matchedCard) => {
          matchedCard.classList.add('matched');
          matchedCard.dataset.locked = 'true';
        });
        matched += 1;
        flipped = [];
        if (matched === emojis.length) {
          finish();
        }
      } else {
        setTimeout(() => {
          flipBack();
        }, 600);
      }
      updateHud();
    }
  };

  const buildBoard = () => {
    const pairs = shuffle([...emojis, ...emojis]);
    deck = pairs;
    flipped = [];
    matched = 0;
    moves = 0;
    boardEl.innerHTML = '';
    pairs.forEach((emoji) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card';
      card.dataset.emoji = emoji;
      card.dataset.locked = 'false';
      const face = document.createElement('div');
      face.className = 'face';
      face.textContent = '❓';
      card.appendChild(face);
      card.addEventListener('click', handleCardClick);
      boardEl.appendChild(card);
    });
    updateHud();
  };

 const startGame = () => {
    markPlayed();
    buildBoard();
    running = true;
    elapsed = 0;
    startTime = performance.now();
    updateHud();
    logEl.textContent = 'カードをめくってペアを探しましょう。';
    startButton.disabled = true;
    startButton.textContent = 'プレイ中';
    cancelAnimationFrame(timerId);
    timerId = requestAnimationFrame(tick);
  };

  startButton.addEventListener('click', () => {
    if (running) {
      return;
    }
    startGame();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestTime === null) {
        return;
      }
      const text = `エモジーマッチでベスト ${bestTime.toFixed(1)} 秒！ #aomagame`;
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
  buildBoard();
})();
</script>

## 遊び方
1. スタートを押すと絵文字カードが並び、すべて裏向きになります。
2. カードを2枚ずつめくり、同じ絵文字のペアを探します。
3. すべてのペアを揃えるまでのタイムと手数を縮めて記録更新を狙いましょう。

## 実装メモ
- 8種類の絵文字を複製してシャッフルし、毎回違う並びでプレイ可能にしました。
- 2枚めくった後はタイマーで元に戻す仕組みにし、めくり過ぎ防止のロックも実装。
- HUDで手数と経過時間を更新し、クリア時にベストタイムをチェックしています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
