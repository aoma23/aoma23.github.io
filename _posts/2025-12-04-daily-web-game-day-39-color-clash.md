---
title: "毎日ゲームチャレンジ Day 39: カラークラッシュ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-38-ascend-grid/' | relative_url }}">スカイストライカー</a>

39日目はストループ風ゲーム「カラークラッシュ」。表示された文字と色を見極め、指示通りにタップしましょう。脳トレにもぴったりなシンプル反射ゲームです。

<style>
#color-clash-game {
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
#color-clash-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #color-clash-game .hud {
    font-size: 0.82rem;
  }
}
#color-clash-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#color-clash-game .start-controls button {
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
#color-clash-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#color-clash-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#color-clash-game .instruction-card {
  margin-bottom: 16px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.6);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
#color-clash-game .instruction {
  font-size: 1rem;
  color: #cbd5f5;
}
#color-clash-game .word-card {
  margin-bottom: 18px;
  padding: 24px;
  border-radius: 20px;
  background: rgba(248, 250, 252, 0.08);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
#color-clash-game .word {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}
#color-clash-game .choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
#color-clash-game .choices button {
  border: none;
  border-radius: 16px;
  padding: 18px 12px;
  font-size: 1.4rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.18);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#color-clash-game .choices button.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
}
#color-clash-game .choices button.wrong {
  background: rgba(248, 113, 113, 0.28);
  color: #f8fafc;
}
#color-clash-game .choices button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#color-clash-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#color-clash-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#color-clash-game .share button {
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

<div id="color-clash-game">
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
  <div class="instruction-card">
    <p class="instruction">スタートで指示が表示されます。</p>
  </div>
  <div class="word-card">
    <p class="word" style="color:#f8fafc;">COLOR</p>
  </div>
  <div class="choices">
    <button type="button" data-color="red">赤</button>
    <button type="button" data-color="blue">青</button>
    <button type="button" data-color="green">緑</button>
    <button type="button" data-color="yellow">黄</button>
  </div>
  <p class="log">指示に合わせて正しいカラーをタップしましょう。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('color-clash-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const accuracyEl = root.querySelector('.accuracy');
  const startButton = root.querySelector('.start');
  const instructionEl = root.querySelector('.instruction');
  const wordEl = root.querySelector('.word');
  const choiceButtons = Array.from(root.querySelectorAll('.choices button'));
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:color-clash';
  const playedKey = 'aomagame:played:color-clash';

  const colors = [
    { name: '赤', key: 'red', value: '#ef4444' },
    { name: '青', key: 'blue', value: '#3b82f6' },
    { name: '緑', key: 'green', value: '#22c55e' },
    { name: '黄', key: 'yellow', value: '#facc15' }
  ];

  const instructions = [
    { label: '文字の意味でタップ！', mode: 'word' },
    { label: '文字の色でタップ！', mode: 'color' },
    { label: '正しい色をタップ（意味優先）', mode: 'word' },
    { label: '表示色をタップ（色優先）', mode: 'color' }
  ];

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    currentInstruction: instructions[0],
    currentWord: colors[0],
    displayColor: colors[0],
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

  const randomInstruction = () => instructions[Math.floor(Math.random() * instructions.length)];
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const nextRound = () => {
    state.currentInstruction = randomInstruction();
    state.currentWord = randomColor();
    let colorOption = randomColor();
    if (Math.random() < 0.4) {
      colorOption = randomColor();
    }
    state.displayColor = colorOption;
    instructionEl.textContent = state.currentInstruction.label;
    wordEl.textContent = state.currentWord.name;
    wordEl.style.color = colorOption.value;
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

  const handleChoice = (button) => {
    if (!state.running) {
      return;
    }
    const key = button.dataset.color ?? '';
    state.attempts += 1;
    const shouldMatchWord = state.currentInstruction.mode === 'word';
    const expectedKey = shouldMatchWord ? state.currentWord.key : state.displayColor.key;
    if (key === expectedKey) {
      state.hits += 1;
      state.streak += 1;
      const bonus = 10 + state.streak;
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
        nextRound();
        updateHud();
      }, 180);
    } else {
      state.streak = 0;
      playTone('miss');
      button.classList.add('wrong');
      applyTimePenalty();
      setLog('おっと違う色！指示をよく読もう。（-5秒）');
      updateHud();
      window.setTimeout(() => button.classList.remove('wrong'), 200);
    }
  };

  choiceButtons.forEach((button) => {
    button.disabled = true;
    button.addEventListener('click', () => {
      handleChoice(button);
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
    nextRound();
    setLog('指示に集中して、色と文字のトリックに惑わされないで！');
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
      const text = `カラークラッシュでスコア ${state.best} を記録！ #aomagame`;
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
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートで60秒間の勝負開始。指示（文字か色）を見て、正しいボタンをタップします。
2. 正解するとスコアと連続ボーナスが加算。間違えると減点なので冷静に！
3. ハイスコアはローカルに保存。色と言葉のトリックに惑わされず最高記録を更新してください。

## 実装メモ
- 指示は「文字優先」「色優先」の2種類を中心にランダム生成。
- 正答時は短い待ち時間で次の問題へ切り替え、テンポを損なわない設計にしました。
- 効果音はWeb Audio APIで生成し、スマホでもレスポンス良く遊べるようにしています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
