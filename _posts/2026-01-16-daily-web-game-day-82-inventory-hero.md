---
title: "毎日ゲームチャレンジ Day 82: インベントリ・ヒーロー (Inventory Hero)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

82日目は「インベントリ・ヒーロー」。
冒険の準備は整理整頓から！
配られたアイテムを、カバンの中にきっちり詰め込むパズルゲームです。
隙間なく詰めて、最強の装備でダンジョンへ出発しましょう！（出発した後は想像にお任せします）

<style>
#inventory-hero {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #2c241b;
  color: #f0e6d2;
  font-family: 'Verdana', sans-serif;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #8b5a2b;
  position: relative;
  text-align: center;
  user-select: none;
  touch-action: none;
}
#inventory-hero canvas {
  display: block;
  background-color: #3e3226;
  margin: 0 auto;
  border: 2px solid #5d4037;
  border-radius: 4px;
}
#inventory-hero .ui-header {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
  font-size: 1.1rem;
  font-weight: bold;
  border-bottom: 2px solid #5d4037;
  margin-bottom: 10px;
}
#inventory-hero .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(44, 36, 27, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 6px;
}
#inventory-hero .overlay.hidden { display: none; }
#inventory-hero h2 {
  color: #eab308;
  margin-bottom: 10px;
  font-size: 2rem;
  text-shadow: 2px 2px 0 #000;
}
#inventory-hero .btn {
  background: #eab308;
  color: #2c241b;
  border: 2px solid #fff;
  padding: 12px 30px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  margin-top: 15px;
  font-family: inherit;
  box-shadow: 0 4px 0 #b45309;
  transition: transform 0.1s, box-shadow 0.1s;
}
#inventory-hero .btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #b45309;
}
#inventory-hero .msg { color: #ccc; line-height: 1.6; margin-bottom: 15px; }
</style>

<div id="inventory-hero">
  <div class="ui-header">
    <span>LEVEL: <span id="ih-level">1</span></span>
    <span style="font-size:0.9em; color:#aaa;">BEST: <span id="ih-best">1</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="360" height="480"></canvas>
    
    <div class="overlay" id="ih-overlay">
      <h2>INVENTORY HERO</h2>
      <p class="msg">
        アイテムをドラッグして<br>
        カバン(グリッド)に詰め込め！<br>
        <br>
        すべてのアイテムが入れば次へ進めます。<br>
        回転機能はありません。<br>
        整理整頓の鬼となれ！
      </p>
      <button class="btn" id="ih-start-btn">GAME START</button>
    </div>
  </div>
</div>

