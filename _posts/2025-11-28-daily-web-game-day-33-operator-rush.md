---
title: "毎日Webゲームチャレンジ Day 33: オペレーターダッシュ"
categories:
  - game
tags:
  - aomagame
---

33日目は暗算クイズ「オペレーターダッシュ」。与えられた数式に正しい演算子（+ / − / × / ÷）を素早く当てはめてください。スマホの大きなボタンでテンポよく回答できます。

<style>
#operator-rush-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 28px 50px rgba(15, 23, 42, 0.38);
}
#operator-rush-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
  font-weight: 700;
}
#operator-rush-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#operator-rush-game .start-controls button {
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
#operator-rush-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#operator-rush-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#operator-rush-game .equation-card {
  margin-bottom: 18px;
  padding: 22px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.6);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
#operator-rush-game .equation {
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
#operator-rush-game .choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
#operator-rush-game .choices button {
  border: none;
  border-radius: 16px;
  padding: 16px 12px;
  font-size: 1.5rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.18);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#operator-rush-game .choices button.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
  box-shadow: 0 18px 36px rgba(34, 197, 94, 0.35);
}
#operator-rush-game .choices button.wrong {
  background: rgba(248, 113, 113, 0.28);
}
#operator-rush-game .choices button:disabled {
  opacity: 0.35;
  box-shadow: none;
  cursor: not-allowed;
}
#operator-rush-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#operator-rush-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#operator-rush-game .share button {
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
#operator-rush-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
</style>

<div id="operator-rush-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="streak">連続正解: 0</span>
    <span class="accuracy">正答率: 100%</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="equation-card">
    <p class="equation">-- ? -- = --</p>
  </div>
  <div class="choices">
    <button type="button" data-operator="+">＋</button>
    <button type="button" data-operator="-">−</button>
    <button type="button" data-operator="*">×</button>
    <button type="button" data-operator="/">÷</button>
  </div>
  <p class="log">スタートで数式が表示されます。正しい演算子を選びましょう。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('operator-rush-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const accuracyEl = root.querySelector('.accuracy');
  const startButton = root.querySelector('.start');
  const equationEl = root.querySelector('.equation');
  const choiceButtons = Array.from(root.querySelectorAll('.choices button'));
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:operator-rush';
  const playedKey = 'aomagame:played:operator-rush';

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    operands: [0, 0],
    result: 0,
    answer: '+',
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
    streakEl.textContent = `連続正解: ${state.streak}`;
    const accuracy = state.attempts === 0 ? 100 : Math.round((state.hits / state.attempts) * 100);
    accuracyEl.textContent = `正答率: ${accuracy}%`;
  };

  const formatEquation = () => {
    const [a, b] = state.operands;
    const placeholder = '？';
    equationEl.textContent = `${a} ${placeholder} ${b} = ${state.result}`;
  };

  const generatePuzzle = () => {
    const operators = ['+', '-', '*', '/'];
    const chosen = operators[Math.floor(Math.random() * operators.length)];
    let a = 0;
    let b = 0;
    let result = 0;

    if (chosen === '+') {
      a = 1 + Math.floor(Math.random() * 30);
      b = 1 + Math.floor(Math.random() * 30);
      result = a + b;
    } else if (chosen === '-') {
      a = 10 + Math.floor(Math.random() * 30);
      b = 1 + Math.floor(Math.random() * a);
      result = a - b;
    } else if (chosen === '*') {
      a = 1 + Math.floor(Math.random() * 12);
      b = 1 + Math.floor(Math.random() * 12);
      result = a * b;
    } else {
      b = 1 + Math.floor(Math.random() * 12);
      result = 1 + Math.floor(Math.random() * 12);
      a = b * result;
    }

    state.operands = [a, b];
    state.result = result;
    state.answer = chosen;
    formatEquation();
  };

  const remainingTime = () => {
    const elapsed = (performance.now() - state.startTime) / 1000;
    return Math.max(0, state.timeLimit - elapsed - state.penalty);
  };

  const applyTimePenalty = () => {
    if (!state.running) {
      return;
    }
    state.penalty = Math.min(state.timeLimit, state.penalty + 5);
  };

  const endGame = () => {
    state.running = false;
    startButton.disabled = false;
    choiceButtons.forEach((button) => {
      button.disabled = true;
      button.classList.remove('correct', 'wrong');
    });
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

  const handleChoice = (operator, button) => {
    if (!state.running) {
      return;
    }
    state.attempts += 1;
    if (operator === state.answer) {
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
      choiceButtons.forEach((btn) => (btn.disabled = true));
      window.setTimeout(() => {
        choiceButtons.forEach((btn) => {
          btn.disabled = false;
          btn.classList.remove('correct', 'wrong');
        });
        generatePuzzle();
        updateHud();
      }, 180);
    } else {
      state.streak = 0;
      playTone('miss');
      button.classList.add('wrong');
      applyTimePenalty();
      setLog('残念！演算子が違います。（-5秒）');
      updateHud();
      window.setTimeout(() => button.classList.remove('wrong'), 200);
    }
  };

  choiceButtons.forEach((button) => {
    button.disabled = true;
    button.addEventListener('click', () => {
      handleChoice(button.dataset.operator, button);
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
    choiceButtons.forEach((button) => (button.disabled = false));
    generatePuzzle();
    setLog('正しい演算子をタップしてください！');
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
      const text = `オペレーターダッシュでスコア ${state.best} を記録！ #aomagame`;
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
  equationEl.textContent = '-- ? -- = --';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートを押すと60秒カウントダウンがスタート。数式の「？」に入る正しい演算子を選びます。
2. 正解でスコアと連続ボーナスが伸び、間違えるとスコアマイナス＆コンボリセット。素早く判断して高得点を狙いましょう。
3. ベストスコアはローカルに保存。演算感覚を鍛えてシェアで友だちに挑戦状を送りましょう。

## 実装メモ
- 足し算・引き算・掛け算・割り算からランダムに出題し、割り算は必ず整数結果になるよう生成しています。
- スコアは連続正解で加速する設計で、短時間でも緊張感があるテンポに。
- 効果音はWeb Audio APIで生成し、タップ操作でも気持ちよくプレイできるようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
