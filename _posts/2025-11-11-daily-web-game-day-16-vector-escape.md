---
title: "毎日ゲームチャレンジ Day 16: ネビュラ・シューター"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-15-sound-memory/' | relative_url }}">サウンドメモリー</a>

16日目は自動生成されるドローンを撃ち落とす「ネビュラ・シューター」。スタートすると上空から次々と敵が降ってくるので、砲台をドラッグして位置を合わせ、タイミングよくショットを放って迎撃します。連続ヒットでボーナスが膨らみ、30秒の間にどれだけ撃破数を伸ばせるかが勝負。ラウンド中に1度だけ放てる全体攻撃「オーバードライブ」をどこで使うかもポイントです。

<style>
#nebula-shooter {
  max-width: 520px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0b1220, #16233b);
  color: #f8fafc;
  box-shadow: 0 28px 44px rgba(6, 11, 23, 0.55);
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#nebula-shooter .hud {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
  font-weight: 700;
}
#nebula-shooter .arena {
  position: relative;
  width: min(94vw, 340px);
  aspect-ratio: 3 / 4;
  margin: 0 auto 18px;
  border-radius: 26px;
  background: radial-gradient(circle at top, rgba(56, 189, 248, 0.25), rgba(15, 23, 42, 0.95));
  overflow: hidden;
  touch-action: none;
  border: 1px solid rgba(148, 163, 184, 0.15);
}
#nebula-shooter .arena.flash {
  animation: nebula-flash 0.5s ease;
}
@keyframes nebula-flash {
  0% { box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
  50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.35); }
  100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
}
#nebula-shooter .turret {
  position: absolute;
  bottom: 18px;
  left: 50%;
  width: 48px;
  height: 28px;
  border-radius: 14px;
  background: linear-gradient(180deg, #38bdf8, #0ea5e9);
  transform: translateX(-50%);
  box-shadow: 0 12px 26px rgba(14, 165, 233, 0.45);
}
#nebula-shooter .turret::after {
  content: '';
  position: absolute;
  top: -18px;
  left: 50%;
  width: 14px;
  height: 24px;
  border-radius: 6px 6px 2px 2px;
  background: #f8fafc;
  transform: translateX(-50%);
}
#nebula-shooter .enemy,
#nebula-shooter .bullet {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  pointer-events: none;
}
#nebula-shooter .enemy {
  background: radial-gradient(circle, #f97316, #c2410c);
  box-shadow: 0 12px 22px rgba(249, 115, 22, 0.45);
}
#nebula-shooter .bullet {
  width: 12px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #a855f7, #7c3aed);
  box-shadow: 0 0 18px rgba(168, 85, 247, 0.65);
}
#nebula-shooter .controls {
  display: flex;
  justify-content: center;
  gap: 12px;
}
#nebula-shooter .start,
#nebula-shooter .skill {
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 32px rgba(34, 211, 238, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#nebula-shooter .start {
  background: #22d3ee;
}
#nebula-shooter .skill {
  background: #f97316;
  box-shadow: 0 18px 32px rgba(249, 115, 22, 0.35);
  color: #0b1220;
}
#nebula-shooter .start:hover:not(:disabled),
#nebula-shooter .skill:hover:not(:disabled) {
  transform: translateY(-1px);
}
#nebula-shooter .start:disabled,
#nebula-shooter .skill:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#nebula-shooter .log {
  margin-top: 16px;
  text-align: center;
  font-size: 0.95rem;
}
#nebula-shooter .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#nebula-shooter .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(249, 115, 22, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#nebula-shooter .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(249, 115, 22, 0.45);
}
#nebula-shooter .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="nebula-shooter">
  <div class="hud">
    <span class="time">残り:30.0 秒</span>
    <span class="score">撃破: 0</span>
    <span class="misses">突破: 0</span>
    <span class="best">ベスト:--</span>
  </div>
  <div class="arena">
    <div class="turret"></div>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
    <button type="button" class="skill" disabled>オーバードライブ</button>
  </div>
  <p class="log">スタートで砲台が起動。ドラッグで位置を合わせ、タップでショット！オーバードライブは1回だけ。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('nebula-shooter');
  if (!root) {
    return;
  }

  const arenaEl = root.querySelector('.arena');
  const turretEl = root.querySelector('.turret');
  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const missesEl = root.querySelector('.misses');
  const startButton = root.querySelector('.start');
  const skillButton = root.querySelector('.skill');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:nebula-shooter';
  const playedKey = 'aomagame:played:nebula-shooter';
  const sessionLength = 30; // 秒
  const maxMiss = 5;

  let bullets = [];
  let enemies = [];
  let running = false;
  let animationId = null;
  let lastTimestamp = 0;
  let remaining = sessionLength;
  let spawnTimer = 0;
  let score = 0;
  let misses = 0;
  let bestScore = null;
  let storageAvailable = false;
  let arenaWidth = 0;
  let arenaHeight = 0;
  let turretX = 0;
  let pointerActive = false;
  let lastShotTime = 0;
  let skillAvailable = false;
  let combo = 0;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomBetween = (min, max) => Math.random() * (max - min) + min;

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
    if (!storageAvailable) {
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

  const detectStorage = () => {
    try {
      const testKey = `${storageKey}-test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      storageAvailable = true;
    } catch (error) {
      storageAvailable = false;
    }
  };

  const loadBest = () => {
    if (!storageAvailable) {
      return;
    }
    const storedBest = localStorage.getItem(storageKey);
    if (storedBest) {
      const value = Number.parseInt(storedBest, 10);
      if (!Number.isNaN(value) && value >= 0) {
        bestScore = value;
      }
    }
    updateHud();
  };

  const saveBest = () => {
    if (!storageAvailable || bestScore === null) {
      return;
    }
    localStorage.setItem(storageKey, String(bestScore));
  };

  const updateHud = () => {
    timeEl.textContent = `残り:${remaining.toFixed(1)} 秒`;
    scoreEl.textContent = `撃破: ${score}`;
    missesEl.textContent = `突破: ${misses}/${maxMiss}`;
    bestEl.textContent = `ベスト:${bestScore === null ? '--' : bestScore}`;
    shareButton.disabled = bestScore === null;
  };

  const updateSkillButton = () => {
    if (!skillButton) {
      return;
    }
    if (!running) {
      skillButton.disabled = true;
      skillButton.textContent = 'オーバードライブ';
      return;
    }
    skillButton.disabled = !skillAvailable;
    skillButton.textContent = skillAvailable ? 'オーバードライブ' : '使用済み';
  };

  const resetArena = () => {
    bullets.forEach((b) => b.el.remove());
    enemies.forEach((e) => e.el.remove());
    bullets = [];
    enemies = [];
  };

  const resetCombo = (message) => {
    if (combo === 0) {
      return;
    }
    combo = 0;
    if (message) {
      logEl.textContent = message;
    }
    updateHud();
  };

  const registerHit = ({ source = 'shot', silent = false } = {}) => {
    combo += 1;
    const bonus = Math.max(0, combo - 1);
    const gained = 1 + bonus;
    score += gained;
    if (!silent) {
      const prefix = source === 'skill' ? 'オーバードライブ！' : '撃破！';
      const bonusText = bonus > 0 ? `（ボーナス +${bonus}）` : '';
      logEl.textContent = `${prefix}${combo} 連続：+${gained}pt ${bonusText}`.trim();
    }
    updateHud();
    return { gained, bonus };
  };

  const spawnEnemy = () => {
    const enemyEl = document.createElement('div');
    enemyEl.className = 'enemy';
    const x = randomBetween(20, arenaWidth - 20);
    const speed = randomBetween(60, 110);
    const enemy = { el: enemyEl, x, y: -30, speed };
    enemies.push(enemy);
    arenaEl.appendChild(enemyEl);
    enemyEl.style.left = `${enemy.x - 14}px`;
    enemyEl.style.top = `${enemy.y - 14}px`;
  };

  const spawnBullet = () => {
    const now = performance.now();
    if (now - lastShotTime < 160) {
      return;
    }
    lastShotTime = now;
    const bulletEl = document.createElement('div');
    bulletEl.className = 'bullet';
    const bullet = { el: bulletEl, x: turretX, y: arenaHeight - 40, speed: 420 };
    bullets.push(bullet);
    arenaEl.appendChild(bulletEl);
    bulletEl.style.left = `${bullet.x - 6}px`;
    bulletEl.style.top = `${bullet.y - 9}px`;
  };

  const removeEnemy = (enemy) => {
    enemies = enemies.filter((item) => item !== enemy);
    enemy.el.remove();
  };

  const removeBullet = (bullet, reason) => {
    bullets = bullets.filter((item) => item !== bullet);
    bullet.el.remove();
    if (reason === 'miss') {
      resetCombo('弾が外れてコンボがリセット…。焦らず狙いを定めよう。');
    }
  };

  const distance = (aX, aY, bX, bY) => {
    const dx = aX - bX;
    const dy = aY - bY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const finishGame = (reason) => {
    running = false;
    pointerActive = false;
    skillAvailable = false;
    resetCombo();
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    updateSkillButton();
    if (reason === 'time') {
      logEl.textContent = `タイムアップ！撃破数は ${score}。さらに精度を高めよう。`;
    } else if (reason === 'breach') {
      logEl.textContent = `敵が基地に到達… 撃破 ${score}。再挑戦で守り切ろう！`;
    }
    if (bestScore === null || score > bestScore) {
      bestScore = score;
      saveBest();
      shareButton.disabled = false;
      logEl.textContent += ' ベストスコアを更新！';
    }
    updateHud();
  };

  const triggerArenaFlash = () => {
    arenaEl.classList.add('flash');
    setTimeout(() => {
      arenaEl.classList.remove('flash');
    }, 400);
  };

  const activateSkill = () => {
    if (!running || !skillAvailable) {
      return;
    }
    skillAvailable = false;
    const targets = enemies.slice();
    const cleared = targets.length;
    targets.forEach((enemy) => removeEnemy(enemy));
    if (cleared > 0) {
      const bonusPerKill = Math.max(0, combo - 1);
      const gainedPerKill = 1 + bonusPerKill;
      const totalGained = cleared * gainedPerKill;
      const totalBonus = cleared * bonusPerKill;
      score += totalGained;
      logEl.textContent = `オーバードライブ発動！${cleared} 機撃破、+${totalGained}pt（ボーナス +${totalBonus}）。次のヒットは 1 から再開！`;
    } else {
      logEl.textContent = 'オーバードライブで空域を制圧！敵が来たらすぐ狙おう。';
    }
    combo = 0;
    updateHud();
    triggerArenaFlash();
    updateSkillButton();
  };

  const updateTurret = (event) => {
    const rect = arenaEl.getBoundingClientRect();
    arenaWidth = rect.width;
    arenaHeight = rect.height;
    const x = clamp(event.clientX - rect.left, 24, arenaWidth - 24);
    turretX = x;
    turretEl.style.left = `${turretX}px`;
  };

  const handlePointerDown = (event) => {
    if (!running) {
      return;
    }
    pointerActive = true;
    arenaEl.setPointerCapture?.(event.pointerId);
    updateTurret(event);
    spawnBullet();
    event.preventDefault();
  };

  const handlePointerMove = (event) => {
    if (!running || !pointerActive) {
      return;
    }
    updateTurret(event);
  };

  const handlePointerUp = (event) => {
    if (!running) {
      return;
    }
    pointerActive = false;
    arenaEl.releasePointerCapture?.(event.pointerId);
  };

  const updateGame = (timestamp) => {
    if (!running) {
      return;
    }
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    remaining = Math.max(0, remaining - delta);
    spawnTimer -= delta;
    if (spawnTimer <= 0) {
      spawnEnemy();
      spawnTimer = randomBetween(0.45, 1.1);
    }

    bullets.slice().forEach((bullet) => {
      bullet.y -= bullet.speed * delta;
      if (bullet.y < -20) {
        removeBullet(bullet, 'miss');
        return;
      }
      bullet.el.style.top = `${bullet.y - 9}px`;
      bullet.el.style.left = `${bullet.x - 6}px`;
    });

    enemies.slice().forEach((enemy) => {
      enemy.y += enemy.speed * delta;
      if (enemy.y > arenaHeight + 30) {
        removeEnemy(enemy);
        misses += 1;
        logEl.textContent = `敵が突破！あと ${Math.max(0, maxMiss - misses)} 体で終了。`;
        return;
      }
      enemy.el.style.top = `${enemy.y - 14}px`;
      enemy.el.style.left = `${enemy.x - 14}px`;
    });

    bullets.slice().forEach((bullet) => {
      enemies.slice().forEach((enemy) => {
        if (!bullets.includes(bullet) || !enemies.includes(enemy)) {
          return;
        }
        if (distance(bullet.x, bullet.y, enemy.x, enemy.y) < 24) {
          removeBullet(bullet);
          removeEnemy(enemy);
          registerHit();
        }
      });
    });

    updateHud();

    if (remaining <= 0) {
      finishGame('time');
      return;
    }
    if (misses >= maxMiss) {
      finishGame('breach');
      return;
    }

    animationId = requestAnimationFrame(updateGame);
  };

  const startGame = () => {
    markPlayed();
    resetArena();
    running = true;
    pointerActive = false;
    lastTimestamp = 0;
    remaining = sessionLength;
    spawnTimer = 0.2;
    score = 0;
    misses = 0;
    combo = 0;
    arenaWidth = arenaEl.clientWidth;
    arenaHeight = arenaEl.clientHeight;
    turretX = arenaWidth / 2;
    turretEl.style.left = `${turretX}px`;
    startButton.disabled = true;
    startButton.textContent = 'プレイ中…';
    logEl.textContent = 'ドラッグで砲台を移動し、タップで連射！30秒守ってコンボを繋ごう。';
    skillAvailable = true;
    updateSkillButton();
    updateHud();
    animationId = requestAnimationFrame(updateGame);
  };

  startButton.addEventListener('click', () => {
    if (running) {
      return;
    }
    startGame();
  });

  if (skillButton) {
    skillButton.addEventListener('click', () => {
      activateSkill();
    });
  }

  arenaEl.addEventListener('pointerdown', handlePointerDown);
  arenaEl.addEventListener('pointermove', handlePointerMove);
  arenaEl.addEventListener('pointerup', handlePointerUp);
  arenaEl.addEventListener('pointerleave', () => {
    pointerActive = false;
  });
  arenaEl.addEventListener('pointercancel', () => {
    pointerActive = false;
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestScore === null) {
        return;
      }
      const text = `ネビュラ・シューターで撃破数 ${bestScore} を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
  updateHud();
  updateSkillButton();
})();
</script>

## 遊び方
1. スタートで30秒間の防衛モードが開始。砲台を指やマウスで左右にスライドさせて敵の真下へ構えます。
2. アリーナ内をタップ／クリックするとショットが発射されるので、狙いをずらさずに連打して落下する敵を素早く迎撃しましょう。
3. 敵を連続で倒すほどボーナスポイントが増加しますが、弾が外れるとコンボはリセット。常に命中させ続けるのが高得点の鍵です。
4. ラウンド中に1度だけ使えるオーバードライブは敵を一掃する切り札で、現在のコンボ倍率だけ点数が乗ります（同時撃破でもコンボ数自体は増えず、使用後は次のヒットが1から再開）。
5. 5機突破されるか時間切れで終了。撃破数を伸ばし、ハイスコア更新を狙ってください。

## 実装メモ
- `requestAnimationFrame`ループで時間経過、敵生成、弾道更新、衝突判定まで一括で管理し、30fps以上でも安定するようデルタタイムを利用しています。
- ポインターイベントを使って砲台移動とショット入力を統一し、マウス／タッチどちらでも直感的に操作できるようにしました。
- 連続ヒット数をカウントしてボーナスを加算し、弾が外れた瞬間にリセットする仕組みを追加。オーバードライブもヒット数に含めつつ、使用後は自動でコンボをリセットするよう調整しました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
