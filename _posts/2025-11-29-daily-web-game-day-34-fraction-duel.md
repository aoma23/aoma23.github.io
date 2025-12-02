---
title: "毎日ゲームチャレンジ Day 34: フラクションデュエル"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-33-operator-rush/' | relative_url }}">オペレーターダッシュ</a>

34日目は比較ゲーム「フラクションデュエル」。2つの分数の大小を瞬時に判断し、＜ / ＝ / ＞のいずれかをタップしてください。スマホでも遊びやすい大きなボタンで、計算力と直感を鍛えましょう。

<style>
#fraction-duel-game {
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
#fraction-duel-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #fraction-duel-game .hud {
    font-size: 0.82rem;
  }
}
#fraction-duel-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#fraction-duel-game .start-controls button {
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
#fraction-duel-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#fraction-duel-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#fraction-duel-game .fractions {
  display: flex;
  justify-content: center;
  gap: 24px;
  align-items: center;
  margin-bottom: 18px;
}
#fraction-duel-game .fraction {
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: 0.05em;
}
#fraction-duel-game .choices {
  display: grid;
  grid-template-columns: repeat(3, minmax(90px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}
#fraction-duel-game .choices button {
  border: none;
  border-radius: 16px;
  padding: 16px 12px;
  font-size: 1.8rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.18);
  color: #f8fafc;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#fraction-duel-game .choices button.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
}
#fraction-duel-game .choices button.wrong {
  background: rgba(248, 113, 113, 0.28);
}
#fraction-duel-game .choices button:disabled {
  opacity: 0.35;
  box-shadow: none;
  cursor: not-allowed;
}
#fraction-duel-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#fraction-duel-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#fraction-duel-game .share button {
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
#fraction-duel-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
</style>

<div id="fraction-duel-game">
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
  <div class="fractions">
    <p class="fraction left">--/--</p>
    <p class="vs">?</p>
    <p class="fraction right">--/--</p>
  </div>
  <div class="choices">
    <button type="button" data-choice="<">＜</button>
    <button type="button" data-choice="=">＝</button>
    <button type="button" data-choice=">">＞</button>
  </div>
  <p class="log">スタートで分数が表示されます。どちらが大きいか選んでください。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('fraction-duel-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const accuracyEl = root.querySelector('.accuracy');
  const startButton = root.querySelector('.start');
  const leftFractionEl = root.querySelector('.fraction.left');
  const rightFractionEl = root.querySelector('.fraction.right');
  const vsEl = root.querySelector('.vs');
  const choiceButtons = Array.from(root.querySelectorAll('.choices button'));
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:fraction-duel';
  const playedKey = 'aomagame:played:fraction-duel';

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    left: { numerator: 1, denominator: 1 },
    right: { numerator: 1, denominator: 1 },
    correctChoice: '=',
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

  const renderFractions = () => {
    const { numerator: ln, denominator: ld } = state.left;
    const { numerator: rn, denominator: rd } = state.right;
    leftFractionEl.textContent = `${ln}/${ld}`;
    rightFractionEl.textContent = `${rn}/${rd}`;
    vsEl.textContent = '?';
  };

  const generateFraction = () => {
    const denominator = 2 + Math.floor(Math.random() * 9);
    const numerator = 1 + Math.floor(Math.random() * (denominator - 1));
    return { numerator, denominator };
  };

  const simplify = (frac) => {
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const d = gcd(frac.numerator, frac.denominator);
    return { numerator: frac.numerator / d, denominator: frac.denominator / d };
  };

  const generatePuzzle = () => {
    let left = generateFraction();
    let right = generateFraction();
    if (Math.random() < 0.15) {
      left = simplify(left);
      right = simplify(right);
      right = { numerator: left.numerator, denominator: left.denominator };
    }
    const leftValue = left.numerator / left.denominator;
    const rightValue = right.numerator / right.denominator;
    let relation = '=';
    if (Math.abs(leftValue - rightValue) < 0.001) {
      relation = '=';
    } else if (leftValue < rightValue) {
      relation = '<';
    } else {
      relation = '>';
    }
    state.left = left;
    state.right = right;
    state.correctChoice = relation;
    renderFractions();
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

  const handleChoice = (choice, button) => {
    if (!state.running) {
      return;
    }
    state.attempts += 1;
    if (choice === state.correctChoice) {
      state.hits += 1;
      state.streak += 1;
      const bonus = 12 + state.streak * 2;
      state.score += bonus;
      vsEl.textContent = choice;
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
      setLog('残念！もう一度集中しましょう。（-5秒）');
      updateHud();
      window.setTimeout(() => button.classList.remove('wrong'), 200);
    }
  };

  choiceButtons.forEach((button) => {
    button.disabled = true;
    button.addEventListener('click', () => {
      handleChoice(button.dataset.choice, button);
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
    setLog('どちらの分数が大きいか、直感と暗算で勝負！');
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
      const text = `フラクションデュエルでスコア ${state.best} を記録！ #aomagame`;
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
1. スタートで60秒カウントダウンが開始。表示された2つの分数を比較します。
2. 「＜」「＝」「＞」のいずれかをタップして回答。正解でスコアが伸び、連続正解でボーナスアップ。
3. ハイスコアはローカルに保存。直感も暗算も鍛えて、友だちとスコア対決を楽しみましょう。

## 実装メモ
- 分数は分母2〜10、分子は分母未満をランダム生成し、一部は同値になるよう調整しました。
- 判定後は短いインターバルを挟んで自動で次の問題を表示し、テンポよく回答できるようにしています。
- 効果音はWeb Audio APIで用意し、スマホのタップ操作にも気持ちよく反応するようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
