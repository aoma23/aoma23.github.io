---
title: "毎日ゲームチャレンジ Day 36: マルチプルマッチ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-35-number-ladder/' | relative_url }}">ナンバーラダー</a>

36日目は数当てアクション「マルチプルマッチ」。表示された数字がどの倍数に当てはまるか、素早くタップで仕分けましょう。3・5・7の3種類でシンプルながら、反射神経と暗算が試されます。

<style>
#multiple-match-game {
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
#multiple-match-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #multiple-match-game .hud {
    font-size: 0.82rem;
  }
}
#multiple-match-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#multiple-match-game .start-controls button {
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
#multiple-match-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#multiple-match-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#multiple-match-game .number-card {
  margin-bottom: 18px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.6);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
#multiple-match-game .number {
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin: 0;
}
#multiple-match-game .choices {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
#multiple-match-game .choices button {
  border: none;
  border-radius: 16px;
  padding: 16px 12px;
  font-size: 1.2rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.18);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#multiple-match-game .choices button[data-type="none"] {
  font-size: 0.95rem;
}
#multiple-match-game .choices button.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
}
#multiple-match-game .choices button.wrong {
  background: rgba(248, 113, 113, 0.28);
}
#multiple-match-game .choices button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#multiple-match-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#multiple-match-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#multiple-match-game .share button {
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
#multiple-match-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
</style>

<div id="multiple-match-game">
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
  <div class="number-card">
    <p class="number">--</p>
  </div>
  <div class="choices">
    <button type="button" data-type="3">3の倍数</button>
    <button type="button" data-type="5">5の倍数</button>
    <button type="button" data-type="7">7の倍数</button>
    <button type="button" data-type="none">どれでもない</button>
  </div>
  <p class="log">スタートで数字が表示されます。該当する倍数をタップしてください。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('multiple-match-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const accuracyEl = root.querySelector('.accuracy');
  const startButton = root.querySelector('.start');
  const numberEl = root.querySelector('.number');
  const choiceButtons = Array.from(root.querySelectorAll('.choices button'));
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:multiple-match';
  const playedKey = 'aomagame:played:multiple-match';

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    current: 0,
    answers: new Set(),
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

  const newNumber = () => {
    const value = 10 + Math.floor(Math.random() * 190);
    state.current = value;
    state.answers = new Set();
    if (value % 3 === 0) {
      state.answers.add('3');
    }
    if (value % 5 === 0) {
      state.answers.add('5');
    }
    if (value % 7 === 0) {
      state.answers.add('7');
    }
    if (state.answers.size === 0) {
      state.answers.add('none');
    }
    numberEl.textContent = value.toString();
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
    const type = button.dataset.type ?? '';
    state.attempts += 1;
    let isCorrect = false;
    if (type === '3' || type === '5' || type === '7') {
      isCorrect = state.answers.has(type);
    } else if (type === 'none') {
      isCorrect = state.answers.has('none');
    }
    if (isCorrect) {
      state.hits += 1;
      state.streak += 1;
      const bonus = 8 + state.streak * 2;
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
        newNumber();
        updateHud();
      }, 160);
    } else {
      state.streak = 0;
      playTone('miss');
      button.classList.add('wrong');
      applyTimePenalty();
      let feedback = '倍数ではありません。';
      if (state.answers.has('none')) {
        feedback = 'どの倍数にも当てはまりません。';
      }
      setLog(`${feedback}（-5秒）`);
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
    newNumber();
    setLog('該当する倍数を素早く選びましょう！');
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
      const text = `マルチプルマッチでスコア ${state.best} を記録！ #aomagame`;
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
1. スタートで60秒カウントダウン。数字が表示されたら、3・5・7のどの倍数かを判断します。
2. 該当する倍数のボタンをタップ。間違えると連続正解が途切れ、スコアが減点。
3. ベストスコアはローカルに保存されるので、暗算力を鍛えて自己ベスト更新を目指しましょう。

## 実装メモ
- 数字は10〜199からランダム生成し、3・5・7の倍数判定をセットで実装。どの倍数にも当てはまらない場合も出題されます。
- 連続正解でスコアが伸びるよう調整し、短時間でも集中力が高まる仕組みです。
- Web Audio API で効果音を鳴らし、タップ操作でも気持ちよく遊べるようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
