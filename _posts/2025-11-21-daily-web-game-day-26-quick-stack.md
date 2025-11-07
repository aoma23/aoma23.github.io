---
title: "毎日Webゲームチャレンジ Day 26: クイックスタック"
categories:
  - game
tags:
  - aomagame
---

26日目はタイミング命の積み上げゲーム「クイックスタック」。横にスライドするブロックをスペースキーで止め、下の段とぴったり揃えてどこまで高く積み上げられるかに挑戦します。重なりが小さいほどブロックが細くなっていくので集中力が鍵！

<style>
#quick-stack-game {
  max-width: 560px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
  box-shadow: 0 28px 52px rgba(15, 23, 42, 0.36);
}
#quick-stack-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  font-weight: 700;
}
#quick-stack-game .tower {
  position: relative;
  width: 260px;
  height: 360px;
  margin: 0 auto;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.9), rgba(7, 11, 19, 0.95));
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2), 0 26px 48px rgba(15, 23, 42, 0.35);
  overflow: hidden;
  touch-action: manipulation;
}
#quick-stack-game .ground {
  position: absolute;
  inset: auto 0 0 0;
  height: 32px;
  background: linear-gradient(180deg, rgba(15, 118, 110, 0.55), rgba(4, 47, 46, 0.8));
}
#quick-stack-game .block {
  position: absolute;
  height: 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  box-shadow: 0 12px 20px rgba(14, 165, 233, 0.36);
  transition: box-shadow 0.12s ease;
}
#quick-stack-game .block.base {
  background: linear-gradient(135deg, #22d3ee, #0ea5e9);
  box-shadow: 0 12px 24px rgba(14, 165, 233, 0.4);
}
#quick-stack-game .block.moving {
  background: linear-gradient(135deg, #facc15, #f97316);
  box-shadow: 0 14px 26px rgba(249, 115, 22, 0.42);
}
#quick-stack-game .block.fail {
  animation: quick-stack-fall 0.6s ease forwards;
}
@keyframes quick-stack-fall {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(280px);
    opacity: 0;
  }
}
#quick-stack-game .controls {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
#quick-stack-game .controls button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#quick-stack-game .controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#quick-stack-game .controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#quick-stack-game .log {
  margin-top: 20px;
  min-height: 24px;
  color: #cbd5f5;
}
#quick-stack-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#quick-stack-game .share-button {
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
  touch-action: manipulation;
}
#quick-stack-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#quick-stack-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="quick-stack-game">
  <div class="hud">
    <span class="height">高さ: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="width">最小幅: 100%</span>
    <span class="speed">スピード: x1.0</span>
  </div>
  <div class="tower">
    <div class="ground"></div>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <p class="log">スペースキーまたはタワーをクリックでブロックを停止。ぴったり重ねよう！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('quick-stack-game');
  if (!root) {
    return;
  }

  const heightEl = root.querySelector('.height');
  const bestEl = root.querySelector('.best');
  const widthEl = root.querySelector('.width');
  const speedEl = root.querySelector('.speed');
  const towerEl = root.querySelector('.tower');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:quick-stack';
  const playedKey = 'aomagame:played:quick-stack';
  const containerWidth = 260;
  const baseWidth = 200;
  const blockHeight = 22;
  const minOverlap = 6;
  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    lock: { frequency: 780, duration: 0.18, gain: 0.22 },
    fail: { frequency: 220, duration: 0.3, gain: 0.24 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.lock;
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
    stack: [],
    current: null,
    direction: 1,
    speed: 120,
    lastFrame: 0,
    animationId: null,
    height: 0,
    best: 0,
    minWidth: baseWidth,
    storageAvailable: false
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
    heightEl.textContent = `高さ: ${state.height}`;
    bestEl.textContent = `ベスト: ${state.best}`;
    const widthRatio = Math.max(1, Math.round((state.minWidth / baseWidth) * 100));
    widthEl.textContent = `最小幅: ${widthRatio}%`;
    speedEl.textContent = `スピード: x${(state.speed / 120).toFixed(1)}`;
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };

  const clearAnimation = () => {
    if (state.animationId !== null) {
      cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }
  };

  const createBase = () => {
    towerEl.innerHTML = '<div class="ground"></div>';
    const base = document.createElement('div');
    base.className = 'block base';
    const baseLeft = (containerWidth - baseWidth) / 2;
    base.style.width = `${baseWidth}px`;
    base.style.left = `${baseLeft}px`;
    base.style.bottom = '10px';
    towerEl.appendChild(base);
    state.stack = [
      {
        el: base,
        width: baseWidth,
        left: baseLeft,
        bottom: 10
      }
    ];
  };

  const spawnBlock = () => {
    const prev = state.stack[state.stack.length - 1];
    const width = prev.width;
    const block = document.createElement('div');
    block.className = 'block moving';
    const bottom = prev.bottom + blockHeight;
    const direction = state.stack.length % 2 === 0 ? 1 : -1;
    const startLeft = direction === 1 ? 0 : containerWidth - width;
    block.style.width = `${width}px`;
    block.style.left = `${startLeft}px`;
    block.style.bottom = `${bottom}px`;
    towerEl.appendChild(block);
    state.current = {
      el: block,
      width,
      left: startLeft,
      bottom
    };
    state.direction = direction;
    state.speed = 120 + state.height * 8;
    state.lastFrame = performance.now();
    state.animationId = requestAnimationFrame(step);
    setLog('タイミングを合わせてスペースキーかタワークリックで停止！');
    updateHud();
  };

  const endGame = (message) => {
    state.running = false;
    clearAnimation();
    if (state.current) {
      state.current.el.classList.add('fail');
      state.current = null;
    }
    startButton.disabled = false;
    setLog(message);
    if (state.height > state.best) {
      state.best = state.height;
      saveBest();
    }
    enableShare();
    updateHud();
  };

  const dropBlock = () => {
    if (!state.running || !state.current) {
      return;
    }
    clearAnimation();
    const prev = state.stack[state.stack.length - 1];
    const current = state.current;
    const currentRight = current.left + current.width;
    const prevRight = prev.left + prev.width;
    const overlapLeft = Math.max(prev.left, current.left);
    const overlapRight = Math.min(prevRight, currentRight);
    const overlapWidth = overlapRight - overlapLeft;
    if (overlapWidth <= minOverlap) {
      current.el.classList.add('fail');
      playTone('fail');
      endGame('積み損ねてしまいました…。高さを更新して再挑戦！');
      return;
    }
    current.el.classList.remove('moving');
    current.left = overlapLeft;
    current.width = overlapWidth;
    current.el.style.left = `${overlapLeft}px`;
    current.el.style.width = `${overlapWidth}px`;
    state.stack.push({ ...current });
    state.current = null;
    state.height += 1;
    state.minWidth = Math.min(state.minWidth, overlapWidth);
    if (state.height > state.best) {
      state.best = state.height;
      saveBest();
    }
    playTone('lock');
    updateHud();
    spawnBlock();
  };

  const step = (now) => {
    if (!state.running || !state.current) {
      return;
    }
    state.animationId = requestAnimationFrame(step);
    const delta = now - state.lastFrame;
    state.lastFrame = now;
    const bounds = containerWidth - state.current.width;
    let nextLeft = state.current.left + state.direction * state.speed * (delta / 1000);
    if (nextLeft <= 0) {
      nextLeft = 0;
      state.direction = 1;
    } else if (nextLeft >= bounds) {
      nextLeft = bounds;
      state.direction = -1;
    }
    state.current.left = nextLeft;
    state.current.el.style.left = `${nextLeft}px`;
  };

  const startGame = () => {
    markPlayed();
    playTone('start');
    clearAnimation();
    state.running = true;
    state.current = null;
    state.direction = 1;
    state.height = 0;
    state.minWidth = baseWidth;
    createBase();
    spawnBlock();
    startButton.disabled = true;
    setTimeout(() => {
      startButton.disabled = false;
    }, 400);
    enableShare();
    updateHud();
  };

  const openShareWindow = () => {
    if (state.best === 0) {
      return;
    }
    const text = `クイックスタックで高さ ${state.best} 段まで積み上げた！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  startButton.addEventListener('click', () => {
    startGame();
  });

  towerEl.addEventListener('click', () => {
    dropBlock();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      dropBlock();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      openShareWindow();
    });
  }

  detectStorage();
  loadBest();
  enableShare();
  updateHud();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートを押すとブロックが左右に往復します。
2. 下の段と重なるタイミングでスペースキー（またはタワーをクリック）してブロックを停止。
3. 重なりが小さいほどブロックが細くなります。重なりがなくなるとゲームオーバー。記録を更新したらシェアもどうぞ！

## 実装メモ
- タワーの状態は1段ごとに配列で保持し、重なり幅を計算して次のブロックのサイズを決定。
- 往復アニメーションは`requestAnimationFrame`で実装し、ウィンドウ全体でスペースキー入力を監視。
- ベスト高さはローカルストレージに保存し、最小幅と現在スピードをHUDに表示して進行度の見える化をしました。
- Web Audio APIの効果音でゲーム開始・着地成功・失敗時のフィードバックを追加し、操作感を強調しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
