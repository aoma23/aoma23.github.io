---
title: "毎日ゲームチャレンジ Day 13: ストループスプリント"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-12-maze-dash/' | relative_url }}">ミニメイズダッシュ</a>

13日目は色と言葉のトリックに挑む「ストループスプリント」。表示された文字色と意味のどちらが正しいか瞬時に判断し、正解を1分間でどれだけ積み重ねられるかを競います。脳の混乱に負けないスピードを鍛えましょう。

<style>
#stroop-sprint-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  background: #f1f5f9;
  color: #0f172a;
  box-shadow: 0 24px 46px rgba(15, 23, 42, 0.18);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#stroop-sprint-game .hud {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #stroop-sprint-game .hud {
    font-size: 0.82rem;
  }
}
#stroop-sprint-game .target-label {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #475569;
}
.problem {
  margin: 12px 0 20px;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
#stroop-sprint-game .choices {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 12px;
}
#stroop-sprint-game button.choice {
  border: none;
  border-radius: 14px;
  padding: 16px 20px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#stroop-sprint-game button.choice:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
}
#stroop-sprint-game .start {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  margin-top: 18px;
  background: #1d4ed8;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#stroop-sprint-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(29, 78, 216, 0.35);
}
#stroop-sprint-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#stroop-sprint-game .log {
  margin-top: 14px;
  font-size: 0.95rem;
  min-height: 24px;
}
#stroop-sprint-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#stroop-sprint-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #38bdf8);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 34px rgba(56, 189, 248, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#stroop-sprint-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(56, 189, 248, 0.45);
}
#stroop-sprint-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="stroop-sprint-game">
  <div class="hud">
    <span class="timer">残り60.0 秒</span>
    <span class="score">スコア:0</span>
    <span class="best">ベスト:0</span>
  </div>
  <p class="target-label">ターゲット: RED</p>
  <p class="problem">READY</p>
  <div class="choices">
    <button type="button" class="choice" data-choice="word" disabled>文字が一致</button>
    <button type="button" class="choice" data-choice="color" disabled>色が一致</button>
    <button type="button" class="choice" data-choice="both" disabled>両方一致</button>
    <button type="button" class="choice" data-choice="neither" disabled>一致なし</button>
  </div>
  <button type="button" class="start">スタート</button>
  <p class="log">スタートで60秒の勝負開始。選択肢を素早く押そう。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('stroop-sprint-game');
  if (!root) {
    return;
  }

  const timerEl = root.querySelector('.timer');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const targetEl = root.querySelector('.target-label');
  const problemEl = root.querySelector('.problem');
  const choiceButtons = Array.from(root.querySelectorAll('button.choice'));
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:stroop-sprint';
  const playedKey = 'aomagame:played:stroop-sprint';

  const colors = [
    { name: 'RED', value: '#f87171' },
    { name: 'BLUE', value: '#60a5fa' },
    { name: 'GREEN', value: '#4ade80' },
    { name: 'YELLOW', value: '#fbbf24' },
    { name: 'PURPLE', value: '#c084fc' }
  ];

  let current = null;
  let target = null;
  let score = 0;
  let best = 0;
  let timeLeft = 60;
  let timerId = null;
  let running = false;
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
    if (!stored) {
      return;
    }
    const value = Number.parseInt(stored, 10);
    if (!Number.isNaN(value) && value > 0) {
      best = value;
      bestEl.textContent = `ベスト:${best}`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || best <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(best));
  };

  const updateHud = () => {
    timerEl.textContent = `残り${timeLeft.toFixed(1)} 秒`;
    scoreEl.textContent = `スコア:${score}`;
    bestEl.textContent = `ベスト:${best}`;
    shareButton.disabled = best <= 0;
  };

  const pickProblem = () => {
    const word = colors[Math.floor(Math.random() * colors.length)];
    const ink = colors[Math.floor(Math.random() * colors.length)];
    target = colors[Math.floor(Math.random() * colors.length)];

    targetEl.textContent = `ターゲット: ${target.name}`;
    problemEl.textContent = word.name;
    problemEl.style.color = ink.value;

    const isWordMatch = word.name === target.name;
    const isColorMatch = ink.name === target.name;

    let answer;
    if (isWordMatch && isColorMatch) {
      answer = 'both';
    } else if (isWordMatch) {
      answer = 'word';
    } else if (isColorMatch) {
      answer = 'color';
    } else {
      answer = 'neither';
    }

    current = { answer };
    inputFocus();
  };

  const inputFocus = () => {
    choiceButtons[0].focus({ preventScroll: true });
  };

  const tick = () => {
    if (!running) {
      return;
    }
    timeLeft = Math.max(0, timeLeft - 0.1);
    updateHud();
    if (timeLeft > 0) {
      timerId = setTimeout(tick, 100);
    } else {
      finishGame();
    }
  };

 const startGame = () => {
    markPlayed();
    running = true;
    score = 0;
    timeLeft = 60;
    choiceButtons.forEach((button) => {
      button.disabled = false;
    });
    startButton.disabled = true;
    startButton.textContent = 'プレイ中';
    logEl.textContent = '問題を見て素早く選択！';
    pickProblem();
    updateHud();
    clearTimeout(timerId);
    timerId = setTimeout(tick, 100);
  };

  const finishGame = () => {
    running = false;
    clearTimeout(timerId);
    timerId = null;
    choiceButtons.forEach((button) => {
      button.disabled = true;
    });
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    if (score > best) {
      best = score;
      saveBest();
      logEl.textContent = `終了！${score} 問正解。ベスト更新です。`;
      shareButton.disabled = false;
    } else {
      logEl.textContent = `終了！${score} 問正解。次はさらに記録を伸ばそう。`;
    }
    updateHud();
  };

  choiceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!running || !current) {
        return;
      }
      const choice = button.dataset.choice;
    if (choice === current.answer) {
      score += 1;
      logEl.textContent = '正解！次の問題へ。';
    } else {
      timeLeft = Math.max(0, timeLeft - 10);
      logEl.textContent = '惜しい！10秒のペナルティ。慎重に見極めよう。';
    }
      pickProblem();
      updateHud();
    });
  });

  startButton.addEventListener('click', () => {
    if (!running) {
      startGame();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (best <= 0) {
        return;
      }
      const text = `ストループスプリントでベスト ${best} 問正解！ #aomagame`;
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
1. スタートを押すと色と単語が表示され、判定ボタンが有効になります。
2. 上部に表示されるターゲット色と比較し、「文字が一致」「色が一致」などの判定を素早く選びます。
3. 60秒間で正解を積み重ね、ハイスコアを目指してください。

## 実装メモ
- 色と言葉の組み合わせをランダムに生成し、ストループ効果の混乱を再現。
- `setTimeout`で0.1秒刻みの残り時間を更新し、緊張感を保てるスピード感に調整。
- 選択状況に応じてログを更新し、正誤フィードバックをテンポよく返す設計です。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
