---
title: "毎日ゲームチャレンジ Day 25: ピクセルペインター"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-24-orbit-defender/' | relative_url }}">オービットディフェンダー</a>

25日目は記憶力と空間認識を鍛える「ピクセルペインター」。数秒だけ表示される模様を覚えて、同じ配置でマス目を塗り直すシンプルな記憶ゲームです。ステージを重ねるごとに塗るピクセルが増えていくので、集中力が物を言います。

<style>
#pixel-painter-game {
  max-width: 640px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 28px 52px rgba(15, 23, 42, 0.36);
}
#pixel-painter-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  font-weight: 700;
}
#pixel-painter-game .boards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}
#pixel-painter-game .board-wrapper {
  padding: 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.55);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
}
#pixel-painter-game .board-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #cbd5f5;
  margin-bottom: 12px;
}
#pixel-painter-game .board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
#pixel-painter-game .cell {
  position: relative;
  width: 100%;
  padding-top: 100%;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.7);
  border: 2px solid rgba(148, 163, 184, 0.25);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border 0.12s ease, background 0.12s ease;
  touch-action: manipulation;
}
#pixel-painter-game .cell::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(14, 165, 233, 0.18));
  opacity: 0;
  transition: opacity 0.12s ease;
}
#pixel-painter-game .pattern-board .cell {
  cursor: default;
}
#pixel-painter-game .pattern-board .cell.active::after {
  opacity: 1;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.55), rgba(14, 165, 233, 0.78));
}
#pixel-painter-game .pattern-board.conceal .cell {
  border-color: rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.55);
}
#pixel-painter-game .pattern-board.conceal .cell::after {
  opacity: 0;
}
#pixel-painter-game .paint-board .cell {
  background: rgba(15, 23, 42, 0.65);
}
#pixel-painter-game .paint-board .cell.painted::after {
  opacity: 1;
  background: linear-gradient(135deg, rgba(250, 204, 21, 0.65), rgba(249, 115, 22, 0.82));
}
#pixel-painter-game .paint-board .cell.hint-miss {
  border-color: rgba(248, 113, 113, 0.9);
  box-shadow: 0 0 12px rgba(248, 113, 113, 0.45);
}
#pixel-painter-game .paint-board .cell.hint-extra {
  border-color: rgba(96, 165, 250, 0.85);
  box-shadow: 0 0 12px rgba(96, 165, 250, 0.4);
}
#pixel-painter-game .start-controls {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
  gap: 12px;
}
#pixel-painter-game .controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}
#pixel-painter-game .controls button,
#pixel-painter-game .start-controls button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#pixel-painter-game .controls button:hover:not(:disabled),
#pixel-painter-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#pixel-painter-game .controls button:disabled,
#pixel-painter-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#pixel-painter-game .controls .check {
  background: linear-gradient(135deg, #facc15, #f97316);
  color: #0f172a;
  box-shadow: 0 18px 34px rgba(249, 115, 22, 0.32);
}
#pixel-painter-game .log {
  margin-top: 18px;
  min-height: 24px;
  color: #cbd5f5;
}
#pixel-painter-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#pixel-painter-game .share-button {
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
  touch-action: manipulation;
}
#pixel-painter-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#pixel-painter-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="pixel-painter-game">
  <div class="hud">
    <span class="stage">ステージ: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="perfect">パーフェクト: 0</span>
    <span class="accuracy">正答率: 100%</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="boards">
    <div class="board-wrapper">
      <p class="board-label">記憶ボード</p>
      <div class="board pattern-board"></div>
    </div>
    <div class="board-wrapper">
      <p class="board-label">ペイントボード</p>
      <div class="board paint-board"></div>
    </div>
  </div>
  <div class="controls">
    <button type="button" class="check" disabled>チェック</button>
  </div>
  <p class="log">スタートでパターン表示。覚えたら同じ位置を塗ってチェック！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('pixel-painter-game');
  if (!root) {
    return;
  }

  const stageEl = root.querySelector('.stage');
  const bestEl = root.querySelector('.best');
  const perfectEl = root.querySelector('.perfect');
  const accuracyEl = root.querySelector('.accuracy');
  const patternBoard = root.querySelector('.pattern-board');
  const paintBoard = root.querySelector('.paint-board');
  const startButton = root.querySelector('.start');
  const checkButton = root.querySelector('.check');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:pixel-painter';
  const playedKey = 'aomagame:played:pixel-painter';
  const boardSize = 4;
  const totalCells = boardSize * boardSize;
  const displayBase = 3200;
  const displayMin = 1800;
  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    cue: { frequency: 660, duration: 0.16, gain: 0.18 },
    ready: { frequency: 780, duration: 0.16, gain: 0.18 },
    success: { frequency: 860, duration: 0.24, gain: 0.24 },
    error: { frequency: 260, duration: 0.3, gain: 0.24 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.cue;
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

  const state = {
    running: false,
    stage: 0,
    bestStage: 0,
    perfectCount: 0,
    lastAccuracy: 100,
    storageAvailable: false,
    ready: false,
    showTimer: null,
    pattern: new Set(),
    selected: new Set()
  };

  const patternCells = [];
  const paintCells = [];

  const detectStorage = () => {
    try {
      const testKey = `${storageKey}:test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      state.storageAvailable = true;
    } catch (error) {
      state.storageAvailable = false;
    }
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
      state.bestStage = value;
      bestEl.textContent = `ベスト: ${state.bestStage}`;
    }
  };

  const saveBest = () => {
    if (!state.storageAvailable) {
      return;
    }
    localStorage.setItem(storageKey, String(state.bestStage));
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
    stageEl.textContent = `ステージ: ${state.stage}`;
    bestEl.textContent = `ベスト: ${state.bestStage}`;
    perfectEl.textContent = `パーフェクト: ${state.perfectCount}`;
    accuracyEl.textContent = `正答率: ${state.lastAccuracy}%`;
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.bestStage === 0;
  };

  const clearTimers = () => {
    if (state.showTimer !== null) {
      clearTimeout(state.showTimer);
      state.showTimer = null;
    }
  };

  const generatePattern = () => {
    state.pattern.clear();
    const fillCount = Math.min(totalCells - 2, 3 + state.stage);
    while (state.pattern.size < fillCount) {
      state.pattern.add(Math.floor(Math.random() * totalCells));
    }
  };

  const clearPaintBoard = () => {
    state.selected.clear();
    paintCells.forEach((cell) => {
      cell.classList.remove('painted', 'hint-miss', 'hint-extra');
    });
  };

  const showPattern = () => {
    patternBoard.classList.remove('conceal');
    patternCells.forEach((cell) => cell.classList.remove('active'));
    for (const index of state.pattern.values()) {
      const cell = patternCells[index];
      if (cell) {
        cell.classList.add('active');
      }
    }
  };

  const hidePattern = () => {
    patternCells.forEach((cell) => cell.classList.remove('active'));
    patternBoard.classList.add('conceal');
  };

  const prepareStage = () => {
    clearTimers();
    state.ready = false;
    clearPaintBoard();
    generatePattern();
    showPattern();
    playTone('cue');
    setLog(`ステージ ${state.stage}: パターンを ${Math.max(displayMin, displayBase - state.stage * 120) / 1000} 秒で記憶しよう。`);
    startButton.disabled = true;
    checkButton.disabled = true;
    const duration = Math.max(displayMin, displayBase - state.stage * 120);
    state.showTimer = window.setTimeout(() => {
      hidePattern();
      state.ready = true;
      checkButton.disabled = false;
      startButton.disabled = false;
      playTone('ready');
      setLog('同じ位置を塗って「チェック」を押してください。');
    }, duration);
  };

  const startGame = () => {
    markPlayed();
    playTone('start');
    state.running = true;
    state.stage = 1;
    state.perfectCount = 0;
    state.lastAccuracy = 100;
    enableShare();
    updateHud();
    prepareStage();
  };

  const evaluate = () => {
    if (!state.running || !state.ready) {
      return;
    }
    let matches = 0;
    paintCells.forEach((cell) => {
      cell.classList.remove('hint-miss', 'hint-extra');
    });
    for (let index = 0; index < totalCells; index += 1) {
      const hasPattern = state.pattern.has(index);
      const hasPaint = state.selected.has(index);
      if (hasPattern === hasPaint) {
        matches += 1;
      } else if (hasPattern) {
        paintCells[index].classList.add('hint-miss');
      } else if (hasPaint) {
        paintCells[index].classList.add('hint-extra');
      }
    }
    const accuracy = Math.round((matches / totalCells) * 100);
    state.lastAccuracy = accuracy;
    if (matches === totalCells) {
      playTone('success');
      state.perfectCount += 1;
      state.stage += 1;
      if (state.stage - 1 > state.bestStage) {
        state.bestStage = state.stage - 1;
        saveBest();
      }
      setLog(`完璧！正答率100%。次はステージ ${state.stage} です。`);
      enableShare();
      updateHud();
      prepareStage();
      return;
    }
    setLog(`正答率 ${accuracy}%。足りないマスは赤、余計なマスは青で表示しています。調整してもう一度挑戦！`);
    playTone('error');
    updateHud();
  };

  const toggleCell = (cell) => {
    if (!state.running || !state.ready) {
      return;
    }
    const index = Number.parseInt(cell.dataset.index ?? '-1', 10);
    if (Number.isNaN(index) || index < 0 || index >= totalCells) {
      return;
    }
    if (state.selected.has(index)) {
      state.selected.delete(index);
      cell.classList.remove('painted');
    } else {
      state.selected.add(index);
      cell.classList.add('painted');
    }
  };

  const openShareWindow = () => {
    if (state.bestStage === 0) {
      return;
    }
    const text = `ピクセルペインターでステージ ${state.bestStage} をクリア！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  const createBoardCells = () => {
    for (let index = 0; index < totalCells; index += 1) {
      const patternCell = document.createElement('div');
      patternCell.className = 'cell';
      patternCell.dataset.index = String(index);
      patternBoard.appendChild(patternCell);
      patternCells.push(patternCell);

      const paintCell = document.createElement('button');
      paintCell.type = 'button';
      paintCell.className = 'cell';
      paintCell.dataset.index = String(index);
      paintBoard.appendChild(paintCell);
      paintCells.push(paintCell);
    }
  };

  createBoardCells();

  paintBoard.addEventListener('click', (event) => {
    const cell = event.target.closest('.cell');
    if (!cell) {
      return;
    }
    toggleCell(cell);
  });

  startButton.addEventListener('click', () => {
    startGame();
  });

  checkButton.addEventListener('click', () => {
    evaluate();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      openShareWindow();
    });
  }

  detectStorage();
  loadBest();
  enableShare();
  updateHud();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートを押すと記憶ボードに模様が数秒だけ表示されます。色の位置を覚えましょう。
2. 表示が消えたらペイントボードで同じ位置をクリックして塗ります。
3. チェックを押すと採点。完全一致なら次のステージへ進み、ミスした場所はヒント表示されます。

## 実装メモ
- ステージごとに塗るマス数と表示時間を調整しつつ、Setを使ってパターンと選択状態を管理。
- 正解率は最後のチェック結果を保持し、ローカルストレージに最高ステージを保存。
- 余計なマスや不足マスにはクラスを付与して視覚的にフィードバックすることで、次の挑戦がしやすいようにしました。
- Web Audio API で開始・暗記タイミング・判定結果の効果音を用意し、テンポ良く遊べるようにしています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
