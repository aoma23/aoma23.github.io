---
title: "毎日ゲームチャレンジ Day 12: ミニメイズダッシュ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-11-beat-bar/' | relative_url }}">ビートバー・チャレンジ</a>

12日目はミニサイズの迷路でタイムアタック「ミニメイズダッシュ」。矢印キーや画面下の方向ボタンを使ってプレイヤーを操り、壁にぶつからないようゴールへ辿り着きましょう。毎回生成される迷路は必ず解ける構造になっているので、ルート取りを工夫しながら最短タイムに挑戦してください。

<style>
#maze-dash-game {
  max-width: 480px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: #111827;
  color: #f8fafc;
  box-shadow: 0 28px 46px rgba(17, 24, 39, 0.45);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#maze-dash-game .hud {
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
  #maze-dash-game .hud {
    font-size: 0.82rem;
  }
}
#maze-dash-game .maze-wrapper {
  display: flex;
  justify-content: center;
}
#maze-dash-game .maze {
  width: min(92vw, 360px);
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 4px;
}
#maze-dash-game .cell {
  position: relative;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.1);
  transition: background 0.15s ease;
}
#maze-dash-game .cell.wall {
  background: rgba(148, 163, 184, 0.45);
}
#maze-dash-game .cell.start {
  background: rgba(56, 189, 248, 0.4);
}
#maze-dash-game .cell.goal {
  background: rgba(34, 197, 94, 0.45);
}
#maze-dash-game .player {
  position: absolute;
  inset: 12%;
  border-radius: 8px;
  background: linear-gradient(135deg, #f97316, #fb7185);
  box-shadow: 0 12px 18px rgba(249, 115, 22, 0.35);
}
#maze-dash-game .start-button {
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 700;
  background: rgba(248, 250, 252, 0.12);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  margin-bottom: 16px;
  touch-action: manipulation;
}
#maze-dash-game .start-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(148, 163, 184, 0.25);
}
#maze-dash-game .start-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#maze-dash-game .controls {
  display: grid;
  grid-template-columns: repeat(3, 64px);
  gap: 8px;
  justify-content: center;
  margin: 12px auto 0;
}
#maze-dash-game .control {
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  font-size: 1.2rem;
  font-weight: 700;
  background: rgba(248, 250, 252, 0.12);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#maze-dash-game .control:active {
  transform: translateY(1px);
  opacity: 0.85;
}
#maze-dash-game .log {
  margin-top: 14px;
  font-size: 0.95rem;
}
#maze-dash-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#maze-dash-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #38bdf8);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(56, 189, 248, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#maze-dash-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(56, 189, 248, 0.45);
}
#maze-dash-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="maze-dash-game">
  <div class="hud">
    <span class="timer">タイム:0.00 秒</span>
    <span class="best">ベスト:-- 秒</span>
    <span class="moves">移動数:0</span>
  </div>
  <div class="maze-wrapper">
    <div class="maze"></div>
  </div>
  <button type="button" class="start-button">スタート</button>
  <div class="controls" aria-label="方向ボタン">
    <span></span>
    <button type="button" class="control" data-dir="up">↑</button>
    <span></span>
    <button type="button" class="control" data-dir="left">←</button>
    <button type="button" class="control" data-dir="down">↓</button>
    <button type="button" class="control" data-dir="right">→</button>
  </div>
  <p class="log">スタートで新しい迷路が生成されます。矢印キーまたは方向ボタンで移動しましょう。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('maze-dash-game');
  if (!root) {
    return;
  }

  const mazeEl = root.querySelector('.maze');
  const timerEl = root.querySelector('.timer');
  const bestEl = root.querySelector('.best');
  const movesEl = root.querySelector('.moves');
  const startButton = root.querySelector('.start-button');
  const logEl = root.querySelector('.log');
  const controlButtons = Array.from(root.querySelectorAll('.control'));
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:maze-dash';
  const playedKey = 'aomagame:played:maze-dash';

  const directions = {
    up: [-1, 0],
    down: [1, 0],
    left: [0, -1],
    right: [0, 1],
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
    w: [-1, 0],
    s: [1, 0],
    a: [0, -1],
    d: [0, 1],
  };

  let layout = [];
  let player = { row: 0, col: 0 };
  let goal = { row: 0, col: 0 };
  let startTime = 0;
  let elapsed = 0;
  let timerId = null;
  let bestTime = null;
  let moves = 0;
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
      bestEl.textContent = `ベスト:${bestTime.toFixed(2)} 秒`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || bestTime === null) {
      return;
    }
    localStorage.setItem(storageKey, String(bestTime));
  };

  const updateHud = () => {
    timerEl.textContent = `タイム:${elapsed.toFixed(2)} 秒`;
    movesEl.textContent = `移動数:${moves}`;
    bestEl.textContent = `ベスト:${bestTime === null ? '--' : bestTime.toFixed(2)} 秒`;
    shareButton.disabled = bestTime === null;
  };

  const setPlayerPosition = () => {
    mazeEl.querySelectorAll('.player').forEach((node) => node.remove());
    const index = player.row * layout[0].length + player.col;
    const cell = mazeEl.children[index];
    if (!cell) {
      return;
    }
    const token = document.createElement('div');
    token.className = 'player';
    cell.appendChild(token);
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
      logEl.textContent = `ゴール！タイムは ${elapsed.toFixed(2)} 秒。ベスト更新です。`;
      shareButton.disabled = false;
    } else {
      logEl.textContent = `ゴール！タイムは ${elapsed.toFixed(2)} 秒。次はルート短縮を狙いましょう。`;
    }
  };


  const movePlayer = (dr, dc) => {
    if (!running) {
      return;
    }
    const nextRow = player.row + dr;
    const nextCol = player.col + dc;
    if (nextRow < 0 || nextRow >= layout.length || nextCol < 0 || nextCol >= layout[0].length) {
      return;
    }
    if (layout[nextRow][nextCol] === '#') {
      logEl.textContent = '壁にぶつかった！別のルートを試そう。';
      return;
    }
    player = { row: nextRow, col: nextCol };
    moves += 1;
    setPlayerPosition();
    if (player.row === goal.row && player.col === goal.col) {
      finish();
    } else {
      updateHud();
    }
  };

  const generateMaze = () => {
    const cellRows = 4;
    const cellCols = 4;
    const rows = cellRows * 2 + 1; // 9
    const cols = cellCols * 2 + 1;

    const maze = Array.from({ length: rows }, () => Array(cols).fill('#'));

    for (let r = 1; r < rows; r += 2) {
      for (let c = 1; c < cols; c += 2) {
        maze[r][c] = '.';
      }
    }

    const stack = [[1, 1]];
    const visited = new Set(['1,1']);
    const offsets = [
      [0, -2],
      [0, 2],
      [-2, 0],
      [2, 0],
    ];

    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    while (stack.length > 0) {
      const [r, c] = stack[stack.length - 1];
      const neighbors = shuffle(offsets.slice()).filter(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        return nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && !visited.has(`${nr},${nc}`);
      });

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const [dr, dc] = neighbors[0];
        const nr = r + dr;
        const nc = c + dc;
        maze[r + dr / 2][c + dc / 2] = '.';
        maze[nr][nc] = '.';
        visited.add(`${nr},${nc}`);
        stack.push([nr, nc]);
      }
    }

    maze[1][1] = 'S';
    maze[rows - 2][cols - 2] = 'G';
    return maze;
  };

  const buildMaze = () => {
    layout = generateMaze();
    player = { row: 1, col: 1 };
    goal = { row: layout.length - 2, col: layout[0].length - 2 };
    mazeEl.innerHTML = '';
    layout.forEach((row) => {
      row.forEach((tile) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        if (tile === '#') {
          cell.classList.add('wall');
        }
        if (tile === 'S') {
          cell.classList.add('start');
        }
        if (tile === 'G') {
          cell.classList.add('goal');
        }
        mazeEl.appendChild(cell);
      });
    });
    setPlayerPosition();
  };

 const startGame = () => {
    markPlayed();
    buildMaze();
    moves = 0;
    elapsed = 0;
    running = true;
    startTime = performance.now();
    updateHud();
    logEl.textContent = 'ゴールの緑マスを目指して進もう！';
    startButton.disabled = true;
    startButton.textContent = 'プレイ中';
    cancelAnimationFrame(timerId);
    timerId = requestAnimationFrame(tick);
  };

  window.addEventListener('keydown', (event) => {
    const direction = directions[event.key];
    if (!direction) {
      return;
    }
    event.preventDefault();
    movePlayer(direction[0], direction[1]);
  });

  controlButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const direction = directions[button.dataset.dir];
      if (!direction) {
        return;
      }
      movePlayer(direction[0], direction[1]);
    });
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
      if (bestTime === null) {
        return;
      }
      const text = `ミニメイズダッシュでベスト ${bestTime.toFixed(2)} 秒！ #aomagame`;
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
1. スタートを押すと毎回違う迷路が生成され、プレイヤーは左上のスタート地点からスタートします。
2. 矢印キーまたは画面下の方向ボタンで移動し、壁を避けながらゴールの緑マスを目指します。
3. ゴールまでのタイムと移動数を更新し、より速いルートを探して記録更新を目指しましょう。

## 実装メモ
- 深さ優先探索で必ず解ける迷路を自動生成し、挑戦するたびに異なるレイアウトになるようにしました。
- HUDにはタイムと移動数をリアルタイム表示し、達成状況が一目で分かるよう調整。
- キーボード操作に加えてタッチ操作の方向ボタンも用意し、スマホでも遊びやすいようにしています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
