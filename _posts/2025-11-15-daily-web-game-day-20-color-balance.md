---
title: "毎日ゲームチャレンジ Day 20: カラーバランス"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲーム作る人
---

おはこんばんちは！100日間毎日ゲーム作る人、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-19-equation-drop/' | relative_url }}">エクエーションドロップ</a>

20日目はRGBスライダーを駆使する「カラーバランス」。提示された目標色にできるだけ近づけるよう、3つのスライダーを素早く調整しスコアを競います。色感覚と微調整のセンスが試されます。

<style>
#color-balance-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  background: #f1f5f9;
  color: #0f172a;
  box-shadow: 0 26px 44px rgba(15, 23, 42, 0.12);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#color-balance-game .swatches {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}
#color-balance-game .swatch {
  border-radius: 16px;
  height: 140px;
  box-shadow: inset 0 0 18px rgba(15, 23, 42, 0.12);
  position: relative;
}
#color-balance-game .swatch span {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(15, 23, 42, 0.55);
  color: #f8fafc;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
}
#color-balance-game .slider-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
#color-balance-game label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
}
#color-balance-game input[type="range"] {
  flex: 1;
  accent-color: #38bdf8;
}
#color-balance-game .controls {
  margin-top: 18px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
#color-balance-game button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#color-balance-game .start {
  background: #38bdf8;
  color: #0f172a;
}
#color-balance-game .submit {
  background: #f97316;
  color: #fff;
}
#color-balance-game button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#color-balance-game .hud {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  font-weight: 700;
  margin-bottom: 12px;
  font-size: 0.75rem;
  line-height: 1.3;
}
@media (min-width: 400px) {
  #color-balance-game .hud {
    font-size: 0.82rem;
  }
}
#color-balance-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#color-balance-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#color-balance-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fcd34d, #f97316);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(249, 115, 22, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#color-balance-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(249, 115, 22, 0.45);
}
#color-balance-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="color-balance-game">
  <div class="hud">
    <span class="score">今回の誤差:--</span>
    <span class="best">ベスト誤差:--</span>
  </div>
  <div class="swatches">
    <div class="swatch target"><span>ターゲット</span></div>
    <div class="swatch current"><span>あなたの色</span></div>
  </div>
  <div class="slider-group">
    <label>R<input type="range" min="0" max="255" value="128" data-channel="r"></label>
    <label>G<input type="range" min="0" max="255" value="128" data-channel="g"></label>
    <label>B<input type="range" min="0" max="255" value="128" data-channel="b"></label>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
    <button type="button" class="submit" disabled>判定</button>
  </div>
  <p class="log">スタートで新しい目標色が表示されます。スライダーを調整して近づけましょう。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('color-balance-game');
  if (!root) {
    return;
  }

  const targetSwatch = root.querySelector('.swatch.target');
  const currentSwatch = root.querySelector('.swatch.current');
  const sliders = Array.from(root.querySelectorAll('input[type="range"]'));
  const startButton = root.querySelector('.start');
  const submitButton = root.querySelector('.submit');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:color-balance';
  const playedKey = 'aomagame:played:color-balance';

  let targetColor = { r: 128, g: 128, b: 128 };
  let bestDiff = null;
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
      const value = Number.parseFloat(stored);
      if (!Number.isNaN(value) && value >= 0) {
        bestDiff = value;
        shareButton.disabled = false;
      }
    }
    updateHud('--');
  };

  const saveBest = () => {
    if (!storageAvailable || bestDiff === null) {
      return;
    }
    localStorage.setItem(storageKey, String(bestDiff));
  };

  const rgbToCss = ({ r, g, b }) => `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;

  const updateHud = (currentDiff) => {
    scoreEl.textContent = `今回の誤差:${currentDiff}`;
    bestEl.textContent = `ベスト誤差:${bestDiff === null ? '--' : bestDiff.toFixed(1)}°`;
    shareButton.disabled = bestDiff === null;
  };

  const randomColor = () => ({
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  });

  const getCurrentColor = () => {
    const values = sliders.reduce((obj, slider) => {
      obj[slider.dataset.channel] = Number(slider.value);
      return obj;
    }, {});
    currentSwatch.style.background = rgbToCss(values);
    return values;
  };

  const colorDiff = (a, b) => {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  sliders.forEach((slider) => {
    slider.addEventListener('input', () => {
      getCurrentColor();
    });
  });

  const startGame = () => {
    markPlayed();
    targetColor = randomColor();
    targetSwatch.style.background = rgbToCss(targetColor);
    sliders.forEach((slider) => {
      slider.value = String(Math.floor(Math.random() * 256));
    });
    getCurrentColor();
    logEl.textContent = '調整して判定ボタンを押してください。';
    startButton.disabled = true;
    submitButton.disabled = false;
    updateHud('--');
  };

  submitButton.addEventListener('click', () => {
    if (submitButton.disabled) {
      return;
    }
    const current = getCurrentColor();
    const diff = colorDiff(current, targetColor);
    logEl.textContent = `誤差は${diff.toFixed(1)}でした。`; 
    if (bestDiff === null || diff < bestDiff) {
      bestDiff = diff;
      saveBest();
      shareButton.disabled = false;
      logEl.textContent += ' ベスト更新です！';
    }
    updateHud(diff.toFixed(1));
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    submitButton.disabled = true;
  });

  startButton.addEventListener('click', () => {
    startGame();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (bestDiff === null) {
        return;
      }
      const text = `カラーバランスで誤差 ${bestDiff.toFixed(1)} を記録！ #aomagame`;
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
  getCurrentColor();
})();
</script>

## 遊び方
1. スタートを押すとターゲット色が表示され、スライダー初期値もランダムに設定されます。
2. RGBの各スライダーを動かし、ターゲット色に近づけたと思ったら判定を押してください。
3. 誤差が小さいほどハイスコア更新のチャンス。何度も挑戦して最小誤差を目指しましょう。

## 実装メモ
- RGBのユークリッド距離を誤差として採用し、色差が直感的に分かるよう数値表示。
- ベスト誤差はローカルに保存し、共有ボタンで成果を簡単にシェア可能にしました。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
