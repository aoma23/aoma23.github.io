---
title: "毎日ゲームチャレンジ Day 42: マージスライド"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-41-one-move-puzzle/' | relative_url }}">ワンムーブパズル</a>

42日目はパズルゲーム「マージスライド」。2048風に同じ数字を合体させて大きくしていきましょう。60秒間でどこまでスコアを伸ばせるか、戦略と素早い判断が試されます。

<style>
#merge-slide-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 28px 52px rgba(15, 23, 42, 0.38);
}
#merge-slide-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #merge-slide-game .hud {
    font-size: 0.82rem;
  }
}
#merge-slide-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#merge-slide-game .start-controls button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#merge-slide-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#merge-slide-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#merge-slide-game .grid-container {
  margin: 18px auto 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(30, 41, 59, 0.6);
  padding: 10px;
  border-radius: 12px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
  max-width: calc(100vw - 60px);
  touch-action: none;
}
#merge-slide-game .grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
  position: relative;
  width: min(320px, calc(100vw - 80px));
  height: min(320px, calc(100vw - 80px));
  aspect-ratio: 1;
}
#merge-slide-game .cell.cell-slide-left {
  animation: slide-from-right 0.15s ease-out;
}
#merge-slide-game .cell.cell-slide-right {
  animation: slide-from-left 0.15s ease-out;
}
#merge-slide-game .cell.cell-slide-up {
  animation: slide-from-bottom 0.15s ease-out;
}
#merge-slide-game .cell.cell-slide-down {
  animation: slide-from-top 0.15s ease-out;
}
@keyframes slide-from-right {
  0% {
    transform: translateX(25%);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-from-left {
  0% {
    transform: translateX(-25%);
    opacity: 0.5;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes slide-from-bottom {
  0% {
    transform: translateY(25%);
    opacity: 0.5;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes slide-from-top {
  0% {
    transform: translateY(-25%);
    opacity: 0.5;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
#merge-slide-game .cell {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, 4vw, 1.5rem);
  font-weight: 700;
  transition: all 0.15s ease;
}
#merge-slide-game .cell.cell-new {
  animation: cell-appear 0.2s ease;
}
#merge-slide-game .cell.cell-merged {
  animation: cell-merge 0.25s ease;
}
@keyframes cell-appear {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
@keyframes cell-merge {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
  100% {
    transform: scale(1);
  }
}
#merge-slide-game .cell[data-value="2"] {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
}
#merge-slide-game .cell[data-value="4"] {
  background: linear-gradient(135deg, #22d3ee, #06b6d4);
  color: #0f172a;
}
#merge-slide-game .cell[data-value="8"] {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  color: #fff;
}
#merge-slide-game .cell[data-value="16"] {
  background: linear-gradient(135deg, #f472b6, #ec4899);
  color: #fff;
}
#merge-slide-game .cell[data-value="32"] {
  background: linear-gradient(135deg, #fb923c, #f97316);
  color: #fff;
}
#merge-slide-game .cell[data-value="64"] {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #0f172a;
}
#merge-slide-game .cell[data-value="128"] {
  background: linear-gradient(135deg, #facc15, #eab308);
  color: #0f172a;
}
#merge-slide-game .cell[data-value="256"] {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #0f172a;
}
#merge-slide-game .cell[data-value="512"] {
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #0f172a;
}
#merge-slide-game .cell[data-value="1024"] {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: #fff;
}
#merge-slide-game .cell[data-value="2048"] {
  background: linear-gradient(135deg, #818cf8, #6366f1);
  color: #fff;
}
#merge-slide-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#merge-slide-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#merge-slide-game .share button {
  border: none;
  border-radius: 9999px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #facc15, #f97316);
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(249, 115, 22, 0.32);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
</style>

