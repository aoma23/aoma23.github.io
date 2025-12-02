---
title: "毎日ゲームチャレンジ Day 7: 5×5ミニマインスイーパー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-6-click-burst/' | relative_url }}">クリックバースト</a>

7日目はクラシックなマインスイーパーを5×5サイズでリメイク。盤面は小さいものの地雷は5個配置され、推理と運のバランスがほど良い難易度に調整しました。スマホ操作でも旗を立てられるよう、右クリック（長押し）でフラグ切り替えに対応しています。

<style>
#mini-minesweeper-game {
  max-width: 400px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 16px;
  background: #0b1120;
  color: #e2e8f0;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.45);
}
#mini-minesweeper-game .stats {
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
  #mini-minesweeper-game .stats {
    font-size: 0.82rem;
  }
}
#mini-minesweeper-game .wins {
  font-weight: 700;
}
#mini-minesweeper-game .board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
#mini-minesweeper-game .cell {
  width: 100%;
  padding-top: 100%;
  position: relative;
}
#mini-minesweeper-game .cell button {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 10px;
  background: #1e293b;
  color: #e2e8f0;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.1s ease, background 0.1s ease;
}
#mini-minesweeper-game .cell button:hover {
  transform: translateY(-1px);
}
#mini-minesweeper-game .cell button.revealed {
  background: #111827;
  cursor: default;
  transform: none;
}
#mini-minesweeper-game .cell button.mine {
  background: #ef4444;
  color: #fff;
}
#mini-minesweeper-game .cell button.flagged {
  background: #334155;
  color: #fde68a;
}
#mini-minesweeper-game .log {
  margin-top: 16px;
  text-align: center;
  font-size: 0.95rem;
}
#mini-minesweeper-game .actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
#mini-minesweeper-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa, #22d3ee);
  color: #0b1120;
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(34, 211, 238, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
#mini-minesweeper-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(34, 211, 238, 0.45);
}
#mini-minesweeper-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#mini-minesweeper-game .reset {
  width: 100%;
  margin-top: 18px;
  padding: 12px 18px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  background: linear-gradient(135deg, #22c55e, #14b8a6);
  color: #0f172a;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
#mini-minesweeper-game .reset:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(20, 184, 166, 0.35);
}
</style>

<div id="mini-minesweeper-game">
  <div class="stats">
    <span class="safe">残り安全マス:20</span>
    <span class="flags">旗:0/5</span>
    <span class="wins">勝利数:0</span>
  </div>
  <div class="board"></div>
  <p class="log">地雷を避けてすべての安全マスを開こう！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>勝利数をXで共有</button>
  </div>
  <button type="button" class="reset">リセット</button>
</div>

