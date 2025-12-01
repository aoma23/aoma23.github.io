---
title: "毎日ゲームチャレンジ Day 32: レタースイープ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-31-hue-harmony/' | relative_url }}">ヒューハーモニー</a>

32日目は文字探索ゲーム「レタースイープ」。ターゲットの文字を素早く見つけてタップし、盤面をすべて掃除しましょう。スマホでもサクサク遊べる5×5のシンプルグリッドです。

<style>
#letter-sweep-game {
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
#letter-sweep-game .hud {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  align-items: center;
  margin-bottom: 14px;
  font-weight: 700;
}
#letter-sweep-game .hud span {
  white-space: nowrap;
  font-size: 0.95rem;
}
#letter-sweep-game .start-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin: 12px 0 18px;
}
#letter-sweep-game .target-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.5);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.15);
  max-width: min(320px, 100%);
  width: 100%;
  margin: 0 auto 14px;
}
#letter-sweep-game .target-letter {
  font-size: clamp(1.6rem, 4.8vw, 2.2rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  margin: 0;
}
#letter-sweep-game .target-info {
  display: contents;
}
#letter-sweep-game .target-label {
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  opacity: 0.7;
}
#letter-sweep-game .count-info {
  font-size: 0.82rem;
  letter-spacing: 0.06em;
}
#letter-sweep-game .start {
  align-self: center;
  border: none;
  border-radius: 9999px;
  padding: 10px 26px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  text-align: center;
}
#letter-sweep-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#letter-sweep-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#letter-sweep-game .board {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}
#letter-sweep-game .tile {
  border: none;
  border-radius: 12px;
  padding: 0;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  font-weight: 700;
  color: #0f172a;
  background: rgba(56, 189, 248, 0.18);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, opacity 0.1s ease;
  touch-action: manipulation;
}
#letter-sweep-game .tile.correct {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #0f172a;
  box-shadow: 0 16px 30px rgba(34, 197, 94, 0.32);
}
#letter-sweep-game .tile.wrong {
  background: rgba(248, 113, 113, 0.28);
  color: #f8fafc;
}
#letter-sweep-game .tile:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#letter-sweep-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
}
#letter-sweep-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#letter-sweep-game .share button {
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
#letter-sweep-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
</style>

