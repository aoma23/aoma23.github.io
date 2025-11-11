---
title: "毎日ゲームチャレンジ Day 22: トラックタップ"
categories:
  - game
tags:
  - aomagame
  - 100日間毎日ゲームを公開する男
---

おはこんばんちは！100日間毎日ゲームを公開する男、aomaです！  
昨日のゲーム：<a href="{{ '/daily-web-game-day-21-sequence-runner/' | relative_url }}">シーケンスランナー</a>

22日目はリズムに合わせてタップする「トラックタップ」。画面を横切るトラック上のノートをタイミング良くタップし、コンボを伸ばしていきます。約1分間の軽快なBGMと効果音で盛り上がる、ライトな音ゲー感覚のワンボタンゲームです。

<style>
#track-tap-game {
  max-width: 520px;
  margin: 24px auto;
  padding: 28px;
  border-radius: 18px;
  background: linear-gradient(135deg, #312e81, #1e3a8a);
  color: #f8fafc;
  box-shadow: 0 26px 48px rgba(49, 46, 129, 0.38);
  text-align: center;
  font-family: "Inter", "Hiragino Kaku Gothic ProN", sans-serif;
}
#track-tap-game .hud {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  font-weight: 700;
  margin-bottom: 12px;
}
#track-tap-game .track {
  position: relative;
  width: min(92vw, 360px);
  height: 200px;
  margin: 0 auto 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.08);
  overflow: hidden;
}
#track-tap-game .note {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #22d3ee, #38bdf8);
  box-shadow: 0 12px 26px rgba(56, 189, 248, 0.32);
}
#track-tap-game .line {
  position: absolute;
  right: 48px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(248, 250, 252, 0.45);
}
#track-tap-game .controls {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
#track-tap-game button {
  border: none;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  touch-action: manipulation;
}
#track-tap-game .start {
  background: #38bdf8;
  color: #0f172a;
}
#track-tap-game .start:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 18px 34px rgba(56, 189, 248, 0.35);
}
#track-tap-game button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
#track-tap-game .log {
  margin-top: 16px;
  font-size: 0.95rem;
}
#track-tap-game .actions {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}
#track-tap-game .share-button {
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
#track-tap-game .share-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 22px 40px rgba(244, 114, 182, 0.45);
}
#track-tap-game .share-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}
</style>

