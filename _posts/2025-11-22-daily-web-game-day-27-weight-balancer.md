---
title: "毎日Webゲームチャレンジ Day 27: ウェイトバランサー"
categories:
  - game
tags:
  - aomagame
---

27日目は足し算パズル「ウェイトバランサー」。提示されたターゲット重量にぴったりなるよう、重りボタンを組み合わせます。限られた時間で連続クリアを狙い、思考スピードと指先の操作感覚を鍛えましょう。

<style>
#weight-balancer-game {
  max-width: 560px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 26px 48px rgba(15, 23, 42, 0.38);
}
#weight-balancer-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
  font-weight: 700;
}
#weight-balancer-game .target {
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.6);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.22);
}
#weight-balancer-game .target span {
  display: block;
  font-size: 1.6rem;
  margin-top: 6px;
  color: #38bdf8;
  letter-spacing: 0.06em;
}
#weight-balancer-game .weights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 12px;
  margin: 18px 0;
}
#weight-balancer-game .weights button,
#weight-balancer-game .actions button {
  border: none;
  border-radius: 16px;
  padding: 14px 18px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#weight-balancer-game .weights button {
  background: rgba(56, 189, 248, 0.18);
  color: #0f172a;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.22);
}
#weight-balancer-game .weights button:hover:not(:disabled),
#weight-balancer-game .weights button:active {
  transform: translateY(-2px);
  box-shadow: 0 18px 34px rgba(56, 189, 248, 0.35);
}
#weight-balancer-game .weights button:disabled,
#weight-balancer-game .actions button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#weight-balancer-game .actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
#weight-balancer-game .actions button.primary {
  background: linear-gradient(135deg, #facc15, #f97316);
  color: #0f172a;
  box-shadow: 0 20px 36px rgba(249, 115, 22, 0.32);
}
#weight-balancer-game .actions button.secondary {
  background: rgba(99, 102, 241, 0.2);
  color: #cbd5f5;
  box-shadow: inset 0 0 0 1px rgba(129, 140, 248, 0.25);
}
#weight-balancer-game .summary {
  margin-top: 12px;
  color: #cbd5f5;
  font-size: 1rem;
  min-height: 24px;
}
#weight-balancer-game .log {
  margin-top: 16px;
  color: #f8fafc;
  min-height: 24px;
}
#weight-balancer-game .start-controls {
  margin: 16px 0;
  display: flex;
  justify-content: center;
}
#weight-balancer-game .start-controls button {
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
#weight-balancer-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#weight-balancer-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#weight-balancer-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#weight-balancer-game .share button {
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
#weight-balancer-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#weight-balancer-game .share button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="weight-balancer-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="combo">連続成功: 0</span>
    <span class="attempts">使用回数: 0</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="target">
    <p>ターゲット重量</p>
    <span class="target-value">-- kg</span>
  </div>
  <div class="summary">
    現在の合計: <span class="current-sum">0</span> kg
  </div>
  <div class="weights">
    <button type="button" data-weight="1">+1 kg</button>
    <button type="button" data-weight="2">+2 kg</button>
    <button type="button" data-weight="3">+3 kg</button>
    <button type="button" data-weight="5">+5 kg</button>
    <button type="button" data-weight="8">+8 kg</button>
  </div>
  <div class="actions">
    <button type="button" class="secondary undo">ひとつ戻す</button>
    <button type="button" class="secondary clear">リセット</button>
    <button type="button" class="primary submit">これでいく！</button>
  </div>
  <p class="log">スタートで計量開始。重りを素早く組み合わせましょう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('weight-balancer-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const comboEl = root.querySelector('.combo');
  const attemptsEl = root.querySelector('.attempts');
  const targetEl = root.querySelector('.target-value');
  const sumEl = root.querySelector('.current-sum');
  const weightButtons = Array.from(root.querySelectorAll('[data-weight]'));
  const undoButton = root.querySelector('.undo');
  const clearButton = root.querySelector('.clear');
  const submitButton = root.querySelector('.submit');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:weight-balancer';
  const playedKey = 'aomagame:played:weight-balancer';
  const weights = [1, 2, 3, 5, 8];

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 530, duration: 0.18, gain: 0.22 },
    add: { frequency: 660, duration: 0.1, gain: 0.18 },
    undo: { frequency: 360, duration: 0.1, gain: 0.18 },
    success: { frequency: 820, duration: 0.22, gain: 0.24 },
    miss: { frequency: 260, duration: 0.24, gain: 0.22 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.add;
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
    target: 0,
    currentSum: 0,
    history: [],
    score: 0,
    best: 0,
    combo: 0,
    attempts: 0,
    storageAvailable: false
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
    comboEl.textContent = `連続成功: ${state.combo}`;
    attemptsEl.textContent = `使用回数: ${state.history.length}`;
  };

  const updateSumDisplay = () => {
    sumEl.textContent = state.currentSum.toString();
  };

  const enableControls = (enabled) => {
    weightButtons.forEach((button) => {
      // Buttons remain usable even when target matched; we gate by state.running
      button.disabled = !enabled;
    });
    undoButton.disabled = !enabled;
    clearButton.disabled = !enabled;
    submitButton.disabled = !enabled;
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };

  const pickTarget = () => {
    const min = 7;
    const max = 30;
    let next = state.target;
    while (next === state.target) {
      next = min + Math.floor(Math.random() * (max - min + 1));
    }
    state.target = next;
    targetEl.textContent = `${state.target} kg`;
  };

  const clearRound = () => {
    state.history = [];
    state.currentSum = 0;
    state.attempts = 0;
    updateSumDisplay();
    updateHud();
  };

  const newRound = (message) => {
    pickTarget();
    clearRound();
    setLog(message);
  };

  const endGame = () => {
    state.running = false;
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    enableControls(false);
    startButton.disabled = false;
    setLog(`終了！スコアは ${state.score} 点でした。`);
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

  const handleSuccess = () => {
    state.score += 1;
    state.combo += 1;
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }
    updateHud();
    enableShare();
    playTone('success');
    newRound(`ナイス！連続成功 ${state.combo}。次のターゲットに挑戦しましょう。`);
  };

  const handleFailure = (difference) => {
    state.combo = 0;
    const hint =
      difference > 0
        ? `あと ${difference} kg 必要です。`
        : `${Math.abs(difference)} kg オーバーしています。`;
    playTone('miss');
    setLog(`惜しい！${hint}`);
    updateHud();
  };

  const addWeight = (weight) => {
    if (!state.running) {
      return;
    }
    state.currentSum += weight;
    state.history.push(weight);
    state.attempts += 1;
    playTone('add');
    updateSumDisplay();
    updateHud();
    setLog(`${weight} kg を追加しました。合計 ${state.currentSum} kg`);
  };

  const undoWeight = () => {
    if (!state.running || state.history.length === 0) {
      return;
    }
    const last = state.history.pop();
    state.currentSum -= last;
    playTone('undo');
    updateSumDisplay();
    updateHud();
    setLog(`${last} kg を取り消しました。`);
  };

  const clearWeights = () => {
    if (!state.running) {
      return;
    }
    state.history = [];
    state.currentSum = 0;
    state.attempts = 0;
    updateSumDisplay();
    updateHud();
    setLog('リセットしました。もう一度組み合わせを考えましょう。');
  };

  const submitWeights = () => {
    if (!state.running) {
      return;
    }
    const difference = state.target - state.currentSum;
    if (difference === 0) {
      handleSuccess();
      return;
    }
    handleFailure(difference);
  };

  weightButtons.forEach((button) => {
    const weight = Number.parseInt(button.dataset.weight ?? '0', 10);
    button.addEventListener('click', () => {
      addWeight(weight);
    });
  });

  undoButton.addEventListener('click', () => {
    undoWeight();
  });

  clearButton.addEventListener('click', () => {
    clearWeights();
  });

  submitButton.addEventListener('click', () => {
    submitWeights();
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
    state.combo = 0;
    state.currentSum = 0;
    state.history = [];
    state.attempts = 0;
    updateHud();
    updateSumDisplay();
    startButton.disabled = true;
    enableControls(true);
    newRound('計量開始！重りを組み合わせてぴったりを狙いましょう。');
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
      const text = `ウェイトバランサーでスコア ${state.best} を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  enableShare();
  enableControls(false);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
  updateHud();
})();
</script>

## 遊び方
1. スタートを押すと60秒のカウントダウン開始。ターゲット重量が表示されます。
2. 重りボタンで合計値を作り、ぴったり揃ったら「これでいく！」を押して判定。ひとつ戻す／リセットも活用しましょう。
3. 連続成功でコンボが伸びます。正確かつ素早い判断でハイスコアを目指してください。

## 実装メモ
- 重りの選択履歴を配列で保持し、Undo/Resetで柔軟に調整できるようにしました。
- 成功時はターゲットを即リフレッシュしつつ、ローカルストレージへベストスコアを保存。
- Web Audio API の軽量トーンで開始・追加・取り消し・成功・ミスの効果音を鳴らし、タップ操作の手応えを高めています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
