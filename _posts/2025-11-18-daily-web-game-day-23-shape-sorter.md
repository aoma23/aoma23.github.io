---
title: "毎日Webゲームチャレンジ Day 23: シェイプソート"
categories:
  - game
tags:
  - aomagame
---

Day 23は形の識別と素早い直感操作を組み合わせた「シェイプソート」。画面に現れる○・□・△を瞬時に見極め、対応するボタン（キーボードも可）で仕分けていきます。60秒でどこまでスコアを伸ばせるか挑戦してみてください。

<style>
#shape-sorter-game {
  max-width: 560px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 20px;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  color: #f8fafc;
  box-shadow: 0 26px 48px rgba(15, 23, 42, 0.35);
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
}
#shape-sorter-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  font-weight: 700;
}
#shape-sorter-game .shape-display {
  margin: 0 auto 18px;
  width: 180px;
  height: 180px;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
#shape-sorter-game .shape {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  filter: drop-shadow(0 12px 24px rgba(14, 165, 233, 0.45));
  transition: transform 0.15s ease;
}
#shape-sorter-game .shape.square {
  border-radius: 20px;
}
#shape-sorter-game .shape.circle {
  border-radius: 50%;
}
#shape-sorter-game .shape.triangle {
  width: 132px;
  height: 132px;
  clip-path: polygon(50% 8%, 8% 90%, 92% 90%);
}
#shape-sorter-game .bins {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 32px auto 20px;
  flex-wrap: wrap;
}
#shape-sorter-game .bin {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 150px;
  padding: 16px 18px;
  border-radius: 18px;
  border: none;
  background: rgba(30, 41, 59, 0.55);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
  color: inherit;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.12s ease, border 0.12s ease, background 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#shape-sorter-game .bin:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.85);
  outline-offset: 2px;
}
#shape-sorter-game .bin.active {
  background: rgba(14, 165, 233, 0.22);
  box-shadow: 0 18px 36px rgba(14, 165, 233, 0.3);
  transform: translateY(-4px);
}
#shape-sorter-game .bin.success {
  background: rgba(74, 222, 128, 0.24);
  box-shadow: 0 18px 36px rgba(74, 222, 128, 0.35);
}
#shape-sorter-game .bin.miss {
  background: rgba(248, 113, 113, 0.22);
  box-shadow: 0 18px 36px rgba(248, 113, 113, 0.32);
}
#shape-sorter-game .bin .key {
  display: block;
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
#shape-sorter-game .bin .label {
  font-size: 0.95rem;
  opacity: 0.85;
}
#shape-sorter-game .bin .cta {
  font-size: 0.8rem;
  opacity: 0.75;
  letter-spacing: 0.1em;
}
#shape-sorter-game .controls {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
#shape-sorter-game .controls button {
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
#shape-sorter-game .controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 32px rgba(14, 165, 233, 0.35);
}
#shape-sorter-game .controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
#shape-sorter-game .log {
  margin-top: 18px;
  color: #cbd5f5;
  min-height: 24px;
}
#shape-sorter-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#shape-sorter-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #facc15, #f97316);
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(249, 115, 22, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#shape-sorter-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 38px rgba(249, 115, 22, 0.45);
}
#shape-sorter-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="shape-sorter-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="combo">コンボ: 0</span>
    <span class="accuracy">正答率: 100%</span>
  </div>
  <div class="shape-display">
    <div class="shape circle"></div>
  </div>
  <div class="bins">
    <button type="button" class="bin" data-type="circle">
      <span class="key">○</span>
      <span class="label">Circle</span>
    </button>
    <button type="button" class="bin" data-type="square">
      <span class="key">□</span>
      <span class="label">Square</span>
    </button>
    <button type="button" class="bin" data-type="triangle">
      <span class="key">△</span>
      <span class="label">Triangle</span>
    </button>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <p class="log">ボタンまたは J / K / L キーで仕分け。60秒間のハイスコアを狙いましょう！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('shape-sorter-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const comboEl = root.querySelector('.combo');
  const accuracyEl = root.querySelector('.accuracy');
  const shapeEl = root.querySelector('.shape');
  const bins = Array.from(root.querySelectorAll('.bin'));
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:shape-sorter';
  const playedKey = 'aomagame:played:shape-sorter';
  const shapes = [
    { type: 'circle', key: 'j', name: '○サークル' },
    { type: 'square', key: 'k', name: '□スクエア' },
    { type: 'triangle', key: 'l', name: '△トライアングル' }
  ];
  const keyMap = new Map(shapes.map((shape) => [shape.key, shape.type]));

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 540, duration: 0.18, gain: 0.22 },
    correct: { frequency: 760, duration: 0.14, gain: 0.2 },
    miss: { frequency: 240, duration: 0.22, gain: 0.22 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.correct;
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
    startTime: 0,
    timeLimit: 60,
    timerId: null,
    score: 0,
    best: 0,
    combo: 0,
    attempts: 0,
    correct: 0,
    storageAvailable: false,
    current: shapes[0],
    locked: false
  };

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
      state.best = value;
      bestEl.textContent = `ベスト: ${state.best}`;
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

  const getBin = (type) => bins.find((bin) => bin.dataset.type === type);

  const flashBin = (bin, className, duration = 240) => {
    if (!bin) {
      return;
    }
    bin.classList.add(className);
    window.setTimeout(() => {
      bin.classList.remove(className);
    }, duration);
  };

  const clearBinStates = () => {
    bins.forEach((bin) => {
      bin.classList.remove('active', 'success', 'miss');
    });
  };

  const setShape = (shape) => {
    state.current = shape;
    shapeEl.className = `shape ${shape.type}`;
    clearBinStates();
  };

  const spawnShape = () => {
    const next = shapes[Math.floor(Math.random() * shapes.length)];
    setShape(next);
  };

  const updateHud = () => {
    scoreEl.textContent = `スコア: ${state.score}`;
    comboEl.textContent = `コンボ: ${state.combo}`;
    bestEl.textContent = `ベスト: ${state.best}`;
    const accuracy =
      state.attempts === 0 ? 100 : Math.round((state.correct / state.attempts) * 100);
    accuracyEl.textContent = `正答率: ${accuracy}%`;
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };

  const stopTimer = () => {
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
  };

  const endGame = () => {
    state.running = false;
    state.locked = false;
    stopTimer();
    startButton.disabled = false;
    setLog(`タイムアップ！スコアは ${state.score} 点でした。`);
    clearBinStates();
    enableShare();
  };

  const tick = () => {
    const elapsed = (performance.now() - state.startTime) / 1000;
    const remaining = Math.max(0, state.timeLimit - elapsed);
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    if (remaining <= 0) {
      timeEl.textContent = '残り: 0.0 秒';
      endGame();
      return;
    }
    state.timerId = requestAnimationFrame(tick);
  };

  const startGame = () => {
    markPlayed();
    playTone('start');
    state.running = true;
    state.locked = false;
    state.startTime = performance.now();
    state.score = 0;
    state.combo = 0;
    state.correct = 0;
    state.attempts = 0;
    setLog('仕分け開始！ボタンまたは J / K / L キーで正しい形を選びましょう。');
    startButton.disabled = true;
    spawnShape();
    updateHud();
    stopTimer();
    tick();
  };

  const handleSelection = (type) => {
    if (!state.running || state.locked) {
      return;
    }
    if (!type) {
      return;
    }
    const shape = state.current;
    if (!shape) {
      return;
    }
    if (!shapes.some((item) => item.type === type)) {
      return;
    }

    state.locked = true;
    state.attempts += 1;
    clearBinStates();

    if (type === shape.type) {
      state.score += 1;
      state.combo += 1;
      state.correct += 1;
      setLog(`ナイス！${shape.name} を仕分けました。`);
      const correctBin = getBin(type);
      if (correctBin) {
        flashBin(correctBin, 'success', 260);
      }
      playTone('correct');
      if (state.score > state.best) {
        state.best = state.score;
        saveBest();
      }
    } else {
      state.combo = 0;
      const tapped = shapes.find((item) => item.type === type);
      const wrongBin = getBin(type);
      if (wrongBin) {
        flashBin(wrongBin, 'miss', 320);
      }
      const tappedName = tapped ? tapped.name : '別の形';
      setLog(`${tappedName} を選びましたが、正解は ${shape.name} でした。`);
      playTone('miss');
    }

    updateHud();
    enableShare();

    const delay = type === shape.type ? 260 : 320;
    window.setTimeout(() => {
      if (!state.running) {
        state.locked = false;
        return;
      }
      spawnShape();
      state.locked = false;
    }, delay);
  };

  const handleKey = (event) => {
    if (!state.running || state.locked) {
      return;
    }
    const key = event.key.toLowerCase();
    const type = keyMap.get(key);
    if (!type) {
      return;
    }
    event.preventDefault();
    handleSelection(type);
  };

  const openShareWindow = () => {
    if (state.best === 0) {
      return;
    }
    const text = `シェイプソートでスコア ${state.best} を記録！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      openShareWindow();
    });
  }

  bins.forEach((bin) => {
    bin.addEventListener('click', () => {
      handleSelection(bin.dataset.type ?? '');
    });
  });

  startButton.addEventListener('click', () => {
    if (state.running) {
      return;
    }
    startGame();
  });

  window.addEventListener('keydown', handleKey);

  detectStorage();
  loadBest();
  enableShare();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
  updateHud();
})();
</script>

## 遊び方
1. スタートを押したら60秒間のカウントダウンが始まります。
2. 画面中央の形を見て、対応するボタンまたは J / K / L キーで仕分けしましょう。
3. 連続正解でコンボが伸びます。焦らず視認してから入力するのがコツ。

## 実装メモ
- 各ラウンドでランダムに形を選び、ボタン入力とキー入力を共通ハンドラで処理しつつロックで二重入力を防止。
- ローカルストレージにベストスコアを保存し、シェアボタンでX投稿を生成。
- `requestAnimationFrame`で残り時間を滑らかに更新しつつ、誤操作時は bins にミス演出を追加しました。
- Web Audio API でゲーム開始・正解・ミス時の効果音を生成し、入力でもレスポンスが分かりやすいようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
