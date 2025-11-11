---
title: "毎日ゲームチャレンジ Day 9: ワードスプリント"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-8-number-chase/' | relative_url }}">ナンバーチェイス</a>

9日目は英単語を素早く推理する「ワードスプリント」。ランダムにシャッフルされたアルファベットを並べ替えて正しい単語を入力する1分勝負です。単語力と直感を試しながら、テンポよく答えをひねり出してみましょう。

<style>
#word-sprint-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  background: linear-gradient(135deg, #9333ea, #6366f1);
  color: #f8fafc;
  box-shadow: 0 28px 50px rgba(99, 102, 241, 0.4);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#word-sprint-game .hud {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-weight: 700;
  margin-bottom: 18px;
}
#word-sprint-game .scramble {
  font-size: 2rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin: 20px 0;
  word-break: break-word;
}
#word-sprint-game .scramble .hint-letter {
  color: #fef3c7;
  text-shadow: 0 0 18px rgba(251, 191, 36, 0.6);
}
#word-sprint-game form {
  display: flex;
  gap: 12px;
  justify-content: center;
}
#word-sprint-game input[type="text"] {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  border: none;
  font-size: 1.1rem;
  color: #1e293b;
}
#word-sprint-game button {
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
#word-sprint-game button.submit {
  background: #fbbf24;
  color: #0f172a;
  box-shadow: 0 12px 24px rgba(251, 191, 36, 0.35);
}
#word-sprint-game button.submit:hover {
  transform: translateY(-1px);
}
#word-sprint-game .start {
  width: 100%;
  margin-top: 18px;
  background: rgba(15, 23, 42, 0.9);
  color: #fff;
}
#word-sprint-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.35);
}
#word-sprint-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#word-sprint-game .log {
  margin-top: 14px;
}
#word-sprint-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#word-sprint-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 26px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #22d3ee, #38bdf8);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 38px rgba(56, 189, 248, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#word-sprint-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 42px rgba(56, 189, 248, 0.45);
}
#word-sprint-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="word-sprint-game">
  <div class="hud">
    <span class="timer">残り 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
  </div>
  <p class="scramble">READY</p>
  <form autocomplete="off">
    <input type="text" placeholder="答えを入力" maxlength="16" />
    <button type="submit" class="submit">送信</button>
  </form>
  <button type="button" class="start">スタート</button>
  <p class="log">スタートで60秒チャレンジ開始。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('word-sprint-game');
  if (!root) {
    return;
  }

  const timerEl = root.querySelector('.timer');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const scrambleEl = root.querySelector('.scramble');
  const formEl = root.querySelector('form');
  const inputEl = root.querySelector('input');
  const submitButton = root.querySelector('.submit');
  const startButton = root.querySelector('.start');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:word-sprint';
  const playedKey = 'aomagame:played:word-sprint';

  const words = [
    'creative', 'dynamic', 'puzzle', 'network', 'gallery',
    'fantasy', 'holiday', 'perfect', 'balance', 'library',
    'startup', 'android', 'journey', 'awesome', 'digital',
    'mission', 'freedom', 'harmony', 'artisan', 'keyboard'
  ];

  let currentWord = '';
  let scrambled = '';
  let score = 0;
  let bestScore = 0;
  let timeLeft = 60;
  let running = false;
  let timerId = null;
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
      bestScore = value;
      bestEl.textContent = `ベスト: ${bestScore}`;
      shareButton.disabled = false;
    }
  };

  const saveBest = () => {
    if (!storageAvailable || bestScore <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(bestScore));
  };

  const shuffle = (word) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const scrambledWord = letters.join('');
    return scrambledWord === word ? shuffle(word) : scrambledWord;
  };

  const escapeHtml = (text) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const formatScramble = (word, scrambledWord) => {
    if (!word) {
      return escapeHtml(scrambledWord);
    }
    const hintLetter = word[0];
    let highlighted = false;
    return scrambledWord
      .split('')
      .map((char) => {
        const safeChar = escapeHtml(char);
        if (!highlighted && char === hintLetter) {
          highlighted = true;
          return `<span class="hint-letter">${safeChar}</span>`;
        }
        return safeChar;
      })
      .join('');
  };

  const nextWord = () => {
    currentWord = words[Math.floor(Math.random() * words.length)];
    scrambled = shuffle(currentWord);
    scrambleEl.innerHTML = formatScramble(currentWord, scrambled);
    inputEl.value = '';
    inputEl.focus();
  };

  const updateHud = () => {
    timerEl.textContent = `残り ${timeLeft.toFixed(1)} 秒`;
    scoreEl.textContent = `スコア: ${score}`;
    bestEl.textContent = `ベスト: ${bestScore}`;
    shareButton.disabled = bestScore <= 0;
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
    running = true;
    score = 0;
    timeLeft = 60;
    updateHud();
    logEl.textContent = 'スクランブルされた単語を解読してください。';
    submitButton.disabled = false;
    startButton.disabled = true;
    startButton.textContent = 'プレイ中';
    nextWord();
    clearTimeout(timerId);
    timerId = setTimeout(tick, 100);
  };

  const finishGame = () => {
    running = false;
    clearTimeout(timerId);
    timerId = null;
    submitButton.disabled = true;
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    scrambleEl.textContent = 'DONE';
   if (score > bestScore) {
     bestScore = score;
     saveBest();
     logEl.textContent = `結果は ${score} 問正解。ベスト更新です！`;
     shareButton.disabled = false;
   } else {
     logEl.textContent = `結果は ${score} 問正解。次はベストを狙おう。`;
   }
   updateHud();
    markPlayed();
 };

  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!running) {
      return;
    }
    const answer = inputEl.value.trim().toLowerCase();
    if (!answer) {
      return;
    }
    if (answer === currentWord) {
      score += 1;
      logEl.textContent = '正解！次の単語へ。';
      nextWord();
      updateHud();
    } else {
      logEl.textContent = `残念…正解は "${currentWord}"`; 
      nextWord();
    }
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
      const text = `ワードスプリントでベスト ${bestScore} 問正解！ #aomagame`;
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
1. スタートを押すと60秒のカウントダウンとともにシャッフル語が表示されます。
2. 並び替えて完成すると判断した単語を入力し、送信します。
3. 正解を重ねてハイスコアを狙いましょう。間違えても次の単語に進めます。

## 実装メモ
- 単語候補をシャッフルしても元の並びと同じにならないよう再帰的に調整。
- タイマーは0.1秒刻みで更新し、リアルタイム感のある残り時間表示を実装。
- 正解・不正解でメッセージを切り替え、短いサイクルでテンポ良く遊べるようにしました。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
