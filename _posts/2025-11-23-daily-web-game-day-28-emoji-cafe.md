---
title: "毎日ゲームチャレンジ Day 28: エモジカフェ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-27-weight-balancer/' | relative_url }}">ウェイトバランサー</a>

28日目はカジュアルな早押しゲーム「エモジカフェ」。お客さんの注文（絵文字で表示されます）に合わせて、正しいメニューを素早くタップしましょう。シンプル操作で、スマホでも片手で楽しめます。

<style>
#emoji-cafe-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 22px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  box-shadow: 0 26px 48px rgba(15, 23, 42, 0.38);
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
  text-align: center;
}
#emoji-cafe-game .hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #emoji-cafe-game .hud {
    font-size: 0.82rem;
  }
}
#emoji-cafe-game .order-card {
  padding: 22px;
  border-radius: 20px;
  background: rgba(30, 41, 59, 0.6);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
  margin-bottom: 16px;
}
#emoji-cafe-game .order-card .customer {
  font-size: 1rem;
  color: #cbd5f5;
}
#emoji-cafe-game .order-card .emoji {
  margin-top: 8px;
  font-size: 3rem;
}
#emoji-cafe-game .order-card .label {
  margin-top: 4px;
  font-size: 1.1rem;
}
#emoji-cafe-game .menu {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 12px;
  margin: 20px 0;
}
#emoji-cafe-game .menu button {
  border: none;
  border-radius: 18px;
  padding: 16px 12px;
  background: rgba(56, 189, 248, 0.18);
  color: #f8fafc;
  font-size: 1.6rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#emoji-cafe-game .menu button span {
  display: block;
  margin-top: 6px;
  font-size: 1rem;
}
#emoji-cafe-game .menu button:hover:not(:disabled),
#emoji-cafe-game .menu button:active {
  transform: translateY(-2px);
  box-shadow: 0 20px 34px rgba(56, 189, 248, 0.35);
}
#emoji-cafe-game .menu button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#emoji-cafe-game .start-controls {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}
#emoji-cafe-game .start-controls button {
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
#emoji-cafe-game .start-controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(14, 165, 233, 0.35);
}
#emoji-cafe-game .start-controls button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#emoji-cafe-game .log {
  min-height: 24px;
  color: #f8fafc;
}
#emoji-cafe-game .share {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#emoji-cafe-game .share button {
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
#emoji-cafe-game .share button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(249, 115, 22, 0.4);
}
#emoji-cafe-game .share button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="emoji-cafe-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア:0</span>
    <span class="best">ベスト:0</span>
    <span class="streak">連続成功:0</span>
    <span class="combo">スピードボーナス: x1.0</span>
  </div>
  <div class="start-controls">
    <button type="button" class="start">オープン！</button>
  </div>
  <div class="order-card">
    <p class="customer">お客さんの注文</p>
    <p class="emoji">🙂</p>
    <p class="label">スタートで注文を受け付けます</p>
  </div>
  <div class="menu">
    <button type="button" data-id="coffee">☕<span>コーヒー</span></button>
    <button type="button" data-id="pizza">🍕<span>ピザ</span></button>
    <button type="button" data-id="sushi">🍣<span>お寿司</span></button>
    <button type="button" data-id="cake">🍰<span>ケーキ</span></button>
  </div>
  <p class="log">タップで注文を届けます。正しいメニューを選びましょう！</p>
  <div class="share">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('emoji-cafe-game');
  if (!root) {
    return;
  }

  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const comboEl = root.querySelector('.combo');
  const orderEmojiEl = root.querySelector('.order-card .emoji');
  const orderLabelEl = root.querySelector('.order-card .label');
  const menuButtons = Array.from(root.querySelectorAll('.menu button'));
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:emoji-cafe';

  const enableShare = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = state.best === 0;
  };
  const playedKey = 'aomagame:played:emoji-cafe';

  const menuItems = [
    { id: 'coffee', label: 'コーヒー', emoji: '☕' },
    { id: 'pizza', label: 'ピザ', emoji: '🍕' },
    { id: 'sushi', label: 'お寿司', emoji: '🍣' },
    { id: 'cake', label: 'ケーキ', emoji: '🍰' },
    { id: 'ramen', label: 'ラーメン', emoji: '🍜' },
    { id: 'burger', label: 'バーガー', emoji: '🍔' },
    { id: 'ice', label: 'アイス', emoji: '🍦' },
    { id: 'juice', label: 'ジュース', emoji: '🧃' }
  ];

  const state = {
    running: false,
    timeLimit: 60,
    startTime: 0,
    timerId: null,
    currentOrder: null,
    score: 0,
    best: 0,
    streak: 0,
    comboLevel: 1,
    lastOrderTime: performance.now(),
    storageAvailable: false
  };

  let audioCtx = null;
  const soundMap = {
    start: { frequency: 520, duration: 0.18, gain: 0.22 },
    correct: { frequency: 780, duration: 0.16, gain: 0.22 },
    miss: { frequency: 260, duration: 0.22, gain: 0.24 }
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


  const applyPenalty = () => {
    const penaltySeconds = 10;
    state.startTime -= penaltySeconds * 1000;
    const elapsed = (performance.now() - state.startTime) / 1000;
    const remaining = Math.max(0, state.timeLimit - elapsed);
    if (remaining <= 0) {
      timeEl.textContent = '残り: 0.0 秒';
      endGame();
      return true;
    }
    return false;
  };
  const playTone = (type) => {
    const ctx = ensureAudio();
    if (!ctx) {
      return;
    }
    const { frequency, duration, gain } = soundMap[type] ?? soundMap.correct;
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
      enableShare();
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
    scoreEl.textContent = `スコア:${state.score}`;
    bestEl.textContent = `ベスト:${state.best}`;
    streakEl.textContent = `連続成功:${state.streak}`;
    comboEl.textContent = `スピードボーナス: x${state.comboLevel.toFixed(1)}`;
  };

  const enableMenu = (enabled) => {
    menuButtons.forEach((button) => {
      button.disabled = !enabled;
    });
  };

  const pickOrder = () => {
    const shuffled = [...menuItems].sort(() => Math.random() - 0.5);
    state.currentOrder = shuffled[0];
    state.lastOrderTime = performance.now();
    orderEmojiEl.textContent = state.currentOrder.emoji;
    orderLabelEl.textContent = `${state.currentOrder.label} をお届け！`;

    const candidates = shuffled.slice(0, 4).sort(() => Math.random() - 0.5);
    menuButtons.forEach((button, index) => {
      const item = candidates[index];
      button.dataset.id = item.id;
      button.innerHTML = `${item.emoji}<span>${item.label}</span>`;
    });
  };

  const endGame = () => {
    state.running = false;
    if (state.timerId !== null) {
      cancelAnimationFrame(state.timerId);
      state.timerId = null;
    }
    enableMenu(false);
    startButton.disabled = false;
    orderEmojiEl.textContent = '🙂';
    orderLabelEl.textContent = 'お疲れさまでした！';
    setLog(`閉店！スコア ${state.score}、連続成功 ${state.streak} でした。`);
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
      updateHud();
    }
    enableShare();
  };

  const tick = () => {
    if (!state.running) {
      return;
    }
    const elapsed = (performance.now() - state.startTime) / 1000;
    const remaining = Math.max(0, state.timeLimit - elapsed);
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    if (remaining <= 0) {
      timeEl.textContent = '残り: 0.0 秒';
      endGame();
      return;
    }
    state.timerId = requestAnimationFrame(tick);
  };

  const handleCorrect = (reaction) => {
    const bonus = Math.max(1, Math.floor((3 - reaction) * state.comboLevel));
    state.score += bonus;
    state.streak += 1;
    state.comboLevel = Math.min(3, state.comboLevel + 0.1);
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }
    playTone('correct');
    updateHud();
    enableShare();
    setLog(`Good! 現在の連続成功 ${state.streak}`);
    pickOrder();
  };

  const handleMiss = () => {
    state.comboLevel = 1;
    state.streak = 0;
    playTone('miss');
    updateHud();
    setLog('残念！オーダーを間違えました…時間が10秒減ります。');
    if (applyPenalty()) {
      return;
    }
    pickOrder();
  };

  menuButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!state.running || !state.currentOrder) {
        return;
      }
      const isCorrect = button.dataset.id === state.currentOrder.id;
      if (isCorrect) {
        const now = performance.now();
        const reaction = (now - state.lastOrderTime) / 1000;
        handleCorrect(reaction);
      } else {
        handleMiss();
      }
    });
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
    state.streak = 0;
    state.comboLevel = 1;
    updateHud();
    startButton.disabled = true;
    enableMenu(true);
    pickOrder();
    setLog('ご来店ありがとうございます！正しいメニューを素早く出しましょう。');
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
      const text = `エモジカフェでスコア ${state.best} を記録！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  detectStorage();
  loadBest();
  updateHud();
  enableMenu(false);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }
})();
</script>

## 遊び方
1. スタート（オープン）を押すと60秒間の営業開始。表示された注文(絵文字)に合うメニューをタップします。
2. 正解すると次の注文が届き、連続成功でスコア倍率が上がります。間違えると倍率がリセットされ、残り時間が10秒減ります。
3. ハイスコアは自動保存。テンポよくオーダーをさばいて、友だちにスコアを共有しましょう。

## 実装メモ
- メニュー候補をシャッフルして4択を生成し、正解は必ず含まれるようにしています。
- スコアは反応速度をざっくり反映しつつ、連続成功で倍率を掛けて爽快感を演出。
- Web Audio API で開始／正解／ミスのトーンを再生し、タッチ操作でもフィードバックが得られるようにしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
