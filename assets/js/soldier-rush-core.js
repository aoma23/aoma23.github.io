(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const renderers = {
    hill: (soldiers) => {
      let html = '<div class="soldier-grid">';
      const numRows = Math.ceil(soldiers / 9);
      let remaining = soldiers;
      for (let row = 0; row < numRows; row += 1) {
        const soldiersInRow = Math.min(remaining, 9);
        html += '<span class="soldier-pair">';
        for (let i = 0; i < soldiersInRow; i += 1) {
          const emojiNum = i + 1;
          html += `<span class="soldier-emoji soldier-emoji-${emojiNum}">🧍‍♂️</span>`;
        }
        html += '</span>';
        remaining -= soldiersInRow;
      }
      html += '</div>';
      return html;
    },
    centerFive: (soldiers) => {
      let html = '<div class="soldier-grid">';
      const numGroups = Math.ceil(soldiers / 5);
      let remaining = soldiers;
      for (let g = 0; g < numGroups; g += 1) {
        const soldiersInGroup = Math.min(5, remaining);
        html += '<span class="soldier-pair">';
        const order = [3, 2, 4, 1, 5];
        for (let i = 0; i < soldiersInGroup; i += 1) {
          const emojiNum = order[i];
          html += `<span class="soldier-emoji soldier-emoji-${emojiNum}">🧍‍♂️</span>`;
        }
        html += '</span>';
        remaining -= soldiersInGroup;
      }
      html += '</div>';
      return html;
    }
  };

  const defaults = {
    rootId: 'soldier-rush-game',
    seriesKey: 'aomagame:soldier-rush-series',
    storageKey: '',
    playedKey: '',
    prevStageKey: null,
    nextStageKey: null,
    shareLabel: 'ソルジャーラッシュ',
    initialSoldiers: 10,
    allowContinue: false,
    startWithModeButtons: false,
    gateSpawnInterval: 1200,
    gateFallSpeed: 3,
    playerMoveSpeed: 4,
    playerBulletInterval: 400,
    playerBulletSpeed: 5,
    bossSpawnTime: 20,
    boss: {
      hp: 50,
      moveSpeed: 2,
      shootInterval: 1500,
      bulletDamage: 3,
      bulletSpeed: 4
    },
    gateTypes: [
      { value: 3, type: 'positive', text: '+3', hp: 3 },
      { value: 5, type: 'positive', text: '+5', hp: 5 },
      { value: -3, type: 'negative', text: '-3', hp: 3 },
      { value: -5, type: 'negative', text: '-5', hp: 5 }
    ],
    collectRequiresBreak: false,
    rapidFire: { enabled: false, duration: 10000, interval: 200 },
    shield: { enabled: false, duration: 10000 },
    renderer: 'hill',
    shareUrlBuilder: (best, label) => {
      const text = `${label}を${best.toFixed(1)}秒でクリア！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      return shareUrl.toString();
    }
  };

  const ensureRenderer = (renderer) => {
    if (typeof renderer === 'function') return renderer;
    if (typeof renderer === 'string' && renderers[renderer]) return renderers[renderer];
    return renderers.hill;
  };

  const initSoldierRushGame = (userConfig = {}) => {
    const config = {
      ...defaults,
      ...userConfig,
      boss: { ...defaults.boss, ...(userConfig.boss || {}) },
    rapidFire: { ...defaults.rapidFire, ...(userConfig.rapidFire || {}) },
    shield: { ...defaults.shield, ...(userConfig.shield || {}) }
  };
    config.renderSoldiers = ensureRenderer(userConfig.renderer ?? defaults.renderer);

    const root = document.getElementById(config.rootId) || document.querySelector(`#${config.rootId}`);
    if (!root) {
      return;
    }

    const soldiersEl = root.querySelector('.soldiers');
    const attackEl = root.querySelector('.attack');
    const rapidFireEl = root.querySelector('.rapidfire');
    const shieldEl = root.querySelector('.shield');
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
    const modeFreshButton = root.querySelector('.mode-fresh');
    const modeContinueButton = root.querySelector('.mode-continue');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

    if (!gameArea || !playerEl || !arrowLeft || !arrowRight || !logEl) {
      return;
    }

    const rapidFireLabel = rapidFireEl ? (rapidFireEl.dataset.label || (rapidFireEl.textContent.split(':')[0] || '連射')) : '連射';
    const shieldLabel = shieldEl ? (shieldEl.dataset.label || (shieldEl.textContent.split(':')[0] || 'シールド')) : 'シールド';

    const state = {
      running: false,
      soldiers: config.initialSoldiers,
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
      bossAttackTimers: [],
      spawnTimer: null,
      gameTimer: null,
      shootTimer: null,
      bossShootTimer: null,
      bossMoveTimer: null,
      bossPhase: false,
      storageAvailable: false,
      keys: {},
      selectedMode: null,
      inheritedSoldiers: 0,
      rapidFireActive: false,
      rapidFireEndTime: 0,
      shieldActive: false,
      shieldEndTime: 0,
      rapidFireStrong: false,
      shieldStrong: false,
      baseShootInterval: config.playerBulletInterval
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
      lose: { frequency: 180, duration: 0.35, gain: 0.24 },
      ng: { frequency: 260, duration: 0.1, gain: 0.25 }
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
        const testKey = `${config.storageKey}-test`;
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
      const stored = localStorage.getItem(config.storageKey);
      if (stored) {
        const value = Number.parseFloat(stored);
        if (!Number.isNaN(value) && value > 0) {
          state.best = value;
        }
      }
      const seriesData = localStorage.getItem(config.seriesKey);
      if (seriesData) {
        try {
          const data = JSON.parse(seriesData);
          if (totalPlaysEl && data.totalPlays) {
            totalPlaysEl.textContent = (data.totalPlays || 0).toString();
          }
        } catch (e) {
          /* noop */
        }
      }
      if (config.allowContinue && config.prevStageKey && modeContinueButton) {
        const prevSoldiers = localStorage.getItem(config.prevStageKey);
        if (prevSoldiers) {
          const value = Number.parseInt(prevSoldiers, 10);
          if (!Number.isNaN(value) && value > 0) {
            state.inheritedSoldiers = value;
            modeContinueButton.textContent = `続きから (${value}人)`;
            modeContinueButton.disabled = false;
          } else {
            modeContinueButton.disabled = true;
          }
        } else {
          modeContinueButton.disabled = true;
        }
      }
      updateHud();
      enableShare();
    };

    const saveProgress = () => {
      if (!state.storageAvailable) {
        return;
      }
      localStorage.setItem(config.storageKey, String(state.best));
      const seriesData = localStorage.getItem(config.seriesKey);
      let data = {};
      if (seriesData) {
        try {
          data = JSON.parse(seriesData);
        } catch (e) {
          data = {};
        }
      }
      data.totalPlays = (data.totalPlays || 0) + 1;
      localStorage.setItem(config.seriesKey, JSON.stringify(data));
      if (totalPlaysEl) {
        totalPlaysEl.textContent = data.totalPlays.toString();
      }
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
        const current = Number.parseInt(localStorage.getItem(config.playedKey) ?? '0', 10);
        const next = Number.isNaN(current) ? 1 : current + 1;
        localStorage.setItem(config.playedKey, String(next));
      } catch (error) {
        return;
      }
      updatePlayCount();
    };

    const setLog = (message) => {
      logEl.textContent = message;
    };

  const getAttackPower = () => {
    // 基本攻撃力3 + 兵士数ボーナス（最大8）
    return Math.min(8, 3 + Math.floor(state.soldiers / 10));
  };

    const updatePlayerDisplay = () => {
      let html = config.renderSoldiers(state.soldiers);
      const now = Date.now();
      const rfActive = config.rapidFire.enabled && state.rapidFireActive && now < state.rapidFireEndTime;
      const shActive = config.shield.enabled && state.shieldActive && now < state.shieldEndTime;
      const rfBlink = rfActive && state.rapidFireEndTime - now <= 3000;
      const shBlink = shActive && state.shieldEndTime - now <= 3000;
      const rfIcon = state.rapidFireStrong ? '⚡+' : '⚡';
      const shIcon = state.shieldStrong ? '🛡️+' : '🛡️';
      const rfClass = `buff-icon left ${state.rapidFireStrong ? 'strong' : ''} ${rfBlink ? 'blink' : ''}`;
      const shClass = `buff-icon right ${state.shieldStrong ? 'strong' : ''} ${shBlink ? 'blink' : ''}`;
      html += '<div class="buff-icons">';
      html += `<span class="${rfClass}" style="${rfActive ? '' : 'display:none;'}">${rfIcon}</span>`;
      html += `<span class="${shClass}" style="${shActive ? '' : 'display:none;'}">${shIcon}</span>`;
      html += '</div>';
      playerEl.innerHTML = html;
    };

    const updateHud = () => {
      if (soldiersEl) soldiersEl.textContent = `兵士: ${state.soldiers}`;
      if (attackEl) attackEl.textContent = `攻撃力: ${getAttackPower()}`;
      if (timeEl) timeEl.textContent = `タイム: ${state.elapsedTime.toFixed(1)}秒`;
      if (bestEl) bestEl.textContent = `ベスト: ${state.best > 0 ? state.best.toFixed(1) + '秒' : '--'}`;
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
        state.playerX = Math.max(55, state.playerX - config.playerMoveSpeed);
      }
      if (state.keys.ArrowRight || state.keys.d) {
        state.playerX = Math.min(265, state.playerX + config.playerMoveSpeed);
      }
      playerEl.style.left = `${state.playerX}px`;
    };

    const shootBullet = () => {
      if (!state.running) {
        return;
      }
      const bullet = document.createElement('div');
      bullet.className = 'bullet';
      const bulletX = state.playerX - 4;
      bullet.style.left = `${bulletX}px`;
      bullet.style.bottom = `${480 - 380}px`;
      bullet.dataset.x = bulletX.toString();
      bullet.dataset.y = '370';
      bullet.dataset.power = getAttackPower().toString();
      gameArea.appendChild(bullet);
      state.bullets.push(bullet);
    };

    const bossShoots = (attack = {}) => {
      if (!state.boss || !state.running) {
        return;
      }
      const damage = attack.damage ?? config.boss.bulletDamage ?? 3;
      const speed = attack.speed ?? config.boss.bulletSpeed;
      const type = attack.type ?? 'direct';
      const bullet = document.createElement('div');
      bullet.className = `boss-bullet dmg-${damage}`;
      const x = type === 'rain' ? Math.random() * 240 + 40 : state.bossX;
      bullet.style.left = `${x}px`;
      bullet.style.top = '140px';
      bullet.dataset.x = x.toString();
      bullet.dataset.y = '140';
      bullet.dataset.damage = damage.toString();
      bullet.dataset.speed = speed.toString();
      gameArea.appendChild(bullet);
      state.bossBullets.push(bullet);
    };

    const moveBoss = () => {
      if (!state.boss || !state.running) {
        return;
      }

      state.bossX += state.bossDirection * config.boss.moveSpeed;

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
      const gateData = config.gateTypes[Math.floor(Math.random() * config.gateTypes.length)];
      const x = Math.random() * 240 + 40;

      const gate = document.createElement('div');
      gate.className = `gate ${gateData.type}`;
      gate.textContent = gateData.text;

      if (gateData.hp) {
        gate.dataset.hp = gateData.hp.toString();
        gate.dataset.maxHp = gateData.hp.toString();
      }
      const forceNoBreak = gateData.type === 'positive' || gateData.type === 'negative';
      const requireBreak = forceNoBreak ? false : (gateData.collectRequiresBreak ?? config.collectRequiresBreak);
      gate.dataset.requireBreak = requireBreak ? '1' : '0';

      gate.style.left = `${x}px`;
      gate.style.transform = 'translateX(-50%)';
      gate.style.top = '-60px';
      gate.dataset.value = gateData.value.toString();
      gate.dataset.type = gateData.type;
      if (gateData.operation) {
        gate.dataset.operation = gateData.operation;
      }
      gate.dataset.x = x.toString();
      gate.dataset.y = '-60';

      gameArea.appendChild(gate);
      state.gates.push(gate);
    };

    const clearBossAttackTimers = () => {
      if (state.bossAttackTimers) {
        state.bossAttackTimers.forEach((t) => clearInterval(t));
      }
      state.bossAttackTimers = [];
    };

    const spawnBoss = () => {
      state.bossPhase = true;
      clearInterval(state.spawnTimer);
      clearBossAttackTimers();
      state.bossAttackTimers = [];

      state.bossX = 160;
      state.bossDirection = 1;

      const boss = document.createElement('div');
      boss.className = 'boss';
      boss.textContent = config.boss.emoji || '👹';
      boss.dataset.hp = String(config.boss.hp);
      boss.dataset.maxHp = String(config.boss.hp);

      gameArea.appendChild(boss);
      state.boss = boss;

      const hpBar = document.createElement('div');
      hpBar.className = 'boss-hp-bar';
      hpBar.innerHTML = '<div class="boss-hp-fill"></div>';
      gameArea.appendChild(hpBar);

      setTimeout(() => {
        boss.style.top = '40px';
      }, 100);

      const attacks = Array.isArray(config.boss.attacks) && config.boss.attacks.length > 0
        ? config.boss.attacks
        : [{ damage: config.boss.bulletDamage ?? 3, interval: config.boss.shootInterval, speed: config.boss.bulletSpeed, type: 'direct' }];
      attacks.forEach((attack) => {
        const timer = setInterval(() => bossShoots(attack), attack.interval ?? config.boss.shootInterval);
        state.bossAttackTimers.push(timer);
      });
      state.bossMoveTimer = setInterval(moveBoss, 50);
    };

    const checkGateCollision = (gate) => {
      const gateX = Number.parseFloat(gate.dataset.x);
      const gateY = Number.parseFloat(gate.dataset.y);
      return gateY > 360 && gateY < 420 && Math.abs(gateX - state.playerX) < 50;
    };

    const handleGateEffect = (gate, value, gateType) => {
      if (gateType === 'multiply') {
        state.soldiers = state.soldiers * value;
        playTone('gate');
        setLog(`×${value}ゲート通過！兵士${value}倍！`);
      } else if (gateType === 'divide') {
        state.soldiers = Math.floor(state.soldiers / value);
        playTone('gate');
        setLog(`÷${value}ゲート通過！兵士半分に…`);
      } else if (gateType === 'rapidfire' && config.rapidFire.enabled) {
        state.rapidFireActive = true;
        state.rapidFireStrong = false;
        state.rapidFireEndTime = Date.now() + config.rapidFire.duration;
        clearInterval(state.shootTimer);
        state.shootTimer = setInterval(shootBullet, config.rapidFire.interval);
        playTone('gate');
        setLog('連射アイテム取得！');
      } else if (gateType === 'rapidfire-strong' && config.rapidFire.enabled) {
        state.rapidFireActive = true;
        state.rapidFireStrong = true;
        state.rapidFireEndTime = Date.now() + config.rapidFire.duration * 2;
        clearInterval(state.shootTimer);
        state.shootTimer = setInterval(shootBullet, config.rapidFire.interval);
        playTone('gate');
        setLog('強化連射アイテム取得！');
      } else if (gateType === 'shield' && config.shield.enabled) {
        state.shieldActive = true;
        state.shieldStrong = false;
        state.shieldEndTime = Date.now() + config.shield.duration;
        playTone('gate');
        setLog('シールド取得！');
      } else if (gateType === 'shield-strong' && config.shield.enabled) {
        state.shieldActive = true;
        state.shieldStrong = true;
        state.shieldEndTime = Date.now() + config.shield.duration * 2;
        playTone('gate');
        setLog('強化シールド取得！');
      } else if (gateType === 'negative') {
        state.soldiers = Math.max(0, state.soldiers + value);
        playTone('damage');
        setLog(`-ゲートに接触！兵士${Math.abs(value)}減少`);
      } else {
        state.soldiers = Math.max(0, state.soldiers + value);
        playTone('gate');
      }
    };

    const gameLoop = () => {
      if (!state.running) {
        return;
      }

      const gameRect = gameArea.getBoundingClientRect();
      movePlayer();

      if (config.rapidFire.enabled && state.rapidFireActive && Date.now() > state.rapidFireEndTime) {
        state.rapidFireActive = false;
        state.rapidFireStrong = false;
        clearInterval(state.shootTimer);
        state.shootTimer = setInterval(shootBullet, state.baseShootInterval);
        setLog('連射終了');
      }
      if (config.shield.enabled && state.shieldActive && Date.now() > state.shieldEndTime) {
        state.shieldActive = false;
        state.shieldStrong = false;
        setLog('シールド終了');
      }

      state.elapsedTime = (Date.now() - state.startTime) / 1000;

      const toRemove = [];
      state.gates.forEach((gate) => {
        const y = Number.parseFloat(gate.dataset.y) + config.gateFallSpeed;
        gate.dataset.y = y.toString();
        gate.style.top = `${y}px`;

        if (checkGateCollision(gate)) {
          const hp = gate.dataset.hp !== undefined ? Number.parseInt(gate.dataset.hp ?? '0', 10) : null;
          const requiresBreak = gate.dataset.requireBreak === '1';
          if (requiresBreak && hp !== null && hp > 0) {
            playTone('ng');
            setLog('まだ壊れていない！');
            return;
          }

          const value = Number.parseInt(gate.dataset.value, 10);
          const gateType = gate.dataset.type;

          handleGateEffect(gate, value, gateType);
          toRemove.push(gate);

          if (state.soldiers <= 0) {
            endGame('兵士が全滅…ゲームオーバー！');
            return;
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
        const y = Number.parseFloat(bullet.dataset.y) - config.playerBulletSpeed;
        bullet.dataset.y = y.toString();
        bullet.style.bottom = `${480 - y}px`;

        const bulletX = Number.parseFloat(bullet.dataset.x);
        const power = Number.parseInt(bullet.dataset.power, 10);

        let bulletHit = false;

        state.gates.forEach((gate) => {
          if (bulletHit) return;

          const gateX = Number.parseFloat(gate.dataset.x);
          const gateY = Number.parseFloat(gate.dataset.y);

          if (Math.abs(bulletX - gateX) < 40 && Math.abs(y - gateY) < 30) {
            const hp = gate.dataset.hp !== undefined ? Number.parseInt(gate.dataset.hp, 10) : null;
            const newHp = hp === null ? null : Math.max(0, hp - 1);
            if (newHp !== null) {
              gate.dataset.hp = newHp.toString();
            }
            const requiresBreak = gate.dataset.requireBreak === '1';

            const gateType = gate.dataset.type;
            if (gateType === 'negative') {
              const currentValue = Number.parseInt(gate.dataset.value, 10);
              const newValue = currentValue + 1;
              gate.dataset.value = newValue.toString();
              gate.textContent = `${newValue}`;
            } else if (gateType === 'positive') {
              const currentValue = Number.parseInt(gate.dataset.value, 10);
              const newValue = currentValue - 1;
              gate.dataset.value = newValue.toString();
              gate.textContent = newValue > 0 ? `+${newValue}` : '0';
            } else if (gateType === 'multiply' || gateType === 'divide') {
              const nextType = gateType === 'multiply' ? 'divide' : 'multiply';
              gate.dataset.type = nextType;
              gate.dataset.operation = nextType;
              gate.textContent = nextType === 'multiply' ? `×${gate.dataset.value}` : `÷${gate.dataset.value}`;
              gate.classList.remove('multiply', 'divide');
              gate.classList.add(nextType);
            }

            bulletsToRemove.push(bullet);
            bulletHit = true;
            playTone('hit');

            if (newHp !== null && newHp <= 0) {
              if (requiresBreak && (gateType === 'rapidfire-strong' || gateType === 'shield-strong')) {
                gate.dataset.requireBreak = '0';
                delete gate.dataset.hp;
                delete gate.dataset.maxHp;
                gate.classList.add('gate-core');
              } else {
                const index = state.gates.indexOf(gate);
                if (index > -1) {
                  state.gates.splice(index, 1);
                }
                gate.remove();
                playTone('gateDestroy');
                setLog(gateType === 'negative' ? '-ゲートを破壊！' : gateType === 'positive' ? '+ゲートを破壊！' : 'ゲートを破壊！');
              }
            }
          }
        });

        if (!bulletHit && state.boss && state.bossPhase) {
          const bossRect = state.boss.getBoundingClientRect();
          const bossHitBox = {
            left: bossRect.left - gameRect.left + 6,
            right: bossRect.right - gameRect.left - 6,
            top: bossRect.top - gameRect.top + 6,
            bottom: bossRect.bottom - gameRect.top - 6
          };

          const bulletRect = bullet.getBoundingClientRect();
          const bulletBox = {
            left: bulletRect.left - gameRect.left,
            right: bulletRect.right - gameRect.left,
            top: bulletRect.top - gameRect.top,
            bottom: bulletRect.bottom - gameRect.top
          };

          if (
            bulletBox.right > bossHitBox.left &&
            bulletBox.left < bossHitBox.right &&
            bulletBox.bottom > bossHitBox.top &&
            bulletBox.top < bossHitBox.bottom
          ) {
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
            bulletHit = true;

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

        if (!bulletHit && y < -20) {
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
      const speed = Number.parseFloat(bullet.dataset.speed ?? String(config.boss.bulletSpeed));
      const y = Number.parseFloat(bullet.dataset.y) + speed;
      bullet.dataset.y = y.toString();
      bullet.style.top = `${y}px`;

      const bulletX = Number.parseFloat(bullet.dataset.x);
      if (y > 360 && y < 420 && Math.abs(bulletX - state.playerX) < 30) {
        const damage = Number.parseInt(bullet.dataset.damage ?? String(config.boss.bulletDamage ?? 3), 10);
        if (config.shield.enabled && state.shieldActive && Date.now() < state.shieldEndTime) {
          playTone('gate');
          setLog('シールドでダメージを防いだ！');
        } else {
          state.soldiers = Math.max(0, state.soldiers - damage);
          playTone('damage');

          if (state.soldiers <= 0) {
            endGame('兵士が全滅…ゲームオーバー！');
            bossBulletsToRemove.push(bullet);
            return;
          }
        }
        bossBulletsToRemove.push(bullet);
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

      if (state.elapsedTime >= config.bossSpawnTime && !state.bossPhase) {
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
      clearBossAttackTimers();
      clearInterval(state.bossMoveTimer);
      arrowLeft.disabled = true;
      arrowRight.disabled = true;
      if (startButton) startButton.disabled = false;
      setLog(message);

      if (message.includes('勝利')) {
        if (state.best === 0 || state.elapsedTime < state.best) {
          state.best = state.elapsedTime;
        }
        if (state.storageAvailable && config.nextStageKey) {
          localStorage.setItem(config.nextStageKey, state.soldiers.toString());
        }
      }

      saveProgress();
      enableShare();
    };

    const getStartSoldiers = () => {
      if (!config.allowContinue) return config.initialSoldiers;
      if (state.selectedMode === 'continue' && state.inheritedSoldiers > 0) {
        return state.inheritedSoldiers;
      }
      return config.initialSoldiers;
    };

    const startGame = () => {
      if (config.allowContinue && !state.selectedMode) {
        state.selectedMode = state.inheritedSoldiers > 0 ? 'continue' : 'fresh';
      }
      markPlayed();
      playTone('start');
      state.running = true;
      state.soldiers = getStartSoldiers();
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
      state.rapidFireActive = false;
      state.rapidFireEndTime = 0;
      state.rapidFireStrong = false;
      state.shieldStrong = false;
      state.shieldActive = false;
      state.shieldEndTime = 0;
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

      if (startButton) startButton.disabled = true;
      arrowLeft.disabled = false;
      arrowRight.disabled = false;

      state.spawnTimer = setInterval(spawnGate, config.gateSpawnInterval);
      state.gameTimer = setInterval(gameLoop, 16);
      state.shootTimer = setInterval(shootBullet, state.baseShootInterval);
    };

    if (rapidFireEl) {
      rapidFireEl.style.display = 'none';
    }
    if (shieldEl) {
      shieldEl.style.display = 'none';
    }

    if (startButton) {
      startButton.addEventListener('click', () => {
        if (!state.running) {
          startGame();
        }
      });
    }

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
    gameArea.addEventListener(
      'touchstart',
      (event) => {
        if (!state.running) return;
        touchStartX = event.touches[0].clientX;
      },
      { passive: true }
    );

    gameArea.addEventListener(
      'touchmove',
      (event) => {
        if (!state.running) return;
        const rect = gameArea.getBoundingClientRect();
        const touchX = event.touches[0].clientX - rect.left;
        state.playerX = clamp(touchX, 55, 265);
      },
      { passive: true }
    );

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

    const triggerStartWithMode = (mode) => {
      state.selectedMode = mode;
      modeFreshButton?.classList.toggle('selected', mode === 'fresh');
      modeContinueButton?.classList.toggle('selected', mode === 'continue');
      startGame();
    };

    if (config.allowContinue && modeFreshButton && modeContinueButton) {
      modeFreshButton.addEventListener('click', () => {
        if (config.startWithModeButtons) {
          triggerStartWithMode('fresh');
        } else {
          state.selectedMode = 'fresh';
          modeFreshButton.classList.add('selected');
          modeContinueButton.classList.remove('selected');
        }
      });
      modeContinueButton.addEventListener('click', () => {
        if (modeContinueButton.disabled) return;
        if (config.startWithModeButtons) {
          triggerStartWithMode('continue');
        } else {
          state.selectedMode = 'continue';
          modeContinueButton.classList.add('selected');
          modeFreshButton.classList.remove('selected');
        }
      });
    }

    if (shareButton) {
      shareButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (state.best === 0) {
          return;
        }
        const url = config.shareUrlBuilder(state.best, config.shareLabel);
        window.open(url, '_blank', 'noopener');
      });
    }

    detectStorage();
    loadProgress();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
    } else {
      updatePlayCount();
    }
  };

  window.initSoldierRushGame = initSoldierRushGame;
  window.soldierRushRenderers = renderers;
})();
