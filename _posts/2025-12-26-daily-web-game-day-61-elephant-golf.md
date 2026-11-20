---
title: "毎日ゲームチャレンジ Day 61: ゾウのゴルフ"
og_image: "/assets/images/games/day61_og.png"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

61日目は「ゾウのゴルフ」。ゾウが鼻でゴルフボールを打って、カップを目指すゲーム！パワーゲージでショットの強さを調整しよう！

<style>
#elephant-game {
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
#elephant-game .hud {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #elephant-game .hud {
    font-size: 0.82rem;
  }
}
#elephant-game .game-canvas {
  width: 100%;
  max-width: 460px;
  height: auto;
  aspect-ratio: 460 / 420;
  margin: 0 auto;
  background: linear-gradient(180deg, #7dd3fc 0%, #86efac 100%);
  border-radius: 18px;
  box-shadow: inset 0 0 0 2px rgba(148, 163, 184, 0.2);
  cursor: pointer;
  touch-action: none;
}
#elephant-game .log {
  min-height: 24px;
  color: #f8fafc;
  margin-top: 12px;
  font-size: 0.9rem;
}
#elephant-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#elephant-game .share button {
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
#elephant-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#elephant-game .share button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

<div id="elephant-game">
  <div class="hud">
    <span class="strokes">打数: 0</span>
    <span class="score">得点: 0</span>
    <span class="best">最高: 0</span>
  </div>
  <canvas class="game-canvas" width="460" height="420"></canvas>
  <p class="log">ドラッグで方向とパワーを調整！離してショット！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('elephant-game');
  if (!root) return;

  const canvas = root.querySelector('.game-canvas');
  const ctx = canvas.getContext('2d');
  const strokesEl = root.querySelector('.strokes');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const START_BUTTON = {
    x: canvas.width / 2 - 80,
    y: canvas.height / 2 - 30,
    width: 160,
    height: 60
  };

  const storageKey = 'aomagame:best:elephant';
  const playedKey = 'aomagame:played:elephant';

  const state = {
    running: false,
    firstPlay: true,
    showRetryButton: false,
    gameOver: false,
    charging: false,
    chargeTime: 0,
    chargeDirection: 1,
    maxCharge: 1.5,
    strokes: 0,
    score: 0,
    best: 0,
    holes: 0,
    maxHoles: 5,
    combo: 0,
    holedIn: false,
    aimX: 0,
    aimY: 0,
    elephant: {
      x: 60,
      y: 350
    },
    ball: {
      x: 100,
      y: 350,
      vx: 0,
      vy: 0,
      radius: 6,
      moving: false,
      visible: true
    },
    hole: {
      x: 400,
      y: 350,
      radius: 15
    },
    obstacles: [],
    particles: [],
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    charge: { frequency: 340, duration: 0.08, gain: 0.12 },
    hit: { frequency: 480, duration: 0.15, gain: 0.2 },
    hole: { frequency: 720, duration: 0.25, gain: 0.24 },
    complete: { frequency: 880, duration: 0.35, gain: 0.26 }
  };

  const ensureAudio = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    if (!audioCtx) audioCtx = new Context();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  };

  const playTone = (type) => {
    const ctx = ensureAudio();
    if (!ctx) return;
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.hit;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    const env = ctx.createGain();
    env.gain.setValueAtTime(gain, now);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(env).connect(ctx.destination);
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
    if (!state.storageAvailable) return;
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value >= 0) {
      state.best = value;
      bestEl.textContent = `最高: ${state.best}`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!state.storageAvailable) return;
    localStorage.setItem(storageKey, String(state.best));
  };

  const updatePlayCount = () => {
    const counterEl = getPlayCountEl();
    if (!counterEl) return;
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (typeof key !== 'string' || !key.startsWith('aomagame:played:')) continue;
        const value = Number.parseInt(localStorage.getItem(key) ?? '0', 10);
        if (!Number.isNaN(value) && value > 0) total += 1;
      }
      counterEl.textContent = total;
    } catch (error) {
      counterEl.textContent = '0';
    }
  };

  const markPlayed = () => {
    if (!state.storageAvailable) return;
    try {
      const current = Number.parseInt(localStorage.getItem(playedKey) ?? '0', 10);
      const next = Number.isNaN(current) ? 1 : current + 1;
      localStorage.setItem(playedKey, String(next));
    } catch (error) {
      return;
    }
    updatePlayCount();
  };

  const updateHud = () => {
    strokesEl.textContent = `打数: ${state.strokes}`;
    scoreEl.textContent = `得点: ${state.score}`;
    bestEl.textContent = `最高: ${state.best}`;
  };

  const generateObstacles = () => {
    state.obstacles = [];

    // ステージ2以降で障害物を追加
    if (state.holes >= 1) {
      const numObstacles = Math.min(state.holes, 4); // 最大4個

      for (let i = 0; i < numObstacles; i++) {
        let obstX, obstY, obstW, obstH;
        let attempts = 0;
        let valid = false;

        while (!valid && attempts < 20) {
          obstX = 150 + Math.random() * (canvas.width - 250);
          obstY = 100 + Math.random() * (canvas.height - 200);
          obstW = 40 + Math.random() * 30;
          obstH = 40 + Math.random() * 30;

          // ボールとホールから十分離れているか確認
          const ballDist = Math.hypot(obstX - state.ball.x, obstY - state.ball.y);
          const holeDist = Math.hypot(obstX - state.hole.x, obstY - state.hole.y);

          if (ballDist > 100 && holeDist > 80) {
            valid = true;
          }
          attempts++;
        }

        if (valid) {
          state.obstacles.push({
            x: obstX,
            y: obstY,
            width: obstW,
            height: obstH
          });
        }
      }
    }
  };

  const generateNewHole = () => {
    const minX = 200;
    const maxX = canvas.width - 50;
    const minY = 100;
    const maxY = canvas.height - 50;

    let holeX, holeY;
    do {
      holeX = minX + Math.random() * (maxX - minX);
      holeY = minY + Math.random() * (maxY - minY);
    } while (Math.hypot(holeX - state.ball.x, holeY - state.ball.y) < 100);

    state.hole.x = holeX;
    state.hole.y = holeY;

    generateObstacles();
  };

  const startCharging = (x, y) => {
    if (!state.running || state.ball.moving || state.charging) return;
    state.charging = true;
    state.chargeTime = 0;
    state.chargeDirection = 1;
    state.aimX = x;
    state.aimY = y;
  };

  const updateAim = (x, y) => {
    if (!state.charging) return;
    state.aimX = x;
    state.aimY = y;
  };

  const releaseCharge = () => {
    if (!state.charging) return;
    state.charging = false;

    const power = Math.min(state.chargeTime / state.maxCharge, 1);
    const dx = state.aimX - state.ball.x;
    const dy = state.aimY - state.ball.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) return; // Too short to shoot

    const angle = Math.atan2(dy, dx);
    // パワーが弱いときはより飛距離が出ないように (2次関数的に)
    const speed = 2 + power * power * 18;

    state.ball.vx = Math.cos(angle) * speed;
    state.ball.vy = Math.sin(angle) * speed;
    state.ball.moving = true;
    state.ball.holedIn = false;
    state.strokes++;

    playTone('hit');
    logEl.textContent = `パワー: ${Math.round(power * 100)}%`;
  };

  const createParticles = (x, y, color, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (2 + Math.random() * 3),
        vy: Math.sin(angle) * (2 + Math.random() * 3),
        life: 1,
        color
      });
    }
  };

  const checkHole = () => {
    if (state.holedIn) return; // 既にホールインしている場合は処理しない

    const dist = Math.hypot(state.ball.x - state.hole.x, state.ball.y - state.hole.y);

    // ホールの範囲内で、速度が遅い（ピッタリ）ならホールイン
    if (dist < state.hole.radius && Math.abs(state.ball.vx) < 2 && Math.abs(state.ball.vy) < 2) {
      state.holedIn = true; // ホールインフラグを立てる
      state.ball.visible = false; // ボールを消す

      // スコア計算
      const strokeBonus = Math.max(0, 50 - state.strokes * 10);
      const perfectBonus = state.strokes === 1 ? 100 : 0;

      if (state.strokes === 1) {
        state.combo++;
      } else {
        state.combo = 0;
      }

      const comboBonus = state.combo > 0 ? state.combo * 50 : 0;
      const totalPoints = 100 + strokeBonus + perfectBonus + comboBonus;

      state.score += totalPoints;
      state.holes++;

      createParticles(state.hole.x, state.hole.y, '#fbbf24', 15);
      playTone('hole');

      let message = `ホールイン！${state.holes}/${state.maxHoles}`;
      if (perfectBonus > 0) message += ' ⭐パーフェクト！';
      if (comboBonus > 0) message += ` 🔥×${state.combo}コンボ！`;
      message += ` (+${totalPoints}点)`;
      logEl.textContent = message;

      if (state.score > state.best) {
        state.best = state.score;
        saveBest();
        shareButton.disabled = false;
      }

      if (state.holes >= state.maxHoles) {
        setTimeout(() => endGame(), 1500);
      } else {
        state.strokes = 0;
        setTimeout(() => {
          state.holedIn = false;
          generateNewHole();
          state.ball.x = 100;
          state.ball.y = 350;
          state.ball.vx = 0;
          state.ball.vy = 0;
          state.ball.moving = false;
          state.ball.visible = true;
          logEl.textContent = `次のホールへ！`;
        }, 1500);
      }
    }
  };

  const drawElephant = () => {
    const e = state.elephant;

    // 体
    ctx.fillStyle = '#71717a';
    ctx.beginPath();
    ctx.ellipse(e.x, e.y, 30, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭
    ctx.beginPath();
    ctx.arc(e.x - 20, e.y - 15, 20, 0, Math.PI * 2);
    ctx.fill();

    // 耳
    ctx.fillStyle = '#52525b';
    ctx.beginPath();
    ctx.ellipse(e.x - 35, e.y - 20, 15, 20, -0.3, 0, Math.PI * 2);
    ctx.ellipse(e.x - 5, e.y - 20, 15, 20, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 鼻
    const chargeProgress = state.charging ? Math.min(state.chargeTime / state.maxCharge, 1) : 0;
    const trunkAngle = -Math.PI / 4 + chargeProgress * Math.PI / 6;
    const trunkEndX = e.x - 20 + Math.cos(trunkAngle) * 40;
    const trunkEndY = e.y - 15 + Math.sin(trunkAngle) * 40;

    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(e.x - 20, e.y - 5);
    ctx.quadraticCurveTo(e.x - 10, e.y + 10, trunkEndX, trunkEndY);
    ctx.stroke();

    // 目
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(e.x - 25, e.y - 20, 3, 0, Math.PI * 2);
    ctx.arc(e.x - 15, e.y - 20, 3, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBall = () => {
    if (!state.ball.visible) return; // ボールが非表示なら描画しない

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  const drawObstacles = () => {
    ctx.fillStyle = '#78716c';
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 2;

    for (const obs of state.obstacles) {
      // 岩のような見た目
      ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
      ctx.strokeRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);

      // テクスチャ
      ctx.fillStyle = '#57534e';
      for (let i = 0; i < 3; i++) {
        const tx = obs.x - obs.width / 4 + (i * obs.width / 4);
        const ty = obs.y - obs.height / 4 + ((i + 1) % 3) * obs.height / 4;
        ctx.fillRect(tx, ty, 4, 4);
      }
      ctx.fillStyle = '#78716c';
    }
  };

  const drawHole = () => {
    // ホール
    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(state.hole.x, state.hole.y, state.hole.radius, 0, Math.PI * 2);
    ctx.fill();

    // フラッグポール
    ctx.strokeStyle = '#78716c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(state.hole.x, state.hole.y);
    ctx.lineTo(state.hole.x, state.hole.y - 40);
    ctx.stroke();

    // フラッグ
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(state.hole.x, state.hole.y - 40);
    ctx.lineTo(state.hole.x + 20, state.hole.y - 32);
    ctx.lineTo(state.hole.x, state.hole.y - 24);
    ctx.closePath();
    ctx.fill();
  };

  const drawPowerGauge = () => {
    if (state.charging) {
      const gaugeX = 20;
      const gaugeY = 20;
      const gaugeWidth = 100;
      const gaugeHeight = 20;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

      const power = Math.min(state.chargeTime / state.maxCharge, 1);
      const gradient = ctx.createLinearGradient(gaugeX, 0, gaugeX + gaugeWidth, 0);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.7, '#fbbf24');
      gradient.addColorStop(1, '#ef4444');
      ctx.fillStyle = gradient;
      ctx.fillRect(gaugeX, gaugeY, gaugeWidth * power, gaugeHeight);

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(gaugeX, gaugeY, gaugeWidth, gaugeHeight);

      // 方向矢印
      const dx = state.aimX - state.ball.x;
      const dy = state.aimY - state.ball.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 10) {
        const angle = Math.atan2(dy, dx);
        const arrowLength = Math.min(dist, 80);
        const endX = state.ball.x + Math.cos(angle) * arrowLength;
        const endY = state.ball.y + Math.sin(angle) * arrowLength;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(state.ball.x, state.ball.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // 矢印の先端
        const arrowSize = 10;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle - Math.PI / 6),
          endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle + Math.PI / 6),
          endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      }
    }
  };

  const drawParticles = () => {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      ctx.fillStyle = `${p.color}${Math.floor(p.life * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;

      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  };

  const drawStartButton = () => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();

    ctx.shadowColor = 'rgba(22, 101, 52, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(START_BUTTON.x, buttonY, START_BUTTON.width, START_BUTTON.height, 30);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const buttonText = state.firstPlay ? 'スタート' : 'リトライ';
    ctx.fillText(buttonText, START_BUTTON.x + START_BUTTON.width / 2, buttonY + START_BUTTON.height / 2);
  };

  const draw = () => {
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#7dd3fc');
    gradient.addColorStop(1, '#86efac');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 芝生のテクスチャ
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 50; i++) {
      const x = (i * 137) % canvas.width;
      const y = ((i * 211) % canvas.height);
      ctx.fillRect(x, y, 3, 3);
    }

    drawHole();
    drawObstacles();
    drawBall();
    drawElephant();
    drawParticles();
    drawPowerGauge();

    if (state.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ゲームクリア！', canvas.width / 2, canvas.height / 2 - 60);
      ctx.font = '16px sans-serif';
      ctx.fillText(`${state.maxHoles}ホール完了！`, canvas.width / 2, canvas.height / 2 - 30);
      ctx.fillText(`得点: ${state.score}`, canvas.width / 2, canvas.height / 2);
    }

    if (!state.running && (!state.gameOver || state.showRetryButton)) {
      drawStartButton();
    }
  };

  const gameLoop = () => {
    if (!state.running || state.gameOver) return;

    if (state.charging) {
      state.chargeTime += 0.016 * state.chargeDirection;

      // マックスまで行ったら反転
      if (state.chargeTime >= state.maxCharge) {
        state.chargeTime = state.maxCharge;
        state.chargeDirection = -1;
      }
      // 最小まで行ったら反転
      if (state.chargeTime <= 0) {
        state.chargeTime = 0;
        state.chargeDirection = 1;
      }

      // ゲージが半分を超えたら音を鳴らす
      if (state.chargeTime / state.maxCharge > 0.5 && state.chargeDirection === 1) {
        if (Math.random() < 0.1) playTone('charge');
      }
    }

    if (state.ball.moving) {
      state.ball.x += state.ball.vx;
      state.ball.y += state.ball.vy;

      // 摩擦
      state.ball.vx *= 0.98;
      state.ball.vy *= 0.98;

      // 壁との反発
      if (state.ball.x - state.ball.radius < 0 || state.ball.x + state.ball.radius > canvas.width) {
        state.ball.vx *= -0.7;
        state.ball.x = Math.max(state.ball.radius, Math.min(canvas.width - state.ball.radius, state.ball.x));
      }
      if (state.ball.y - state.ball.radius < 0 || state.ball.y + state.ball.radius > canvas.height) {
        state.ball.vy *= -0.7;
        state.ball.y = Math.max(state.ball.radius, Math.min(canvas.height - state.ball.radius, state.ball.y));
      }

      // 障害物との衝突判定
      for (const obs of state.obstacles) {
        const closestX = Math.max(obs.x - obs.width / 2, Math.min(state.ball.x, obs.x + obs.width / 2));
        const closestY = Math.max(obs.y - obs.height / 2, Math.min(state.ball.y, obs.y + obs.height / 2));
        const distX = state.ball.x - closestX;
        const distY = state.ball.y - closestY;
        const distance = Math.hypot(distX, distY);

        if (distance < state.ball.radius) {
          // 衝突したら跳ね返る
          const angle = Math.atan2(distY, distX);
          state.ball.x = closestX + Math.cos(angle) * (state.ball.radius + 1);
          state.ball.y = closestY + Math.sin(angle) * (state.ball.radius + 1);

          // 速度を反転・減衰
          const dotProduct = state.ball.vx * Math.cos(angle) + state.ball.vy * Math.sin(angle);
          state.ball.vx = (state.ball.vx - 2 * dotProduct * Math.cos(angle)) * 0.6;
          state.ball.vy = (state.ball.vy - 2 * dotProduct * Math.sin(angle)) * 0.6;

          playTone('hit');
        }
      }

      // 停止判定
      if (Math.abs(state.ball.vx) < 0.1 && Math.abs(state.ball.vy) < 0.1) {
        state.ball.vx = 0;
        state.ball.vy = 0;
        state.ball.moving = false;
      }

      checkHole();
    }

    draw();
    updateHud();
    requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    state.running = false;
    state.gameOver = true;
    state.showRetryButton = false;
    playTone('complete');
    logEl.textContent = `ゲームクリア！得点: ${state.score}`;
    updateHud();
    draw();
    setTimeout(() => {
      state.showRetryButton = true;
      draw();
    }, 1000);
  };

  const isClickOnStartButton = (x, y) => {
    const buttonY = state.firstPlay ? START_BUTTON.y : START_BUTTON.y + 40;
    return x >= START_BUTTON.x && x <= START_BUTTON.x + START_BUTTON.width &&
           y >= buttonY && y <= buttonY + START_BUTTON.height;
  };

  const handleCanvasDown = (x, y) => {
    if (!state.running && isClickOnStartButton(x, y)) {
      markPlayed();
      playTone('start');
      state.running = true;
      state.firstPlay = false;
      state.showRetryButton = false;
      state.gameOver = false;
      state.strokes = 0;
      state.score = 0;
      state.holes = 0;
      state.combo = 0;
      state.holedIn = false;
      state.ball = {
        x: 100,
        y: 350,
        vx: 0,
        vy: 0,
        radius: 6,
        moving: false,
        visible: true
      };
      state.particles = [];
      state.obstacles = [];
      generateNewHole();
      logEl.textContent = 'ドラッグで方向とパワーを調整！';
      gameLoop();
    } else if (state.running && !state.ball.moving) {
      startCharging(x, y);
    }
  };

  const handleCanvasMove = (x, y) => {
    if (state.charging) {
      updateAim(x, y);
    }
  };

  const handleCanvasUp = () => {
    if (state.charging) {
      releaseCharge();
    }
  };

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    handleCanvasDown(x, y);
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    handleCanvasMove(x, y);
  });

  canvas.addEventListener('mouseup', () => {
    handleCanvasUp();
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    handleCanvasDown(x, y);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    handleCanvasMove(x, y);
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleCanvasUp();
  }, { passive: false });

  if (shareButton) {
    shareButton.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.best === 0) return;
      const text = `ゾウのゴルフで${state.best}点を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  updateHud();
  draw();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタートボタンで5ホールのチャレンジ開始。
2. ドラッグで方向とパワーを調整（矢印と色でフィードバック）。
3. 離してショット！少ない打数でホールインを目指そう。
4. 1打でホールインするとパーフェクトボーナス＆コンボ発動！
5. 5ホール完了で高得点を競え！

## 実装メモ
- ドラッグ操作で方向とパワーを自由に調整
- パワーゲージが往復：タイミングよく離して調整
- ステージ2以降は障害物が登場！岩に当たると跳ね返る
- コンボシステム：1打でホールインし続けるとボーナス倍増
- パーティクルエフェクトで爽快感アップ
- ボールの物理演算と壁の反発
- ランダムなホール配置で毎回違う挑戦

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
