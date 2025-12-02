---
title: "毎日ゲームチャレンジ Day 30: プライムダッシュ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-29-swap-sorter/' | relative_url }}">スワップソーター</a>

節目の30日目は数字判定スプリント「プライムダッシュ」。表示される1〜199の整数が素数かどうかを瞬時に判断し、素数ならFキー、合成数ならJキーで仕分けます。反射神経と算数感覚を総動員してハイスコアを狙いましょう！

<style>
#prime-dash-game {
  max-width: 560px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 28px 52px rgba(15, 23, 42, 0.36);
}
#prime-dash-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #prime-dash-game .hud {
    font-size: 0.82rem;
  }
}
#prime-dash-game .number-card {
  position: relative;
  margin: 0 auto 20px;
  max-width: 320px;
  padding: 32px 24px;
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.7);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
}
#prime-dash-game .number {
  display: block;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #38bdf8;
}
#prime-dash-game .choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
#prime-dash-game .choices button {
  border: none;
  border-radius: 18px;
  padding: 14px 18px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#prime-dash-game .choices button.prime {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#prime-dash-game .choices button.composite {
  background: linear-gradient(135deg, #facc15, #f97316);
  color: #0f172a;
  box-shadow: 0 18px 34px rgba(249, 115, 22, 0.32);
}
#prime-dash-game .choices button:hover:not(:disabled) {
  transform: translateY(-1px);
}
#prime-dash-game .choices button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
#prime-dash-game .controls {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
#prime-dash-game .controls button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#prime-dash-game .controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(16, 185, 129, 0.32);
}
#prime-dash-game .controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#prime-dash-game .log {
  margin-top: 18px;
  min-height: 24px;
  color: #cbd5f5;
}
#prime-dash-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#prime-dash-game .share-button {
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
#prime-dash-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#prime-dash-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="prime-dash-game">
  <div class="hud">
    <span class="time">残り: 30.0 秒</span>
    <span class="score">スコア:0</span>
    <span class="best">ベスト:0</span>
    <span class="combo">連続正解: 0</span>
    <span class="accuracy">正答率: 100%</span>
  </div>
  <div class="number-card">
    <span class="number">--</span>
  </div>
  <div class="choices">
    <button type="button" class="prime" data-choice="prime">Fキー: 素数</button>
    <button type="button" class="composite" data-choice="composite">Jキー: 合成数</button>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <p class="log">スタートで数字出題。素数はF、合成数はJで仕分けます。1は合成数側に分類しましょう。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('prime-dash-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const comboEl = root.querySelector('.combo');
  const accuracyEl = root.querySelector('.accuracy');
  const numberEl = root.querySelector('.number');
  const choiceButtons = Array.from(root.querySelectorAll('.choices button'));
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:prime-dash';
  const playedKey = 'aomagame:played:prime-dash';

  const state = {
    running: false,
    timeLimit: 30,
    startTime: 0,
    timerId: null,
    score: 0,
    best: 0,
    combo: 0,
    attempts: 0,
    correct: 0,
    currentValue: 0,
    currentIsPrime: false,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    correct: { frequency: 780, duration: 0.16, gain: 0.22 },
    miss: { frequency: 260, duration: 0.28, gain: 0.24 }
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
      bestEl.textContent = `ベスト:${state.best}`;
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
    comboEl.textContent = `連続正解: ${state.combo}`;
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

  const applyPenalty = () => {
    const penaltySeconds = 20;
    state.startTime -= penaltySeconds * 1000;
    const elapsed = (performance.now() - state.startTime) / 1000;
    const remaining = Math.max(0, state.timeLimit - elapsed);
    if (remaining <= 0) {
      timeEl.textContent = '残り: 0.0 秒';
      endGame();
      return true;
    }
    return false;
  };

  const isPrime = (value) => {
    if (value <= 1) {
      return false;
    }
    if (value === 2) {
      return true;
    }
    if (value % 2 === 0) {
      return false;
    }
    const limit = Math.floor(Math.sqrt(value));
    for (let i = 3; i <= limit; i += 2) {
      if (value % i === 0) {
        return false;
      }
    }
    return true;
  };

  const spawnNumber = () => {
    const value = 1 + Math.floor(Math.random() * 199);
    state.currentValue = value;
    state.currentIsPrime = isPrime(value);
    numberEl.textContent = String(value);
  };

  const stopGame = () => {
    state.running = false;
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    startButton.disabled = false;
    choiceButtons.forEach((button) => {
      button.disabled = true;
    });
  };

  const endGame = () => {
    stopGame();
    playTone('miss');
    const accuracy =
      state.attempts === 0 ? 100 : Math.round((state.correct / state.attempts) * 100);
    setLog(`タイムアップ！スコア ${state.score}、正答率 ${accuracy}% でした。`);
    enableShare();
  };
  const tick = () => {
    const elapsed = (performance.now() - state.startTime) / 1000;
    const remaining = Math.max(0, state.timeLimit - elapsed);
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    if (!state.running) {
      return;
    }
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
    state.startTime = performance.now();
    state.score = 0;
    state.combo = 0;
    state.attempts = 0;
    state.correct = 0;
    spawnNumber();
    updateHud();
    setLog('素数ならF、合成数ならJ。1は合成数に分類！テンポ良く仕分けよう。');
    startButton.disabled = true;
    choiceButtons.forEach((button) => {
      button.disabled = false;
    });
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
    }
    state.timerId = requestAnimationFrame(tick);
  };

  const handleChoice = (choice) => {
    if (!state.running) {
      return;
    }
    state.attempts += 1;
    const userIsPrime = choice === 'prime';
    if (userIsPrime === state.currentIsPrime) {
      state.score += 1;
      state.combo += 1;
      state.correct += 1;
      playTone('correct');
      setLog(`正解！連続正解 ${state.combo}。次の数字へ。`);
      if (state.score > state.best) {
        state.best = state.score;
        saveBest();
      }
    } else {
      state.combo = 0;
      const correctLabel = state.currentIsPrime ? '素数' : '合成数';
      setLog(`惜しい！ ${state.currentValue} は ${correctLabel} でした。時間が -20 秒されます。`);
      playTone('miss');
      if (applyPenalty()) {
        return;
      }
    }
    updateHud();
    enableShare();
    spawnNumber();
  };

  choiceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      handleChoice(button.dataset.choice || 'prime');
    });
  });

  startButton.addEventListener('click', () => {
    if (state.running) {
      return;
    }
    startGame();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      handleChoice('prime');
    } else if (event.key.toLowerCase() === 'j') {
      event.preventDefault();
      handleChoice('composite');
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.best === 0) {
        return;
      }
      const text = `プライムダッシュでスコア ${state.best}！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
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
1. スタートを押すと30秒間のスプリント開始。表示された整数が素数ならF、合成数（1含む）ならJを押します。
2. 連続正解でコンボが伸び、テンポを落とさずに仕分けるほどスコアが伸びます。ミスすると残り時間が20秒減るので要注意。
3. ハイスコアはローカルに保存され、シェアボタンで結果をXへ投稿できます。

## 実装メモ
- 素数判定は平方根までの試し割りで実装し、1は常に合成数扱いになるよう分岐。
- キーボード（F/J）とボタンの両方で回答できるようイベントを共存させ、誤入力でもログで正解を即フィードバック。
- `requestAnimationFrame`で残り時間を更新しつつ、ベストスコアをローカルストレージへ保存しています。
- Web Audio API でゲーム開始・正解・ミス・タイムアップの効果音を追加し、テンポの速い仕分けを耳でも確認できるようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
