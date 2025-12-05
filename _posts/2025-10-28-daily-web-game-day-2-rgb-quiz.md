---
title: "毎日ゲームチャレンジ Day 2: カラーツインマッチ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-1-reaction-timer/' | relative_url }}">リアクションタイマー</a>

2日目は視覚の集中力を鍛えるカラーゲーム。ターゲットとして表示される色とそっくりな色が4色並び、その中から完全に同じ色を瞬時に見抜く「カラーツインマッチ」を作りました。RGBや16進数の数値を頼らず、純粋に色を見分けるトレーニングになります。

<style>
#color-match-game {
  border: 2px solid #334155;
  border-radius: 18px;
  padding: 28px 24px;
  background: #f1f5f9;
  max-width: 520px;
  margin: 24px auto;
  color: #1e293b;
  font-family: "SF Pro JP", "Hiragino Kaku Gothic ProN", sans-serif;
}
#color-match-game .prompt {
  font-size: 1.15rem;
  font-weight: 600;
  text-align: center;
}
#color-match-game .target {
  margin: 20px auto 24px;
  padding: 18px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(226, 232, 240, 0.9));
  box-shadow: inset 0 0 8px rgba(148, 163, 184, 0.35);
  max-width: 280px;
  text-align: center;
}
#color-match-game .target-label {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #475569;
  text-transform: uppercase;
}
#color-match-game .target-swatch {
  margin: 16px auto 0;
  width: 140px;
  height: 140px;
  border-radius: 20px;
  border: 4px solid rgba(15, 23, 42, 0.18);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
}
#color-match-game .options {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 16px;
}
#color-match-game .option {
  position: relative;
  border: none;
  border-radius: 16px;
  padding: 0;
  height: 140px;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
  transition: transform 0.18s ease, box-shadow 0.18s ease, outline 0.18s ease;
  background: transparent;
  touch-action: manipulation;
}
#color-match-game .option:hover,
#color-match-game .option:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.18);
  outline: 3px solid rgba(59, 130, 246, 0.4);
}
#color-match-game .option span {
  position: absolute;
  top: 10px;
  left: 12px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(15, 23, 42, 0.88);
  background: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
}
#color-match-game .option.is-correct {
  transform: scale(1.02);
  box-shadow: 0 14px 28px rgba(34, 197, 94, 0.3);
  outline: 3px solid rgba(34, 197, 94, 0.45);
}
#color-match-game .option.is-wrong {
  transform: scale(0.96);
  box-shadow: 0 10px 22px rgba(239, 68, 68, 0.35);
  outline: 3px solid rgba(239, 68, 68, 0.55);
}
#color-match-game .feedback {
  margin-top: 24px;
  min-height: 28px;
  text-align: center;
  font-weight: 600;
  color: #1e293b;
}
#color-match-game .streak {
  margin-top: 6px;
  text-align: center;
  font-size: 0.75rem;
  line-height: 1.3;
  color: #475569;
}
@media (min-width: 400px) {
  #color-match-game .streak {
    font-size: 0.82rem;
  }
}
#color-match-game .actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
#color-match-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #1d9bf0, #0c7cd5);
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(29, 155, 240, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  touch-action: manipulation;
}
#color-match-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(29, 155, 240, 0.35);
}
#color-match-game .share-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="color-match-game">
  <p class="prompt">ターゲットと同じ色のタイルを選んでください。</p>
  <div class="target">
    <p class="target-label">ターゲット</p>
    <div class="target-swatch"></div>
  </div>
  <div class="options">
    <button type="button" class="option" data-index="0"><span>A</span></button>
    <button type="button" class="option" data-index="1"><span>B</span></button>
    <button type="button" class="option" data-index="2"><span>C</span></button>
    <button type="button" class="option" data-index="3"><span>D</span></button>
  </div>
  <p class="feedback">似ている色が並ぶので、微妙な差に集中！</p>
  <p class="streak">連続正解: 0 / ベスト: 0</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>記録をXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('color-match-game');
  if (!root) {
    return;
  }

  const targetSwatch = root.querySelector('.target-swatch');
  const feedback = root.querySelector('.feedback');
  const streakEl = root.querySelector('.streak');
  const options = Array.from(root.querySelectorAll('.option'));
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:color-match';
  const playedKey = 'aomagame:played:color-match';

  let correctIndex = 0;
  let currentColor = null;
  let streak = 0;
  let best = 0;
  let lock = false;
  let played = false;
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


  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const wrapHue = (hue) => ((hue % 360) + 360) % 360;
  const randomRange = (min, max) => Math.random() * (max - min) + min;

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
    }
  };

  const saveBest = () => {
    if (!storageAvailable) {
      return;
    }
    localStorage.setItem(storageKey, String(best));
  };

  const createBaseColor = () => ({
    h: Math.floor(randomRange(0, 360)),
    s: Math.floor(randomRange(45, 85)),
    l: Math.floor(randomRange(35, 70)),
  });

  const colorToCss = (color) => `hsl(${color.h}deg ${color.s}% ${color.l}%)`;

  const colorKey = (color) => `${color.h}|${color.s}|${color.l}`;

  const colorsAreEqual = (a, b) => a && b && a.h === b.h && a.s === b.s && a.l === b.l;

  const createVariant = (base) => {
    const variant = {
      h: wrapHue(base.h + Math.round(randomRange(-16, 16))),
      s: clamp(Math.round(base.s + randomRange(-14, 14)), 20, 95),
      l: clamp(Math.round(base.l + randomRange(-14, 14)), 20, 85),
    };

    if (colorsAreEqual(variant, base)) {
      variant.h = wrapHue(variant.h + 6);
      variant.s = clamp(variant.s + 4, 20, 95);
    }

    return variant;
  };

  const renderRound = () => {
    lock = false;
    currentColor = createBaseColor();
    targetSwatch.style.background = colorToCss(currentColor);
    feedback.textContent = 'ターゲットと完全に一致する色を探してください。';

    correctIndex = Math.floor(Math.random() * options.length);

    const usedKeys = new Set();
    usedKeys.add(colorKey(currentColor));

    options.forEach((button, index) => {
      let swatchColor;
      if (index === correctIndex) {
        swatchColor = currentColor;
      } else {
        do {
          swatchColor = createVariant(currentColor);
        } while (usedKeys.has(colorKey(swatchColor)));
      }
      usedKeys.add(colorKey(swatchColor));
      button.style.background = colorToCss(swatchColor);
      button.dataset.correct = index === correctIndex ? 'true' : 'false';
      button.classList.remove('is-correct', 'is-wrong');
    });
  };

  const updateShareButton = () => {
    if (!shareButton) {
      return;
    }
    shareButton.disabled = best <= 0;
  };

  const updateStreak = () => {
    const previousBest = best;
    best = Math.max(best, streak);
    if (best !== previousBest) {
      saveBest();
    }
    streakEl.textContent = `連続正解: ${streak} / ベスト: ${best}`;
    updateShareButton();
  };

  const openShareWindow = () => {
    if (!shareButton) {
      return;
    }
    const text = `カラーツインマッチで連続正解 ${best} 回を記録！ #aomagame`;
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', text);
    shareUrl.searchParams.set('url', window.location.href);
    window.open(shareUrl.toString(), '_blank', 'noopener');
  };

  options.forEach((button) => {
    button.addEventListener('click', () => {
      if (!played) {
        markPlayed();
        played = true;
      }
      if (lock) {
        return;
      }
      lock = true;
      button.blur();
      const isCorrect = button.dataset.correct === 'true';
      if (isCorrect) {
        streak += 1;
        feedback.textContent = '正解！微妙な差を見抜きました。';
        button.classList.add('is-correct');
        updateStreak();
        window.setTimeout(renderRound, 800);
      } else {
        streak = 0;
        feedback.textContent = '惜しい…ターゲットと完全一致する色を探してみましょう。';
        button.classList.add('is-wrong');
        options[correctIndex].classList.add('is-correct');
        updateStreak();
        window.setTimeout(renderRound, 1200);
      }
    });
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
  streakEl.textContent = `連続正解: ${streak} / ベスト: ${best}`;
  updateShareButton();

  renderRound();
})();
</script>

## 遊び方
1. ターゲットとして表示される色をしっかり覚えます。
2. 並んだ4枚のタイルから、ターゲットと完全に一致する色をクリック。
3. 正解すると連続正解数が伸び、間違えるとストリークがリセットされます。

## 実装メモ
- HSL色空間でベースカラーを生成し、色相・彩度・明度に微差を付けたダミーを作成。
- 正誤に応じてボタンのスタイルを切り替え、少し時間を置いて次のラウンドを自動再生。


<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
