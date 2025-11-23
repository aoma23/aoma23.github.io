---
title: "毎日ゲームチャレンジ Day 43: ソルジャーラッシュ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-42-merge-slide/' | relative_url }}">マージスライド</a>

43日目は兵士を集めて敵を倒す「ソルジャーラッシュ」。左右に移動しながらゲートを通過して兵士を増やし、オート射撃でボスを倒しましょう！兵士は中央から密集して増えていき、5人ごとに新しい行が追加されます。7日間続く連続ストーリーの第1章です。

<style>
#soldier-rush-game {
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
#soldier-rush-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
  font-weight: 700;
  font-size: 0.95rem;
}
#soldier-rush-game .game-area {
  position: relative;
  width: 100%;
  max-width: 320px;
  height: 480px;
  margin: 0 auto 16px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: inset 0 0 0 2px rgba(56, 189, 248, 0.2);
}
#soldier-rush-game .player {
  position: absolute;
  top: 380px;
  left: 50%;
  transform: translateX(-50%) translateZ(0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  z-index: 10;
  transition: none;
  max-height: 100px;
  overflow: hidden;
  will-change: transform;
  backface-visibility: hidden;
}
#soldier-rush-game .player .soldier-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  max-width: 100%;
}
#soldier-rush-game .player .soldier-pair {
  position: relative;
  display: inline-block;
  height: 1em;
  line-height: 1;
}
#soldier-rush-game .player .soldier-emoji {
  font-size: 0.85rem;
  line-height: 1;
}
#soldier-rush-game .player .soldier-emoji-1 {
  position: relative;
  z-index: 5;
  vertical-align: top;
}
#soldier-rush-game .player .soldier-emoji-2 {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateX(0.25em);
  z-index: 4;
}
#soldier-rush-game .player .soldier-emoji-3 {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateX(0.5em);
  z-index: 3;
}
#soldier-rush-game .player .soldier-emoji-4 {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateX(0.75em);
  z-index: 2;
}
#soldier-rush-game .player .soldier-emoji-5 {
  position: absolute;
  left: 0;
  top: 0;
  transform: translateX(1em);
  z-index: 1;
}
#soldier-rush-game .player .soldier-count {
  font-size: 0.7rem;
  font-weight: 800;
  color: #38bdf8;
  margin-top: 2px;
}
#soldier-rush-game .gate {
  position: absolute;
  width: 80px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: top 0.05s linear;
}
#soldier-rush-game .gate.positive {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: #fff;
}
#soldier-rush-game .gate.negative {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
}
#soldier-rush-game .bullet {
  position: absolute;
  width: 8px;
  height: 16px;
  background: #fbbf24;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
}
#soldier-rush-game .boss-bullet {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.7);
}
#soldier-rush-game .boss {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  transition: top 0.3s ease, left 0.5s ease-in-out;
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.6));
}
#soldier-rush-game .boss-hp-bar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 14px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 7px;
  overflow: hidden;
  border: 2px solid rgba(248, 250, 252, 0.2);
  z-index: 5;
}
#soldier-rush-game .boss-hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  transition: width 0.2s ease;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.6);
}
#soldier-rush-game .controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
}
#soldier-rush-game .controls button {
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
#soldier-rush-game .controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#soldier-rush-game .controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#soldier-rush-game .arrow-controls {
  display: grid;
  grid-template-columns: repeat(2, 100px);
  gap: 12px;
  justify-content: center;
  margin: 12px auto;
}
#soldier-rush-game .arrow-controls button {
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 1.3rem;
  font-weight: 700;
  background: rgba(56, 189, 248, 0.18);
  color: #f8fafc;
  cursor: pointer;
  transition: all 0.1s ease;
}
#soldier-rush-game .arrow-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
#soldier-rush-game .arrow-controls button:active:not(:disabled) {
  transform: scale(0.95);
  background: rgba(56, 189, 248, 0.3);
}
#soldier-rush-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 16px;
  font-size: 0.95rem;
}
#soldier-rush-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#soldier-rush-game .share button {
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
#soldier-rush-game .share button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
#soldier-rush-game .progress-info {
  margin-top: 16px;
  padding: 12px;
  background: rgba(56, 189, 248, 0.1);
  border-radius: 12px;
  font-size: 0.9rem;
}
</style>

