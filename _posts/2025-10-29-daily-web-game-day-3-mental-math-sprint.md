---
title: "毎日Webゲームチャレンジ Day 3: 30秒暗算スプリント"
categories:
  - game
tags:
  - aomagame
---

3日目は頭をフル回転させる暗算スプリント。30秒の制限時間内にランダムで出題される足し算・引き算・かけ算をどれだけ解けるかに挑戦します。即判定でテンポ良く進むので、短時間のウォームアップにもぴったりです。

<style>
#math-sprint-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  border: 2px solid #0f172a;
  background: linear-gradient(160deg, #0ea5e9 0%, #6366f1 100%);
  color: #fff;
  box-shadow: 0 20px 45px rgba(14, 165, 233, 0.25);
}
#math-sprint-game .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-weight: bold;
  font-size: 1rem;
}
#math-sprint-game .best {
  font-size: 1rem;
}
#math-sprint-game .question {
  font-size: 2.4rem;
  text-align: center;
  margin: 32px 0 20px;
  font-weight: 700;
}
#math-sprint-game form {
  display: flex;
  gap: 12px;
  justify-content: center;
}
#math-sprint-game input[type="number"] {
  width: 140px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 1.2rem;
  text-align: center;
}
#math-sprint-game button {
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  background: rgba(15, 23, 42, 0.85);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
}
#math-sprint-game button:hover {
  transform: translateY(-1px);
  background: rgba(15, 23, 42, 1);
}
#math-sprint-game .start-button {
  width: 100%;
  margin-top: 18px;
  padding: 14px;
  font-size: 1.1rem;
  background: rgba(15, 23, 42, 0.92);
}
#math-sprint-game .start-button:disabled {
  background: rgba(15, 23, 42, 0.3);
  cursor: not-allowed;
}
#math-sprint-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
  text-align: center;
}
#math-sprint-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#math-sprint-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #a7f3d0, #34d399);
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(16, 185, 129, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
#math-sprint-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 32px rgba(16, 185, 129, 0.45);
}
#math-sprint-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="math-sprint-game">
  <div class="header">
    <span class="timer">残り 30.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
  </div>
  <div class="question">0 + 0 = ?</div>
  <form autocomplete="off">
    <input type="number" inputmode="numeric" placeholder="答え" />
    <button type="submit">判定</button>
  </form>
  <button type="button" class="start-button">スタート</button>
  <p class="log">右下のボタンでゲーム開始。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストスコアをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('math-sprint-game');
  if (!root) {
    return;
  }

  const timerEl = root.querySelector('.timer');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const questionEl = root.querySelector('.question');
  const formEl = root.querySelector('form');
  const inputEl = root.querySelector('input');
  const submitButton = formEl.querySelector('button');
  const startButton = root.querySelector('.start-button');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:math-sprint';
  const playedKey = 'aomagame:played:math-sprint';

  let timeLeft = 30;
  let timerId = null;
  let score = 0;
  let currentAnswer = 0;
  let running = false;
  let bestScore = 0;
  let storageAvailable = false;

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


  const formatTime = (value) => value.toFixed(1).padStart(4, ' ');

  const updateTimerDisplay = () => {
    timerEl.textContent = `残り ${formatTime(timeLeft)} 秒`;
  };

  const updateScore = () => {
    scoreEl.textContent = `スコア: ${score}`;
  };

  const updateBestDisplay = () => {
    if (bestEl) {
      bestEl.textContent = `ベスト: ${bestScore}`;
    }
    if (shareButton) {
      shareButton.disabled = bestScore <= 0;
    }
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
      updateBestDisplay();
      return;
    }
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      updateBestDisplay();
      return;
    }
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value > 0) {
      bestScore = value;
    }
    updateBestDisplay();
  };

  const saveBest = () => {
    if (!storageAvailable || bestScore <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(bestScore));
  };

  const openShareWindow = () => {
    if (bestScore <= 0) {
      return;
    }
    const text = `30秒暗算スプリントでベストスコア ${bestScore} を記録！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const generateQuestion = () => {
    const operations = ['+', '-', '×'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let left = randomInt(2, 19);
    let right = randomInt(2, 19);
    if (op === '-') {
      if (left < right) {
        [left, right] = [right, left];
      }
      currentAnswer = left - right;
      questionEl.textContent = `${left} − ${right} = ?`;
    } else if (op === '+') {
      currentAnswer = left + right;
      questionEl.textContent = `${left} ＋ ${right} = ?`;
    } else {
      left = randomInt(2, 9);
      right = randomInt(2, 9);
      currentAnswer = left * right;
      questionEl.textContent = `${left} × ${right} = ?`;
    }
    inputEl.value = '';
    inputEl.focus();
  };

  const stopGame = () => {
    running = false;
    submitButton.disabled = true;
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    const previousBest = bestScore;
    if (score > bestScore) {
      bestScore = score;
      saveBest();
    }
    updateBestDisplay();
    if (score > previousBest) {
      logEl.textContent = `お疲れさま！最終スコアは ${score} でした。ベスト更新！`;
    } else {
      logEl.textContent = `お疲れさま！最終スコアは ${score} でした。`;
    }
  };
  const startGame = () => {
    markPlayed();
    running = true;
    timeLeft = 30;
    score = 0;
    updateTimerDisplay();
    updateScore();
    logEl.textContent = '回答を入力してEnterキーでも判定できます。';
    submitButton.disabled = false;
    startButton.disabled = true;
    startButton.textContent = 'プレイ中';
    generateQuestion();

    const startTime = performance.now();
    timerId = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      timeLeft = Math.max(0, 30 - elapsed);
      updateTimerDisplay();
      if (timeLeft <= 0) {
        stopGame();
      }
    }, 100);
  };

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!running) {
      return;
    }
    const value = Number(inputEl.value.trim());
    if (Number.isNaN(value)) {
      return;
    }
    if (value === currentAnswer) {
      score += 1;
      logEl.textContent = '正解！テンポ良く次へ。';
    } else {
      logEl.textContent = `残念！正解は ${currentAnswer} でした。`;
    }
    updateScore();
    generateQuestion();
  });

  startButton.addEventListener('click', () => {
    if (running) {
      return;
    }
    startGame();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestScore <= 0) {
        return;
      }
      openShareWindow();
    });
  }

  detectStorage();
  loadBest();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlayCount, { once: true });
  } else {
    updatePlayCount();
  }

  updateTimerDisplay();
  updateScore();
})();
</script>

## 遊び方
1. 「スタート」ボタンでカウントダウンが始まります。
2. 表示された式を入力欄に解答し、Enterキーまたは送信ボタンで判定。
3. 制限時間内に正解した数がスコアになります。誤答時はすぐに次の問題へ。

## 実装メモ
- 30秒の倒計時は`setInterval`で500ミリ秒刻み更新にして残り時間を滑らかに表示。
- 出題ロジックはランダムで演算子を選択し、引き算は負の結果を避けるよう調整しました。
- UIはフォーム送信を`preventDefault`してキーボード操作に最適化。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
