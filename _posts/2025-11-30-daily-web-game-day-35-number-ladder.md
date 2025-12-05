---
title: "毎日ゲームチャレンジ Day 35: ナンバーラダー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-34-fraction-duel/' | relative_url }}">フラクションデュエル</a>

35日目は数列クイズ「ナンバーラダー」。並んだ数字の規則を見抜き、次に入る正しい数を選びましょう。等差・等比・交互など、ライトな問題をテンポよく出題します。

<style>
#number-ladder-game {
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
#number-ladder-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #number-ladder-game .hud {
    font-size: 0.82rem;
  }
}
#number-ladder-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#number-ladder-game .start-controls button {
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
#number-ladder-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#number-ladder-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#number-ladder-game .sequence-card {
  margin-bottom: 18px;
  padding: 20px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.6);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
#number-ladder-game .sequence {
  font-size: 1.6rem;
  letter-spacing: 0.12em;
}
#number-ladder-game .choices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
#number-ladder-game .choices button {
  border: none;
  border-radius: 16px;
  padding: 16px 12px;
  font-size: 1.3rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.18);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#number-ladder-game .choices button.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
}
#number-ladder-game .choices button.wrong {
  background: rgba(248, 113, 113, 0.28);
}
#number-ladder-game .choices button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#number-ladder-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#number-ladder-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#number-ladder-game .share button {
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
#number-ladder-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
</style>

<div id="number-ladder-game">
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
  <div class="sequence-card">
    <p class="sequence">--, --, --, ...</p>
  </div>
  <div class="choices">
    <button type="button" data-value="0">0</button>
    <button type="button" data-value="1">1</button>
    <button type="button" data-value="2">2</button>
  </div>
  <p class="log">スタートで数列が表示されます。次に続く数字を選んでください。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('number-ladder-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const accuracyEl = root.querySelector('.accuracy');
  const startButton = root.querySelector('.start');
  const sequenceEl = root.querySelector('.sequence');
  const choiceButtons = Array.from(root.querySelectorAll('.choices button'));
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:number-ladder';
  const playedKey = 'aomagame:played:number-ladder';

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    sequence: [],
    correct: 0,
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

  const formatSequence = () => {
    const preview = state.sequence.map((value) => value.toString()).join(', ');
    sequenceEl.textContent = `${preview}, ...`;
  };

  const createArithmetic = () => {
    const start = Math.floor(Math.random() * 15);
    const diff = 1 + Math.floor(Math.random() * 9);
    const length = 3 + Math.floor(Math.random() * 2);
    const seq = Array.from({ length }, (_, index) => start + diff * index);
    const next = start + diff * length;
    return { seq, next };
  };

  const createGeometric = () => {
    const start = 1 + Math.floor(Math.random() * 6);
    const ratio = 2 + Math.floor(Math.random() * 3);
    const length = 3 + Math.floor(Math.random() * 2);
    const seq = Array.from({ length }, (_, index) => start * ratio ** index);
    const next = start * ratio ** length;
    return { seq, next };
  };

  const createAlternating = () => {
    const base = Math.floor(Math.random() * 10);
    const diff = 1 + Math.floor(Math.random() * 6);
    const length = 4;
    const seq = [];
    for (let i = 0; i < length; i += 1) {
      seq.push(base + diff * (i % 2 === 0 ? 1 : -1) * Math.ceil((i + 1) / 2));
    }
    const next = base + diff * ((length % 2 === 0 ? 1 : -1) * Math.ceil((length + 1) / 2));
    return { seq, next };
  };

  const generatePuzzle = () => {
    const creators = [createArithmetic, createGeometric, createAlternating];
    const { seq, next } = creators[Math.floor(Math.random() * creators.length)]();
    state.sequence = seq;
    state.correct = next;
    const distractors = new Set();
    while (distractors.size < 2) {
      const delta = Math.floor(Math.random() * 7) - 3;
      const option = next + delta;
      if (option !== next && option > -50) {
        distractors.add(option);
      }
    }
    const options = [next, ...Array.from(distractors)];
    options.sort(() => Math.random() - 0.5);
    choiceButtons.forEach((button, index) => {
      const value = options[index];
      button.dataset.value = value.toString();
      button.textContent = value.toString();
      button.classList.remove('correct', 'wrong');
    });
    formatSequence();
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
    choiceButtons.forEach((button) => (button.disabled = true));
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

  const handleChoice = (value, button) => {
    if (!state.running) {
      return;
    }
    state.attempts += 1;
    const numeric = Number.parseInt(value, 10);
    if (numeric === state.correct) {
      state.hits += 1;
      state.streak += 1;
      const bonus = 12 + state.streak * 2;
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
      setLog('惜しい！規則を読み直してみましょう。（-5秒）');
      updateHud();
      window.setTimeout(() => button.classList.remove('wrong'), 200);
    }
  };

  choiceButtons.forEach((button) => {
    button.disabled = true;
    button.addEventListener('click', () => {
      handleChoice(button.dataset.value ?? '0', button);
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
    setLog('数列の規則を見抜いて正しい数字を選びましょう！');
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
      const text = `ナンバーラダーでスコア ${state.best} を記録！ #aomagame`;
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
  sequenceEl.textContent = '--, --, --, ...';
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートで60秒間のチャレンジが開始。数列が表示されるので規則を見抜きます。
2. 次に続く正しい数字を3択からタップ。連続正解でボーナスが伸び、ハイスコア更新を狙えます。
3. ベストスコアはローカル保存。ちょっとした頭のウォーミングアップに最適です。

## 実装メモ
- 等差・等比・交互などの軽い規則から問題を生成し、選択肢もランダムに混在させています。
- 正解時のスコア加算には連続ボーナスを入れ、テンポの良いプレイフィールを目指しました。
- 操作は大きめボタンでスマホでも押しやすく、効果音はWeb Audio APIで生成しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
