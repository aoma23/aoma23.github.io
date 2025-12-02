---
title: "毎日ゲームチャレンジ Day 18: パターングリッド"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-17-clock-align/' | relative_url }}">クロックアライン</a>

18日目は一瞬表示されるマス目を覚えて再現する「パターングリッド」。3秒だけ光るパターンを記憶し、同じセルをタップして正確に再現できるか挑戦します。記憶力と素早さが問われる短期集中ゲームです。

<style>
#pattern-grid-game {
  max-width: 480px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #f8fafc;
  box-shadow: 0 26px 46px rgba(59, 130, 246, 0.35);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#pattern-grid-game .hud {
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
  #pattern-grid-game .hud {
    font-size: 0.82rem;
  }
}
#pattern-grid-game .grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(60px, 1fr));
  gap: 10px;
  margin: 0 auto 18px;
  width: min(92vw, 320px);
}
#pattern-grid-game button.cell {
  border: none;
  border-radius: 14px;
  padding-top: 100%;
  position: relative;
  background: rgba(15, 23, 42, 0.12);
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease;
  cursor: pointer;
  touch-action: manipulation;
}
#pattern-grid-game button.cell.active {
  background: rgba(248, 250, 252, 0.9);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.25);
}
#pattern-grid-game button.cell.correct {
  background: rgba(34, 197, 94, 0.6);
}
#pattern-grid-game button.cell.wrong {
  background: rgba(248, 113, 113, 0.6);
}
#pattern-grid-game .start {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  background: rgba(15, 23, 42, 0.92);
  color: #fff;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  touch-action: manipulation;
}
#pattern-grid-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.35);
}
#pattern-grid-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#pattern-grid-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#pattern-grid-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#pattern-grid-game .share-button {
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
#pattern-grid-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(244, 114, 182, 0.45);
}
#pattern-grid-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="pattern-grid-game">
  <div class="hud">
    <span class="round">ラウンド:0</span>
    <span class="best">ベスト:0</span>
  </div>
  <div class="grid"></div>
  <button type="button" class="start">スタート</button>
  <p class="log">パターンを覚えて同じマスをタップしよう。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('pattern-grid-game');
  if (!root) {
    return;
  }

  const gridEl = root.querySelector('.grid');
  const startButton = root.querySelector('.start');
  const roundEl = root.querySelector('.round');
  const bestEl = root.querySelector('.best');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:pattern-grid';
  const playedKey = 'aomagame:played:pattern-grid';

  let pattern = [];
  let selected = new Set();
  let accepting = false;
  let bestRound = 0;
  let storageAvailable = false;
  let sequenceLength = 1;
  let currentRound = 0;

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
    if (stored) {
      const value = Number.parseInt(stored, 10);
      if (!Number.isNaN(value) && value > 0) {
        bestRound = value;
        shareButton.disabled = false;
      }
    }
    updateHud();
  };

  const saveBest = () => {
    if (!storageAvailable || bestRound <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(bestRound));
  };

  const updateHud = () => {
    roundEl.textContent = `ラウンド:${currentRound}`;
    bestEl.textContent = `ベスト:${bestRound}`;
    shareButton.disabled = bestRound <= 0;
  };

  const buildGrid = () => {
    gridEl.innerHTML = '';
    for (let i = 0; i < 16; i += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.index = String(i);
      gridEl.appendChild(cell);
    }
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const flashPattern = async () => {
    accepting = false;
    startButton.disabled = true;
    logEl.textContent = 'パターンを暗記してください…';
    const cells = Array.from(gridEl.children);
    for (const index of pattern) {
      const cell = cells[index];
      cell.classList.add('active');
      await new Promise((resolve) => setTimeout(resolve, 450));
      cell.classList.remove('active');
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    accepting = true;
    selected.clear();
    logEl.textContent = '同じマスをタップして再現！';
  };

  const startRound = async () => {
    const indices = shuffle(Array.from({ length: 16 }, (_, idx) => idx));
    pattern = indices.slice(0, sequenceLength);
    currentRound = pattern.length;
    updateHud();
    startButton.textContent = 'プレイ中';
    await flashPattern();
  };

  gridEl.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches('.cell')) {
      return;
    }
    if (!accepting) {
      return;
    }
    const index = Number(target.dataset.index);
    if (selected.has(index)) {
      return;
    }
    selected.add(index);
    target.classList.add('active');
    if (!pattern.includes(index)) {
      logEl.textContent = '残念…間違えました。最初から挑戦！';
      accepting = false;
      startButton.disabled = false;
      startButton.textContent = 'リトライ';
      pattern = [];
      sequenceLength = 1;
      currentRound = 0;
      updateHud();
      return;
    }
    if (selected.size === new Set(pattern).size) {
      const roundSize = pattern.length;
      pattern = [];
      if (roundSize > bestRound) {
        bestRound = roundSize;
        saveBest();
        shareButton.disabled = false;
      }
      sequenceLength = roundSize + 1;
      currentRound = roundSize;
      logEl.textContent = '成功！さらに難しいパターンに挑戦しよう。';
      startButton.disabled = false;
      startButton.textContent = '次のラウンド';
      updateHud();
    }
  });

  startButton.addEventListener('click', async () => {
    markPlayed();
    buildGrid();
    if (startButton.textContent !== '次のラウンド') {
      sequenceLength = 1;
    }
    pattern = [];
    selected.clear();
    await startRound();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestRound <= 0) {
        return;
      }
      const text = `パターングリッドで最大 ${bestRound} マスを記憶！ #aomagame`;
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
  buildGrid();
  updateHud();
})();
</script>

## 遊び方
1. スタートを押すと4×4マスに光るパターンが表示されます。
2. 表示が消えた後、覚えているマスをタップして同じ配置を再現します。
3. 成功するとパターンが長くなります。集中力を切らさずベスト記録を更新しましょう。

## 実装メモ
- 表示時間は合計3秒程度に調整し、`await`を使って自然なディレイを実装。
- タップしたマスが正しいかを即判定し、ミス時はラウンドをリセットして再挑戦できます。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
