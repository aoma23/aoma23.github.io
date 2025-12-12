---
title: "毎日ゲームチャレンジ Day 68: ネオン・ドリフト (Neon Drift)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！
昨日のゲーム：<a href="{{ '/daily-web-game-day-67-golden-sunrise/' | relative_url }}">初日の出クライマー</a>

68日目は「ネオン・ドリフト」。
シンセウェーブなサイバー空間を駆け抜けろ！
タップし続ける間、近くのポールの周りをドリフト回転します。
タイミングよく離して、次のポールへと飛び移っていこう！

<style>
#drift-game {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
  padding: 2px;
  border-radius: 16px;
  background: #111827;
  color: #f3f4f6;
  font-family: "Inter", sans-serif;
  text-align: center;
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
  position: relative;
  overflow: hidden;
}
#drift-game .game-canvas {
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  display: block;
  border-radius: 14px;
  background: #0f172a;
  cursor: pointer;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}
#drift-game .hud {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  font-size: 1.25rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
  font-family: monospace;
}
#drift-game .score { color: #22d3ee; }
#drift-game .best { color: #f472b6; }

#drift-game .start-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(17, 24, 39, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 20;
  backdrop-filter: blur(8px);
}
#drift-game .start-overlay.hidden { display: none; }
#drift-game h2 {
  font-size: 2.2rem;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #22d3ee, #f472b6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
}
#drift-game button.primary {
  border: none;
  border-radius: 4px;
  padding: 16px 48px;
  font-size: 1.4rem;
  font-weight: 700;
  color: #0f172a;
  background: #22d3ee;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
  transition: transform 0.1s, box-shadow 0.1s;
  text-transform: uppercase;
  clip-path: polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%);
}
#drift-game button.primary:hover {
  transform: scale(1.05);
  box-shadow: 0 0 30px rgba(34, 211, 238, 0.8);
  background: #67e8f9;
}
#drift-game .tutorial {
  margin-bottom: 30px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #cbd5e1;
}
</style>

