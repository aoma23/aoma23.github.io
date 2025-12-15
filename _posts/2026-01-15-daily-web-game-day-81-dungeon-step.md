---
title: "毎日ゲームチャレンジ Day 81: ダンジョン・ステップ (Dungeon Step)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

81日目は「ダンジョン・ステップ」。
冒険者がのダンジョンの深層を目指す、ローグライク風のミニパズルゲームです。
敵を倒して道を切り開き、どこまで深く潜れるか挑戦してみてください！

<style>
#dungeon-step-game {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #1a1a2e;
  color: #e0e0e0;
  font-family: 'Courier New', Courier, monospace;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #f0a500;
  position: relative;
  text-align: center;
}
#dungeon-step-game canvas {
  display: block;
  background-color: #0f172a;
  margin: 0 auto;
  border: 2px solid #333;
  width: 100%;
  height: auto;
  image-rendering: pixelated;
}
#dungeon-step-game .ui-layer {
  display: flex;
  justify-content: space-between;
  padding: 10px 5px;
  background: #16213e;
  margin-bottom: 5px;
  border-radius: 4px;
}
#dungeon-step-game .ui-text {
  font-size: 1.1rem;
  font-weight: bold;
}
#dungeon-step-game .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  z-index: 20;
}
#dungeon-step-game .overlay.hidden { display: none; }
#dungeon-step-game h2 {
  color: #f0a500;
  margin-bottom: 10px;
  font-size: 2rem;
  text-shadow: 2px 2px 0 #000;
}
#dungeon-step-game .btn {
  background: #f0a500;
  color: #000;
  border: none;
  padding: 12px 24px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 15px;
  font-family: inherit;
  transition: transform 0.1s;
}
#dungeon-step-game .btn:active { transform: scale(0.95); }
#dungeon-step-game .controls {
  margin-top: 15px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}
#dungeon-step-game .c-btn {
  background: #333;
  border: 2px solid #555;
  border-radius: 8px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  user-select: none;
  color: #fff;
}
#dungeon-step-game .c-btn:active { background: #555; }
</style>

<div id="dungeon-step-game">
  <div class="ui-layer">
    <span class="ui-text">HP: <span class="hp-val" style="color: #ff4d4d;">3/3</span></span>
    <span class="ui-text">FL: <span class="floor-val" style="color: #4dff4d;">B1</span> <span class="best-val" style="font-size:0.8em;color:#888;">(Best:B1)</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="320" height="320"></canvas>
    
    <div class="overlay" id="ds-overlay">
      <h2>DUNGEON STEP</h2>
      <p style="margin-bottom:20px; color:#ccc; line-height:1.6;">
        [矢印キー] 移動 & 攻撃<br>
        敵に体当たりで撃破。<br>
        階段を見つけて降りよう！
      </p>
      <button class="btn" id="ds-start-btn">START</button>
    </div>
  </div>

  <div class="controls">
    <div></div>
    <div class="c-btn" data-dir="up">▲</div>
    <div></div>
    <div class="c-btn" data-dir="left">◀</div>
    <div class="c-btn" data-dir="down">▼</div>
    <div class="c-btn" data-dir="right">▶</div>
  </div>
</div>