<script>
(() => {
  const root = document.getElementById('mini-minesweeper-game');
  if (!root) {
    return;
  }

  const boardEl = root.querySelector('.board');
  const logEl = root.querySelector('.log');
  const safeEl = root.querySelector('.safe');
  const flagsEl = root.querySelector('.flags');
  const winsEl = root.querySelector('.wins');
  const resetButton = root.querySelector('.reset');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:mini-minesweeper';
  const playedKey = 'aomagame:played:mini-minesweeper';

  const size = 5;
  const mineCount = 5;
  const totalCells = size * size;
  const directions = [-1, 0, 1];

  let cells = [];
  let gameOver = false;
  let revealedSafe = 0;
  let flaggedCount = 0;
  let totalWins = 0;
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


  const updateStats = () => {
    const remaining = totalCells - mineCount - revealedSafe;
    safeEl.textContent = `残り安全マス:${remaining}`;
    flagsEl.textContent = `旗:${flaggedCount}/${mineCount}`;
    if (winsEl) {
      winsEl.textContent = `勝利数:${totalWins}`;
    }
    if (shareButton) {
      shareButton.disabled = totalWins <= 0;
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

  const loadWins = () => {
    if (!storageAvailable) {
      updateStats();
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      updateStats();
      return;
    }
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value > 0) {
      totalWins = value;
    }
    updateStats();
  };

  const saveWins = () => {
    if (!storageAvailable || totalWins <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(totalWins));
  };

  const openShareWindow = () => {
    if (totalWins <= 0) {
      return;
    }
    const text = `5×5ミニマインスイーパーで通算 ${totalWins} 勝！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  const indexFromCoord = (row, col) => row * size + col;

  const getNeighbors = (row, col) => {
    const neighbors = [];
    directions.forEach((dr) => {
      directions.forEach((dc) => {
        if (dr === 0 && dc === 0) {
          return;
        }
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          neighbors.push(indexFromCoord(nr, nc));
        }
      });
    });
    return neighbors;
  };

  const revealCell = (cell) => {
    if (cell.revealed || cell.flagged || gameOver) {
      return;
    }
    cell.revealed = true;
    cell.button.classList.add('revealed');

    if (cell.mine) {
      cell.button.classList.add('mine');
      cell.button.textContent = 'X';
      return;
    }

    revealedSafe += 1;
    const number = cell.adjacent;
    cell.button.textContent = number > 0 ? String(number) : '';

    if (number === 0) {
      const queue = [...getNeighbors(cell.row, cell.col)];
      while (queue.length > 0) {
        const neighborIndex = queue.shift();
        const neighbor = cells[neighborIndex];
        if (!neighbor || neighbor.revealed || neighbor.flagged || neighbor.mine) {
          continue;
        }
        neighbor.revealed = true;
        neighbor.button.classList.add('revealed');
        revealedSafe += 1;
        const num = neighbor.adjacent;
        neighbor.button.textContent = num > 0 ? String(num) : '';
        if (num === 0) {
          queue.push(...getNeighbors(neighbor.row, neighbor.col));
        }
      }
    }
  };

  const checkWin = () => {
    if (revealedSafe === totalCells - mineCount) {
      gameOver = true;
      totalWins += 1;
      saveWins();
      updateStats();
      logEl.textContent = `お見事！すべての安全マスを開きました。通算 ${totalWins} 勝です。`;
    }
  };

  const revealAllMines = () => {
    cells.forEach((cell) => {
      if (!cell.mine) {
        return;
      }
      cell.button.classList.add('mine');
      cell.button.classList.add('revealed');
      cell.button.textContent = 'X';
    });
  };

  const handleCellClick = (cell) => {
    if (gameOver || cell.flagged) {
      return;
    }
    if (cell.mine) {
      revealCell(cell);
      revealAllMines();
      gameOver = true;
      logEl.textContent = 'ドカン！地雷を踏んでしまいました…';
      return;
    }
    revealCell(cell);
    checkWin();
    updateStats();
  };

  const toggleFlag = (cell) => {
    if (cell.revealed || gameOver) {
      return;
    }
    if (cell.flagged) {
      cell.flagged = false;
      flaggedCount -= 1;
      cell.button.classList.remove('flagged');
      cell.button.textContent = '';
    } else if (flaggedCount < mineCount) {
      cell.flagged = true;
      flaggedCount += 1;
      cell.button.classList.add('flagged');
      cell.button.textContent = 'F';
    }
    updateStats();
  };

  const buildBoard = () => {
    markPlayed();
    boardEl.innerHTML = '';
    cells = [];
    revealedSafe = 0;
    flaggedCount = 0;
    gameOver = false;
    logEl.textContent = '地雷を避けてすべての安全マスを開こう！';

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = '';
        const cell = {
          row,
          col,
          index: indexFromCoord(row, col),
          mine: false,
          adjacent: 0,
          revealed: false,
          flagged: false,
          button,
        };

        button.addEventListener('click', () => {
          handleCellClick(cell);
        });

        button.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          toggleFlag(cell);
        });

        let longPressTimer = null;
        let longPressTriggered = false;

        button.addEventListener('touchstart', (event) => {
          if (event.touches.length !== 1) {
            return;
          }
          event.preventDefault();
          longPressTriggered = false;
          longPressTimer = window.setTimeout(() => {
            toggleFlag(cell);
            longPressTriggered = true;
          }, 500);
        }, { passive: false });

        button.addEventListener('touchend', () => {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
          if (!longPressTriggered) {
            handleCellClick(cell);
          }
        });

        button.addEventListener('touchmove', (event) => {
          if (!longPressTimer) {
            return;
          }
          const touch = event.touches[0];
          if (!touch) {
            return;
          }
          const rect = button.getBoundingClientRect();
          const within = (
            touch.clientX >= rect.left - 10 &&
            touch.clientX <= rect.right + 10 &&
            touch.clientY >= rect.top - 10 &&
            touch.clientY <= rect.bottom + 10
          );
          if (!within) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
          }
        });

        const wrapper = document.createElement('div');
        wrapper.className = 'cell';
        wrapper.appendChild(button);
        boardEl.appendChild(wrapper);
        cells.push(cell);
      }
    }

    // 配置をシャッフル
    const indices = Array.from({ length: totalCells }, (_, idx) => idx);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (let i = 0; i < mineCount; i += 1) {
      cells[indices[i]].mine = true;
    }

    cells.forEach((cell) => {
      if (cell.mine) {
        return;
      }
      const neighbors = getNeighbors(cell.row, cell.col);
      const count = neighbors.filter((index) => cells[index].mine).length;
      cell.adjacent = count;
    });

    updateStats();
  };

  resetButton.addEventListener('click', () => {
    buildBoard();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (totalWins <= 0) {
        return;
      }
      openShareWindow();
    });
  }

  detectStorage();
  loadWins();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
  buildBoard();
})();
</script>

## 遊び方
1. セルをクリックして安全マスを開きます。数字は周囲8マスにある地雷の数。
2. 地雷だと思ったマスは右クリック（長押し）で旗を立てておくと安全です。
3. すべての安全マスを開くと勝利。地雷を踏むと即ゲームオーバーです。

## 実装メモ
- 5×5の盤面と5個の地雷をランダム配置し、隣接数は事前に算出。
- 0のマスは広がるようにBFSで一括オープンすることでテンポを向上。
- 旗の数と残り安全マス数をステータスに表示し、勝利条件のチェックも同時に行なっています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
