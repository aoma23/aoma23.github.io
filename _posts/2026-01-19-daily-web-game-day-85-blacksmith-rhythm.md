---
title: "毎日ゲームチャレンジ Day 85: ブラックスミス・リズム (Blacksmith Rhythm)"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！

85日目は「ブラックスミス・リズム」。
伝説の武器を鍛え上げるには、正確なリズムが必要だ！
流れてくるノーツに合わせてハンマーを振り下ろし、最高の剣を打ちましょう。
カン！カン！という鍛治の音が、心地よいビートを刻みます。

<style>
#blacksmith-rhythm {
  width: 100%;
  max-width: 400px;
  margin: 24px auto;
  padding: 10px;
  border-radius: 8px;
  background: #1e1e1e;
  color: #f39c12;
  font-family: 'Verdana', sans-serif;
  box-shadow: 0 10px 20px rgba(0,0,0,0.5);
  border: 4px solid #d35400;
  position: relative;
  text-align: center;
  user-select: none;
  touch-action: manipulation;
}
#blacksmith-rhythm canvas {
  display: block;
  background-color: #000;
  margin: 0 auto;
  border: 2px solid #555;
  border-radius: 4px;
}
#blacksmith-rhythm .ui-header {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
  font-size: 1.1rem;
  font-weight: bold;
  border-bottom: 2px solid #555;
  margin-bottom: 10px;
}
#blacksmith-rhythm .overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30, 30, 30, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20;
  border-radius: 6px;
}
#blacksmith-rhythm .overlay.hidden { display: none; }
#blacksmith-rhythm h2 {
  color: #e67e22;
  margin-bottom: 10px;
  font-size: 2rem;
  text-shadow: 2px 2px 0 #000;
  font-weight: 900;
}
#blacksmith-rhythm .btn {
  background: #d35400;
  color: #fff;
  border: none;
  padding: 12px 40px;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 6px;
  margin-top: 15px;
  font-family: inherit;
  box-shadow: 0 4px 0 #a04000;
  transition: transform 0.1s;
}
#blacksmith-rhythm .btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #a04000;
}
#blacksmith-rhythm .hit-area {
  margin-top: 10px;
  padding: 20px;
  background: #2c3e50;
  border-radius: 8px;
  color: #fff;
  font-weight: bold;
  font-size: 1.2rem;
  border: 2px dashed #95a5a6;
  cursor: pointer;
  position: relative;
  z-index: 30;
}
#blacksmith-rhythm .hit-area:active {
  background: #34495e;
  border-color: #fff;
}
#blacksmith-rhythm .hit-area.hidden { display: none; }
</style>

<div id="blacksmith-rhythm">
  <div class="ui-header">
    <span>SCORE: <span id="br-score">0</span></span>
    <span>COMBO: <span id="br-combo">0</span></span>
  </div>
  
  <div style="position: relative;">
    <canvas width="360" height="400"></canvas>
    
    <div class="overlay" id="br-overlay">
      <h2>BLACKSMITH<br>RHYTHM</h2>
      <p style="color:#ccc; margin-bottom:15px; line-height:1.6;">
        リズムに合わせて鍛えろ！<br>
        ノーツが下の判定ラインに重なる瞬間に<br>
        タップ (または SPACEキー) です。<br>
        <br>
        音楽に合わせてハンマーを叩け！
      </p>
      <button class="btn" id="br-start-btn">FORGE!</button>
    </div>
  </div>

  <div class="hit-area" id="br-hit-btn">TAP HERE (HIT!)</div>
  <p style="font-size:0.8rem; color:#777; margin-top:5px;">Desktop: SPACE / Mobile: TAP</p>
</div>