<div id="merge-slide-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア:0</span>
    <span class="best">ベスト:0</span>
    <span class="moves">移動数:0</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="grid-container">
    <div class="grid"></div>
  </div>
  <p class="log">スタートでゲーム開始。同じ数字を合体させてスコアを伸ばそう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('merge-slide-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const movesEl = root.querySelector('.moves');
  const startButton = root.querySelector('.start');
  const gridEl = root.querySelector('.grid');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:merge-slide';
  const playedKey = 'aomagame:played:merge-slide';

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    grid: [],
    newTileIndex: -1,
    mergedIndices: new Set(),
    movedIndices: new Set(),
    moveDirection: '',
    score: 0,
    best: 0,
    moves: 0,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    move: { frequency: 620, duration: 0.1, gain: 0.18 },
    merge: { frequency: 820, duration: 0.16, gain: 0.22 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.move;
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

  const detectStorage = () => {
    try {
      const testKey = `${storageKey}-test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      state.storageAvailable = true;
    } catch (error) {
      state.storageAvailable = false;
    }
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };

  const loadBest = () => {
    if (!state.storageAvailable) {
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      return;
    }
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value >= 0) {
      state.best = value;
      bestEl.textContent = `ベスト:${state.best}`;
      enableShare();
    }
  };

  const saveBest = () => {
    if (!state.storageAvailable) {
      return;
    }
    localStorage.setItem(storageKey, String(state.best));
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
    if (!state.storageAvailable) {
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

  const setLog = (message) => {
    logEl.textContent = message;
  };

  const updateHud = () => {
    scoreEl.textContent = `スコア:${state.score}`;
    bestEl.textContent = `ベスト:${state.best}`;
    movesEl.textContent = `移動数:${state.moves}`;
  };

  const initGrid = () => {
    state.grid = Array(16).fill(0);
    addRandomTile();
    addRandomTile();
  };

  const addRandomTile = () => {
    const empty = [];
    state.grid.forEach((value, index) => {
      if (value === 0) {
        empty.push(index);
      }
    });
    if (empty.length === 0) {
      return;
    }
    const index = empty[Math.floor(Math.random() * empty.length)];
    state.grid[index] = Math.random() < 0.9 ? 2 : 4;
    state.newTileIndex = index;
  };

  const renderGrid = () => {
    gridEl.innerHTML = '';
    state.grid.forEach((value, index) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (value > 0) {
        cell.textContent = value.toString();
        cell.dataset.value = value.toString();
        if (index === state.newTileIndex) {
          cell.classList.add('cell-new');
        }
        if (state.mergedIndices.has(index)) {
          cell.classList.add('cell-merged');
        }
        if (state.movedIndices.has(index) && state.moveDirection) {
          cell.classList.add(`cell-slide-${state.moveDirection}`);
        }
      }
      gridEl.appendChild(cell);
    });
    state.newTileIndex = -1;
    state.mergedIndices.clear();
    state.movedIndices.clear();
    state.moveDirection = '';
  };

  const getRow = (rowIndex) => {
    const start = rowIndex * 4;
    return [state.grid[start], state.grid[start + 1], state.grid[start + 2], state.grid[start + 3]];
  };

  const setRow = (rowIndex, values) => {
    const start = rowIndex * 4;
    state.grid[start] = values[0];
    state.grid[start + 1] = values[1];
    state.grid[start + 2] = values[2];
    state.grid[start + 3] = values[3];
  };

  const getColumn = (colIndex) => {
    return [state.grid[colIndex], state.grid[colIndex + 4], state.grid[colIndex + 8], state.grid[colIndex + 12]];
  };

  const setColumn = (colIndex, values) => {
    state.grid[colIndex] = values[0];
    state.grid[colIndex + 4] = values[1];
    state.grid[colIndex + 8] = values[2];
    state.grid[colIndex + 12] = values[3];
  };

  const mergeLine = (line) => {
    const nonZero = line.filter((value) => value !== 0);
    const merged = [];
    const mergedPositions = [];
    let points = 0;
    let i = 0;
    while (i < nonZero.length) {
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
        const value = nonZero[i] * 2;
        merged.push(value);
        mergedPositions.push(merged.length - 1);
        points += value;
        i += 2;
      } else {
        merged.push(nonZero[i]);
        i += 1;
      }
    }
    while (merged.length < 4) {
      merged.push(0);
    }
    return { line: merged, points, mergedPositions };
  };

  const moveLeft = () => {
    let moved = false;
    let totalPoints = 0;
    const beforeGrid = [...state.grid];
    state.mergedIndices.clear();
    state.movedIndices.clear();
    for (let row = 0; row < 4; row += 1) {
      const original = getRow(row);
      const { line, points, mergedPositions } = mergeLine(original);
      setRow(row, line);
      mergedPositions.forEach((pos) => {
        state.mergedIndices.add(row * 4 + pos);
      });
      if (JSON.stringify(original) !== JSON.stringify(line)) {
        moved = true;
      }
      totalPoints += points;
    }
    for (let i = 0; i < 16; i += 1) {
      if (beforeGrid[i] !== state.grid[i]) {
        state.movedIndices.add(i);
      }
    }
    return { moved, points: totalPoints };
  };

  const moveRight = () => {
    let moved = false;
    let totalPoints = 0;
    const beforeGrid = [...state.grid];
    state.mergedIndices.clear();
    state.movedIndices.clear();
    for (let row = 0; row < 4; row += 1) {
      const original = getRow(row);
      const reversed = [...original].reverse();
      const { line, points, mergedPositions } = mergeLine(reversed);
      const result = [...line].reverse();
      setRow(row, result);
      mergedPositions.forEach((pos) => {
        state.mergedIndices.add(row * 4 + (3 - pos));
      });
      if (JSON.stringify(original) !== JSON.stringify(result)) {
        moved = true;
      }
      totalPoints += points;
    }
    for (let i = 0; i < 16; i += 1) {
      if (beforeGrid[i] !== state.grid[i]) {
        state.movedIndices.add(i);
      }
    }
    return { moved, points: totalPoints };
  };

  const moveUp = () => {
    let moved = false;
    let totalPoints = 0;
    const beforeGrid = [...state.grid];
    state.mergedIndices.clear();
    state.movedIndices.clear();
    for (let col = 0; col < 4; col += 1) {
      const original = getColumn(col);
      const { line, points, mergedPositions } = mergeLine(original);
      setColumn(col, line);
      mergedPositions.forEach((pos) => {
        state.mergedIndices.add(pos * 4 + col);
      });
      if (JSON.stringify(original) !== JSON.stringify(line)) {
        moved = true;
      }
      totalPoints += points;
    }
    for (let i = 0; i < 16; i += 1) {
      if (beforeGrid[i] !== state.grid[i]) {
        state.movedIndices.add(i);
      }
    }
    return { moved, points: totalPoints };
  };

  const moveDown = () => {
    let moved = false;
    let totalPoints = 0;
    const beforeGrid = [...state.grid];
    state.mergedIndices.clear();
    state.movedIndices.clear();
    for (let col = 0; col < 4; col += 1) {
      const original = getColumn(col);
      const reversed = [...original].reverse();
      const { line, points, mergedPositions } = mergeLine(reversed);
      const result = [...line].reverse();
      setColumn(col, result);
      mergedPositions.forEach((pos) => {
        state.mergedIndices.add((3 - pos) * 4 + col);
      });
      if (JSON.stringify(original) !== JSON.stringify(result)) {
        moved = true;
      }
      totalPoints += points;
    }
    for (let i = 0; i < 16; i += 1) {
      if (beforeGrid[i] !== state.grid[i]) {
        state.movedIndices.add(i);
      }
    }
    return { moved, points: totalPoints };
  };

  const canMove = () => {
    const savedGrid = [...state.grid];
    const savedMerged = new Set(state.mergedIndices);

    const leftResult = moveLeft();
    state.grid = [...savedGrid];
    const rightResult = moveRight();
    state.grid = [...savedGrid];
    const upResult = moveUp();
    state.grid = [...savedGrid];
    const downResult = moveDown();
    state.grid = savedGrid;
    state.mergedIndices = savedMerged;

    return leftResult.moved || rightResult.moved || upResult.moved || downResult.moved;
  };

  const handleMove = (direction) => {
    if (!state.running) {
      return;
    }
    let result;
    state.moveDirection = direction;
    if (direction === 'left') {
      result = moveLeft();
    } else if (direction === 'right') {
      result = moveRight();
    } else if (direction === 'up') {
      result = moveUp();
    } else if (direction === 'down') {
      result = moveDown();
    }
    if (result && result.moved) {
      state.moves += 1;
      state.score += result.points;
      if (result.points > 0) {
        playTone('merge');
      } else {
        playTone('move');
      }

      renderGrid();
      updateHud();

      window.setTimeout(() => {
        state.moveDirection = '';
        addRandomTile();
        renderGrid();

        if (state.score > state.best) {
          state.best = state.score;
          saveBest();
          enableShare();
        }

        if (!canMove()) {
          setLog('移動できなくなりました！ゲームオーバー');
          endGame();
        }
      }, 150);
    }
  };

  const remainingTime = () => {
    const elapsed = (performance.now() - state.startTime) / 1000;
    return Math.max(0, state.timeLimit - elapsed);
  };

  const endGame = () => {
    state.running = false;
    startButton.disabled = false;
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    setLog(`終了！スコア ${state.score}、移動数 ${state.moves} でした。`);
    enableShare();
  };

  const tick = () => {
    if (!state.running) {
      return;
    }
    const remaining = remainingTime();
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    if (remaining <= 0) {
      timeEl.textContent = '残り: 0.0 秒';
      endGame();
      return;
    }
    state.timerId = requestAnimationFrame(tick);
  };

  document.addEventListener('keydown', (event) => {
    if (!state.running) {
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handleMove('left');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleMove('right');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      handleMove('up');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      handleMove('down');
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  const gridContainer = root.querySelector('.grid-container');

  gridContainer.addEventListener('touchstart', (event) => {
    if (!state.running) {
      return;
    }
    event.preventDefault();
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: false });

  gridContainer.addEventListener('touchmove', (event) => {
    if (!state.running) {
      return;
    }
    event.preventDefault();
  }, { passive: false });

  gridContainer.addEventListener('touchend', (event) => {
    if (!state.running) {
      return;
    }
    event.preventDefault();
    const touch = event.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        handleMove('right');
      } else {
        handleMove('left');
      }
    } else {
      if (deltaY > 0) {
        handleMove('down');
      } else {
        handleMove('up');
      }
    }
  }, { passive: false });

  startButton.addEventListener('click', () => {
    if (state.running) {
      return;
    }
    markPlayed();
    playTone('start');
    state.running = true;
    state.startTime = performance.now();
    state.score = 0;
    state.moves = 0;
    updateHud();
    startButton.disabled = true;
    initGrid();
    renderGrid();
    setLog('同じ数字を合体させてスコアを伸ばそう！');
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
    }
    tick();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.best === 0) {
        return;
      }
      const text = `マージスライドでスコア ${state.best} を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  updateHud();
  enableShare();
  renderGrid();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートで60秒のチャレンジ開始。4x4のグリッドに2と4のタイルが配置されます。
2. キーボードの矢印キーまたはスワイプで上下左右に移動。同じ数字が隣接すると合体して2倍になります。
3. 合体するとその数値がスコアに加算。60秒間でできるだけ高いスコアを目指しましょう！

## 実装メモ
- 2048の基本ルールを踏襲し、60秒の時間制限を追加してスピード感を演出。
- 各方向への移動とマージ処理を実装し、キーボードとスワイプの操作方法に対応。
- タイルの値に応じて色が変わるグラデーション配色で、視覚的にも楽しめるようにしました。
- 新しいタイルの出現とマージ時のアニメーションで、操作の手触りを向上させています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
