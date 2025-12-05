---
title: "毎日ゲームチャレンジ Day 24: オービットディフェンダー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-23-shape-sorter/' | relative_url }}">シェイプソート</a>

24日目は宇宙空間を舞台にした「オービットディフェンダー」。円軌道上を回るキャノンを左右キーや画面の矢印ボタンで回転させ、狙い目が来たらスペースキーやFIREボタンで迎撃します。角度の微調整と集中力が求められるトレーニング系ミニゲームです。

<style>
#orbit-defender-game {
  max-width: 560px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  text-align: center;
  box-shadow: 0 28px 50px rgba(15, 23, 42, 0.38);
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#orbit-defender-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #orbit-defender-game .hud {
    font-size: 0.82rem;
  }
}
#orbit-defender-game .arena {
  position: relative;
  width: min(86vw, 320px);
  height: min(86vw, 320px);
  margin: 0 auto 18px;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.22), rgba(15, 23, 42, 0.9));
  box-shadow: inset 0 0 24px rgba(148, 163, 184, 0.25);
}
#orbit-defender-game .arena::after {
  content: "";
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  border: 2px dashed rgba(148, 163, 184, 0.4);
}
#orbit-defender-game .pointer {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 10px;
  height: 140px;
  background: linear-gradient(180deg, #facc15, #f97316);
  border-radius: 9999px;
  transform-origin: 50% 100%;
  transform: translate(-50%, -100%) rotate(0deg);
  box-shadow: 0 12px 26px rgba(250, 204, 21, 0.38);
}
#orbit-defender-game .pointer::after {
  content: "";
  position: absolute;
  bottom: -28px;
  left: 50%;
  width: 38px;
  height: 38px;
  background: #facc15;
  border-radius: 50%;
  transform: translate(-50%, 0);
  box-shadow: inset 0 0 12px rgba(15, 23, 42, 0.35);
}
#orbit-defender-game .target {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 22px;
  height: 170px;
  border-radius: 9999px;
  transform-origin: 50% 100%;
  transform: translate(-50%, -100%) rotate(0deg);
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), rgba(14, 165, 233, 0.85));
  box-shadow: 0 16px 34px rgba(14, 165, 233, 0.35);
  pointer-events: none;
}
#orbit-defender-game .target.pulse {
  animation: orbit-target-pulse 0.65s ease;
}
@keyframes orbit-target-pulse {
  0% {
    transform: translate(-50%, -100%) rotate(var(--angle, 0deg)) scaleY(0.9);
    opacity: 0.6;
  }
  35% {
    transform: translate(-50%, -100%) rotate(var(--angle, 0deg)) scaleY(1.05);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -100%) rotate(var(--angle, 0deg)) scaleY(1);
    opacity: 0.9;
  }
}
#orbit-defender-game .controls {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
#orbit-defender-game .controls button {
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
#orbit-defender-game .controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#orbit-defender-game .controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#orbit-defender-game .mobile-controls {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
  flex-wrap: wrap;
}
#orbit-defender-game .control-button {
  border: none;
  border-radius: 18px;
  width: 74px;
  height: 74px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  background: rgba(56, 189, 248, 0.18);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#orbit-defender-game .control-button:hover:not(:disabled),
