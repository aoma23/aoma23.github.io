---
title: "毎日Webゲームチャレンジ Day 19: エクエーションドロップ"
categories:
  - game
tags:
  - aomagame
---

19日目は落ちてくる式を素早く解く「エクエーションドロップ」。上から落ちる算数問題を制限時間内に解答して消し、フィールドをクリアに保ちましょう。計算力と判断力を同時に鍛えられるアクション算数ゲームです。

<style>
#equation-drop-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 26px;
  border-radius: 18px;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #f8fafc;
  box-shadow: 0 26px 46px rgba(15, 23, 42, 0.45);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#equation-drop-game .hud {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-weight: 700;
  margin-bottom: 12px;
}
#equation-drop-game .arena {
  position: relative;
  width: min(92vw, 320px);
  height: 360px;
  margin: 0 auto 16px;
  background: rgba(248, 250, 252, 0.06);
  border-radius: 16px;
  overflow: hidden;
}
#equation-drop-game .equation {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(56, 189, 248, 0.85);
  color: #0f172a;
  padding: 8px 12px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(56, 189, 248, 0.3);
}
#equation-drop-game form {
  display: flex;
  gap: 12px;
  justify-content: center;
}
#equation-drop-game input[type="number"] {
  width: 120px;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 1rem;
  text-align: center;
  color: #0f172a;
}
#equation-drop-game button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#equation-drop-game .submit {
  background: #f97316;
  color: #fff;
  box-shadow: 0 18px 34px rgba(249, 115, 22, 0.35);
}
#equation-drop-game .start {
  width: 100%;
  margin-top: 12px;
  background: rgba(248, 250, 252, 0.15);
  color: #f8fafc;
}
#equation-drop-game button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#equation-drop-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#equation-drop-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#equation-drop-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #38bdf8);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(56, 189, 248, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#equation-drop-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(56, 189, 248, 0.45);
}
#equation-drop-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="equation-drop-game">
  <div class="hud">
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="lives">残りライフ: 3</span>
  </div>
  <div class="arena"></div>
  <form autocomplete="off">
    <input type="number" inputmode="numeric" placeholder="答え">
    <button type="submit" class="submit">答える</button>
  </form>
  <button type="button" class="start">スタート</button>
  <p class="log">スタートで式が降ってきます。素早く解答して消しましょう。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('equation-drop-game');
  if (!root) {
    return;
  }

  const arenaEl = root.querySelector('.arena');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const livesEl = root.querySelector('.lives');
  const formEl = root.querySelector('form');
  const inputEl = root.querySelector('input');
  const submitButton = root.querySelector('.submit');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:equation-drop';
  const playedKey = 'aomagame:played:equation-drop';

  const equations = [];
  let spawnTimer = null;
  let tickTimer = null;
  let score = 0;
  let bestScore = 0;
  let lives = 3;
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
    livesEl.textContent = `残りライフ: ${lives}`;
    shareButton.disabled = bestScore <= 0;
  };

  const clearTimers = () => {
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  };

  const endGame = (message) => {
    running = false;
    clearTimers();
    logEl.textContent = message;
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    submitButton.disabled = true;
  };

  const spawnEquation = () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const expression = `${a} ${op} ${b}`;
    const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
    const node = document.createElement('div');
    node.className = 'equation';
    node.textContent = expression;
    node.style.top = '-40px';
    node.dataset.answer = String(answer);
    node.dataset.y = '-40';
    arenaEl.appendChild(node);
    equations.push(node);
  };

  const tick = () => {
    const remove = [];
    equations.forEach((node) => {
      const y = Number(node.dataset.y) + 1.5;
      node.dataset.y = String(y);
      node.style.top = `${y}px`;
      if (y > arenaEl.clientHeight - 40) {
        remove.push(node);
        lives -= 1;
        if (lives <= 0) {
          endGame('ライフがなくなりました…');
        }
      }
    });
    remove.forEach((node) => {
      equations.splice(equations.indexOf(node), 1);
      node.remove();
    });
    updateHud();
    if (!running) {
      equations.splice(0, equations.length).forEach((node) => node.remove());
    }
  };

  const startGame = () => {
    markPlayed();
    score = 0;
    lives = 3;
    equations.splice(0, equations.length).forEach((node) => node.remove());
    updateHud();
    logEl.textContent = '式を解いてどんどん消しましょう！';
    startButton.disabled = true;
    startButton.textContent = 'プレイ中';
    submitButton.disabled = false;
    inputEl.value = '';
    inputEl.focus();
    running = true;
    spawnEquation();
    spawnTimer = setInterval(spawnEquation, 2000);
    tickTimer = setInterval(tick, 16);
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
    const match = equations.find((node) => Number(node.dataset.answer) === value);
    if (match) {
      score += 1;
      match.remove();
      equations.splice(equations.indexOf(match), 1);
      if (score > bestScore) {
        bestScore = score;
        saveBest();
        shareButton.disabled = false;
      }
      logEl.textContent = 'ナイス！正しい答えで消去しました。';
    } else {
      lives -= 1;
      logEl.textContent = '答えが違います…ライフが減りました。';
      if (lives <= 0) {
        endGame('ライフがなくなりました…');
        return;
      }
    }
    inputEl.value = '';
    updateHud();
  });

  startButton.addEventListener('click', () => {
    startGame();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestScore <= 0) {
        return;
      }
      const text = `エクエーションドロップでベストスコア ${bestScore} を記録！ #aomagame`;
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
1. スタートを押すと画面上部から算数問題がゆっくり落ちてきます。
2. 入力欄に答えを入れて送信し、正解した式を消去してください。
3. ライフが0になる前にハイスコアを目指しましょう。連続正解で猛スピードで片付けられるはずです。

## 実装メモ
- 2秒ごとに式を生成し、16ms刻みで落下処理を更新して滑らかな動きを実現。
- フォーム送信で一致する答えの式を除去し、間違いはライフを減らすシステムにしました。
- ベストスコア更新時に共有ボタンを有効化し、チャレンジが手軽に発信できるようにしています。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