<div id="letter-sweep-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="accuracy">成功率: 100%</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">スタート</button>
    <div class="target-card">
      <p class="target-label">探す文字</p>
      <p class="target-letter">?</p>
      <p class="count-info">-- / --</p>
    </div>
  </div>
  <div class="board"></div>
  <p class="log">スタートを押してターゲット文字を探しましょう。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('letter-sweep-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const accuracyEl = root.querySelector('.accuracy');
  const startButton = root.querySelector('.start');
  const targetLetterEl = root.querySelector('.target-letter');
  const countInfoEl = root.querySelector('.count-info');
  const boardEl = root.querySelector('.board');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:letter-sweep';
  const playedKey = 'aomagame:played:letter-sweep';

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    target: null,
    totalTargets: 0,
    foundTargets: 0,
    score: 0,
    best: 0,
    streak: 0,
    hits: 0,
    attempts: 0,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    correct: { frequency: 820, duration: 0.16, gain: 0.22 },
    miss: { frequency: 260, duration: 0.18, gain: 0.22 }
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
    const accuracy = state.attempts === 0 ? 100 : Math.round((state.hits / state.attempts) * 100);
    accuracyEl.textContent = `成功率: ${accuracy}%`;
  };

  const generateBoard = () => {
    boardEl.innerHTML = '';
    const target = alphabet[Math.floor(Math.random() * alphabet.length)];
    state.target = target;
    const minTargets = 3;
    const maxTargets = 6;
    state.totalTargets = minTargets + Math.floor(Math.random() * (maxTargets - minTargets + 1));
    state.foundTargets = 0;
    targetLetterEl.textContent = target;
    countInfoEl.textContent = `0 / ${state.totalTargets}`;
    const fillers = alphabet.filter((letter) => letter !== target);

    const positions = Array.from({ length: 25 }, (_, index) => index);
    const targetPositions = positions
      .sort(() => Math.random() - 0.5)
      .slice(0, state.totalTargets);

    for (let index = 0; index < 25; index += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tile';
      const isTarget = targetPositions.includes(index);
      const char = isTarget
        ? target
        : fillers[Math.floor(Math.random() * fillers.length)];
      button.dataset.target = isTarget ? 'true' : 'false';
      button.dataset.hit = 'false';
      button.textContent = char;
      boardEl.appendChild(button);
    }
  };

  const endGame = () => {
    state.running = false;
    startButton.disabled = false;
    Array.from(boardEl.children).forEach((tile) => {
      tile.disabled = true;
    });
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    setLog(`終了！スコア ${state.score}、成功率 ${(state.attempts === 0 ? 100 : Math.round((state.hits / state.attempts) * 100))}% でした。`);
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

  const handleCorrect = (tile) => {
    tile.dataset.hit = 'true';
    tile.classList.add('correct');
    tile.disabled = true;
    state.score += 10;
    state.hits += 1;
    state.attempts += 1;
    state.foundTargets += 1;
    countInfoEl.textContent = `${state.foundTargets} / ${state.totalTargets}`;
    playTone('correct');
    updateHud();
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
      enableShare();
    }
    if (state.foundTargets === state.totalTargets) {
      state.streak += 1;
      state.score += 5 * state.streak;
      updateHud();
      if (state.score > state.best) {
        state.best = state.score;
        saveBest();
        enableShare();
      }
      setLog(`パーフェクト！連続 ${state.streak}。次の盤面に挑戦！`);
      Array.from(boardEl.children).forEach((tileEl) => {
        tileEl.disabled = true;
      });
      window.setTimeout(() => {
        generateBoard();
        updateHud();
        Array.from(boardEl.children).forEach((tileEl) => {
          tileEl.disabled = false;
        });
      }, 180);
    }
  };

  const handleMiss = (tile) => {
    tile.classList.add('wrong');
    window.setTimeout(() => tile.classList.remove('wrong'), 220);
    state.streak = 0;
    state.attempts += 1;
    playTone('miss');
    updateHud();
    setLog('惜しい！ターゲット以外をタップしました。');
  };

  boardEl.addEventListener('click', (event) => {
    if (!state.running) {
      return;
    }
    const tile = event.target.closest('.tile');
    if (!tile || tile.disabled) {
      return;
    }
    if (tile.dataset.target === 'true') {
      if (tile.dataset.hit === 'true') {
        return;
      }
      handleCorrect(tile);
    } else {
      handleMiss(tile);
    }
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
    updateHud();
    startButton.disabled = true;
    generateBoard();
    Array.from(boardEl.children).forEach((tile) => {
      tile.disabled = false;
    });
    setLog('ターゲット文字をすべて探しましょう！');
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
      const text = `レタースイープでスコア ${state.best} を達成！ #aomagame`;
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
  boardEl.innerHTML = ''; // 初期は空
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートで60秒のタイマーが動き、ターゲット文字とグリッドが表示されます。
2. ターゲット文字だけをタップして消し、全て見つけると次の盤面へ。間違えると連続ボーナスが途切れます。
3. 高スコアはローカルに保存。反射と瞬間視力を鍛えながらランキング更新を狙いましょう。

## 実装メモ
- 5×5のボードを毎回ランダム生成し、ターゲット数も変化させて単調さを回避。
- 正解／不正解でスコア・連続成功・成功率が変動するよう設計し、短時間でも緊張感のあるプレイにしました。
- 効果音はWeb Audio APIで生成し、スマホのタップ操作でもレスポンス良く遊べるようにしています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
