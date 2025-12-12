---
title: "毎日ゲームチャレンジ Day 38: スカイストライカー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  

38日目はシューティングアクション「スカイストライカー」。制限時間30秒のあいだ、上空を横切るドローンをできるだけ速く撃墜してください。逃したときの減点はなく、反応が速いほど高得点になるシンプルなルールです。

<style>
#sky-striker-game {
  max-width: 560px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 24px;
  background: radial-gradient(circle at top, #1d4ed8, #0f172a 70%);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  box-shadow: 0 32px 56px rgba(15, 23, 42, 0.45);
}
#sky-striker-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
  text-align: center;
}
@media (min-width: 400px) {
  #sky-striker-game .hud {
    font-size: 0.82rem;
  }
}
#sky-striker-game .arena {
  position: relative;
  height: 280px;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.4));
  overflow: hidden;
  border: 2px solid rgba(148, 163, 184, 0.3);
  cursor: crosshair;
}
#sky-striker-game .drone {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: radial-gradient(circle, #f87171 0%, #dc2626 60%, #991b1b 100%);
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.45);
  cursor: pointer;
  touch-action: manipulation;
}
#sky-striker-game .drone::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 2px solid rgba(248, 250, 252, 0.7);
}
#sky-striker-game .controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#sky-striker-game .start {
  border: none;
  border-radius: 9999px;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #3b82f6);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