<script>
(() => {
    const root = document.getElementById('dungeon-step-game');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const hpDisplay = root.querySelector('.hp-val');
    const floorDisplay = root.querySelector('.floor-val');
    const bestDisplay = root.querySelector('.best-val');
    const overlay = root.querySelector('#ds-overlay');
    const startBtn = root.querySelector('#ds-start-btn');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
    const PLAYED_KEY = 'aomagame:played:dungeon-step';

    const TILE_SIZE = 64;
    const GRID_W = 5;
    const COLORS = {
        bg: '#0f172a',
        grid: '#1e293b',
        player: '#3b82f6',
        enemy: '#ef4444',
        potion: '#22c55e',
        stairs: '#eab308',
        wall: '#64748b'
    };

    let player = { x: 2, y: 2, hp: 3, maxHp: 3 };
    let floor = 1;
    let bestFloor = parseInt(localStorage.getItem('aomagame:best:dungeon-step') || '1', 10);
    let entities = [];
    let isPlaying = false;
    let isAnimating = false; // Simple lock
    
    // Audio Context
    let audioCtx = null;
    const ensureAudio = () => {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return;
        if (!audioCtx) audioCtx = new C();
        if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
    };

    const playSound = (type) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'heal') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'stairs') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(600, now + 0.4);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === 'hurt') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'over') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 1.0);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 1.0);
            osc.start(now);
            osc.stop(now + 1.0);
        }
    };

    function init() {
        draw();
        startBtn.addEventListener('click', startGame);
        
        // Touch controls
        root.querySelectorAll('.c-btn').forEach(btn => {
            btn.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                ensureAudio();
                handleInput(btn.dataset.dir);
            });
        });
    }

    function startGame() {
        ensureAudio();
        player = { x: 2, y: 2, hp: 5, maxHp: 5 };
        floor = 1;
        isPlaying = true;
        overlay.classList.add('hidden');
        generateLevel();
        updateUI();
        draw();
        markPlayed();
    }

    function generateLevel() {
        entities = [];
        let stairsPos = getRandomEmptyPos();
        entities.push({ x: stairsPos.x, y: stairsPos.y, type: 'stairs' });

        const enemyCount = Math.min(2 + Math.floor(floor / 3), 6);
        for(let i=0; i<enemyCount; i++) {
            let pos = getRandomEmptyPos();
            if(pos) entities.push({ x: pos.x, y: pos.y, type: 'enemy', hp: 1, maxHp: 1 });
        }

        if (player.hp < player.maxHp && Math.random() < 0.3) {
            let pos = getRandomEmptyPos();
            if(pos) entities.push({ x: pos.x, y: pos.y, type: 'potion' });
        }
        
        const wallCount = Math.floor(Math.random() * 3);
        for(let i=0; i<wallCount; i++) {
            let pos = getRandomEmptyPos();
            if(pos) entities.push({ x: pos.x, y: pos.y, type: 'wall' });
        }
    }

    function getRandomEmptyPos() {
        let limit = 100;
        while(limit > 0) {
            limit--;
            let x = Math.floor(Math.random() * GRID_W);
            let y = Math.floor(Math.random() * GRID_W);
            if (x === player.x && y === player.y) continue;
            if (getEntityAt(x, y)) continue;
            return { x, y };
        }
        return null;
    }

    function getEntityAt(x, y) {
        return entities.find(e => e.x === x && e.y === y);
    }

    function handleInput(dir) {
        if (!isPlaying || isAnimating) return;

        let dx = 0, dy = 0;
        if (dir === 'up') dy = -1;
        if (dir === 'down') dy = 1;
        if (dir === 'left') dx = -1;
        if (dir === 'right') dx = 1;

        let targetX = player.x + dx;
        let targetY = player.y + dy;

        if (targetX < 0 || targetX >= GRID_W || targetY < 0 || targetY >= GRID_W) return;

        const entity = getEntityAt(targetX, targetY);

        if (entity) {
            if (entity.type === 'wall') {
                 // Blocked
            } else if (entity.type === 'enemy') {
                attackEnemy(entity);
            } else if (entity.type === 'potion') {
                player.hp = Math.min(player.hp + 1, player.maxHp);
                removeEntity(entity);
                player.x = targetX; player.y = targetY;
                playSound('heal');
            } else if (entity.type === 'stairs') {
                 nextFloor();
                 return;
            }
        } else {
            player.x = targetX;
            player.y = targetY;
        }

        processEnemyTurn();
        updateUI();
        draw();
    }

    function attackEnemy(enemy) {
        enemy.hp--;
        playSound('hit');
        if (enemy.hp <= 0) removeEntity(enemy);
    }

    function removeEntity(e) {
        const idx = entities.indexOf(e);
        if (idx > -1) entities.splice(idx, 1);
    }

    function processEnemyTurn() {
        entities.forEach(e => {
            if (e.type === 'enemy') {
                const dist = Math.abs(player.x - e.x) + Math.abs(player.y - e.y);
                if (dist === 1) {
                    player.hp--;
                    playSound('hurt');
                    checkGameOver();
                } else {
                     let dx = 0, dy = 0;
                     if (Math.abs(player.x - e.x) > Math.abs(player.y - e.y)) {
                         dx = player.x > e.x ? 1 : -1;
                     } else {
                         dy = player.y > e.y ? 1 : -1;
                     }
                     if (!getEntityAt(e.x + dx, e.y + dy) && !(e.x + dx === player.x && e.y + dy === player.y)) {
                          e.x += dx; e.y += dy;
                     }
                }
            }
        });
    }

    function nextFloor() {
        floor++;
        playSound('stairs');
        generateLevel();
        updateUI();
        draw();
    }

    function checkGameOver() {
        if (player.hp <= 0) {
            isPlaying = false;
            playSound('over');
            
            let msg = `到達フロア: B${floor}`;
            if (floor > bestFloor) {
                bestFloor = floor;
                localStorage.setItem('aomagame:best:dungeon-step', bestFloor);
                msg += `<br><span style="color:#f0a500;">NEW RECORD!</span>`;
            } else {
                msg += `<br>(Best: B${bestFloor})`;
            }

            overlay.classList.remove('hidden');
            root.querySelector('h2').innerText = "GAME OVER";
            root.querySelector('p').innerHTML = `${msg}<br>お疲れ様でした！`;
            startBtn.innerText = "もう一度";
        }
    }

    function updateUI() {
        hpDisplay.innerText = `${player.hp}/${player.maxHp}`;
        floorDisplay.innerText = `B${floor}`;
        bestDisplay.innerText = `(Best:B${Math.max(floor, bestFloor)})`;
    }

    function draw() {
        ctx.fillStyle = COLORS.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        for(let y=0; y<GRID_W; y++) {
            for(let x=0; x<GRID_W; x++) {
                const px = x*TILE_SIZE, py = y*TILE_SIZE;
                ctx.fillStyle = COLORS.grid;
                ctx.strokeStyle = '#2a3855';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            }
        }

        entities.forEach(e => {
            const px = e.x*TILE_SIZE, py = e.y*TILE_SIZE;
            if (e.type === 'stairs') {
                ctx.fillStyle = COLORS.stairs;
                for(let i=0; i<3; i++) ctx.fillRect(px + 10 + i*10, py + 40 - i*10, 30, 5);
            } else if (e.type === 'potion') {
                ctx.fillStyle = COLORS.potion;
                ctx.beginPath(); ctx.arc(px + 32, py + 37, 15, 0, Math.PI*2); ctx.fill();
                ctx.fillRect(px + 28, py + 15, 8, 10);
            } else if (e.type === 'wall') {
                ctx.fillStyle = COLORS.wall;
                ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            } else if (e.type === 'enemy') {
                ctx.fillStyle = COLORS.enemy;
                ctx.beginPath(); ctx.roundRect(px + 12, py + 12, 40, 40, 10); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.moveTo(px+20, py+20); ctx.lineTo(px+28, py+28); ctx.moveTo(px+44, py+20); ctx.lineTo(px+36, py+28); ctx.stroke();
            }
        });

        const px = player.x*TILE_SIZE, py = player.y*TILE_SIZE;
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(px + 10, py + 10, 44, 44);
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 20, py + 20, 8, 8);
        ctx.fillRect(px + 36, py + 20, 8, 8);
    }

    document.addEventListener('keydown', (e) => {
        if (!isPlaying) return;
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
            ensureAudio();
            handleInput(e.key.replace('Arrow','').toLowerCase());
        }
    });

    // Play Count Logic
    function updatePlayCount() {
        const counterEl = getPlayCountEl();
        if (!counterEl) return;
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('aomagame:played:')) {
                     const val = parseInt(localStorage.getItem(key)||'0', 10);
                     if (val > 0) total++;
                }
            }
            counterEl.textContent = total;
        } catch (e) { counterEl.textContent = '0'; }
    }

    function markPlayed() {
        try {
            const current = parseInt(localStorage.getItem(PLAYED_KEY) || '0', 10);
            localStorage.setItem(PLAYED_KEY, String(current + 1));
        } catch(e) {}
        updatePlayCount();
    }

    init();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
    } else {
        updatePlayCount();
    }
})();
</script>

## 遊び方
1. **方向キー** または **画面下のボタン** でキャラクターを移動させます。
2. 敵（赤いスライム）のいるマスに移動すると **攻撃** します。
3. 敵からも攻撃を受けるので、HP（ハート）に注意してください。
4. 緑のポーションを取ると回復します。
5. **黄色い階段** に到達すると次の階層へ進みます。
6. HPが尽きるまでに何階まで降りられるか挑戦しましょう！

## 実装メモ
- 5x5グリッドのコンパクトなローグライクです。
- ターン制の移動・攻撃システムを実装しました。
- `Canvas` APIを使用して、ドット絵風のグラフィックをコードで描画しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
