---
title: "毎日ゲームチャレンジ Day 41: ワンムーブパズル"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  

41日目はロジックパズル「ワンムーブパズル」。4つの数字から1つを除外すると、残り3つがターゲット合計になるものを見つけましょう。1手で解ける爽快感とロジック力が試されます。

<style>
#one-move-game {
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
#one-move-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #one-move-game .hud {
    font-size: 0.82rem;
  }
}
#one-move-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#one-move-game .start-controls button {
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
#one-move-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#one-move-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#one-move-game .target-card {
  margin-bottom: 18px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.6);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
#one-move-game .target {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 8px;
}
#one-move-game .target-value {
  font-size: 2.8rem;
  font-weight: 800;
  color: #38bdf8;
}
#one-move-game .puzzle-hint {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-top: 8px;
}
#one-move-game .numbers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
#one-move-game .numbers button {
  border: none;
  border-radius: 16px;
  padding: 24px 12px;
  font-size: 2rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.18);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#one-move-game .numbers button.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
}
#one-move-game .numbers button.wrong {
  background: rgba(248, 113, 113, 0.28);
}
#one-move-game .numbers button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#one-move-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#one-move-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#one-move-game .share button {
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

<div id="one-move-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア:0</span>
    <span class="best">ベスト:0</span>
    <span class="streak">連続正解: 0</span>
    <span class="accuracy">正答率: 100%</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="target-card">
    <p class="target">残り3つの合計</p>
    <p class="target-value">--</p>
    <p class="puzzle-hint">1つ除外して残り3つの合計を作ろう</p>
  </div>
  <div class="numbers">
    <button type="button" data-value="0">0</button>
    <button type="button" data-value="0">0</button>
    <button type="button" data-value="0">0</button>
    <button type="button" data-value="0">0</button>
  </div>
  <p class="log">スタートでパズルが表示されます。除外すべき数字を選びましょう。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('one-move-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const accuracyEl = root.querySelector('.accuracy');
  const startButton = root.querySelector('.start');
  const targetValueEl = root.querySelector('.target-value');
  const numberButtons = Array.from(root.querySelectorAll('.numbers button'));
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:one-move';
  const playedKey = 'aomagame:played:one-move';

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    numbers: [],
    target: 0,
    correctIndex: 0,
    score: 0,
    best: 0,
    streak: 0,
    hits: 0,
    attempts: 0,
    storageAvailable: false,
    penalty: 0
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    correct: { frequency: 820, duration: 0.16, gain: 0.22 },
    miss: { frequency: 260, duration: 0.2, gain: 0.22 }
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
    streakEl.textContent = `連続正解: ${state.streak}`;
    const accuracy = state.attempts === 0 ? 100 : Math.round((state.hits / state.attempts) * 100);
    accuracyEl.textContent = `正答率: ${accuracy}%`;
  };

  const generatePuzzle = () => {
    const nums = Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * 20));
    const removeIndex = Math.floor(Math.random() * 4);
    const target = nums.reduce((sum, num, idx) => idx === removeIndex ? sum : sum + num, 0);

    state.numbers = nums;
    state.target = target;
    state.correctIndex = removeIndex;

    targetValueEl.textContent = target.toString();
    numberButtons.forEach((button, index) => {
      button.dataset.value = nums[index].toString();
      button.textContent = nums[index].toString();
      button.classList.remove('correct', 'wrong');
      button.disabled = false;
    });
  };

  const remainingTime = () => {
    const elapsed = (performance.now() - state.startTime) / 1000;
    return Math.max(0, state.timeLimit - elapsed - state.penalty);
  };

  const applyTimePenalty = () => {
    if (!state.running) {
      return;
    }
    state.penalty = Math.min(state.timeLimit, state.penalty + 3);
  };

  const endGame = () => {
    state.running = false;
    startButton.disabled = false;
    numberButtons.forEach((button) => (button.disabled = true));
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    setLog(`終了！スコア ${state.score}、正答率 ${(state.attempts === 0 ? 100 : Math.round((state.hits / state.attempts) * 100))}% でした。`);
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

  const handleChoice = (button, index) => {
    if (!state.running) {
      return;
    }
    state.attempts += 1;
    if (index === state.correctIndex) {
      state.hits += 1;
      state.streak += 1;
      const bonus = 10 + state.streak * 2;
      state.score += bonus;
      playTone('correct');
      setLog(`正解！+${bonus}点`);
      button.classList.add('correct');
      if (state.score > state.best) {
        state.best = state.score;
        saveBest();
        enableShare();
      }
      updateHud();
      numberButtons.forEach((btn) => (btn.disabled = true));
      window.setTimeout(() => {
        generatePuzzle();
        updateHud();
      }, 180);
    } else {
      state.streak = 0;
      playTone('miss');
      button.classList.add('wrong');
      applyTimePenalty();
      setLog(`残念！もう一度考えてみましょう。（-3秒）`);
      updateHud();
      window.setTimeout(() => button.classList.remove('wrong'), 200);
    }
  };

  numberButtons.forEach((button, index) => {
    button.disabled = true;
    button.addEventListener('click', () => {
      handleChoice(button, index);
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
    state.hits = 0;
    state.attempts = 0;
    state.penalty = 0;
    updateHud();
    startButton.disabled = true;
    numberButtons.forEach((button) => (button.disabled = false));
    generatePuzzle();
    setLog('除外すべき数字を素早く見つけましょう！');
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
      const text = `ワンムーブパズルでスコア ${state.best} を記録！ #aomagame`;
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
  targetValueEl.textContent = '--';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートで60秒のチャレンジ開始。4つの数字とターゲット合計が表示されます。
2. 1つ除外すると残り3つの合計がターゲットになる数字をタップします。
3. 正解するとスコアと連続ボーナスが加算。間違えると減点なので慎重に！

## 実装メモ
- 4つの数字からランダムに1つを除外し、残り3つの合計をターゲットとして設定。
- 連続正解でスコアが伸びるシステムにし、短時間でもロジック力が鍛えられます。
- 効果音はWeb Audio APIで生成し、タッチ操作にも心地よく反応するように調整しました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
