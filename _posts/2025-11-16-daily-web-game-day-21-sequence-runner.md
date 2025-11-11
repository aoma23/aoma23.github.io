---
title: "毎日ゲームチャレンジ Day 21: シーケンスランナー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-20-color-balance/' | relative_url }}">カラーバランス</a>

21日目は矢印入力で走り抜ける「シーケンスランナー」。提示された矢印列を素早く入力して障害物を回避し、60秒の制限時間内にどこまでスコアを伸ばせるか挑戦します。キーボードでもスマホのタッチボタンでも遊べる、テンポの良いランゲームです。

<style>
#sequence-runner-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f172a, #312e81);
  color: #f8fafc;
  box-shadow: 0 26px 46px rgba(49, 46, 129, 0.4);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#sequence-runner-game .hud {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-weight: 700;
  margin-bottom: 16px;
}
#sequence-runner-game .track {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 18px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.08);
  min-height: 96px;
}
#sequence-runner-game .step {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  border: 2px solid rgba(248, 250, 252, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;
}
#sequence-runner-game .step.active {
  transform: translateY(-4px);
  background: rgba(56, 189, 248, 0.35);
  border-color: rgba(56, 189, 248, 0.6);
}
#sequence-runner-game .step.missed {
  background: rgba(248, 113, 113, 0.45);
  border-color: rgba(248, 113, 113, 0.8);
}
#sequence-runner-game .controls {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
#sequence-runner-game .touch-inputs {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-width: 240px;
  margin-left: auto;
  margin-right: auto;
}
#sequence-runner-game .touch-inputs button {
  width: 100%;
  padding: 14px 0;
  font-size: 1.3rem;
  border-radius: 16px;
  border: 2px solid rgba(248, 250, 252, 0.25);
  background: rgba(56, 189, 248, 0.12);
  color: #f8fafc;
  touch-action: manipulation;
}
#sequence-runner-game .touch-inputs button:active {
  background: rgba(56, 189, 248, 0.35);
  border-color: rgba(56, 189, 248, 0.6);
}
#sequence-runner-game button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#sequence-runner-game .start {
  background: #38bdf8;
  color: #0f172a;
}
#sequence-runner-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(56, 189, 248, 0.35);
}
#sequence-runner-game button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#sequence-runner-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#sequence-runner-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#sequence-runner-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbcfe8, #f472b6);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(244, 114, 182, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#sequence-runner-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(244, 114, 182, 0.45);
}
#sequence-runner-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="sequence-runner-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="streak">連続成功: 0</span>
  </div>
  <div class="track"></div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <div class="touch-inputs" aria-label="オンスクリーン入力">
    <span aria-hidden="true"></span>
    <button type="button" data-direction="↑">↑</button>
    <span aria-hidden="true"></span>
    <button type="button" data-direction="←">←</button>
    <button type="button" data-direction="↓">↓</button>
    <button type="button" data-direction="→">→</button>
  </div>
  <p class="log">スタートを押して矢印キー／WASDまたは画面の矢印ボタンで順番に入力してください。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('sequence-runner-game');
  if (!root) {
    return;
  }

  const trackEl = root.querySelector('.track');
  const startButton = root.querySelector('.start');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const timeEl = root.querySelector('.time');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const touchButtons = root.querySelectorAll('[data-direction]');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:sequence-runner';
  const playedKey = 'aomagame:played:sequence-runner';

  const arrows = ['↑', '↓', '←', '→'];
  const keyMap = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    w: '↑',
    s: '↓',
    a: '←',
    d: '→',
  };

  const timeLimit = 60;

  let sequence = [];
  let currentIndex = 0;
  let score = 0;
  let bestScore = 0;
  let streak = 0;
  let storageAvailable = false;
  let running = false;
  let timerId = null;
  let startTime = 0;
  let remaining = timeLimit;

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
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const value = Number.parseInt(stored, 10);
      if (!Number.isNaN(value) && value > 0) {
        bestScore = value;
        shareButton.disabled = false;
      }
    }
    updateHud();
  };

  const saveBest = () => {
    if (!storageAvailable || bestScore <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(bestScore));
  };

  const updateHud = () => {
    scoreEl.textContent = `スコア: ${score}`;
    bestEl.textContent = `ベスト: ${bestScore}`;
    streakEl.textContent = `連続成功: ${streak}`;
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    shareButton.disabled = bestScore <= 0;
  };

  const stopTimer = () => {
    if (timerId) {
      cancelAnimationFrame(timerId);
      timerId = null;
    }
  };

  const updateTimer = () => {
    if (!running) {
      return;
    }
    const now = performance.now();
    const elapsed = (now - startTime) / 1000;
    remaining = Math.max(0, timeLimit - elapsed);
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    if (remaining <= 0) {
      finishGame('time');
      return;
    }
    timerId = requestAnimationFrame(updateTimer);
  };

  const buildSequence = () => {
    sequence = Array.from({ length: 5 }, () => arrows[Math.floor(Math.random() * arrows.length)]);
    trackEl.innerHTML = '';
    sequence.forEach((arrow, index) => {
      const step = document.createElement('div');
      step.className = 'step';
      if (index === 0) {
        step.classList.add('active');
      }
      step.textContent = arrow;
      trackEl.appendChild(step);
    });
    currentIndex = 0;
  };

  const handleInput = (symbol) => {
    if (!running) {
      return;
    }
    const steps = Array.from(trackEl.children);
    const expected = sequence[currentIndex];
    if (symbol === expected) {
      steps[currentIndex].classList.remove('active');
      steps[currentIndex].classList.remove('missed');
      steps[currentIndex].classList.add('correct');
      currentIndex += 1;
      if (currentIndex >= sequence.length) {
        score += 1;
        streak += 1;
        if (score > bestScore) {
          bestScore = score;
          saveBest();
          shareButton.disabled = false;
        }
        logEl.textContent = '成功！次のシーケンスに進みます。';
        buildSequence();
      } else {
        steps[currentIndex].classList.add('active');
      }
    } else {
      streak = 0;
      steps[currentIndex].classList.add('missed');
      logEl.textContent = '入力ミス…シーケンスを再生成します。';
      buildSequence();
    }
    updateHud();
  };

  const finishGame = (reason) => {
    if (!running) {
      return;
    }
    running = false;
    stopTimer();
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    if (reason === 'time') {
      logEl.textContent = `タイムアップ！スコアは ${score}。休憩してからもう一走り！`;
    }
    updateHud();
  };

  const startGame = () => {
    markPlayed();
    score = 0;
    streak = 0;
    buildSequence();
    remaining = timeLimit;
    startTime = performance.now();
    stopTimer();
    timerId = requestAnimationFrame(updateTimer);
    updateHud();
    logEl.textContent = '表示された矢印を順番に入力してください。60秒以内にスコアを伸ばそう！';
    startButton.disabled = true;
    startButton.textContent = 'プレイ中…';
    running = true;
  };

  window.addEventListener('keydown', (event) => {
    const symbol = keyMap[event.key];
    if (!symbol) {
      return;
    }
    event.preventDefault();
    handleInput(symbol);
  });

  startButton.addEventListener('click', () => {
    if (running) {
      return;
    }
    startGame();
  });

  touchButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const direction = button.dataset.direction;
      if (direction) {
        handleInput(direction);
      }
    });
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestScore <= 0) {
        return;
      }
      const text = `シーケンスランナーでベスト ${bestScore} ステップを達成！ #aomagame`;
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
})();
</script>

## 遊び方
1. スタートを押すと矢印のシーケンスが表示されるので、まず順番を覚えます。
2. PCでは矢印キー／WASD、スマホでは画面下の矢印ボタンをタップして、表示順に素早く入力しましょう。
3. 成功すると次のシーケンスへ進み、ミスすると即座に再生成。テンポ良く連続成功を狙ってください。
4. 制限時間は60秒。タイマーがゼロになる前にどこまでスコアを伸ばせるか挑戦しましょう。

## 実装メモ
- シーケンスは固定長5でランダム生成し、入力に応じて`active`/`correct`/`missed`クラスを切り替え。
- オンスクリーン矢印ボタンを追加してタッチ操作にも対応し、キーボード入力と同じ`handleInput`に集約しました。
- `requestAnimationFrame`で60秒タイマーを更新し、残り時間表示とタイムアップ処理を一元管理しています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
