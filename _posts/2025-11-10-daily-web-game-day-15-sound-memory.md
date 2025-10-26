---
title: "毎日Webゲームチャレンジ Day 15: サウンドメモリー"
categories:
  - game
tags:
  - aomagame
---

15日目は耳を頼りにパターンを覚える「サウンドメモリー」。4つのボタンが奏でる音を順番通りに再現し、ステージをクリアしていきます。画面を見られない状況でも遊べるよう、音と振動フィードバックにこだわりました。

<style>
#sound-memory-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  background: #0f172a;
  color: #e2e8f0;
  box-shadow: 0 26px 44px rgba(15, 23, 42, 0.45);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#sound-memory-game .board {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 1fr));
  gap: 16px;
  margin: 20px 0;
}
#sound-memory-game button.pad {
  border: none;
  border-radius: 18px;
  padding: 32px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(30, 41, 59, 0.2));
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
}
#sound-memory-game button.pad.active {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px rgba(59, 130, 246, 0.35);
  filter: brightness(1.3);
}
#sound-memory-game .start {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 700;
  background: #38bdf8;
  color: #0f172a;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
#sound-memory-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(56, 189, 248, 0.35);
}
#sound-memory-game .start:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#sound-memory-game .hud {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-weight: 700;
}
#sound-memory-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#sound-memory-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#sound-memory-game .share-button {
  border: none;
  border-radius: 9999px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  color: #0f172a;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(249, 115, 22, 0.35);
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
}
#sound-memory-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(249, 115, 22, 0.45);
}
#sound-memory-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="sound-memory-game">
  <div class="hud">
    <span class="round">ラウンド: 0</span>
    <span class="best">ベスト: 0</span>
  </div>
  <div class="board">
    <button type="button" class="pad" data-index="0">A</button>
    <button type="button" class="pad" data-index="1">B</button>
    <button type="button" class="pad" data-index="2">C</button>
    <button type="button" class="pad" data-index="3">D</button>
  </div>
  <button type="button" class="start">スタート</button>
  <p class="log">スタートで音のパターン再生が始まります。</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('sound-memory-game');
  if (!root) {
    return;
  }

  const pads = Array.from(root.querySelectorAll('.pad'));
  const startButton = root.querySelector('.start');
  const roundEl = root.querySelector('.round');
  const bestEl = root.querySelector('.best');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:sound-memory';
  const playedKey = 'aomagame:played:sound-memory';

  let sequence = [];
  let accepting = false;
  let stepIndex = 0;
  let best = 0;
  let storageAvailable = false;

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const padFrequencies = [329.63, 392.0, 523.25, 659.25];

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
      shareButton.disabled = false;
    }
    bestEl.textContent = `ベスト: ${best}`;
  };

  const saveBest = () => {
    if (!storageAvailable || best <= 0) {
      return;
    }
    localStorage.setItem(storageKey, String(best));
  };

  const playTone = (index, duration = 300) => {
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.frequency.value = padFrequencies[index];
    oscillator.type = 'sine';
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
    oscillator.start();
    setTimeout(() => {
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
      oscillator.stop(audioCtx.currentTime + duration / 1000);
    }, duration - 50);
  };

  const flashPad = (index) => {
    const pad = pads[index];
    if (!pad) {
      return;
    }
    pad.classList.add('active');
    playTone(index);
    navigator.vibrate?.(60);
    setTimeout(() => {
      pad.classList.remove('active');
    }, 250);
  };

  const updateHud = () => {
    roundEl.textContent = `ラウンド: ${sequence.length}`;
    bestEl.textContent = `ベスト: ${best}`;
    shareButton.disabled = best <= 0;
  };

  const playSequence = async () => {
    accepting = false;
    startButton.disabled = true;
    logEl.textContent = 'パターンを再生中…音を覚えてください。';
    for (let i = 0; i < sequence.length; i += 1) {
      await new Promise((resolve) => {
        setTimeout(() => {
          flashPad(sequence[i]);
          resolve();
        }, 500);
      });
    }
    stepIndex = 0;
    accepting = true;
    logEl.textContent = '順番通りにボタンを押してください。';
  };

  const startRound = async () => {
    sequence.push(Math.floor(Math.random() * pads.length));
    await playSequence();
    updateHud();
  };

  pads.forEach((pad, index) => {
    pad.addEventListener('click', async () => {
      if (!accepting) {
        return;
      }
      flashPad(index);
      if (sequence[stepIndex] === index) {
        stepIndex += 1;
        if (stepIndex >= sequence.length) {
          best = Math.max(best, sequence.length);
          saveBest();
          shareButton.disabled = false;
          bestEl.textContent = `ベスト: ${best}`;
          accepting = false;
          logEl.textContent = '成功！次のラウンドを再生します。';
          await new Promise((resolve) => setTimeout(resolve, 600));
          startRound();
        }
      } else {
        logEl.textContent = '失敗…最初から挑戦しよう。';
        accepting = false;
        startButton.disabled = false;
        startButton.textContent = 'リトライ';
      }
    });
  });

  startButton.addEventListener('click', () => {
    markPlayed();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    sequence = [];
    startButton.textContent = 'プレイ中';
    startButton.disabled = true;
    startRound();
  });

  if (shareButton) {
    shareButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (best <= 0) {
        return;
      }
      const text = `サウンドメモリーでベストラウンド ${best} を達成！ #aomagame`;
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
1. スタートを押すと音と光のパターンが再生されます。
2. 覚えた順番どおりにボタンをタップしてください。
3. 成功するごとにパターンが1つずつ伸びていきます。集中力と記憶力でベストラウンド更新に挑みましょう。

## 実装メモ
- `AudioContext`で各パッドの音階を生成し、短いサウンドフィードバックを付与。
- 順番再生は`async/await`でディレイを挟み、タイミングの取りやすさを重視。
- スタート時にプレイ記録を更新し、連続ラウンドの更新があればハイスコアとして保存します。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="http://localhost:4000/tags/#aomagame">ゲーム一覧へ</a></p>