<script>
(() => {
    const root = document.querySelector('#blacksmith-rhythm');
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = root.querySelector('#br-score');
    const comboEl = root.querySelector('#br-combo');
    const overlay = root.querySelector('#br-overlay');
    const startBtn = root.querySelector('#br-start-btn');
    const hitBtn = root.querySelector('#br-hit-btn');
    const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

    const PLAYED_KEY = 'aomagame:played:blacksmith-rhythm';

    // Game Config
    const BPM = 120;
    const NOTE_SPEED = 250; // pixels per second
    const HIT_Y = 320;
    const SPAWN_Y = -20;
    
    // State
    // let notes = []; // { time: float (seconds), type: 'normal', hit: bool }
    let noteQueue = [];
    let isPlaying = false;
    let startTime = 0;
    let score = 0;
    let combo = 0;
    let maxCombo = 0;
    
    // Audio Context
    let ac = null;
    let nextNoteTime = 0;
    let beatCount = 0;
    
    // Visuals
    let hammerY = HIT_Y - 50;
    let sparks = [];
    let message = "";
    let messageTimer = 0;

    function init() {
        startBtn.addEventListener('click', startGame);
        // Input
        document.addEventListener('keydown', e => {
            if (e.code === 'Space') {
                e.preventDefault();
                processHit();
            }
        });
        hitBtn.addEventListener('mousedown', (e) => { e.preventDefault(); processHit(); });
        hitBtn.addEventListener('touchstart', (e) => { e.preventDefault(); processHit(); }, {passive:false});
        
        hitBtn.classList.add('hidden');
    }

    function initAudio() {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return false;
        if (!ac) ac = new C();
        if (ac.state === 'suspended') ac.resume().catch(()=>{});
        return true;
    }

    function playSound(type) {
        if (!ac) return;
        const t = ac.currentTime;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);

        if (type === 'hit') {
            // Anvil Clang
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
            
            // Add some metallic harmonics
            const osc2 = ac.createOscillator();
            const g2 = ac.createGain();
            osc2.connect(g2);
            g2.connect(ac.destination);
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(2450, t);
            g2.gain.setValueAtTime(0.1, t);
            g2.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
            osc2.start(t);
            osc2.stop(t+0.2);
            
        } else if (type === 'miss') {
            // Dull thud
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } else if (type === 'kick') {
            // Metronome kick
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.1);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        }
    }

    function startGame() {
        if(!initAudio()) return;
        
        isPlaying = true;
        score = 0;
        combo = 0;
        maxCombo = 0;
        scoreEl.textContent = "0";
        comboEl.textContent = "0";
        overlay.classList.add('hidden');
        hitBtn.classList.remove('hidden');
        markPlayed();
        
        noteQueue = [];
        sparks = [];
        startTime = ac.currentTime + 0.5; // Start shortly
        nextNoteTime = startTime;
        beatCount = 0;
        
        scheduleNotes();
        loop();
    }
    
    function scheduleNotes() {
        // Scheduler loop
        // Fill noteQueue up to 5 seconds ahead
        const lookahead = 5.0; 
        const interval = 60 / BPM; 
        
        if (!isPlaying) return;
        
        while (nextNoteTime < ac.currentTime + lookahead) {
            // Generate pattern
            // Every beat? Or some rhythm?
            // Simple: 4 beats, but randomize some off-beats
            // Simple: 4 beats, but randomize some off-beats
            let time = nextNoteTime; // Define time here!
            
            // Rhythm Logic with 8th notes (Harder)
            const sixteenths = beatCount % 16; // 4 beats * 4 sixteenths? No, let's stick to 8th notes.
            // Half beat step?
            // actually interval is beat (quarter note).
            // We want to check possibility of notes in between.
            
            // Simpler: random chance on every Step.
            // But we need to increment time.
            
            // To support 8ths, we just loop faster? 
            // Let's keep loop as is but add extra note logic.
            
            let isNote = false;
            let b = beatCount % 4;
            
            // Downbeats always (almost)
            if (b === 0) isNote = true;
            else if (Math.random() < 0.5) isNote = true; // High chance on quarters
            
            // 8th note check (Off-beat)
            // Add a note halfway to next beat?
            if (Math.random() < 0.3) {
                 noteQueue.push({
                    spawnTime: time + (interval/2),
                    hit: false,
                    visible: true,
                    type: 'sub'
                });
            }
            
            // Force break sometimes? No, continuous is better for now.
            
            // Schedule Metronome sound
            // let time = nextNoteTime; // MOVED UP
            // We don't play metronome here, we rely on user actions mostly, 
            // but maybe a background beat helps. 
            // Let's create a background beat oscillator node? 
            // Better: just play sound at time.
            const osc = ac.createOscillator();
            const g = ac.createGain();
            osc.connect(g);
            g.connect(ac.destination);
            osc.frequency.setValueAtTime(100, time);
            osc.frequency.exponentialRampToValueAtTime(50, time + 0.1);
            g.gain.setValueAtTime(0.1, time); // Quiet metronome
            g.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            osc.start(time);
            osc.stop(time + 0.1);

            if (isNote) {
                noteQueue.push({
                    spawnTime: time, // The time it SHOULD be hit
                    hit: false,
                    visible: true
                });
            }
            
            nextNoteTime += interval;
            beatCount++;
            
            // End game after some beats?
            if (beatCount > 120) { // 1 min approx
                endGame(true);
                return;
            }
        }
        
        if (isPlaying && beatCount <= 120) {
            setTimeout(scheduleNotes, 500);
        }
    }

    function processHit() {
        if (!isPlaying || !ac) return;
        
        const now = ac.currentTime;
        // Find closest unhit note
        // Window: +/- 0.15s (150ms)
        
        let hitNote = null;
        let minDiff = 0.2; // Max window
        
        // Only look at the first few notes
        for (let i=0; i<Math.min(noteQueue.length, 5); i++) {
            const note = noteQueue[i];
            if (note.hit) continue;
            
            const diff = Math.abs(note.spawnTime - now);
            if (diff < minDiff) {
                hitNote = note;
                minDiff = diff;
                // Don't break immediately, find absolute closest? 
                // Usually first one in queue is best candidate due to time ordering.
                break;
            }
        }
        
        if (hitNote) {
            // HIT
            hitNote.hit = true;
            hitNote.visible = false;
            
            let points = 100;
            let timeDiff = Math.abs(hitNote.spawnTime - now);
            let grade = "GOOD";
            
            if (timeDiff < 0.05) {
                points = 300;
                grade = "PERFECT!!";
                createSparks(HIT_Y, 20);
                playSound('hit'); 
            } else {
                grade = "GREAT";
                points = 100;
                createSparks(HIT_Y, 10);
                playSound('hit');
            }
            
            // Visual feedback
            hammerAnim = 5; 
            
            score += points + (combo * 10);
            combo++;
            if (combo > maxCombo) maxCombo = combo;
            scoreEl.textContent = score;
            comboEl.textContent = combo;
            
            message = grade;
            messageTimer = 20;
            
        } else {
            // MISS (Bad timing spam)
            combo = 0;
            comboEl.textContent = combo;
            playSound('miss');
            message = "MISS";
            messageTimer = 20;
        }
    }
    
    // Animation Vars
    let hammerAnim = 0; 

    function update() {
        if (!isPlaying) return;
        
        const now = ac.currentTime;
        
        // Check for missed notes (passed by)
        // If note.spawnTime < now - 0.2 and not hit -> Miss
        
        // We need to iterate carefully since we might remove from front
        while (noteQueue.length > 0) {
            if (noteQueue[0].hit) {
                noteQueue.shift(); // Remove processed
                continue;
            }
            if (noteQueue[0].spawnTime < now - 0.2) {
                // Missed
                noteQueue.shift();
                combo = 0;
                comboEl.textContent = combo;
                message = "MISS";
                messageTimer = 20;
                continue;
            }
            break; 
        }
        
        if (beatCount > 120 && noteQueue.length === 0) {
            endGame(true);
        }
    }
    
    function createSparks(y, count) {
        for(let i=0; i<count; i++) {
            sparks.push({
                x: canvas.width/2,
                y: y,
                vx: (Math.random()-0.5)*15,
                vy: (Math.random()-1.0)*15,
                life: 1.0
            });
        }
    }
    
    function draw() {
        // Clear
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw Sword in Background (evolving)
        ctx.save();
        ctx.globalAlpha = 0.5; // More visible
        drawSword(ctx, getRank(score));
        ctx.restore();
        
        const now = ac ? ac.currentTime : 0;
        
        // Target Line (Anvil)
        ctx.fillStyle = '#555';
        ctx.fillRect(canvas.width/2 - 40, HIT_Y, 80, 40); // Anvil Base
        // Glow line
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(0, HIT_Y + 18, canvas.width, 4);
        
        // Draw Notes
        ctx.textAlign = 'center';
        
        // Note Y = HIT_Y - (noteTime - now) * speed
        // If noteTime > now, Y < HIT_Y (coming from top)
        
        noteQueue.forEach(note => {
            if (!note.visible) return;
            
            const timeDiff = note.spawnTime - now; // Positive means future
            // Falls from top
            // spawnTime is when it hits HIT_Y
            // y = HIT_Y - timeDiff * speed
            
            const y = HIT_Y - (timeDiff * NOTE_SPEED);
            
            if (y > -50 && y < canvas.height + 50) {
                // Draw Ingot
                ctx.fillStyle = '#f39c12'; // Hot orange
                // Glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#e67e22';
                ctx.fillRect(canvas.width/2 - 25, y - 15, 50, 30);
                ctx.shadowBlur = 0;
                
                // Outline
                ctx.strokeStyle = '#fff';
                ctx.strokeRect(canvas.width/2 - 25, y - 15, 50, 30);
            }
        });
        
        // Hammer
        // Resting pos: x-50, y-50?
        // Hit pos: Center
        
        let hx = canvas.width/2 + 60;
        let hy = HIT_Y - 40;
        let rot = 0; // Rads
        
        if (hammerAnim > 0) {
            // Striking pose
            rotation = -0.5; // Hit down
            hx -= 20;
            hy += 20;
            hammerAnim--;
        } else {
            rotation = 0.5; // Raised
        }
        
        ctx.save();
        ctx.translate(canvas.width/2 + 60, HIT_Y - 20); // Pivot point
        ctx.rotate(rotation);
        
        // Hammer Head
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(-60, -20, 50, 40);
        // Handle
        ctx.fillStyle = '#8e44ad'; // Wood color-ish? No, brown.
        ctx.fillStyle = '#A0522D';
        ctx.fillRect( -10, -10, 100, 20);
        
        ctx.restore();

        // Sparks
        for(let i=sparks.length-1; i>=0; i--) {
            let s = sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 1; // Gravity
            s.life -= 0.05;
            
            if (s.life <= 0) {
                sparks.splice(i, 1);
                continue;
            }
            
            ctx.globalAlpha = s.life;
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(s.x, s.y, 4, 4);
            ctx.globalAlpha = 1.0;
        }

        // Message
        if (messageTimer > 0) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 30px Verdana';
            ctx.shadowColor = '#f39c12';
            ctx.shadowBlur = 10;
            ctx.fillText(message, canvas.width/2, 100);
            ctx.shadowBlur = 0;
            messageTimer--;
            if (messageTimer===0) message="";
        }
    }
    
    function getRank(s) {
        if (s >= 50000) return "Universe Sword";
        if (s >= 40000) return "God Slayer";
        if (s >= 30000) return "Legendary Blade";
        if (s >= 20000) return "Golden Sword";
        if (s >= 10000) return "Steel Sword";
        return "Rusty Sword";
    }

    function getRankColor(rank) {
        if (rank === "Universe Sword") return "#ff00ff"; // Magenta
        if (rank === "God Slayer") return "#e74c3c"; // Red
        if (rank === "Legendary Blade") return "#00efff";
        if (rank === "Golden Sword") return "#f1c40f";
        if (rank === "Steel Sword") return "#bdc3c7";
        return "#7f8c8d";
    }

    function drawSword(ctx, rank) {
        const w = canvas.width;
        const h = canvas.height;
        const cx = w/2;
        const cy = h/2 - 20; // Slightly up
        
        ctx.save();
        ctx.translate(cx, cy);
        // Vertical sword looks better for background?
        // Or keep diagonal. Diagonal is cool.
        // Let's make it vertical to fit better between notes? 
        // No, notes fall center. Sword should be center background.
        // Let's keep diagonal but maybe scale it up.
        ctx.scale(1.5, 1.5);
        ctx.rotate(Math.PI / 4); 
        
        // Blade Color
        let bladeColor = "#555";
        let edgeColor = "#777";
        let hiltColor = "#444";
        let glow = false;
        let lightning = false;
        
        if (rank === "Universe Sword") {
             bladeColor = "#220033"; edgeColor = "#ff00ff"; hiltColor = "#00efff"; glow = true; lightning = true;
        } else if (rank === "God Slayer") {
            bladeColor = "#e74c3c"; edgeColor = "#8e44ad"; hiltColor = "#2c3e50"; glow = true; lightning = true;
        } else if (rank === "Legendary Blade") {
            bladeColor = "#2980b9"; edgeColor = "#00efff"; hiltColor = "#f1c40f"; glow = true;
        } else if (rank === "Golden Sword") {
            bladeColor = "#f39c12"; edgeColor = "#f1c40f"; hiltColor = "#c0392b";
        } else if (rank === "Steel Sword") {
            bladeColor = "#95a5a6"; edgeColor = "#ecf0f1"; hiltColor = "#2c3e50";
        }
        
        if (glow) {
            ctx.shadowBlur = 20;
            if (rank === "God Slayer") ctx.shadowBlur = 40; 
            if (rank === "Universe Sword") { ctx.shadowBlur = 60; ctx.shadowColor = "#ff00ff"; }
            else ctx.shadowColor = edgeColor;
        }
        
        // Blade
        ctx.fillStyle = bladeColor;
        ctx.beginPath();
        ctx.moveTo(-10, -80);
        ctx.lineTo(-15, 80); // Base
        ctx.lineTo(0, 120); // Tip
        ctx.lineTo(15, 80);
        ctx.lineTo(10, -80);
        ctx.fill();
        
        // Edge
        ctx.fillStyle = edgeColor;
        ctx.beginPath();
        ctx.moveTo(0, -80);
        ctx.lineTo(0, 120);
        ctx.lineTo(5, 80);
        ctx.lineTo(5, -80);
        ctx.fill();
        
        // Crossguard
        ctx.shadowBlur = 0;
        ctx.fillStyle = hiltColor;
        ctx.fillRect(-40, -80, 80, 15);
        
        // Grip
        ctx.fillStyle = "#3e2723";
        ctx.fillRect(-8, -130, 16, 50);
        
        // Pommel
        ctx.fillStyle = hiltColor;
        ctx.beginPath();
        ctx.arc(0, -135, 12, 0, Math.PI*2);
        ctx.fill();
        
        // Lightning Effect
        if (lightning) {
             ctx.strokeStyle = "#f1c40f";
             ctx.lineWidth = 2;
             ctx.shadowColor = "#fff";
             ctx.shadowBlur = 10;
             
             for(let i=0; i<3; i++) {
                 ctx.beginPath();
                 let ly = -100;
                 ctx.moveTo((Math.random()-0.5)*20, ly);
                 while(ly < 100) {
                     let nx = (Math.random()-0.5)*40;
                     let ny = ly + 20 + Math.random()*20;
                     ctx.lineTo(nx, ny);
                     ly = ny;
                 }
                 ctx.stroke();
             }
        }
        
        ctx.restore();
    }
    
    function endGame(win) {
        isPlaying = false;
        overlay.classList.remove('hidden');
        hitBtn.classList.add('hidden');
        
        const r = getRank(score);
        const c = getRankColor(r);
        
        // Layout: Text Top/Bottom, Center Clear
        root.querySelector('h2').innerText = "FINISH!";
        // Use styled paragraph to position text at top/bottom of overlay?
        // Or just clear background.
        overlay.style.backgroundColor = "rgba(0,0,0,0.6)"; 
        overlay.style.justifyContent = "space-between";
        overlay.style.padding = "20px 0";
        
        root.querySelector('p').innerHTML = 
            `<div style="margin-top:20px;">Score: ${score}<br>Max Combo: ${maxCombo}</div>` + 
            `<div style="margin-bottom:20px;"><span style="color:${c};font-size:1.8rem;text-shadow:0 0 10px ${c}">${r}</span></div>`;
            
        startBtn.innerText = "RETRY";
        startBtn.style.visibility = 'hidden'; // Prevent instant click
        
        // Draw Sword on Canvas after a moment
        ctx.fillStyle = "#111";
        ctx.fillRect(0,0,canvas.width, canvas.height);
        drawSword(ctx, r);
        
        setTimeout(() => {
            startBtn.style.visibility = 'visible';
        }, 1000);
        
        if (combo > maxCombo) maxCombo = combo;
    }
    
    function loop() {
        if (isPlaying) {
            update();
            draw();
            requestAnimationFrame(loop);
        }
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
1. ゲームを開始するとノーツ（赤熱した鉄）が上から降ってきます。
2. ノーツが下の **赤いライン（アンビル）** に重なった瞬間に **タップ** または **Spaceキー** を押してください。
3. タイミングよく叩くと高得点！連続で成功させてコンボを繋ぎましょう。
4. 単純なビートだけでなく、たまに裏拍で来るので注意！

## 実装メモ
- Web Audio APIを使用した正確なリズムスケジューリング（Lookaheadスケジューラ）。
- BGMや効果音も全てコード（Oscillator）で生成。
- Canvasによるハンマーアニメーションとパーティクルシステム。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
