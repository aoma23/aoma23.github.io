---
title: "毎日ゲームチャレンジ Day 31: ヒューハーモニー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-30-prime-dash/' | relative_url }}">プライムダッシュ</a>

31日目は色感覚を鍛える「ヒューハーモニー」。指定されたカラーに合わせてスライダーで色相を調整し、ぴったり一致を狙いましょう。スマホでも片手で遊べるシンプルなスライダーゲームです。

<style>
#hue-harmony-game {
  width: min(560px, 100%);
  max-width: 560px;
  margin: 24px auto;
  padding: clamp(20px, 5vw, 32px);
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 28px 52px rgba(15, 23, 42, 0.38);
}
#hue-harmony-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
  font-weight: 700;
}
#hue-harmony-game .compare-panel {
  display: flex;
  gap: 16px;
  margin-bottom: 18px;
  align-items: stretch;
  justify-content: center;
  flex-wrap: wrap;
}
#hue-harmony-game .swatch-card {
  flex: 1 1 240px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.68);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.15);
}
#hue-harmony-game .swatch-card p {
  margin-top: 12px;
  letter-spacing: 0.05em;
  font-weight: 600;
}
#hue-harmony-game .color-swatch {
  width: 100%;
  height: clamp(120px, 30vw, 150px);
  border-radius: 16px;
  margin: 0 auto;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.2);
}
#hue-harmony-game .controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 8px;
}
#hue-harmony-game .slider {
  width: 100%;
  margin: 0;
}
#hue-harmony-game .start-controls,
#hue-harmony-game .actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}
#hue-harmony-game button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#hue-harmony-game .start-button {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
}
#hue-harmony-game .actions .submit {
  background: linear-gradient(135deg, #facc15, #f97316);
  color: #0f172a;
}
#hue-harmony-game .actions button {
  flex: 1 1 180px;
  min-width: 160px;
}
#hue-harmony-game .actions .reset {
  background: rgba(94, 234, 212, 0.18);
  color: #cbd5f5;
  box-shadow: inset 0 0 0 1px rgba(94, 234, 212, 0.35);
}
#hue-harmony-game button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#hue-harmony-game button:hover:not(:disabled),
#hue-harmony-game button:active {
  transform: translateY(-2px);
  box-shadow: 0 20px 36px rgba(14, 165, 233, 0.32);
}
#hue-harmony-game .log {
  margin-top: 16px;
  min-height: 24px;
  color: #f8fafc;
}
#hue-harmony-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#hue-harmony-game .share button {
  border: none;
  border-radius: 9999px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #facc15, #f97316);
  cursor: pointer;
  box-shadow: 0 16px 32px rgba(249, 115, 22, 0.32);
}
#hue-harmony-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
</style>