<div id="track-tap-game">
  <div class="hud">
    <span class="time">残り: 60.0 秒</span>
    <span class="score">スコア: 0</span>
    <span class="best">ベスト: 0</span>
    <span class="streak">コンボ: 0</span>
  </div>
  <div class="track">
    <div class="line"></div>
  </div>
  <div class="controls">
    <button type="button" class="start">スタート</button>
  </div>
  <p class="log">スタートでノートが流れ始めます。ラインに重なった瞬間にタップ！</p>
  <div class="actions">
    <button type="button" class="share-button" disabled>ベストをXで共有</button>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById('track-tap-game');
  if (!root) {
    return;
  }

  const trackEl = root.querySelector('.track');
  const startButton = root.querySelector('.start');
  const timeEl = root.querySelector('.time');
  const scoreEl = root.querySelector('.score');
  const bestEl = root.querySelector('.best');
  const streakEl = root.querySelector('.streak');
  const logEl = root.querySelector('.log');
  const shareButton = root.querySelector('.share-button');
  const getPlayCountEl = () => document.querySelector('[data-aomagame-play-count]');

  const storageKey = 'aomagame:best:track-tap';
  const playedKey = 'aomagame:played:track-tap';
  const noteSymbols = ['●', '◆', '✶'];

  let audioCtx = null;
  let bgmGain = null;
  let bgmIntervalId = null;
  let bgmStopTimer = null;

  const notes = [];
  let spawnTimer = null;
  let animationId = null;
  let score = 0;
  let bestScore = 0;
  let streak = 0;
  let storageAvailable = false;
  let running = false;
  const timeLimit = 60;
  let startTime = 0;
  let remaining = timeLimit;

  const ensureAudio = () => {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) {
      return false;
    }
    if (!audioCtx) {
      audioCtx = new Context();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return true;
  };

  const stopBgm = () => {
    if (bgmIntervalId) {
      clearTimeout(bgmIntervalId);
      bgmIntervalId = null;
    }
    if (bgmStopTimer) {
      clearTimeout(bgmStopTimer);
      bgmStopTimer = null;
    }
    if (bgmGain) {
      bgmGain.disconnect();
      bgmGain = null;
    }
  };

  const startBgm = () => {
    if (!ensureAudio()) {
      return;
    }
    stopBgm();
    bgmGain = audioCtx.createGain();
    bgmGain.gain.value = 0.08;
    bgmGain.connect(audioCtx.destination);
    const pattern = [196, 246.94, 261.63, 196, 174.61, 196, 220, 246.94];
    let step = 0;
    const scheduleTone = () => {
      if (!bgmGain) {
        return;
      }
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = pattern[step % pattern.length];
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);
      osc.connect(gain).connect(bgmGain);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      step += 1;
      bgmIntervalId = setTimeout(scheduleTone, 460);
    };
    scheduleTone();
    bgmStopTimer = setTimeout(() => {
      stopBgm();
      if (running) {
        logEl.textContent = 'BGMが終わりました。ここで一息ついてもOK！';
      }
    }, 60000);
  };

  const playEffect = (frequency) => {
    if (!ensureAudio()) {
      return;
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.26);
  };

  const playHitSound = () => {
    playEffect(720);
  };

  const playMissSound = () => {
    playEffect(240);
  };

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
    streakEl.textContent = `コンボ: ${streak}`;
    shareButton.disabled = bestScore <= 0;
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
  };

  const clearGame = () => {
    notes.splice(0, notes.length).forEach((note) => note.remove());
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  };

  const createNote = () => {
    const note = document.createElement('div');
    note.className = 'note';
    note.dataset.x = '-40';
    note.dataset.speed = String(Math.random() * 120 + 180);
    note.dataset.hit = 'false';
    note.style.left = '-40px';
    note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
    trackEl.appendChild(note);
    notes.push(note);
  };

  const updateNotes = (timestamp) => {
    if (!running) {
      return;
    }
    if (!trackEl.dataset.last) {
      trackEl.dataset.last = String(timestamp);
    }
    const last = Number(trackEl.dataset.last);
    const delta = (timestamp - last) / 1000;
    trackEl.dataset.last = String(timestamp);

    const remove = [];
    notes.forEach((note) => {
      let x = Number(note.dataset.x) + Number(note.dataset.speed) * delta;
      note.dataset.x = String(x);
      note.style.left = `${x}px`;
      if (x > trackEl.clientWidth) {
        remove.push(note);
        streak = 0;
        logEl.textContent = 'ノートを逃しました…';
        playMissSound();
      }
    });
    remove.forEach((note) => {
      notes.splice(notes.indexOf(note), 1);
      note.remove();
    });

    const now = performance.now();
    remaining = Math.max(0, timeLimit - (now - startTime) / 1000);
    timeEl.textContent = `残り: ${remaining.toFixed(1)} 秒`;
    updateHud();
    if (remaining <= 0) {
      finishGame('time');
      return;
    }
    animationId = requestAnimationFrame(updateNotes);
  };

  const hitNote = () => {
    const lineX = trackEl.clientWidth - 48;
    const tolerance = 30;
    const target = notes.find((note) => {
      const x = Number(note.dataset.x);
      return Math.abs(x - lineX) <= tolerance;
    });
    return target ?? null;
  };

  const handleTap = () => {
    if (!running) {
      return;
    }
    const note = hitNote();
    if (note) {
      score += 1;
      streak += 1;
      logEl.textContent = 'ナイス！良いタイミングです。';
      playHitSound();
      note.remove();
      notes.splice(notes.indexOf(note), 1);
      if (score > bestScore) {
        bestScore = score;
        saveBest();
        shareButton.disabled = false;
      }
    } else {
      streak = 0;
      logEl.textContent = 'タイミングがずれました…';
      playMissSound();
    }
    updateHud();
  };

  const finishGame = (reason) => {
    if (!running) {
      return;
    }
    running = false;
    clearGame();
    stopBgm();
    startButton.disabled = false;
    startButton.textContent = 'もう一度';
    if (reason === 'time') {
      logEl.textContent = `制限時間終了！スコアは ${score}。ベスト更新を狙ってもう一度！`;
    }
    remaining = 0;
    updateHud();
  };

  const startGame = () => {
    markPlayed();
    score = 0;
    streak = 0;
    remaining = timeLimit;
    updateHud();
    logEl.textContent = 'ラインに合わせてタップしましょう。';
    startButton.disabled = true;
    startButton.textContent = 'プレイ中…';
    running = true;
    clearGame();
    delete trackEl.dataset.last;
    startTime = performance.now();
    updateHud();
    createNote();
    spawnTimer = setInterval(createNote, 1000);
    animationId = requestAnimationFrame(updateNotes);
    startBgm();
  };

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      handleTap();
    }
  });

  trackEl.addEventListener('click', () => {
    handleTap();
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
      const text = `トラックタップでベスト ${bestScore} を達成！ #aomagame`;
      const shareUrl = new URL('https://twitter.com/intent/tweet');
      shareUrl.searchParams.set('text', text);
      shareUrl.searchParams.set('url', window.location.href);
      window.open(shareUrl.toString(), '_blank', 'noopener');
    });
  }

  window.addEventListener('beforeunload', () => {
    stopBgm();
  });

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
1. スタートを押すとノートが右方向に流れ始め、1分間のBGMも同時にスタートします。
2. ラインにノートが重なったらクリック（またはスペースキー）でタイミング良くタップします。
3. ミスなくコンボを繋げると高スコア更新のチャンス。ヒットとミスで効果音も変化するので耳でもリズムを掴みましょう。

## 実装メモ
- ノートの動きは`requestAnimationFrame`で更新し、位置情報をデータ属性で管理。
- ヒット判定はラインとの距離に応じた許容値で実装し、クリックでもスペースキーでも遊べる仕様です。
- スタート時にプレイ回数を記録し、結果に応じてベストスコアを更新します。
- Web Audio APIで約60秒のBGMループとヒット／ミス効果音を生成し、ユーザー操作後にのみ再生されるよう制御しています。
- 同じループ内で残り時間のカウントダウンも行い、60秒経過で自動的にゲームを終了してログを表示します。

<p class="game-progress">これまでに遊んだゲーム数: <span data-aomagame-play-count>0</span></p>
<p class="game-link"><a href="{{ "/tags/#aomagame" | relative_url }}">ゲーム一覧へ</a></p>