<div id="soldier-rush-game">
  <div class="hud">
    <span class="soldiers">兵士: 10</span>
    <span class="attack">攻撃力: 1</span>
    <span class="time">タイム: 0.0秒</span>
    <span class="best">ベスト: --</span>
  </div>
  <div class="game-area">
    <div class="player"></div>
  </div>
  <div class="arrow-controls">
    <button type="button" class="arrow-left" disabled>← 左</button>
    <button type="button" class="arrow-right" disabled>→ 右</button>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <p class="log">左右移動でゲートを通過！兵士を増やしてボスを倒そう（オート射撃）</p>
  <div class="progress-info">
    <div>シリーズ進行: Day 1/7 - 基礎編</div>
    <div>累計プレイ: <span class="total-plays">0</span>回</div>
  </div>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('soldier-rush-game');
  if (!root) {
    return;
  }

  const soldiersEl = root.querySelector('.soldiers');
  const attackEl = root.querySelector('.attack');
  const timeEl = root.querySelector('.time');
  const bestEl = root.querySelector('.best');
  const gameArea = root.querySelector('.game-area');
  const playerEl = root.querySelector('.player');
  const startButton = root.querySelector('.start');
  const arrowLeft = root.querySelector('.arrow-left');
  const arrowRight = root.querySelector('.arrow-right');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const totalPlaysEl = root.querySelector('.total-plays');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const SERIES_KEY = 'aomagame:soldier-rush-series';
  const storageKey = 'aomagame:best:soldier-rush-1';
  const playedKey = 'aomagame:played:soldier-rush-1';

  const state = {
    running: false,
    soldiers: 10,
    startTime: 0,
    elapsedTime: 0,
    best: 0,
    playerX: 160,
    gates: [],
    bullets: [],
    bossBullets: [],
    boss: null,
    bossX: 160,
    bossDirection: 1,
    spawnTimer: null,
    gameTimer: null,
    shootTimer: null,
    bossShootTimer: null,
    bossMoveTimer: null,
    bossPhase: false,
    storageAvailable: false,
    keys: {}
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    gate: { frequency: 720, duration: 0.12, gain: 0.2 },
    shoot: { frequency: 880, duration: 0.08, gain: 0.18 },
    hit: { frequency: 1200, duration: 0.1, gain: 0.2 },
    damage: { frequency: 220, duration: 0.15, gain: 0.22 },
    gateDestroy: { frequency: 640, duration: 0.14, gain: 0.2 },
    win: { frequency: 880, duration: 0.3, gain: 0.22 },
    lose: { frequency: 180, duration: 0.35, gain: 0.24 }
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
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.gate;
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

  const loadProgress = () => {
    if (!state.storageAvailable) {
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const value = Number.parseFloat(stored);
      if (!Number.isNaN(value) && value > 0) {
        state.best = value;
      }
    }
    const seriesData = localStorage.getItem(SERIES_KEY);
    if (seriesData) {
      try {
        const data = JSON.parse(seriesData);
        totalPlaysEl.textContent = (data.totalPlays || 0).toString();
      } catch (e) {}
    }
    updateHud();
    enableShare();
  };

  const saveProgress = () => {
    if (!state.storageAvailable) {
      return;
    }
    localStorage.setItem(storageKey, String(state.best));
    const seriesData = localStorage.getItem(SERIES_KEY);
    let data = {};
    if (seriesData) {
      try {
        data = JSON.parse(seriesData);
      } catch (e) {}
    }
    data.day1Best = state.best;
    data.totalPlays = (data.totalPlays || 0) + 1;
    localStorage.setItem(SERIES_KEY, JSON.stringify(data));
    totalPlaysEl.textContent = data.totalPlays.toString();
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

  const getAttackPower = () => {
    return Math.floor(state.soldiers / 10) + 1;
  };

  const updatePlayerDisplay = () => {
    const numGroups = Math.ceil(state.soldiers / 5);
    let html = '<div class="soldier-grid">';

    let remaining = state.soldiers;
    for (let g = 0; g < numGroups; g += 1) {
      const soldiersInGroup = Math.min(5, remaining);
      html += '<span class="soldier-pair">';

      // 中央から増える順序: 3→2→4→1→5
      const order = [3, 2, 4, 1, 5];
      for (let i = 0; i < soldiersInGroup; i += 1) {
        const emojiNum = order[i];
        html += `<span class="soldier-emoji soldier-emoji-${emojiNum}">🧍‍♂️</span>`;
      }

      html += '</span>';
      remaining -= soldiersInGroup;
    }

    html += '</div>';

    playerEl.innerHTML = html;
  };

  const updateHud = () => {
    soldiersEl.textContent = `兵士: ${state.soldiers}`;
    attackEl.textContent = `攻撃力: ${getAttackPower()}`;
    timeEl.textContent = `タイム: ${state.elapsedTime.toFixed(1)}秒`;
    bestEl.textContent = `ベスト: ${state.best > 0 ? state.best.toFixed(1) + '秒' : '--'}`;
    updatePlayerDisplay();
  };

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };

  const movePlayer = () => {
    if (!state.running) {
      return;
    }
    if (state.keys.ArrowLeft || state.keys.a) {
      state.playerX = Math.max(55, state.playerX - 4);
    }
    if (state.keys.ArrowRight || state.keys.d) {
      state.playerX = Math.min(265, state.playerX + 4);
    }
    playerEl.style.left = `${state.playerX}px`;
  };

  const shootBullet = () => {
    if (!state.running) {
      return;
    }
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = `${state.playerX}px`;
    bullet.style.bottom = `${480 - 380}px`;
    bullet.dataset.x = state.playerX.toString();
    bullet.dataset.y = '370';
    bullet.dataset.power = getAttackPower().toString();
    gameArea.appendChild(bullet);
    state.bullets.push(bullet);
  };

  const bossShoots = () => {
    if (!state.boss || !state.running) {
      return;
    }
    const bullet = document.createElement('div');
    bullet.className = 'boss-bullet';
    bullet.style.left = `${state.bossX}px`;
    bullet.style.top = '140px';
    bullet.dataset.x = state.bossX.toString();
    bullet.dataset.y = '140';
    gameArea.appendChild(bullet);
    state.bossBullets.push(bullet);
  };

  const moveBoss = () => {
    if (!state.boss || !state.running) {
      return;
    }

    state.bossX += state.bossDirection * 2;

    if (state.bossX <= 80) {
      state.bossX = 80;
      state.bossDirection = 1;
    } else if (state.bossX >= 240) {
      state.bossX = 240;
      state.bossDirection = -1;
    }

    state.boss.style.left = `${state.bossX}px`;
  };

  const spawnGate = () => {
    const types = [
      { value: 5, type: 'positive', text: '+5' },
      { value: 10, type: 'positive', text: '+10' },
      { value: -3, type: 'negative', text: '-3', hp: 3 },
      { value: -5, type: 'negative', text: '-5', hp: 5 }
    ];
    const gateData = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * 240 + 40;

    const gate = document.createElement('div');
    gate.className = `gate ${gateData.type}`;
    gate.textContent = gateData.text;

    if (gateData.type === 'negative') {
      gate.dataset.hp = gateData.hp.toString();
      gate.dataset.maxHp = gateData.hp.toString();
    }

    gate.style.left = `${x}px`;
    gate.style.transform = 'translateX(-50%)';
    gate.style.top = '-60px';
    gate.dataset.value = gateData.value.toString();
    gate.dataset.type = gateData.type;
    gate.dataset.x = x.toString();
    gate.dataset.y = '-60';

    gameArea.appendChild(gate);
    state.gates.push(gate);
  };

  const spawnBoss = () => {
    state.bossPhase = true;
    clearInterval(state.spawnTimer);

    state.bossX = 160;
    state.bossDirection = 1;

    const boss = document.createElement('div');
    boss.className = 'boss';
    boss.textContent = '👹';
    boss.dataset.hp = '50';
    boss.dataset.maxHp = '50';

    gameArea.appendChild(boss);
    state.boss = boss;

    const hpBar = document.createElement('div');
    hpBar.className = 'boss-hp-bar';
    hpBar.innerHTML = '<div class="boss-hp-fill"></div>';
    gameArea.appendChild(hpBar);

    setTimeout(() => {
      boss.style.top = '40px';
    }, 100);

    state.bossShootTimer = setInterval(bossShoots, 1500);
    state.bossMoveTimer = setInterval(moveBoss, 50);
  };

  const checkGateCollision = (gate) => {
    const gateX = Number.parseFloat(gate.dataset.x);
    const gateY = Number.parseFloat(gate.dataset.y);

    if (gateY > 360 && gateY < 420) {
      if (Math.abs(gateX - state.playerX) < 50) {
        return true;
      }
    }
    return false;
  };

  const gameLoop = () => {
    if (!state.running) {
      return;
    }

    movePlayer();

    state.elapsedTime = (Date.now() - state.startTime) / 1000;

    const toRemove = [];
    state.gates.forEach((gate) => {
      const y = Number.parseFloat(gate.dataset.y) + 3;
      gate.dataset.y = y.toString();
      gate.style.top = `${y}px`;

      if (checkGateCollision(gate)) {
        const value = Number.parseInt(gate.dataset.value, 10);
        const gateType = gate.dataset.type;

        if (gateType === 'negative') {
          state.soldiers = Math.max(0, state.soldiers + value);
          toRemove.push(gate);
          playTone('damage');
          setLog(`-ゲートに接触！兵士${Math.abs(value)}減少`);

          if (state.soldiers <= 0) {
            endGame('兵士が全滅…ゲームオーバー！');
            return;
          }
        } else {
          state.soldiers = Math.max(0, state.soldiers + value);
          toRemove.push(gate);
          playTone('gate');

          if (state.soldiers <= 0) {
            endGame('兵士が全滅…ゲームオーバー！');
            return;
          }
        }
      }

      if (y > 500) {
        toRemove.push(gate);
      }
    });

    toRemove.forEach((gate) => {
      const index = state.gates.indexOf(gate);
      if (index > -1) {
        state.gates.splice(index, 1);
      }
      gate.remove();
    });

    const bulletsToRemove = [];
    state.bullets.forEach((bullet) => {
      const y = Number.parseFloat(bullet.dataset.y) - 5;
      bullet.dataset.y = y.toString();
      bullet.style.bottom = `${480 - y}px`;

      const bulletX = Number.parseFloat(bullet.dataset.x);
      const power = Number.parseInt(bullet.dataset.power, 10);

      state.gates.forEach((gate) => {
        if (gate.dataset.type !== 'negative') return;

        const gateX = Number.parseFloat(gate.dataset.x);
        const gateY = Number.parseFloat(gate.dataset.y);

        if (Math.abs(bulletX - gateX) < 40 && Math.abs(y - gateY) < 30) {
          const hp = Number.parseInt(gate.dataset.hp, 10);
          const newHp = Math.max(0, hp - 1);
          gate.dataset.hp = newHp.toString();

          const currentValue = Number.parseInt(gate.dataset.value, 10);
          const newValue = currentValue + 1;
          gate.dataset.value = newValue.toString();
          gate.textContent = `${newValue}`;

          bulletsToRemove.push(bullet);
          playTone('hit');

          if (newHp <= 0) {
            const index = state.gates.indexOf(gate);
            if (index > -1) {
              state.gates.splice(index, 1);
            }
            gate.remove();
            playTone('gateDestroy');
            setLog('-ゲートを破壊！');
          }
        }
      });

      if (state.boss && state.bossPhase) {
        const bossY = 90;
        if (y < 140 && y > 40 && Math.abs(bulletX - state.bossX) < 50) {
          const bossHp = Number.parseInt(state.boss.dataset.hp, 10);
          const bossMaxHp = Number.parseInt(state.boss.dataset.maxHp, 10);
          const newHp = Math.max(0, bossHp - power);
          state.boss.dataset.hp = newHp.toString();

          const hpBar = gameArea.querySelector('.boss-hp-fill');
          if (hpBar) {
            hpBar.style.width = `${(newHp / bossMaxHp) * 100}%`;
          }

          playTone('hit');
          bulletsToRemove.push(bullet);

          if (newHp <= 0) {
            if (state.boss) {
              state.boss.remove();
              state.boss = null;
            }

            const hpBarContainer = gameArea.querySelector('.boss-hp-bar');
            if (hpBarContainer) hpBarContainer.remove();

            playTone('win');
            endGame(`勝利！ボスを倒しました！クリアタイム: ${state.elapsedTime.toFixed(1)}秒`);
            return;
          }
        }
      }

      if (y < -20) {
        bulletsToRemove.push(bullet);
      }
    });

    bulletsToRemove.forEach((bullet) => {
      const index = state.bullets.indexOf(bullet);
      if (index > -1) {
        state.bullets.splice(index, 1);
      }
      bullet.remove();
    });

    const bossBulletsToRemove = [];
    state.bossBullets.forEach((bullet) => {
      const y = Number.parseFloat(bullet.dataset.y) + 4;
      bullet.dataset.y = y.toString();
      bullet.style.top = `${y}px`;

      const bulletX = Number.parseFloat(bullet.dataset.x);
      if (y > 360 && y < 420 && Math.abs(bulletX - state.playerX) < 40) {
        state.soldiers = Math.max(0, state.soldiers - 3);
        playTone('damage');
        bossBulletsToRemove.push(bullet);

        if (state.soldiers <= 0) {
          endGame('兵士が全滅…ゲームオーバー！');
          return;
        }
      }

      if (y > 500) {
        bossBulletsToRemove.push(bullet);
      }
    });

    bossBulletsToRemove.forEach((bullet) => {
      const index = state.bossBullets.indexOf(bullet);
      if (index > -1) {
        state.bossBullets.splice(index, 1);
      }
      bullet.remove();
    });

    if (state.elapsedTime >= 20 && !state.bossPhase) {
      spawnBoss();
    }

    updateHud();
  };

  const endGame = (message) => {
    state.running = false;
    clearInterval(state.spawnTimer);
    clearInterval(state.gameTimer);
    clearInterval(state.shootTimer);
    clearInterval(state.bossShootTimer);
    clearInterval(state.bossMoveTimer);
    arrowLeft.disabled = true;
    arrowRight.disabled = true;
    startButton.disabled = false;
    setLog(message);

    if (message.includes('勝利')) {
      if (state.best === 0 || state.elapsedTime < state.best) {
        state.best = state.elapsedTime;
      }
    }

    saveProgress();
    enableShare();
  };

  const startGame = () => {
    markPlayed();
    playTone('start');
    state.running = true;
    state.soldiers = 10;
    state.startTime = Date.now();
    state.elapsedTime = 0;
    state.playerX = 160;
    state.bossPhase = false;
    state.bossX = 160;
    state.bossDirection = 1;
    state.keys = {};
    state.gates.forEach((gate) => gate.remove());
    state.gates = [];
    state.bullets.forEach((bullet) => bullet.remove());
    state.bullets = [];
    state.bossBullets.forEach((bullet) => bullet.remove());
    state.bossBullets = [];
    if (state.boss) {
      state.boss.remove();
      state.boss = null;
    }

    const hpBar = gameArea.querySelector('.boss-hp-bar');
    if (hpBar) {
      hpBar.remove();
    }

    playerEl.style.left = '160px';
    updateHud();
    setLog('オート射撃開始！左右移動でゲートを選択しよう');

    startButton.disabled = true;
    arrowLeft.disabled = false;
    arrowRight.disabled = false;

    state.spawnTimer = setInterval(spawnGate, 1200);
    state.gameTimer = setInterval(gameLoop, 16);
    state.shootTimer = setInterval(shootBullet, 400);
  };

  startButton.addEventListener('click', () => {
    if (!state.running) {
      startGame();
    }
  });

  arrowLeft.addEventListener('mousedown', () => {
    state.keys.ArrowLeft = true;
  });
  arrowLeft.addEventListener('mouseup', () => {
    state.keys.ArrowLeft = false;
  });
  arrowLeft.addEventListener('mouseleave', () => {
    state.keys.ArrowLeft = false;
  });

  arrowRight.addEventListener('mousedown', () => {
    state.keys.ArrowRight = true;
  });
  arrowRight.addEventListener('mouseup', () => {
    state.keys.ArrowRight = false;
  });
  arrowRight.addEventListener('mouseleave', () => {
    state.keys.ArrowRight = false;
  });

  let touchStartX = 0;
  gameArea.addEventListener('touchstart', (event) => {
    if (!state.running) return;
    touchStartX = event.touches[0].clientX;
  }, { passive: true });

  gameArea.addEventListener('touchmove', (event) => {
    if (!state.running) return;
    const rect = gameArea.getBoundingClientRect();
    const touchX = event.touches[0].clientX - rect.left;
    state.playerX = Math.max(55, Math.min(265, touchX));
  }, { passive: true });

  document.addEventListener('keydown', (event) => {
    if (!state.running) return;
    if (event.key === 'ArrowLeft' || event.key === 'a') {
      event.preventDefault();
      state.keys[event.key] = true;
    } else if (event.key === 'ArrowRight' || event.key === 'd') {
      event.preventDefault();
      state.keys[event.key] = true;
    }
  });

  document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'ArrowRight' || event.key === 'd') {
      state.keys[event.key] = false;
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.best === 0) {
        return;
      }
      const text = `ソルジャーラッシュを${state.best.toFixed(1)}秒でクリア！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadProgress();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートでゲーム開始。兵士10人からスタートします。
2. 左右の矢印ボタン、キーボード（←→またはAD）、またはスワイプで自由に移動。
3. **オート射撃**：400msごとに自動的に弾が発射されます（静音）。
4. +ゲート（緑）を通ると兵士が増え、-ゲート（赤）を通ると兵士が減ります。
5. **-ゲートの破壊**：-ゲートは弾を当てると数値が増加し、HP0で破壊できます。
6. **攻撃力システム**：兵士10人ごとに攻撃力が+1されます（例：20人で攻撃力2）。
7. 20秒経過でボス戦開始！**ボスは左右に動きながら**攻撃してきます（HPゲージ表示）。
8. ボスのHPを0にして撃破すれば勝利！**クリアタイムを競おう！**

## 実装メモ
- **タイムアタック**：スコアではなく、クリアタイムを競うシステム。最速タイムが記録される。
- **インパクトのある兵士表示**：各絵文字を2つ横にずらして重ねて表示し、密集感を演出。
- **オート射撃**：400ms間隔で自動的に弾を発射（効果音なし、静かに発射）。
- **攻撃力システム**：兵士数÷10（切り捨て）+1が攻撃力。10人ごとに+1ダメージ。
- **-ゲートシステム**：接触すると兵士減少。弾が当たると1ずつHP減少、表示数値が増加。HP0で破壊。
- **ボスバトル**：20秒経過で出現。左右に移動、HPはゲージ表示。撃破時にクリア音が鳴り、ボスは消滅。
- 7日間連続シリーズの第1章。localStorageでベストタイムを保存。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