<div id="drift-game">
  <canvas class="game-canvas" width="450" height="600"></canvas>
  <div class="hud">
    <div class="score">SCORE: 0</div>
    <div class="best">BEST: 0</div>
  </div>
  
  <div class="start-overlay">
    <h2>Neon Drift</h2>
    <p class="tutorial">
      ポールをつかんでカーブを曲がれ！<br>
      <br>
      押し続ける：近くのポールを中心に回転<br>
      離す：直進
    </p>
    <button class="primary" id="nd-start-btn">IGNITION</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('drift-game');
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const overlay = root.querySelector('.start-overlay');
  const startBtn = document.getElementById('nd-start-btn');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const STORAGE_KEY = 'aomagame:best:neondrift';
  const PLAYED_KEY = 'aomagame:played:neondrift';

  const CAR_SPEED = 7;
  const PIVOT_GRAB_RANGE = 180;
  const ROTATION_SPEED = 0.08;
  
  let audioCtx = null;
  const ensureAudio = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
  };
  
  const playTone = (type) => {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'drift') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'release') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'crash') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };

  const state = {
    running: false,
    gameOver: false,
    score: 0,
    best: 0,
    car: { x: 0, y: 0, angle: 0, vx: 0, vy: 0 },
    pivots: [],
    particles: [],
    cameraY: 0,
    isDrifting: false,
    currentPivot: null,
    radius: 0,
    driftDirection: 1 // 1: clockwise, -1: counter-clockwise
  };

  const COLORS = {
    bg: '#0f172a',
    grid: '#1e293b',
    car: '#22d3ee',
    pivot: '#f472b6',
    pivotActive: '#fbbf24',
    trail: 'rgba(34, 211, 238, 0.4)'
  };

  class Pivot {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.passed = false;
    }
  }

  function initPivots() {
    state.pivots = [];
    // Start pivots in a zigzag pattern
    // Initial pivot closer to player to prevent immediate game over
    let y = canvas.height - 350; // Start closer (Player is at H-150, so dist=200)
    let x = canvas.width / 2;
    let direction = 1; // 1 for right, -1 for left

    // Initial safe zone
    for (let i = 0; i < 4; i++) {
        state.pivots.push(new Pivot(x, y));
        y -= 250;
    }
  }

  function generateNextPivot() {
    const last = state.pivots[state.pivots.length - 1];
    const y = last.y - (200 + Math.random() * 50);
    // ジグザグに生成
    let x = last.x;
    
    // 画面端に行き過ぎないように
    const margin = 100;
    const maxShift = 200;
    
    // ランダムな方向に配置しつつ、画面内に収める
    let shift = (100 + Math.random() * 150) * (Math.random() < 0.5 ? 1 : -1);
    
    if (x + shift < margin) shift = Math.abs(shift);
    if (x + shift > canvas.width - margin) shift = -Math.abs(shift);
    
    state.pivots.push(new Pivot(x + shift, y));
  }

  function update() {
    const car = state.car;

    // Drifting Logic
    if (state.isDrifting && state.currentPivot) {
      // ポールを中心に回転
      const p = state.currentPivot;
      
      // 現在の角度
      let angleToCar = Math.atan2(car.y - p.y, car.x - p.x);
      
      // 回転
      angleToCar += ROTATION_SPEED * state.driftDirection;
      
      // 新しい位置
      car.x = p.x + Math.cos(angleToCar) * state.radius;
      car.y = p.y + Math.sin(angleToCar) * state.radius;
      
      // 進行方向（接線方向）
      // 時計回りなら +90度, 反時計なら -90度
      car.angle = angleToCar + (state.driftDirection * Math.PI / 2);
      
      // 速度ベクトル更新（離したとき用）
      car.vx = Math.cos(car.angle) * CAR_SPEED;
      car.vy = Math.sin(car.angle) * CAR_SPEED;
      
      // 遠心力情報の保存（リリース時に使う）
      state.lastDriftDir = state.driftDirection;

    } else {
      // Straight movement
      car.x += car.vx;
      car.y += car.vy;
    }

    // カメラ追従
    const targetCamY = car.y - canvas.height * 0.7;
    state.cameraY += (targetCamY - state.cameraY) * 0.1;

    // 画面外判定（ゲームオーバー）
    // 左右は画面外へ少し余裕を持たせる (Canvas幅 + 150px)
    // 上下はカメラより下に行き過ぎたらアウト
    const sideMargin = 150;
    if (car.x < -sideMargin || car.x > canvas.width + sideMargin || car.y > state.cameraY + canvas.height + 100) {
      endGame();
    }
    
    // 直進し続けるとポールから離れるが、ゲームオーバーにはしない
    // 画面外に出たときだけゲームオーバー

    // 古いPivot削除 & 新規生成
    if (state.pivots[0].y > state.cameraY + canvas.height + 100) {
      state.pivots.shift();
      generateNextPivot();
    }

    // スコア加算 (距離ベース)
    const distScore = Math.floor(Math.abs(car.y) / 100);
    if (distScore > state.score) {
      state.score = distScore;
      scoreEl.textContent = `SCORE: ${state.score}`;
    }

    // パーティクル更新
    state.particles.forEach((p, i) => {
      p.life -= 0.05;
      p.x += p.vx;
      p.y += p.vy;
      if (p.life <= 0) state.particles.splice(i, 1);
    });
  }

  function draw() {
    // 背景グリッド
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gridSize = 50;
    const offset = Math.abs(state.cameraY) % gridSize;
    
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // 縦線
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
    }
    // 横線 (スクロール)
    for (let y = offset; y <= canvas.height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    ctx.save();
    ctx.translate(0, -state.cameraY);

    // Pivots
    state.pivots.forEach(p => {
      const isActive = (p === state.currentPivot);
      
      // Glow
      if (isActive) {
        ctx.shadowColor = COLORS.pivotActive;
        ctx.shadowBlur = 20;
        ctx.fillStyle = COLORS.pivotActive;
      } else {
        ctx.shadowColor = COLORS.pivot;
        ctx.shadowBlur = 10;
        ctx.fillStyle = COLORS.pivot;
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 接続線（ドリフト中のみ）
      if (isActive) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(state.car.x, state.car.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Car (Triangle)
    ctx.translate(state.car.x, state.car.y);
    ctx.rotate(state.car.angle);
    
    ctx.shadowColor = COLORS.car;
    ctx.shadowBlur = 15;
    ctx.fillStyle = COLORS.car;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-10, 7);
    ctx.lineTo(-10, -7);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Trail
    if (state.isDrifting) {
       // ドリフト中は車体から火花
       // ここでパーティクル生成は重くなるかもだが、数個ならOK
       if (Math.random() < 0.3) {
         state.particles.push({
           x: state.car.x,
           y: state.car.y,
           vx: (Math.random() - 0.5) * 2,
           vy: (Math.random() - 0.5) * 2,
           life: 1.0,
           color: '#fcd34d'
         });
       }
    }

    ctx.restore();

    // Draw Particles
    ctx.save();
    ctx.translate(0, -state.cameraY);
    state.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // Connecting line helper (nearest pivot hint)
    // 近くのPivotがあれば薄く線を表示して「掴めるよ」感を出す
    if (!state.isDrifting && state.running) {
      const nearest = findNearestPivot();
      if (nearest && nearest.dist < PIVOT_GRAB_RANGE) {
        ctx.save();
        ctx.translate(0, -state.cameraY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(state.car.x, state.car.y);
        ctx.lineTo(nearest.pivot.x, nearest.pivot.y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function loop() {
    if (!state.running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function findNearestPivot() {
    let nearest = null;
    let minDist = Infinity;
    
    // 現在位置より前方（画面上方向）にあるポールのみ対象にするのが基本だが、
    // 真横もありえるので全探索（数は少ないのでOK）
    for (const p of state.pivots) {
      // 既に通り過ぎたものを除外（簡易的にY座標で判定）
      if (p.y > state.car.y + 100) continue;

      const dx = state.car.x - p.x;
      const dy = state.car.y - p.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    }
    return nearest ? { pivot: nearest, dist: minDist } : null;
  }

  function startDrift() {
    if (!state.running) return;
    
    const nearestData = findNearestPivot();
    if (nearestData && nearestData.dist < PIVOT_GRAB_RANGE) {
      state.isDrifting = true;
      state.currentPivot = nearestData.pivot;
      state.radius = nearestData.dist;
      playTone('drift');
      
      // 回転方向の決定 (外積的な考え方)
      // 車の進行方向ベクトルと、車->ポールのベクトルの関係
      // v1 (car velocity) = (cos(ang), sin(ang))
      // v2 (car to pivot) = (px - cx, py - cy)
      // If cross product is positive, pivot is to the left => Turn Left (CCW, -1)
      // If negative, pivot is to the right => Turn Right (CW, 1)
      // Canvas座標系(Y下向き)注意
      
      const v1x = Math.cos(state.car.angle);
      const v1y = Math.sin(state.car.angle);
      const v2x = state.currentPivot.x - state.car.x;
      const v2y = state.currentPivot.y - state.car.y;
      
      const cross = v1x * v2y - v1y * v2x;
      state.driftDirection = cross > 0 ? 1 : -1; 
      
      // 補正: ゲーム的には「常に内側に回り込む」のが正解
    }
  }

  function endDrift() {
    if (state.isDrifting) {
      // 遠心力で少し外側に飛ばす (直進にならないように)
      // 回転方向と同じ方向に少し角度をずらす
      // 時計回り(1)なら、接線よりさらに右(外)へ -> angle += ?
      // 接線は center -> car から +90度。
      // 外側へのベクトル成分を加える＝角度を浅くする？
      // シンプルに回転方向に少し角度を足す
      state.car.angle += state.lastDriftDir * 0.15; 
      state.car.vx = Math.cos(state.car.angle) * CAR_SPEED;
      state.car.vy = Math.sin(state.car.angle) * CAR_SPEED;
      playTone('release');
    }
    state.isDrifting = false;
    state.currentPivot = null;
  }

  function handleInputStart(e) {
    if (!state.running) return;
    e.preventDefault();
    startDrift();
  }

  function handleInputEnd(e) {
    if (!state.running) return;
    e.preventDefault();
    endDrift();
  }

  canvas.addEventListener('mousedown', handleInputStart);
  canvas.addEventListener('mouseup', handleInputEnd);
  canvas.addEventListener('touchstart', handleInputStart, { passive: false });
  canvas.addEventListener('touchend', handleInputEnd);

  function init() {
    loadBest();
    updatePlayCount();
    startBtn.addEventListener('click', startGame);
    window.addEventListener('mousedown', ensureAudio);
    window.addEventListener('touchstart', ensureAudio);
    
    // Initial Render
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function startGame() {
    state.running = true;
    state.gameOver = false;
    state.score = 0;
    state.cameraY = 0;
    state.pivots = [];
    state.isDrifting = false;
    
    // Initial Car setup
    state.car = {
      x: canvas.width / 2,
      y: canvas.height - 150,
      angle: -Math.PI / 2 + 0.1, // 少し斜めにスタート
      vx: Math.cos(-Math.PI / 2 + 0.1) * CAR_SPEED, 
      vy: Math.sin(-Math.PI / 2 + 0.1) * CAR_SPEED
    };
    
    initPivots();
    overlay.classList.add('hidden');
    scoreEl.textContent = 'SCORE: 0';
    
    markPlayed();
    requestAnimationFrame(loop);
  }

  function endGame() {
    playTone('crash');
    state.running = false;
    state.gameOver = true;
    overlay.classList.remove('hidden');
    root.querySelector('h2').textContent = "CRASHED";
    root.querySelector('.tutorial').innerHTML = `SCORE: <span style="font-size:1.5em;font-weight:bold;color:#22d3ee">${state.score}</span>`;
    startBtn.textContent = "RETRY";
    
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }
  }

  function loadBest() {
    try { state.best = parseInt(localStorage.getItem(STORAGE_KEY) || '0'); 
          bestEl.textContent = `BEST: ${state.best}`;} catch(e){}
  }
  function saveBest() { 
    try { localStorage.setItem(STORAGE_KEY, state.best);
          bestEl.textContent = `BEST: ${state.best}`; } catch(e){}
  }
  function updatePlayCount() {
    try {
      const el = getPlayCountEl();
      if(el) {
        let count = 0;
        for(let i=0; i<localStorage.length; i++) if(localStorage.key(i).startsWith('aomagame:played:')) count++;
        el.textContent = count;
      }
    } catch(e){}
  }
  function markPlayed() {
    try { localStorage.setItem(PLAYED_KEY, (parseInt(localStorage.getItem(PLAYED_KEY)||'0')+1)); }catch(e){}
    updatePlayCount();
  }

  init();

})();
</script>

## 遊び方
1. ゲームスタート！マシンは自動で前進します。
2. 画面を長押しすると、一番近くのポールにワイヤーを繋いで旋回（ドリフト）します。
3. 指を離すと、その瞬間の向きに直線的に飛び出します。
4. これを繰り返して、ポールの間を縫うように進み続けよう！
5. 画面外に出たり、進めなくなったらゲームオーバー。

## 実装メモ
- 等速円運動と等速直線運動を切り替えるシンプルな物理モデル。
- 外積 (`cross product`) を用いて、ポールの左右どちらにあるかを判定し、回転方向を自動決定。
- ネオンの輝き (`shadowBlur`) とグリッド背景でサイバーパンクな雰囲気を演出。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
