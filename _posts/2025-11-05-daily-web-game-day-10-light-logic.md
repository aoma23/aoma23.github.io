---
title: "毎日Webゲームチャレンジ Day 10: ライトロジック"
categories:
  - game
tags:
  - aomagame
---

10日目は灯りをすべて消すパズル「ライトロジック」。5×5のタイルは押すたびに自分と上下左右が反転し、最小手数でグリッド全体を暗くできればクリアです。シンプルながら奥が深いロジックゲームに挑戦してみてください。

<style>
#light-logic-game {
  max-width: 480px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: #0f172a;
  color: #f8fafc;
  box-shadow: 0 26px 44px rgba(15, 23, 42, 0.45);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#light-logic-game .hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  font-weight: 700;
}
#light-logic-game .board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin: 0 auto 18px;
}
#light-logic-game button.tile {
  aspect-ratio: 1 / 1;
  border: none;
  border-radius: 14px;
  background: #facc15;
  box-shadow: inset 0 0 12px rgba(15, 23, 42, 0.25);
  transition: background 0.15s ease, transform 0.1s ease, box-shadow 0.1s ease;
  cursor: pointer;
}
#light-logic-game button.tile.off {
  background: #1e293b;
  box-shadow: inset 0 0 10px rgba(148, 163, 184, 0.2);
}
#light-logic-game button.tile:hover {
  transform: translateY(-1px);
}
#light-logic-game .start {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #22d3ee, #38bdf8);
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
#light-logic-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 30px rgba(56, 189, 248, 0.35);
}
#light-logic-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#light-logic-game .log {
  margin-top: 14px;
  font-size: 0.95rem;
  min-height: 24px;
}
#light-logic-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#light-logic-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #f97316, #fb7185);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(251, 113, 133, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#light-logic-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(251, 113, 133, 0.45);
}
#light-logic-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="light-logic-game">
  <div class="hud">
    <span class="moves">手数: 0</span>
    <span class="best">最少手数: --</span>
  </div>
  <div class="board"></div>
  <button type="button" class="start">リセット</button>
  <p class="log">タイルを押して全ての光を消してください。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>最少手数をXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('light-logic-game');
  if (!root) {
    return;
  }

  const boardEl = root.querySelector('.board');
  const movesEl = root.querySelector('.moves');
  const bestEl = root.querySelector('.best');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const size = 5;
  const storageKey = 'aomagame:best:light-logic';
  const playedKey = 'aomagame:played:light-logic';

  let tiles = [];
  let moves = 0;
  let bestMoves = null;
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
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value > 0) {
      bestMoves = value;
      bestEl.textContent = `最少手数: ${bestMoves}`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || bestMoves === null) {
      return;
    }
    localStorage.setItem(storageKey, String(bestMoves));
  };

  const indexFromCoord = (row, col) => row * size + col;

  const toggle = (row, col) => {
    if (row < 0 || row >= size || col < 0 || col >= size) {
      return;
    }
    const tile = tiles[indexFromCoord(row, col)];
    tile.state = !tile.state;
    tile.button.classList.toggle('off', !tile.state);
  };

  const updateHud = () => {
    movesEl.textContent = `手数: ${moves}`;
    bestEl.textContent = `最少手数: ${bestMoves === null ? '--' : bestMoves}`;
    shareButton.disabled = bestMoves === null;
  };

  const isCleared = () => tiles.every((tile) => tile.state === false);

  const handleTileClick = (tile) => {
    moves += 1;
    toggle(tile.row, tile.col);
    toggle(tile.row - 1, tile.col);
    toggle(tile.row + 1, tile.col);
    toggle(tile.row, tile.col - 1);
    toggle(tile.row, tile.col + 1);
    updateHud();
    if (isCleared()) {
      if (bestMoves === null || moves < bestMoves) {
        bestMoves = moves;
        saveBest();
        logEl.textContent = `クリア！手数は ${moves}。ベスト更新です。`;
        shareButton.disabled = false;
      } else {
        logEl.textContent = `クリア！手数は ${moves}。次はさらに減らしてみよう。`;
      }
    }
  };

  const buildBoard = () => {
    boardEl.innerHTML = '';
    tiles = [];
    moves = 0;
    const pattern = Array.from({ length: size * size }, () => Math.random() < 0.5);
    pattern.forEach((state, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `tile ${state ? '' : 'off'}`;
      const row = Math.floor(index / size);
      const col = index % size;
      const tile = { row, col, state, button };
      button.addEventListener('click', () => {
        handleTileClick(tile);
      });
      tiles.push(tile);
      boardEl.appendChild(button);
    });
    logEl.textContent = 'ランダムな盤面がセットされました。全消灯を目指しましょう。';
    updateHud();
  };

 startButton.addEventListener('click', () => {
    markPlayed();
    buildBoard();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestMoves === null) {
        return;
      }
      const text = `ライトロジックで最少手数 ${bestMoves} を達成！ #aomagame`;
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
1. ランダムに点灯したタイルが表示されるので、1枚を押すとそのタイルと上下左右が反転します。
2. すべてのタイルを暗く（オフ）すればクリアです。
3. 解き直したいときはリセットで新しい盤面に挑戦できます。

## ヒント
- 角のタイルを押すと周囲への影響が少なく、盤面を整理しやすいです。
- 同じ列や行で明かりの数が偶数か奇数かを意識すると、押す場所の候補が絞れます。
- 行き詰まったらスタートで盤面を変えて、流れを掴んでから再挑戦してみましょう。

## 実装メモ
- 盤面は`Math.random()`で生成し、毎回違う形のパズルが楽しめるようにしました。
- クリック処理は上下左右の座標を確認して、タイルの状態と見た目を同時に更新。
- 最少手数をHUDに表示し、上達がわかりやすい作りにしています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
