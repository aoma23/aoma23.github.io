---
title: "毎日ゲームチャレンジ Day 5: メモリービーツ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-4-catching-stars/' | relative_url }}">星キャッチ・ラン</a>

5日目はサイモン系の記憶ゲーム「メモリービーツ」。4つのパッドが奏でる光のリズムを覚えて、同じ順番でタップできるか挑戦します。ゲームが進むほどパターンが長くなり、集中力と短期記憶を試されます。

<style>
#memory-beats-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  background: #1e293b;
  color: #e2e8f0;
  box-shadow: 0 24px 40px rgba(15, 23, 42, 0.4);
  font-family: "SF Pro JP", "Hiragino Kaku Gothic ProN", sans-serif;
}
#memory-beats-game .board {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 16px;
  margin: 18px 0 24px;
}
#memory-beats-game .pad {
  border-radius: 18px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  touch-action: manipulation;
}
#memory-beats-game .pad[data-index="0"] { background: linear-gradient(145deg, #f97316, #fb923c); }
#memory-beats-game .pad[data-index="1"] { background: linear-gradient(145deg, #10b981, #34d399); }
#memory-beats-game .pad[data-index="2"] { background: linear-gradient(145deg, #3b82f6, #60a5fa); }
#memory-beats-game .pad[data-index="3"] { background: linear-gradient(145deg, #ec4899, #f472b6); }
#memory-beats-game .pad.active {
  transform: scale(1.05);
  filter: brightness(1.25);
}
#memory-beats-game button.start {
  width: 100%;
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #fef08a, #fde047);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  touch-action: manipulation;
}
#memory-beats-game button.start:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgba(250, 204, 21, 0.3);
}
#memory-beats-game button.start:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
#memory-beats-game .status {
  text-align: center;
  font-size: 1rem;
  margin-top: 16px;
}
#memory-beats-game .footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #cbd5f5;
}
#memory-beats-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#memory-beats-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #86efac, #22c55e);
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(34, 197, 94, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  touch-action: manipulation;
}
#memory-beats-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(34, 197, 94, 0.45);
}
#memory-beats-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="memory-beats-game">
  <button type="button" class="start">スタート</button>
  <div class="board">
    <div class="pad" data-index="0">A</div>
    <div class="pad" data-index="1">B</div>
    <div class="pad" data-index="2">C</div>
    <div class="pad" data-index="3">D</div>
  </div>
  <p class="status">順番を覚えてタップしてください。</p>
  <div class="footer">
    <span class="round">ラウンド:0</span>
    <span class="best">ベスト:0</span>
  </div>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベスト記録をXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('memory-beats-game');
  if (!root) {
    return;
  }

  const startBtn = root.querySelector('.start');
  const pads = Array.from(root.querySelectorAll('.pad'));
  const statusEl = root.querySelector('.status');
  const roundEl = root.querySelector('.round');
  const bestEl = root.querySelector('.best');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:memory-beats';
  const playedKey = 'aomagame:played:memory-beats';

  const sequence = [];
  let accepting = false;
  let stepIndex = 0;
  let best = 0;
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


  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const updateBestDisplay = () => {
    bestEl.textContent = `ベスト:${best}`;
    if (shareButton) {
      shareButton.disabled = best <= 0;
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
      best = value;
    }
    updateBestDisplay();
  };

  const saveBest = () => {
    if (!storageAvailable || best <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(best));
  };

  const openShareWindow = () => {
    if (best <= 0) {
      return;
    }
    const text = `メモリービーツでベスト ${best} ラウンドを達成！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  const flashPad = async (index) => {
    const pad = pads[index];
    if (!pad) {
      return;
    }
    pad.classList.add('active');
    await sleep(320);
    pad.classList.remove('active');
    await sleep(140);
  };

  const playSequence = async () => {
    accepting = false;
    startBtn.disabled = true;
    statusEl.textContent = 'リズムを再生中…覚えてください。';

    for (let i = 0; i < sequence.length; i += 1) {
      await flashPad(sequence[i]);
    }

    stepIndex = 0;
    accepting = true;
    statusEl.textContent = '順番通りにタップ！';
  };

  const updateRoundInfo = () => {
    roundEl.textContent = `ラウンド:${sequence.length}`;
    updateBestDisplay();
  };

  const startRound = async () => {
    sequence.push(Math.floor(Math.random() * pads.length));
    await playSequence();
    updateRoundInfo();
  };

  const resetGame = (message) => {
    accepting = false;
    sequence.length = 0;
    stepIndex = 0;
    startBtn.disabled = false;
    startBtn.textContent = 'もう一度';
    statusEl.textContent = message;
    updateRoundInfo();
  };

  pads.forEach((pad) => {
    pad.addEventListener('click', async () => {
      if (!accepting) {
        return;
      }
      const index = Number(pad.dataset.index);
      pad.classList.add('active');
      setTimeout(() => pad.classList.remove('active'), 220);

      if (sequence[stepIndex] === index) {
        stepIndex += 1;
       if (stepIndex >= sequence.length) {
         const previousBest = best;
         if (sequence.length > best) {
           best = sequence.length;
           saveBest();
         }
          updateBestDisplay();
          accepting = false;
          statusEl.textContent = sequence.length > previousBest ? 'ベスト更新！次のパターンを再生します。' : 'クリア！次のパターンを再生します。';
          await sleep(600);
          startRound();
        }
      } else {
        resetGame('残念！間違えました…もう一度挑戦しましょう。');
      }
    });
  });

 startBtn.addEventListener('click', async () => {
    if (accepting) {
      return;
    }
    markPlayed();
    startBtn.textContent = '再生中…';
    statusEl.textContent = '最初のパターンを準備中…';
    sequence.length = 0;
    await sleep(300);
    startRound();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (best <= 0) {
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
  updateRoundInfo();
})();
</script>

## 遊び方
1. スタートを押すと光る順番が再生されます。
2. パッドを同じ順番でタップします。正しいと自動で次のラウンドへ。
3. 間違えるとゲームオーバー。集中力を切らさずに続けましょう。

## 実装メモ
- 非同期処理でパターン再生を行い、`await`と`setTimeout`を組み合わせてテンポを調整。
- 入力受付中かどうかのフラグを用意し、連打で処理が破綻しないように制御。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