<script>
(() => {
    const root = document.getElementById('inventory-hero');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const levelEl = root.querySelector('#ih-level');
    const bestEl = root.querySelector('#ih-best');
    const overlay = root.querySelector('#ih-overlay');
    const startBtn = root.querySelector('#ih-start-btn');
    const msgEl = root.querySelector('.msg');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

    const PLAYED_KEY = 'aomagame:played:inventory-hero';
    const BEST_KEY = 'aomagame:best:inventory-hero';

    // Constants
    const GRID_SIZE = 6;
    const CELL_SIZE = 50;
    const GRID_OFFSET_X = 30;
    const GRID_OFFSET_Y = 20;

    // Item definitions (Relative coords, Color)
    const SHAPES = [
        // Large items only
        { id: 'shield', color: '#f59e0b', cells: [[0,0],[1,0],[0,1],[1,1]] }, // 2x2
        { id: 'sword',  color: '#cbd5e1', cells: [[0,0],[0,1],[0,2]] }, // 1x3
        { id: 'axe',    color: '#10b981', cells: [[0,0],[1,0],[1,1],[0,1],[1,2]] }, // 2x3 P-shape
        { id: 'scythe', color: '#8b5cf6', cells: [[0,0],[1,0],[2,0],[2,1]] }, // L-long (4)
        { id: 'book',   color: '#d946ef', cells: [[0,0],[1,0],[0,1]] }, // L-small (3)
        { id: 'staff',  color: '#eab308', cells: [[0,0],[0,1],[0,2],[0,3]] }, // 1x4
        { id: 'armor',  color: '#94a3b8', cells: [[1,0],[0,1],[1,1],[2,1],[1,2]] }, // Cross/Armor shape (5)
        { id: 'greatsword', color: '#ef4444', cells: [[1,0],[1,1],[0,1],[2,1],[1,2],[1,3]] }, // Big Sword (6)
    ];

    // State
    let level = 1;
    let bestLevel = parseInt(localStorage.getItem(BEST_KEY) || '1', 10);
    let grid = []; // 2D array [y][x] 0=empty, 1=filled
    let items = []; // Current items to place
    let draggingItem = null;
    let dragOffset = { x: 0, y: 0 };
    let isPlaying = false;
    
    // Audio
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

        if (type === 'pickup') {
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.linearRampToValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'drop') {
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'clear') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'fail') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    };

    function init() {
        bestEl.textContent = bestLevel;
        startBtn.addEventListener('click', startGame);
        
        // Mouse/Touch Events
        canvas.addEventListener('mousedown', onPointerDown);
        canvas.addEventListener('mousemove', onPointerMove);
        canvas.addEventListener('mouseup', onPointerUp);
        canvas.addEventListener('mouseleave', onPointerUp);
        
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onPointerDown(e.touches[0]); }, {passive:false});
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); onPointerMove(e.touches[0]); }, {passive:false});
        canvas.addEventListener('touchend', (e) => { e.preventDefault(); onPointerUp(e); }); // e for touchend is distinctive
        
        draw();
    }

    function startGame() {
        ensureAudio();
        level = 1;
        isPlaying = true;
        overlay.classList.add('hidden');
        markPlayed();
        startLevel();
    }

    function startLevel() {
        levelEl.textContent = level;
        // Reset Grid
        grid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));
        
        // Difficulty: Add Broken Slots (Obstacles)
        // Increases with level. Start from Lv2.
        if (level >= 2) {
            // formula: roughly 1 obstacle per 2 levels, max 12
            let obstacleCount = Math.min(Math.floor(level / 1.5), 12);
            for(let i=0; i<obstacleCount; i++) {
                let ox = Math.floor(Math.random() * GRID_SIZE);
                let oy = Math.floor(Math.random() * GRID_SIZE);
                grid[oy][ox] = 9; // 9 = Blocked
            }
        }

        // Generate Items
        items = [];
        generatePuzzle(level);
        
        draw();
    }

    function generatePuzzle(lv) {
        // Alg: 
        // 1. Create a virtual finished grid
        // 2. Try to fill it with random shapes until full or enough items
        // 3. Reset item positions to "Waiting Area"
        
        // Target number of items increases with level
        // Target number of items (Fewer items since they are bigger)
        const targetItems = Math.min(3 + Math.floor(lv/3), 8); 
        // Available shapes complexity
        
        // Use current grid (with obstacles) as base
        let tempGrid = grid.map(row => [...row]);
        let attempts = 0;
        let count = 0;
        
        while(count < targetItems && attempts < 100) {
            attempts++;
            // Pick random shape
            const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            
            // Try to place randomly
            // Try 10 spots for this shape
            for(let k=0; k<10; k++) {
                let tx = Math.floor(Math.random() * GRID_SIZE);
                let ty = Math.floor(Math.random() * GRID_SIZE);
                
                if (canPlace(tempGrid, baseShape.cells, tx, ty)) {
                    // Place it in tempGrid
                    placeOnGrid(tempGrid, baseShape.cells, tx, ty, 1);
                    
                    // Add to real items list, but pos is in "Waiting Area"
                    items.push({
                        ...baseShape,
                        // Initial waiting position (random scatter below grid)
                        x: 20 + Math.random() * (canvas.width - 100),
                        y: 350 + Math.random() * 80,
                        placed: false,
                        gridX: -1,
                        gridY: -1
                    });
                    count++;
                    break;
                }
            }
        }
    }

    function canPlace(g, cells, ox, oy) {
        for(let c of cells) {
            let nx = ox + c[0];
            let ny = oy + c[1];
            if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
            if (g[ny][nx] !== 0) return false;
        }
        return true;
    }

    function placeOnGrid(g, cells, ox, oy, val) {
        for(let c of cells) {
            g[oy + c[1]][ox + c[0]] = val;
        }
    }

    // Input Handling
    function onPointerDown(e) {
        if (!isPlaying) return;
        ensureAudio();
        
        const rect = canvas.getBoundingClientRect();
        // Scale handling if canvas is CSS-resized
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        // Check if hitting any item
        // Check "placed" items (on grid) first? No, actually last drawn is on top.
        // Let's iterate reverse
        
        for(let i=items.length-1; i>=0; i--) {
            const item = items[i];
            let hit = false;
            
            if (item.placed) {
                // Check grid cells logic
                // x = GRID_OFFSET_X + item.gridX * CELL_SIZE
                const screenX = GRID_OFFSET_X + item.gridX * CELL_SIZE;
                const screenY = GRID_OFFSET_Y + item.gridY * CELL_SIZE;
                
                // Simple bounding box check roughly or precise cell check
                // Precise is better
                hit = checkPixelHit(item, screenX, screenY, mx, my);
            } else {
                // Floating item
                hit = checkPixelHit(item, item.x, item.y, mx, my);
            }

            if (hit) {
                draggingItem = item;
                // Lift it
                if (item.placed) {
                    // Remove from grid occupancy
                    placeOnGrid(grid, item.cells, item.gridX, item.gridY, 0);
                    item.x = GRID_OFFSET_X + item.gridX * CELL_SIZE;
                    item.y = GRID_OFFSET_Y + item.gridY * CELL_SIZE;
                    item.placed = false;
                }
                
                dragOffset.x = mx - item.x;
                dragOffset.y = my - item.y;
                
                // Move to top of array to draw last
                items.splice(i, 1);
                items.push(item);
                
                playSound('pickup');
                draw();
                return;
            }
        }
    }

    function checkPixelHit(item, ix, iy, mx, my) {
        // ix, iy is top-left of item (0,0 cell)
        // Convert mouse to relative item coords
        const rx = mx - ix;
        const ry = my - iy;
        
        // Identify which cell
        const cx = Math.floor(rx / CELL_SIZE);
        const cy = Math.floor(ry / CELL_SIZE);
        
        // Check if this cell exists in item
        for(let c of item.cells) {
            if (c[0] === cx && c[1] === cy) return true;
        }
        return false;
    }

    function onPointerMove(e) {
        if (!draggingItem) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        
        draggingItem.x = mx - dragOffset.x;
        draggingItem.y = my - dragOffset.y;
        draw();
    }

    function onPointerUp(e) {
        if (!draggingItem) return;
        
        // Try to snap to grid
        // Item's (0,0) cell center roughly
        const cx = draggingItem.x + CELL_SIZE/2;
        const cy = draggingItem.y + CELL_SIZE/2;
        
        const gx = Math.round((draggingItem.x - GRID_OFFSET_X) / CELL_SIZE);
        const gy = Math.round((draggingItem.y - GRID_OFFSET_Y) / CELL_SIZE);
        
        // Validate placement
        if (canPlace(grid, draggingItem.cells, gx, gy)) {
            // Snap
            draggingItem.placed = true;
            draggingItem.gridX = gx;
            draggingItem.gridY = gy;
            placeOnGrid(grid, draggingItem.cells, gx, gy, 1);
            playSound('drop');
        } else {
            // Return to waiting area but close to drop point
            // Just leave x,y as is (clamp to screen)
            draggingItem.placed = false;
            playSound('drop'); // or diff sound?
        }
        
        draggingItem = null;
        draw();
        checkWin();
    }
    
    function checkWin() {
        // Win if ALL items are placed
        if (items.every(i => i.placed)) {
            playSound('clear');
            setTimeout(() => {
                // Next level
                level++;
                if (level > bestLevel) {
                    bestLevel = level;
                    localStorage.setItem(BEST_KEY, bestLevel);
                    bestEl.textContent = bestLevel;
                }
                startLevel();
            }, 500);
        }
    }

    // Drawing
    function draw() {
        // Clear
        ctx.fillStyle = '#3e3226';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Grid Area
        ctx.fillStyle = '#2c241b';
        ctx.fillRect(GRID_OFFSET_X - 4, GRID_OFFSET_Y - 4, GRID_SIZE*CELL_SIZE + 8, GRID_SIZE*CELL_SIZE + 8);
        
        // Draw Grid Lines and Cells
        for(let y=0; y<GRID_SIZE; y++) {
            for(let x=0; x<GRID_SIZE; x++) {
                const px = GRID_OFFSET_X + x*CELL_SIZE;
                const py = GRID_OFFSET_Y + y*CELL_SIZE;
                
                // Draw Obstacles
                if (grid[y][x] === 9) {
                    ctx.fillStyle = '#111'; // Dark hole
                    ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
                    ctx.strokeStyle = '#555'; // Visible cross
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(px + 4, py + 4); ctx.lineTo(px+CELL_SIZE - 4, py+CELL_SIZE - 4);
                    ctx.moveTo(px+CELL_SIZE - 4, py + 4); ctx.lineTo(px + 4, py+CELL_SIZE - 4);
                    ctx.stroke();
                }

                ctx.strokeStyle = '#5d4037';
                ctx.lineWidth = 1;
                ctx.strokeRect(px, py, CELL_SIZE, CELL_SIZE);
            }
        }
        
        // Draw Waiting Area Label
        ctx.fillStyle = '#aaa';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("LOOT PILE", canvas.width/2, 340);
        ctx.fillStyle = '#2a221a';
        ctx.fillRect(10, 350, canvas.width-20, 120);
        ctx.strokeStyle = '#5d4037';
        ctx.strokeRect(10, 350, canvas.width-20, 120);

        // Draw Items
        // Draw placed items first? No, list order is z-index logic.
        // Currently held item is at end of list (top).
        
        items.forEach(item => {
            let drawX = item.x;
            let drawY = item.y;
            
            if (item.placed && item !== draggingItem) {
                drawX = GRID_OFFSET_X + item.gridX * CELL_SIZE;
                drawY = GRID_OFFSET_Y + item.gridY * CELL_SIZE;
            }
            
            ctx.fillStyle = item.color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            
            // Draw each cell
            item.cells.forEach(c => {
                const cx = drawX + c[0]*CELL_SIZE;
                const cy = drawY + c[1]*CELL_SIZE;
                
                // Shadow
                if (item === draggingItem) {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(cx+5, cy+5, CELL_SIZE-1, CELL_SIZE-1);
                    ctx.fillStyle = item.color;
                }
                
                ctx.fillRect(cx, cy, CELL_SIZE-1, CELL_SIZE-1);
                ctx.strokeRect(cx, cy, CELL_SIZE-1, CELL_SIZE-1);
                
                // Inner highlight
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(cx, cy, CELL_SIZE-1, 10);
                ctx.fillStyle = item.color;
            });
        });
    }

    // Play Count
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
1. 画面下の「LOOT PILE」に散らばったアイテムを、上のグリッド(カバン)にドラッグ&ドロップします。
2. 他のアイテムと重ならないように綺麗に並べてください。
3. 全てのアイテムをカバンに詰め込むと Level Clear!
4. レベルが上がるとアイテムの数が増え、難易度が上がります。

## 実装メモ
- マウス/タッチ対応のドラッグ&ドロップシステム。
- グリッドのスナップ処理と衝突判定。
- アイテム配置の自動生成アルゴリズム（逆算方式：空グリッドに埋め込んでからバラす）。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