#orbit-defender-game .control-button:active {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(56, 189, 248, 0.28);
}
#orbit-defender-game .control-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#orbit-defender-game .control-fire {
  width: 108px;
  background: linear-gradient(135deg, #facc15, #f97316);
  color: #0f172a;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  box-shadow: 0 18px 34px rgba(249, 115, 22, 0.35);
}
#orbit-defender-game .log {
  margin-top: 18px;
  min-height: 24px;
  color: #cbd5f5;
}
#orbit-defender-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#orbit-defender-game .share-button {
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
#orbit-defender-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#orbit-defender-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="orbit-defender-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">ヒット: 0</span>
    <span class="best">ベスト:0</span>
    <span class="combo">コンボ: 0</span>
    <span class="accuracy">命中率: 100%</span>
  </div>
  <div class="arena">
    <div class="target"></div>
    <div class="pointer"></div>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="mobile-controls" aria-label="画面タッチ操作">
    <button type="button" class="control-button control-left" aria-label="左回転">←</button>
    <button type="button" class="control-button control-fire" aria-label="射撃">FIRE</button>
    <button type="button" class="control-button control-right" aria-label="右回転">→</button>
  </div>
  <p class="log">矢印ボタン / 左右キーで旋回し、FIRE ボタン / スペースキーで射撃。60秒間に何体撃墜できるか挑戦！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('orbit-defender-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const comboEl = root.querySelector('.combo');
  const accuracyEl = root.querySelector('.accuracy');
  const targetEl = root.querySelector('.target');
  const pointerEl = root.querySelector('.pointer');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const controlLeft = root.querySelector('.control-left');
  const controlRight = root.querySelector('.control-right');
  const controlFire = root.querySelector('.control-fire');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const setMobileControlsEnabled = (enabled) => {
    [controlLeft, controlRight, controlFire].forEach((button) => {
      if (!button) {
        return;
      }
      button.disabled = !enabled;
    });
  };

  const storageKey = 'aomagame:best:orbit-defender';
  const playedKey = 'aomagame:played:orbit-defender';
  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    hit: { frequency: 720, duration: 0.18, gain: 0.22 },
    miss: { frequency: 240, duration: 0.24, gain: 0.22 }
  };

  const resetKeys = () => {
    state.keys.left = false;
    state.keys.right = false;
  };

  const bindControlHold = (element, type) => {
    if (!element) {
      return;
    }
    const release = (event) => {
      if (type === 'left' || type === 'right') {
        state.keys[type] = false;
      }
      if (event && event.pointerId != null) {
        element.releasePointerCapture?.(event.pointerId);
      }
    };
    element.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      element.setPointerCapture?.(event.pointerId);
      if (type === 'fire') {
        if (state.running) {
          handleShot();
        }
        return;
      }
      if (!state.running) {
        return;
      }
      if (type === 'left') {
        state.keys.left = true;
        state.keys.right = false;
      } else if (type === 'right') {
        state.keys.right = true;
        state.keys.left = false;
      }
    });
    element.addEventListener('pointerup', release);
    element.addEventListener('pointercancel', release);
    element.addEventListener('pointerleave', release);
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.hit;
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
    loopId: null,
    score: 0,
    best: 0,
    combo: 0,
    shots: 0,
    hits: 0,
    angle: 0,
    targetAngle: 0,
    lastFrame: 0,
    turnRate: 220,
    tolerance: 12,
    storageAvailable: false,
    keys: {
      left: false,
      right: false
    }
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

  const setPointer = (angle) => {
    pointerEl.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
  };

  const setTarget = (angle) => {
    targetEl.style.setProperty('--angle', `${angle}deg`);
    targetEl.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
    targetEl.classList.remove('pulse');
    // eslint-disable-next-line no-unused-expressions
    targetEl.offsetHeight;
    targetEl.classList.add('pulse');
  };

  const setLog = (message) => {
    logEl.textContent = message;
  };

  const updateHud = () => {
    scoreEl.textContent = `ヒット: ${state.score}`;
    comboEl.textContent = `コンボ: ${state.combo}`;
    bestEl.textContent = `ベスト:${state.best}`;
    const accuracy =
      state.shots === 0 ? 100 : Math.round((state.hits / state.shots) * 100);
    accuracyEl.textContent = `命中率: ${accuracy}%`;
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };

  const endGame = () => {
    state.running = false;
    if (state.loopId !== null) {
      cancelAnimationFrame(state.loopId);
      state.loopId = null;
    }
    startButton.disabled = false;
    setMobileControlsEnabled(false);
    resetKeys();
    timeEl.textContent = '残り: 0.0 秒';
    setLog(`タイムアップ！ヒット数 ${state.score}、命中率 ${(state.shots === 0 ? 100 : Math.round((state.hits / state.shots) * 100))}% でした。`);
    enableShare();
  };

  const spawnTarget = () => {
    state.targetAngle = Math.random() * 360;
    setTarget(state.targetAngle);
  };

  const normalizeAngle = (angle) => {
    let value = angle % 360;
    if (value < 0) {
      value += 360;
    }
    return value;
  };

  const angularDifference = (a, b) => {
    const diff = Math.abs(((a - b + 540) % 360) - 180);
    return diff;
  };

  const handleShot = () => {
    if (!state.running) {
      return;
    }
    state.shots += 1;
    const diff = angularDifference(state.angle, state.targetAngle);
    if (diff <= state.tolerance) {
      state.hits += 1;
      state.score += 1;
      state.combo += 1;
      setLog(`ヒット！ずれ ${diff.toFixed(1)} 度。次のターゲットが来ます。`);
      playTone('hit');
      if (state.score > state.best) {
        state.best = state.score;
        saveBest();
      }
      spawnTarget();
    } else {
      state.combo = 0;
      setLog(`惜しい！ ${diff.toFixed(1)} 度ずれていました。調整して再チャレンジ。`);
      playTone('miss');
    }
    updateHud();
  };

  const loop = (now) => {
    if (!state.running) {
      return;
    }
    state.loopId = requestAnimationFrame(loop);
    const delta = now - state.lastFrame;
    state.lastFrame = now;
    const direction = (state.keys.right ? 1 : 0) - (state.keys.left ? 1 : 0);
    if (direction !== 0) {
      const nextAngle = state.angle + direction * state.turnRate * (delta / 1000);
      state.angle = normalizeAngle(nextAngle);
      setPointer(state.angle);
    }
    const elapsed = (now - state.startTime) / 1000;
    const remaining = Math.max(0, state.timeLimit - elapsed);
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    if (remaining <= 0) {
      endGame();
    }
  };

  const startGame = () => {
    markPlayed();
    playTone('start');
    state.running = true;
    state.startTime = performance.now();
    state.lastFrame = state.startTime;
    state.score = 0;
    state.combo = 0;
    state.shots = 0;
    state.hits = 0;
    state.angle = 0;
    resetKeys();
    setPointer(state.angle);
    spawnTarget();
    updateHud();
    setLog('ターゲットに合わせて矢印ボタン / 左右キーで照準し、FIRE ボタン / スペースキーで射撃！精度を高めよう。');
    startButton.disabled = true;
    setMobileControlsEnabled(true);
    enableShare();
    if (state.loopId !== null) {
      cancelAnimationFrame(state.loopId);
    }
    state.loopId = requestAnimationFrame(loop);
  };

  const handleKeydown = (event) => {
    if (event.repeat) {
      // Allow continuous rotation without generating multiple state changes per keydown.
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      state.keys.left = true;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      state.keys.right = true;
    }
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      handleShot();
    }
  };

  const handleKeyup = (event) => {
    if (event.key === 'ArrowLeft') {
      state.keys.left = false;
    }
    if (event.key === 'ArrowRight') {
      state.keys.right = false;
    }
  };

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.best === 0) {
        return;
      }
      const text = `オービットディフェンダーでヒット数 ${state.best} を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  startButton.addEventListener('click', () => {
    if (state.running) {
      return;
    }
    startGame();
  });

  bindControlHold(controlLeft, 'left');
  bindControlHold(controlRight, 'right');
  bindControlHold(controlFire, 'fire');

  setMobileControlsEnabled(false);

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);

  detectStorage();
  loadBest();
  enableShare();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
  updateHud();
  setPointer(state.angle);
  spawnTarget();
})();
</script>

## 遊び方
1. スタートでカウントダウン開始。画面の矢印ボタンまたは左右キーでキャノンを回転させ、ターゲットの角度に合わせます。
2. 「ここだ！」と思ったら FIRE ボタンまたはスペースキーで発射。±12度以内ならヒット判定になります。
3. 60秒間での撃墜数を競います。連続ヒットでコンボが伸び、集中力の維持が鍵になります。

## 実装メモ
- `requestAnimationFrame`で回転処理と残り時間更新を同時に実装。キー状態を保持して滑らかに追従。
- 命中判定は角度差を正規化して±180度以内で比較し、ローカルストレージでベストスコア管理。
- 視覚的演出としてターゲットにパルスアニメーションを付与し、ヒット/ミスのテキストでフィードバックを即時表示しています。
- Web Audio API でゲーム開始とヒット/ミス時の効果音を鳴らし、操作結果が直感的に分かるようにしています。
- ポインターイベントで画面ボタンのホールド/タップ操作を処理し、モバイルでも左右旋回と射撃が行えるようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