<div id="hue-harmony-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="streak">連続ピッタリ: 0</span>
    <span class="accuracy">平均誤差: --°</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start-button">スタート</button>
  </div>
  <div class="compare-panel">
    <div class="swatch-card target-card">
      <div class="color-swatch target-swatch"></div>
      <p>ターゲット</p>
    </div>
    <div class="swatch-card preview-card">
      <div class="color-swatch preview-swatch"></div>
      <p>あなたの色</p>
    </div>
  </div>
  <div class="controls">
    <input type="range" class="slider" min="0" max="359" value="180" />
    <div class="actions">
      <button type="button" class="reset" disabled>リセット</button>
      <button type="button" class="submit" disabled>これで決める！</button>
    </div>
  </div>
  <p class="log">スタートで挑戦開始。スライダーで色相を合わせてください。</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('hue-harmony-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const accuracyEl = root.querySelector('.accuracy');
  const targetSwatch = root.querySelector('.target-swatch');
  const previewSwatch = root.querySelector('.preview-swatch');
  const startButton = root.querySelector('.start-button');
  const resetButton = root.querySelector('.reset');
  const submitButton = root.querySelector('.submit');
  const slider = root.querySelector('.slider');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:hue-harmony';
  const playedKey = 'aomagame:played:hue-harmony';

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    target: 0,
    value: 180,
    moves: 0,
    score: 0,
    totalError: 0,
    best: 0,
    streak: 0,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    adjust: { frequency: 680, duration: 0.08, gain: 0.16 },
    submit: { frequency: 840, duration: 0.16, gain: 0.22 },
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.adjust;
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

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };

  const setLog = (message) => {
    logEl.textContent = message;
  };

  const updateHud = () => {
    scoreEl.textContent = `スコア: ${state.score}`;
    bestEl.textContent = `ベスト: ${state.best}`;
    streakEl.textContent = `連続ピッタリ: ${state.streak}`;
    const avg = state.moves === 0 ? '--' : (state.totalError / state.moves).toFixed(1);
    accuracyEl.textContent = `平均誤差: ${avg}°`;
  };

  const updateSliderUI = () => {
    slider.value = state.value;
    previewSwatch.style.background = `hsl(${state.value}deg, 70%, 55%)`;
  };

  const pickTarget = () => {
    const next = Math.floor(Math.random() * 360);
    state.target = next;
    targetSwatch.style.background = `hsl(${next}deg, 70%, 55%)`;
    state.lastTargetTime = performance.now();
  };

  const resetRound = (message) => {
    state.value = Math.floor(Math.random() * 360);
    updateSliderUI();
    pickTarget();
    slider.disabled = false;
    resetButton.disabled = false;
    submitButton.disabled = false;
    setLog(message);
  };

  const endGame = () => {
    state.running = false;
    slider.disabled = true;
    resetButton.disabled = true;
    submitButton.disabled = true;
    startButton.disabled = false;
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    setLog(`終了！スコア ${state.score}、平均誤差 ${(state.moves === 0 ? '--' : (state.totalError / state.moves).toFixed(1))}°でした。`);
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

  const handleSubmit = () => {
    if (!state.running) {
      return;
    }
    const error = Math.abs(state.value - state.target);
    state.totalError += error;
    state.moves += 1;
    const reaction = (performance.now() - state.lastTargetTime) / 1000;
    const bonus = Math.max(1, Math.round((360 - error) / 60 + Math.max(0, 3 - reaction)));
    if (error <= 6) {
      state.streak += 1;
      state.score += bonus + state.streak;
      setLog(`素晴らしい！誤差 ${error.toFixed(1)}° / ボーナス +${bonus + state.streak}`);
      if (state.streak % 3 === 0) {
        state.score += 5;
      }
    } else {
      state.streak = 0;
      state.score += Math.max(1, Math.round((360 - error) / 90));
      setLog(`まずまず。誤差 ${error.toFixed(1)}°`);
    }
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
      enableShare();
    }
    playTone(error <= 6 ? 'submit' : 'miss');
    updateHud();
    resetRound('次のカラーが来ました。素早く合わせましょう！');
  };

  slider.addEventListener('input', () => {
    state.value = Number.parseInt(slider.value, 10);
    updateSliderUI();
    playTone('adjust');
  });

  resetButton.addEventListener('click', () => {
    if (!state.running) {
      return;
    }
    state.value = Math.floor(Math.random() * 360);
    updateSliderUI();
    setLog('色相をシャッフルしました。再調整してください。');
  });

  submitButton.addEventListener('click', () => {
    handleSubmit();
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
    state.totalError = 0;
    state.moves = 0;
    state.streak = 0;
    updateHud();
    enableShare();
    slider.disabled = false;
    resetButton.disabled = false;
    submitButton.disabled = false;
    startButton.disabled = true;
    resetRound('ターゲットカラーが表示されました。スライダーを調整して下さい！');
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
      const text = `ヒューハーモニーでスコア ${state.best} を記録！ #aomagame`;
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
  slider.disabled = true;
  resetButton.disabled = true;
  submitButton.disabled = true;
  updateSliderUI();
  pickTarget();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートを押すと60秒カウントダウンが始まり、ターゲットの色相が表示されます。
2. スライダーで色相を調整し、「これで決める！」で判定。誤差が小さいほどスコアが高く、連続で6°以内だとボーナスが増えます。
3. ローカルにベストスコアを保存。短時間でどこまで正確に合わせられるか挑戦してください。

## 実装メモ
- 色はHSLの色相を中心に扱い、スライダーでも直感的に操作できる構成にしました。
- 判定では誤差と反応時間からボーナスを算出し、連続精度でコンボが伸びるよう調整。
- Web Audio API で調整・決定・ミス時の効果音を再生し、タッチ操作でもフィードバックが得られるようにしています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