#sky-striker-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(59, 130, 246, 0.4);
}
#sky-striker-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#sky-striker-game .log {
  margin-top: 16px;
  min-height: 24px;
  text-align: center;
  font-size: 0.95rem;
}
#sky-striker-game .reticle {
  position: absolute;
  width: 44px;
  height: 44px;
  margin-left: -22px;
  margin-top: -22px;
  border: 2px solid rgba(248, 250, 252, 0.8);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.7);
  transition: opacity 0.18s ease, transform 0.18s ease;
}
#sky-striker-game .reticle.show {
  opacity: 1;
  transform: scale(1);
}
#sky-striker-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#sky-striker-game .share-button {
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
#sky-striker-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="sky-striker-game">
  <div class="hud">
    <span class="time">残り: 30.0 秒</span>
    <span class="score">スコア:0</span>
    <span class="best">ベスト:0</span>
    <span class="accuracy">命中率: 100%</span>
  </div>
  <div class="arena">
    <span class="reticle"></span>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <p class="log">スタートでドローンが飛来。早撃ちしてハイスコアを狙おう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('sky-striker-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const accuracyEl = root.querySelector('.accuracy');
  const arenaEl = root.querySelector('.arena');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const reticleEl = root.querySelector('.reticle');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:sky-striker';
  const playedKey = 'aomagame:played:sky-striker';

  const state = {
    running: false,
    timeLimit: 30,
    startTime: 0,
    timerId: null,
    spawnDelay: 200,
    activeDrone: null,
    score: 0,
    best: 0,
    hits: 0,
    attempts: 0,
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    hit: { frequency: 920, duration: 0.12, gain: 0.22 },
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.hit;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(gain, now);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(envelope).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.05);
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
      bestEl.textContent = `ベスト:${state.best}`;
      shareButton.disabled = false;
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

  const remainingTime = () => {
    const elapsed = (performance.now() - state.startTime) / 1000;
    return Math.max(0, state.timeLimit - elapsed);
  };

  const clearDrone = () => {
    if (!state.activeDrone) {
      return;
    }
    clearTimeout(state.activeDrone.timeoutId);
    state.activeDrone.el.remove();
    state.activeDrone = null;
  };

  const updateHud = () => {
    scoreEl.textContent = `スコア:${state.score}`;
    bestEl.textContent = `ベスト:${state.best}`;
    const accuracy = state.attempts === 0 ? 100 : Math.round((state.hits / state.attempts) * 100);
    accuracyEl.textContent = `命中率: ${accuracy}%`;
  };

  const endGame = () => {
    state.running = false;
    startButton.disabled = false;
    clearDrone();
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    logEl.textContent = `終了！スコア ${state.score}、命中率 ${(state.attempts === 0 ? 100 : Math.round((state.hits / state.attempts) * 100))}% でした。`;
    shareButton.disabled = state.best === 0;
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

  const spawnDrone = () => {
    if (!state.running) {
      return;
    }
    clearDrone();
    const drone = document.createElement('button');
    drone.type = 'button';
    drone.className = 'drone';
    const arenaRect = arenaEl.getBoundingClientRect();
    const size = 56;
    const maxX = Math.max(0, arenaRect.width - size);
    const maxY = Math.max(0, arenaRect.height - size);
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    drone.style.left = `${x}px`;
    drone.style.top = `${y}px`;
    const id = `drone-${Date.now()}`;
    drone.dataset.id = id;
    drone.addEventListener('click', (event) => {
      event.stopPropagation();
      handleHit(id);
    });
    arenaEl.appendChild(drone);
    const life = 1200;
    const timeoutId = window.setTimeout(() => handleMiss(id), life);
    state.activeDrone = { id, el: drone, timeoutId, spawnedAt: performance.now() };
  };

  const handleHit = (id) => {
    if (!state.running || !state.activeDrone || state.activeDrone.id !== id) {
      return;
    }
    state.hits += 1;
    state.attempts += 1;
    const reaction = (performance.now() - state.activeDrone.spawnedAt) / 1000;
    const bonus = Math.max(6, Math.round(40 - reaction * 25));
    state.score += bonus;
    playTone('hit');
    setLog(`撃墜！リアクション ${reaction.toFixed(2)} 秒 / +${bonus}点`);
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
      shareButton.disabled = false;
    }
    updateHud();
    clearDrone();
    state.spawnDelay = Math.max(120, state.spawnDelay - 4);
    window.setTimeout(spawnDrone, state.spawnDelay);
  };

  const handleMiss = (id) => {
    if (!state.running || !state.activeDrone || state.activeDrone.id !== id) {
      return;
    }
    state.attempts += 1;
    playTone('miss');
    setLog('逃げられた…！');
    clearDrone();
    updateHud();
    window.setTimeout(spawnDrone, state.spawnDelay);
  };

  const setLog = (message) => {
    logEl.textContent = message;
  };

  const showReticle = (event) => {
    if (!reticleEl) {
      return;
    }
    const rect = arenaEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    reticleEl.style.left = `${x}px`;
    reticleEl.style.top = `${y}px`;
    reticleEl.classList.remove('show');
    void reticleEl.offsetWidth;
    reticleEl.classList.add('show');
    window.setTimeout(() => reticleEl.classList.remove('show'), 200);
  };

  arenaEl.addEventListener('pointerdown', (event) => {
    if (!state.running) {
      return;
    }
    showReticle(event);
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
    state.hits = 0;
    state.attempts = 0;
    state.spawnDelay = 220;
    updateHud();
    startButton.disabled = true;
    setLog('ドローンを逃さないようにタップ！');
    spawnDrone();
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
      const text = `スカイストライカーでスコア ${state.best} を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  updateHud();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートで30秒カウントダウンが始まり、フィールド内にドローンが出現します。
2. ドローンを素早くタップして撃墜。反応が速いほど加点が大きく、逃すと得点は入らず次のドローンへ移ります。
3. ベストスコアはローカル保存され、30秒の短期集中で反射神経を鍛えられます。

## 実装メモ
- ドローンは1.2秒で逃走し、連続撃墜に成功すると出現間隔がわずかに短くなるよう調整。
- スコアは「反応時間ベース」。0.2秒で +35 点前後、1秒かかると +15 点程度まで下がるため素早いタップが重要になります。
- レティクル演出と効果音を追加し、スマホでもシューティングの手触りを感じられるようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
