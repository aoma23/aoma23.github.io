---
title: "毎日ゲームチャレンジ Day 29: スワップソーター"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-28-emoji-cafe/' | relative_url }}">エモジカフェ</a>

29日目はミニソートパズル「スワップソーター」。ランダムに並んだ4つの数字を、タップだけで昇順に並び替えます。手数は記録に残るので、ムダのないスワップでハイスコアを叩き出しましょう。

<style>
#swap-sorter-game {
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
#swap-sorter-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
  font-weight: 700;
}
#swap-sorter-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#swap-sorter-game .start-controls button {
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
#swap-sorter-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#swap-sorter-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#swap-sorter-game .board {
  display: grid;
  grid-template-columns: repeat(4, minmax(70px, 1fr));
  gap: 12px;
  margin: 20px auto 14px;
}
#swap-sorter-game .tile {
  position: relative;
  border: none;
  border-radius: 18px;
  padding: 24px 0;
  font-size: 1.8rem;
  font-weight: 800;
  background: rgba(56, 189, 248, 0.2);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#swap-sorter-game .tile.selected {
  background: linear-gradient(135deg, #facc15, #f97316);
  color: #0f172a;
  box-shadow: 0 20px 38px rgba(249, 115, 22, 0.32);
  transform: translateY(-2px);
}
#swap-sorter-game .tile:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#swap-sorter-game .summary {
  margin-bottom: 12px;
  font-size: 1rem;
  color: #cbd5f5;
}
#swap-sorter-game .log {
  min-height: 24px;
  color: #f8fafc;
}
#swap-sorter-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#swap-sorter-game .share button {
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
#swap-sorter-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#swap-sorter-game .share button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="swap-sorter-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="streak">連続クリア: 0</span>
    <span class="moves">今回の手数: 0</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="board">
    <button type="button" class="tile">-</button>
    <button type="button" class="tile">-</button>
    <button type="button" class="tile">-</button>
    <button type="button" class="tile">-</button>
  </div>
  <div class="summary">左から小さい順に並べ替えましょう。</div>
  <p class="log">スタートで並べ替え開始。タイルを2回タップして入れ替えます。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('swap-sorter-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const movesEl = root.querySelector('.moves');
  const tiles = Array.from(root.querySelectorAll('.tile'));
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:swap-sorter';
  const playedKey = 'aomagame:played:swap-sorter';

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    select: { frequency: 720, duration: 0.12, gain: 0.18 },
    swap: { frequency: 860, duration: 0.16, gain: 0.22 },
    success: { frequency: 900, duration: 0.22, gain: 0.24 },
    miss: { frequency: 250, duration: 0.18, gain: 0.2 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.select;
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
    tiles: [],
    previousTiles: [],
    selectedIndex: null,
    moves: 0,
    score: 0,
    best: 0,
    streak: 0,
    storageAvailable: false
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
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
    scoreEl.textContent = `スコア: ${state.score}`;
    bestEl.textContent = `ベスト: ${state.best}`;
    streakEl.textContent = `連続クリア: ${state.streak}`;
    movesEl.textContent = `今回の手数: ${state.moves}`;
  };

  const enableTiles = (enabled) => {
    tiles.forEach((tile) => {
      tile.disabled = !enabled;
      if (!enabled) {
        tile.classList.remove('selected');
      }
    });
  };

  const shuffledTiles = () => {
    const prev = state.previousTiles || [];
    const sample = () => {
      const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, 4);
    };
    const isAscending = (numbers) => {
      for (let i = 1; i < numbers.length; i += 1) {
        if (numbers[i - 1] > numbers[i]) {
          return false;
        }
      }
      return true;
    };
    while (true) {
      const numbers = sample();
      const sameAsPrev =
        prev.length === numbers.length && prev.every((value, index) => value === numbers[index]);
      if (!isAscending(numbers) && !sameAsPrev) {
        return numbers;
      }
    }
  };

  const renderTiles = () => {
    tiles.forEach((tile, index) => {
      tile.textContent = String(state.tiles[index]);
      tile.classList.remove('selected', 'correct');
    });
  };

  const newRound = (message) => {
    const next = shuffledTiles();
    state.tiles = next;
    state.previousTiles = next.slice();
    state.selectedIndex = null;
    state.moves = 0;
    renderTiles();
    updateHud();
    setLog(message);
    enableTiles(true);
  };

  const checkSorted = () => {
    for (let i = 0; i < state.tiles.length - 1; i += 1) {
      if (state.tiles[i] > state.tiles[i + 1]) {
        return false;
      }
    }
    return true;
  };

  const endGame = () => {
    state.running = false;
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    enableTiles(false);
    startButton.disabled = false;
    tiles.forEach((tile) => tile.classList.remove('selected'));
    setLog(`終了！スコア ${state.score}、連続クリア ${state.streak} でした。`);
    enableShare();
  };

  const tick = () => {
    if (!state.running) {
      return;
    }
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

  const handleSorted = () => {
    enableTiles(false);
    state.score += 1;
    state.streak += 1;
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }
    playTone('success');
    updateHud();
    enableShare();
    window.setTimeout(() => {
      newRound(`整列完了！連続クリア ${state.streak}。次の並び替えに挑戦！`);
    }, 160);
  };

  const selectTile = (index) => {
    if (!state.running) {
      return;
    }
    if (state.selectedIndex === index) {
      tiles[index].classList.remove('selected');
      state.selectedIndex = null;
      return;
    }
    if (state.selectedIndex === null) {
      state.selectedIndex = index;
      tiles[index].classList.add('selected');
      playTone('select');
      setLog(`${state.tiles[index]} を選択しました。入れ替え先をタップしてください。`);
      return;
    }
    const firstIndex = state.selectedIndex;
    const secondIndex = index;
    const temp = state.tiles[firstIndex];
    state.tiles[firstIndex] = state.tiles[secondIndex];
    state.tiles[secondIndex] = temp;
    state.selectedIndex = null;
    state.moves += 1;
    playTone('swap');
    renderTiles();
    updateHud();
    if (checkSorted()) {
      handleSorted();
      return;
    }
    setLog(`入れ替え完了。現在の手数: ${state.moves}`);
  };

  tiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
      selectTile(index);
    });
  });

  startButton.addEventListener('click', () => {
    if (state.running) {
      return;
    }
    markPlayed();
    playTone('start');
    state.running = true;
    state.startTime = performance.now();
    state.score = 0;
    state.streak = 0;
    state.moves = 0;
    updateHud();
    startButton.disabled = true;
    enableTiles(true);
    newRound('タイルを昇順に並べ替えましょう。最短手数を目指してください！');
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
      const text = `スワップソーターでスコア ${state.best} を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  enableShare();
  enableTiles(false);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
  updateHud();
})();
</script>

## 遊び方
1. スタートで60秒間のカウントダウン開始。数字タイルがランダムに並びます。
2. タイルを2回タップして入れ替え、左から小さい順になるよう並べ替えましょう。
3. 並べ替えに成功すると次の問題へ。連続クリアでスコアが伸びるので、素早い判断と最小手数を意識してください。

## 実装メモ
- タイル配列はシャッフル後、昇順の初期状態を避けてゲーム性を確保。
- 選択中タイルのインデックスを保持し、2回目のタップでスワップを実行。正しい位置は色でフィードバック。
- スコア／ベストはローカルストレージに保存し、Web Audio API で選択・入れ替え・クリア時の効果音を追加してタッチ操作を快適にしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
