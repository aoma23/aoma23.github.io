---
title: "毎日ゲームチャレンジ Day 1: リアクションタイマー"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！aomaです！  
100日間毎日Webゲームを作っていくチャレンジをスタートします！スキマ時間にぜひ楽しんでください！
初日は短時間で気軽に遊べるリアクションタイマーです。クリックするだけの単純な仕組みですが、計測の正確さや演出を丁寧に作り込むとプレイ体験がぐっと良くなるはず。

<style>
#reaction-timer-game {
  border: 2px solid #0f172a;
  border-radius: 16px;
  padding: 24px;
  background: #f8fafc;
  max-width: 420px;
  margin: 24px auto;
  text-align: center;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}
#reaction-timer-game.go {
  box-shadow: 0 0 25px rgba(34, 197, 94, 0.55);
  transform: scale(1.02);
}
#reaction-timer-game .game-status {
  font-size: 1.1rem;
  margin-bottom: 12px;
  font-weight: bold;
  color: #1e293b;
}
#reaction-timer-game .game-button {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #fff;
  border: none;
  border-radius: 9999px;
  padding: 12px 32px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  touch-action: manipulation;
}
#reaction-timer-game .game-button:hover {
  opacity: 0.9;
}
#reaction-timer-game .game-button:active {
  transform: scale(0.98);
}
#reaction-timer-game .game-result {
  margin-top: 16px;
  min-height: 24px;
  color: #334155;
}
#reaction-timer-game .game-history {
  margin-top: 8px;
  font-size: 0.9rem;
  color: #64748b;
}
#reaction-timer-game .actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
#reaction-timer-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 10px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #facc15, #f97316);
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(249, 115, 22, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  touch-action: manipulation;
}
#reaction-timer-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 26px rgba(249, 115, 22, 0.38);
}
#reaction-timer-game .share-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="reaction-timer-game">
  <p class="game-status">ボタンを押してチャレンジ開始！</p>
  <button type="button" class="game-button">スタート</button>
  <p class="game-result"></p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストタイムをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('reaction-timer-game');
  if (!root) {
    return;
  }

  const statusEl = root.querySelector('.game-status');
  const button = root.querySelector('.game-button');
  const resultEl = root.querySelector('.game-result');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');
  const historyEl = document.createElement('p');
  historyEl.className = 'game-history';
  historyEl.textContent = 'ベストタイム: -- ms | 平均: -- ms (0回)';
  root.appendChild(historyEl);

  const storageKey = 'aomagame:best:reaction-timer';
  const playedKey = 'aomagame:played:reaction-timer';

  let state = 'idle';
  let timeoutId = null;
  let startTime = 0;
  let best = null;
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

  const records = [];

  const updateHistory = () => {
    const bestText = best !== null ? `${best.toFixed(0)} ms` : '-- ms';
    if (shareButton) {
      shareButton.disabled = best === null;
    }
    if (records.length === 0) {
      historyEl.textContent = `ベストタイム: ${bestText} | 平均: -- ms (0回)`;
      return;
    }
    const average = records.reduce((sum, value) => sum + value, 0) / records.length;
    historyEl.textContent = `ベストタイム: ${best.toFixed(0)} ms | 平均: ${average.toFixed(0)} ms (${records.length}回)`;
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
    const value = Number.parseFloat(stored);
    if (!Number.isNaN(value) && value > 0) {
      best = value;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || best === null) {
      return;
    }
    localStorage.setItem(storageKey, String(best));
  };

  const openShareWindow = () => {
    if (best === null) {
      return;
    }
    const text = `リアクションタイマーでベスト ${best.toFixed(0)} ms を記録！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  const setStatus = (message) => {
    statusEl.textContent = message;
  };

  const startRound = () => {
    state = 'armed';
    setStatus('ランプが緑になるまで待ってください…');
    resultEl.textContent = '';
    button.textContent = '待機中…';
    root.classList.remove('go');
    const delay = 1200 + Math.random() * 2500;
    timeoutId = window.setTimeout(() => {
      state = 'go';
      startTime = performance.now();
      root.classList.add('go');
      setStatus('今だ！ 緑に光っている間にクリック');
      button.textContent = '今すぐクリック！';
    }, delay);
  };

  const resetRound = (message) => {
    setStatus(message);
    button.textContent = 'もう一度';
    state = 'idle';
    timeoutId = null;
    root.classList.remove('go');
  };

  button.addEventListener('click', () => {
    if (state === 'idle') {
      markPlayed();
      startRound();
      return;
    }

    if (state === 'armed') {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      resultEl.textContent = 'フライングでした…落ち着いてもう一度。';
      resetRound('ボタンを押すと再スタート');
      return;
    }

    if (state === 'go') {
      const reaction = performance.now() - startTime;
      records.push(reaction);
      const improved = best === null || reaction < best;
      if (improved) {
        best = reaction;
        saveBest();
      }
      resultEl.textContent = `今回の記録: ${reaction.toFixed(0)} ms`;
      resetRound('ナイス！ 連続で挑戦してみてください');
      updateHistory();
    }
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (best === null) {
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
  updateHistory();
})();
</script>

## 遊び方
1. 「スタート」を押すとランプが緑になるのを待ちます。
2. 緑に変わった瞬間にボタンをクリックします。
3. 反応が遅れたりフライングすると結果に反映されます。ベストタイムの更新を目指してください。

## 実装メモ
- `performance.now()`を使ってミリ秒単位のタイムを計測。
- ランダムな待機時間で先読みを防ぎ、フライング判定も組み込みました。
- 直感的に状態が分かるようカードの色とメッセージを切り替えています。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
