/* aoma's town: a small top-down RPG map that works as the homepage navigation.
   Every destination is also an ordinary link (warp menu + list below), so the page works without JavaScript. */
(() => {
  'use strict';
  const root = document.querySelector('[data-rpg]');
  const dataEl = document.getElementById('rpg-data');
  if (!root || !dataEl) return;
  const D = JSON.parse(dataEl.textContent);
  const stage = root.querySelector('.rpg-stage');
  const canvas = stage.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const $ = s => root.querySelector(s);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');
  root.classList.add('is-ready');

  /* ---------- map ---------- */
  const T = 16, W = 40, H = 28;
  const GRASS = 0, PATH = 1, WATER = 2, TREE = 3, STONE = 4, BRIDGE = 5, FLOWER = 6, PITCH = 7;
  const map = new Uint8Array(W * H);
  const solid = new Uint8Array(W * H);
  const inMap = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const get = (x, y) => (inMap(x, y) ? map[y * W + x] : TREE);
  const put = (x, y, v) => { if (inMap(x, y)) map[y * W + x] = v; };
  const fill = (x, y, w, h, v) => { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) put(i, j, v); };
  const hash = (x, y, k = 0) => (((x * 73856093) ^ (y * 19349663) ^ (k * 83492791)) >>> 0);

  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) put(x, y, TREE);
  fill(13, 0, 2, H, WATER);           // あおま川
  fill(22, 3, 4, 4, WATER);           // pond
  fill(2, 13, 36, 1, PATH);           // main street
  fill(4, 23, 32, 1, PATH);           // lower street
  fill(19, 2, 2, 22, PATH);           // north-south street
  fill(15, 9, 10, 9, STONE);          // central plaza
  fill(7, 8, 1, 5, PATH); fill(31, 8, 1, 5, PATH); fill(7, 22, 1, 1, PATH); fill(30, 22, 1, 1, PATH);
  for (const y of [13, 23]) for (const x of [13, 14]) put(x, y, BRIDGE);
  [[9, 9], [10, 9], [9, 10], [3, 9], [4, 10], [3, 10], [11, 16], [11, 17], [16, 3], [17, 4], [16, 4], [36, 8], [36, 9],
    [35, 15], [36, 16], [16, 20], [17, 21], [16, 21], [10, 25], [11, 25], [25, 25], [26, 25], [34, 25], [37, 22],
    [2, 18], [3, 25], [28, 12], [10, 4], [11, 5]].forEach(([x, y]) => put(x, y, TREE));
  for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) if (get(x, y) === GRASS && hash(x, y, 7) % 100 < 8) put(x, y, FLOWER);
  const PITCH_R = { x: 21, y: 18, w: 6, h: 5 };   // QuickBoard grounds
  const GOALS = [[21, 20], [26, 20]];
  fill(PITCH_R.x, PITCH_R.y, PITCH_R.w, PITCH_R.h, PITCH);
  for (let i = 0; i < W * H; i++) if (map[i] === WATER || map[i] === TREE) solid[i] = 1;

  const buildings = [
    { id: 'apps', name: '工房', sub: 'APPS', x: 4, y: 3, w: 7, h: 5, roof: '#d9734e', roofDark: '#a9503a', wall: '#f3e5c6', chimney: true },
    { id: 'games', name: 'ゲームセンター', sub: 'GAMES', x: 27, y: 3, w: 8, h: 5, roof: '#7458cf', roofDark: '#4f3a9a', wall: '#e9e0f7', neon: true },
    { id: 'library', name: '図書館', sub: 'BLOG', x: 4, y: 17, w: 7, h: 5, roof: '#4c7fbf', roofDark: '#335b8f', wall: '#eef0e6', columns: true },
    { id: 'house', name: 'aomaの家', sub: 'ABOUT', x: 27, y: 17, w: 7, h: 5, roof: '#c95757', roofDark: '#953a3c', wall: '#f7ecd9', chimney: true }
  ];
  buildings.forEach(b => {
    b.door = { x: b.x + (b.w >> 1), y: b.y + b.h - 1 };
    for (let j = b.y; j < b.y + b.h; j++) for (let i = b.x; i < b.x + b.w; i++) solid[j * W + i] = 1;
  });

  const objects = [
    { id: 'sign', kind: 'sign', label: '立て札', x: 22, y: 16 },
    { id: 'board', kind: 'board', label: '掲示板', x: 16, y: 9 },
    { id: 'fountain', kind: 'fountain', label: 'ふしぎな泉', x: 19, y: 10, w: 2, h: 2 },
    { id: 'cab', kind: 'cabinet', label: 'ゲーム機', x: 28, y: 9, i: 0 },
    { id: 'tactics', kind: 'tactics', label: '作戦ボード', x: 25, y: 17 },
    { id: 'calendar', kind: 'calendar', label: 'カレンダー', x: 35, y: 14 },
    { id: 'chest1', kind: 'chest', label: '宝箱', x: 2, y: 3 },
    { id: 'chest2', kind: 'chest', label: '宝箱', x: 36, y: 25 },
    { id: 'mailbox', kind: 'mailbox', label: 'ポスト', x: 34, y: 21 },
    // things that are just there
    { id: 'well', kind: 'well', label: '井戸', x: 10, y: 11 },
    { id: 'pot1', kind: 'pot', label: 'つぼ', x: 11, y: 7 },
    { id: 'pot2', kind: 'pot', label: 'つぼ', x: 12, y: 7 },
    { id: 'bench', kind: 'bench', label: 'ベンチ', x: 17, y: 16 },
    { id: 'stump', kind: 'stump', label: '切り株', x: 17, y: 6 },
    { id: 'duck', kind: 'duck', label: 'アヒル', x: 22, y: 5 },
    { id: 'river-sign', kind: 'sign', label: '看板', x: 12, y: 14 }
  ];
  objects.forEach(o => {
    o.w = o.w || 1; o.h = o.h || 1;
    for (let j = o.y; j < o.y + o.h; j++) for (let i = o.x; i < o.x + o.w; i++) solid[j * W + i] = 1;
  });

  const makeEnt = (o) => Object.assign({ fx: o.x, fy: o.y, t: 1, moving: false, dir: 'down', wait: 1 }, o);
  const npcs = [
    makeEnt({ id: 'cat', kind: 'cat', label: 'ねこ', x: 23, y: 11, home: [23, 12], radius: 3 }),
    makeEnt({ id: 'robot', kind: 'robot', label: 'AIロボ', x: 11, y: 20, home: [11, 20], radius: 1 }),
    makeEnt({ id: 'fisher', kind: 'fisher', label: '釣り人', x: 12, y: 18, home: [12, 18], radius: 0, dir: 'right', idleDir: 'right' }),
    makeEnt({ id: 'villager', kind: 'villager', label: '村人', x: 26, y: 15, home: [26, 15], radius: 2 }),
    makeEnt({ id: 'coach', kind: 'coach', label: 'コーチ', x: 27, y: 22, home: [27, 22], radius: 0, dir: 'left', idleDir: 'left' }),
    makeEnt({ id: 'couple1', kind: 'couple', label: 'ふたり', x: 33, y: 15, home: [33, 15], radius: 0, dir: 'right', idleDir: 'right' }),
    makeEnt({ id: 'couple2', kind: 'couple', label: 'ふたり', x: 34, y: 15, home: [34, 15], radius: 0, dir: 'left', idleDir: 'left' })
  ];
  const ball = { id: 'ball', kind: 'ball', label: 'ボール', x: 23, y: 20, fx: 23, fy: 20, t: 1, moving: false, roll: 0, dir: 'right', spin: 0, goals: 0, reset: 0 };
  const player = makeEnt({ id: 'player', x: 20, y: 15, steps: 0 });

  /* ---------- discovery log ---------- */
  const DISCOVER = ['apps', 'games', 'library', 'house', 'fountain', 'board', 'sign', 'mailbox', 'chest', 'cat', 'robot', 'arcade',
    'well', 'pot', 'bench', 'stump', 'duck', 'fisher', 'villager', 'river-sign',
    'quickboard', 'coach', 'goal', 'kinenbi', 'couple'];
  const STORE = 'aoma-town-found-v1';
  let found = new Set();
  let celebrated = false;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
    found = new Set((saved.found || []).filter(k => DISCOVER.includes(k)));
    celebrated = !!saved.celebrated;
  } catch (e) { /* storage unavailable */ }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify({ found: [...found], celebrated })); } catch (e) { /* ignore */ } };
  const foundEl = $('.rpg-found b');
  $('.rpg-found i').textContent = DISCOVER.length;
  const updateFound = () => { foundEl.textContent = found.size; $('.rpg-found').classList.toggle('is-complete', found.size === DISCOVER.length); };
  const discover = key => { if (!found.has(key)) { found.add(key); save(); updateFound(); } };
  updateFound();

  /* ---------- content scripts ---------- */
  const posts = D.posts || [];
  const games = D.games || [];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const postChoice = p => ({ label: p.t, sub: p.d, href: p.u });
  const gameChoice = (g, label) => ({ label: label || g.title, sub: g.day ? `DAY ${g.day}${g.kind ? ' ・ ' + g.kind : ''}` : '', href: g.url, img: g.image });
  const findGame = day => games.find(g => g.day === day);

  const scripts = {
    sign: o => (o && o.id === 'river-sign' ? {
      name: '看板', discover: 'river-sign',
      pages: ['「あおま川　つり禁止」', '……と書いてある。すぐそこで誰か釣りをしているけど。']
    } : {
      name: '立て札', discover: 'sign',
      pages: ['「ようこそ、aomaの街へ。アプリの工房、ゲームセンター、日記の図書館があります。」',
        coarse.matches ? '「行きたい場所をタップすると歩いていきます。Ⓐボタンで目の前のものを調べられます。」'
          : '「矢印キー（WASD）で移動、Space・Enter・Z で調べる。行きたい場所をクリックしても歩いていきます。」',
        `「街には ${DISCOVER.length} 個の見どころがあります。役に立つものも、立たないものも。ぜんぶ見つけられるかな？」`]
    }),
    board: () => ({
      name: '掲示板', discover: 'board',
      pages: ['新しいお知らせが貼ってある。'],
      choices: [...posts.slice(0, 3).map(postChoice), { label: '記事一覧を見る', href: '/posts/' }]
    }),
    fountain: () => {
      const pool = posts.length > 12 ? posts.slice(10) : posts;
      const p = pick(pool);
      return {
        name: 'ふしぎな泉', discover: 'fountain',
        pages: ['泉をのぞきこむと、むかしの記事が浮かんできた……。', p ? `「${p.t}」（${p.d}）` : '……なにも見えない。'],
        choices: [...(p ? [{ label: 'この記事を読む', sub: p.d, href: p.u }] : []), { label: 'もう一度のぞく', run: () => interactById('fountain') }]
      };
    },
    apps: () => ({
      name: '工房', discover: 'apps',
      pages: ['工房へようこそ。日々の「これがほしい」を、アプリにしています。'],
      choices: [...D.apps.map(a => ({ label: a.name, sub: a.desc, href: a.url, img: a.img, external: /^https?:/.test(a.url) })), { label: 'アプリ一覧へ', href: '/apps/' }]
    }),
    games: () => ({
      name: 'ゲームセンター', discover: 'games',
      pages: ['いらっしゃい！ 毎日1本ずつ作った、100本のゲームがあるよ。', 'パズルにアクション、ねこをなでるだけのゲームまで。どれにする？'],
      choices: [...(games.length ? [{ label: 'ランダムで1本えらんでもらう', run: () => openDialog(scripts.gacha('ゲームセンター')) }] : []), { label: 'ゲーム100本の一覧へ', href: '/games100/' }]
    }),
    gacha: (name, intro) => {
      const g = pick(games);
      return { name, discover: name === 'ゲーム機' ? 'arcade' : null, pages: [intro ? intro(g) : `「${g.title}」が出てきた！`], choices: [gameChoice(g, `「${g.title}」で遊ぶ`), { label: 'ほかのゲームにする', run: () => openDialog(scripts.gacha(name, intro)) }] };
    },
    cabinet: () => scripts.gacha('ゲーム機', g => `100本のうち、どれかが動いている。いまは「${g.title}」のデモ画面だ。`),
    library: () => ({
      name: '図書館', discover: 'library',
      pages: ['図書館です。試したこと、作ったこと、考えたことを、本にして並べています。', '新しく入った本はこちら。'],
      choices: [...posts.slice(0, 6).map(postChoice), { label: '記事をすべて見る', href: '/posts/' }, { label: 'タグからさがす', href: '/tags/' }]
    }),
    house: () => ({
      name: 'aoma', portrait: D.avatar, discover: 'house',
      pages: ['あ、いらっしゃい。aomaです。エンジニアをしています。', 'アプリやゲームを作ったり、試したことや気づいたことをブログに書いたりしています。ゆっくりしていってね。'],
      choices: [{ label: 'プロフィールを見る', href: '/about/' }, { label: 'X（@aoma_dev）', href: 'https://x.com/aoma_dev', external: true }]
    }),
    mailbox: () => ({
      name: 'ポスト', discover: 'mailbox',
      pages: ['「aoma」と書かれたポストだ。', 'お手紙は X で受け付けているらしい。'],
      choices: [{ label: 'X で話しかける', href: 'https://x.com/aoma_dev', external: true }]
    }),
    chest: o => {
      const again = opened.has(o.id);
      opened.add(o.id);
      const head = again ? 'からっぽ……と思ったら、また何か入っていた！' : '宝箱をあけた！';
      if (posts.length > 20 && Math.random() < 0.25) {
        const p = pick(posts.slice(20));
        return { name: '宝箱', discover: 'chest', pages: [head, `古い日記を見つけた。「${p.t}」と書いてある。`], choices: [{ label: '読んでみる', sub: p.d, href: p.u }] };
      }
      const [item, note] = pick(JUNK);
      return { name: '宝箱', discover: 'chest', pages: [head, `${item}を手に入れた！`, note] };
    },
    cat: () => ({ name: 'ねこ', discover: 'cat', pages: pick(CAT) }),
    robot: () => {
      const ai = posts.filter(p => /AI|Claude|ChatGPT|Gemini|Codex|LLM|Copilot|Cursor|Notion/i.test(p.t)).slice(0, 4);
      return {
        name: 'AIロボ', discover: 'robot',
        pages: ['ピピッ。ワタシハ AIロボ デス。', ai.length ? 'AI ノ 記事ヲ オススメ シマス。' : 'キョウモ ヘイワ デス。'],
        choices: ai.map(postChoice)
      };
    },
    well: () => ({ name: '井戸', discover: 'well', pages: ['井戸をのぞきこんだ。', pick(['……自分の顔が映っている。', '「おーい」と言ってみた。「おーい」と返ってきた。', '……底が見えない。小銭が光っている気がする。'])] }),
    pot: o => {
      const n = (o.count = (o.count || 0) + 1);
      return { name: 'つぼ', discover: 'pot', pages: n === 1 ? ['つぼを調べた。', 'なにも入っていなかった。'] : n < 4 ? ['やっぱり、なにも入っていない。'] : ['……つぼの気持ちになってきた。'] };
    },
    bench: () => ({ name: 'ベンチ', discover: 'bench', pages: ['ベンチにすわって、ひとやすみした。', pick(['噴水の音が聞こえる。', 'ねこがこっちを見ている。', '体力が回復した気がする。（気のせい）'])] }),
    stump: () => ({ name: '切り株', discover: 'stump', pages: ['切り株だ。', '年輪を数えてみたら、23本あった。'] }),
    duck: () => ({ name: 'アヒル', discover: 'duck', pages: [pick(['グワッ。', 'グワッ グワッ。', '……（無視された）'])] }),
    fisher: n => {
      const k = (n.count = (n.count || 0) + 1);
      return { name: '釣り人', discover: 'fisher', pages: FISHER[Math.min(k, FISHER.length) - 1] };
    },
    villager: () => ({ name: '村人', discover: 'villager', pages: [pick(VILLAGER)] }),
    tactics: () => ({
      name: '作戦ボード', discover: 'quickboard',
      pages: ['作戦ボードだ。青と赤のマグネットが、フォーメーションの形に並んでいる。',
        'これは QuickBoard。サッカーの戦術を、ブラウザでさっと作れる。', 'インストールもいらないし、URL でチームにそのまま共有できる。'],
      choices: [appChoice('QuickBoard', 'QuickBoard を使ってみる')]
    }),
    coach: n => {
      const k = (n.count = (n.count || 0) + 1);
      const lines = [
        ['「おう、ボールを押してゴールに入れてみな！」', '「Space で蹴る、向きを変えずに歩けばドリブルだ」'],
        ['「作戦は QuickBoard で作って、グループにURLを貼るだけ」', '「試合前に、スマホで全員が同じ図を見られるんだ」'],
        ['「4-4-2か、4-3-3か……」', '「悩んだら、ボードに並べて動かしてみるのが一番だ」']
      ];
      return { name: 'コーチ', discover: 'coach', pages: lines[(k - 1) % lines.length], choices: [appChoice('QuickBoard', 'QuickBoard を見てみる')] };
    },
    calendar: () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const days = (a, b) => Math.round((b - a) / 86400000);
      const wd = '日月火水木金土'[today.getDay()];
      const pages = [`カレンダーだ。今日は ${today.getMonth() + 1}月${today.getDate()}日（${wd}）。`];
      const first = posts.length && posts[posts.length - 1].d.split('.').map(Number);
      if (first) pages.push(`このブログに最初の記事を書いた ${first[0]}年${first[1]}月${first[2]}日 から、今日で ${days(new Date(first[0], first[1] - 1, first[2]), today).toLocaleString()}日。`);
      pages.push(`お正月まで、あと ${days(today, new Date(today.getFullYear() + 1, 0, 1))}日。`);
      pages.push('「あの日から何日？」「次の記念日まで何日？」そんな数え方は KINENBI におまかせ。');
      return { name: 'カレンダー', discover: 'kinenbi', pages, choices: [appChoice('KINENBI', 'KINENBI で記念日をつくる')] };
    },
    couple: () => ({
      name: 'ふたり', discover: 'couple',
      pages: ['「今日でつきあって 993日目なんだ」', '「1000日記念まで、あと7日。KINENBI でカウントダウンしてるの」', '（しあわせそうだ……）'],
      choices: [appChoice('KINENBI', 'KINENBI を見てみる')]
    })
  };
  const appChoice = (name, label) => {
    const a = D.apps.find(a => a.name === name);
    return { label, sub: a.desc, href: a.url, img: a.img, external: /^https?:/.test(a.url) };
  };
  const JUNK = [
    ['ただの石ころ', '……持って帰るかどうか、少しまよった。'],
    ['よく乾いた葉っぱ', 'いい音がする。'],
    ['片方だけの靴下', 'もう片方はどこへ行ったのだろう。'],
    ['どんぐり', 'ぼうしつきだ。ちょっとうれしい。'],
    ['謎のネジ', 'どこかの何かが、ゆるんでいるかもしれない。'],
    ['使いかけの消しゴム', 'かどは、もう残っていない。'],
    ['セミのぬけがら', '夏の思い出だ。'],
    ['書きかけのメモ', '「TODO: あとでやる」と書いてある。']
  ];
  const CAT = [
    ['にゃーん。'],
    ['（あくびをしている）'],
    ['ゴロゴロ……。', '（なでさせてくれた）'],
    ['（しっぽで、ぺしっとたたかれた）'],
    ['……。', '（こちらを見ているが、何も言わない）']
  ];
  const FISHER = [
    ['今日はつれないなあ。'],
    ['看板？ ……見なかったことにしてくれ。'],
    ['ここは昔から、長靴しかつれないんだ。'],
    ['…………。', '（集中しているようだ）']
  ];
  const VILLAGER = [
    'このへんは平和だよ。毎日だれかが何かを作ってる。',
    'グラウンドでボール蹴ると、けっこう気持ちいいよ。',
    'あそこのふたり、毎日なにかの記念日らしいよ。',
    '図書館の本、気づくと増えてるんだ。',
    'aomaさんなら、たぶん家でコード書いてるよ。',
    '泉をのぞくと、むかしの記事が見えるらしいよ。',
    '宝箱？ だいたいガラクタだったよ。'
  ];
  const opened = new Set();


  /* ---------- targets & pathfinding ---------- */
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const occupied = (x, y, self) => {
    for (const e of [player, ...npcs]) {
      if (e === self) continue;
      if ((e.x === x && e.y === y) || (e.moving && e.fx === x && e.fy === y)) return true;
    }
    return false;
  };
  const ballAt = (x, y) => (ball.x === x && ball.y === y) || (ball.moving && ball.fx === x && ball.fy === y);
  const blocked = (x, y, self) => !inMap(x, y) || solid[y * W + x] === 1 || occupied(x, y, self) || (self !== ball && ballAt(x, y));
  const inRect = (r, x, y) => x >= r.x && y >= r.y && x < r.x + (r.w || 1) && y < r.y + (r.h || 1);

  function targetAt(x, y) {
    const o = objects.find(o => inRect(o, x, y));
    if (o) return { type: 'obj', ref: o, label: o.label };
    const n = npcs.find(n => (n.x === x && n.y === y) || (n.moving && n.fx === x && n.fy === y));
    if (n) return { type: 'npc', ref: n, label: n.label };
    if (ballAt(x, y)) return { type: 'ball', ref: ball, label: 'ボール' };
    const b = buildings.find(b => inRect(b, x, y));
    if (b) return { type: 'building', ref: b, label: b.name };
    return null;
  }
  function approachTiles(t) {
    if (t.type === 'building') return [[t.ref.door.x, t.ref.door.y + 1]];
    const r = t.ref, out = [];
    const x0 = r.x, y0 = r.y, w = r.w || 1, h = r.h || 1;
    for (let i = x0; i < x0 + w; i++) { out.push([i, y0 + h]); out.push([i, y0 - 1]); }
    for (let j = y0; j < y0 + h; j++) { out.push([x0 - 1, j]); out.push([x0 + w, j]); }
    return out.filter(([x, y]) => inMap(x, y) && !solid[y * W + x]);
  }
  function findPath(goals) {
    const goalSet = new Set(goals.map(([x, y]) => y * W + x));
    const start = player.y * W + player.x;
    if (goalSet.has(start)) return [];
    const prev = new Int32Array(W * H).fill(-1);
    prev[start] = start;
    const queue = [start];
    for (let qi = 0; qi < queue.length; qi++) {
      const cur = queue[qi];
      const cx = cur % W, cy = (cur / W) | 0;
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = cx + dx, ny = cy + dy, ni = ny * W + nx;
        if (!inMap(nx, ny) || prev[ni] !== -1 || blocked(nx, ny, player)) continue;
        prev[ni] = cur;
        if (goalSet.has(ni)) {
          const path = [];
          for (let c = ni; c !== start; c = prev[c]) path.unshift([c % W, (c / W) | 0]);
          return path;
        }
        queue.push(ni);
      }
    }
    return null;
  }
  function faceToward(t) {
    if (t.type === 'building') { player.dir = 'up'; return; }
    const r = t.ref, w = r.w || 1, h = r.h || 1;
    if (player.y >= r.y + h) player.dir = 'up';
    else if (player.y < r.y) player.dir = 'down';
    else player.dir = player.x < r.x ? 'right' : 'left';
  }
  const frontTile = () => { const [dx, dy] = DIRS[player.dir]; return [player.x + dx, player.y + dy]; };
  const frontTarget = () => (player.moving ? null : targetAt(...frontTile()));

  function interact(t) {
    faceToward(t);
    if (t.type === 'ball') { kickBall(player.dir, 2); return; }
    let spec;
    if (t.type === 'building') spec = scripts[t.ref.id]();
    else if (t.type === 'npc') {
      const n = t.ref;
      n.dir = player.x < n.x ? 'left' : player.x > n.x ? 'right' : player.y < n.y ? 'up' : 'down';
      n.talking = true;
      spec = scripts[n.kind](n);
      spec.onClose = () => { n.talking = false; n.wait = 1.5; };
    } else spec = scripts[t.ref.kind](t.ref);
    openDialog(spec);
  }
  const interactById = id => {
    const o = objects.find(o => o.id === id);
    if (o) openDialog(scripts[o.kind](o));
  };

  /* ---------- movement ---------- */
  const WALK = 6.2, RUN = 13;
  let path = null, pathGoals = null, pendingTarget = null, speed = WALK;
  const held = new Set();
  let padDir = null;
  let tapDir = null; // a key tapped and released between frames still takes one step
  const inputDir = () => { const keys = [...held]; return keys.length ? keys[keys.length - 1] : padDir || tapDir; };

  function tryStep(ent, dir) {
    const [dx, dy] = DIRS[dir];
    const nx = ent.x + dx, ny = ent.y + dy;
    ent.dir = dir;
    if (blocked(nx, ny, ent)) return false;
    ent.fx = ent.x; ent.fy = ent.y; ent.x = nx; ent.y = ny; ent.t = 0; ent.moving = true;
    return true;
  }
  const clearPath = () => { path = null; pathGoals = null; pendingTarget = null; speed = WALK; };
  function goTo(t, spd) {
    const goals = t ? approachTiles(t) : null;
    if (!goals || !goals.length) return false;
    const p = findPath(goals);
    if (p === null) return false;
    if (p.length === 0 && !player.moving) { clearPath(); interact(t); return true; }
    path = p; pathGoals = goals; pendingTarget = t; speed = spd || WALK;
    return true;
  }

  function updatePlayer(dt) {
    if (player.moving) {
      player.t += dt * speed;
      if (player.t < 1) return;
      player.t = 1; player.moving = false; player.steps++;
      onTileChange();
    }
    if (dialog) return;
    let dir = inputDir();
    tapDir = null;
    const manual = !!dir;
    if (manual && path) clearPath();
    if (!dir && path) {
      if (!path.length) {
        const t = pendingTarget; clearPath();
        if (t) interact(t);
        return;
      }
      const [nx, ny] = path[0];
      dir = nx > player.x ? 'right' : nx < player.x ? 'left' : ny > player.y ? 'down' : 'up';
      if (tryStep(player, dir)) { path.shift(); return; }
      const goals = pathGoals, t = pendingTarget, spd = speed;
      clearPath();
      const p = findPath(goals);
      if (p) { path = p; pathGoals = goals; pendingTarget = t; speed = spd; }
      return;
    }
    if (!dir) return;
    if (!tryStep(player, dir) && manual) {
      const [fx, fy] = frontTile();
      if (ballAt(fx, fy)) { kickBall(dir, 1); return; }
      const b = buildings.find(b => b.door.x === fx && b.door.y === fy);
      if (b && dir === 'up' && bumpReady) { bumpReady = false; interact({ type: 'building', ref: b }); }
    }
  }
  let bumpReady = true;

  function kickBall(dir, roll) {
    if (ball.moving || ball.reset) return;
    const [dx, dy] = DIRS[dir];
    const nx = ball.x + dx, ny = ball.y + dy;
    if (!inRect(PITCH_R, nx, ny) || blocked(nx, ny, ball)) { bubble('ゴツン', 0.8); return; }
    ball.dir = dir; ball.roll = roll - 1;
    ball.fx = ball.x; ball.fy = ball.y; ball.x = nx; ball.y = ny; ball.t = 0; ball.moving = true;
  }
  function updateBall(dt) {
    if (ball.reset) {
      ball.reset -= dt;
      if (ball.reset <= 0) {
        ball.reset = 0;
        if (!occupied(23, 20, ball)) { ball.x = ball.fx = 23; ball.y = ball.fy = 20; }
      }
      return;
    }
    if (!ball.moving) return;
    ball.t += dt * 9;
    ball.spin += dt * 12;
    if (ball.t < 1) return;
    ball.t = 1; ball.moving = false;
    const horizontal = ball.dir === 'left' || ball.dir === 'right';
    if (horizontal && GOALS.some(([gx, gy]) => gx === ball.x && gy === ball.y)) {
      ball.goals++;
      discover('goal');
      bubble(ball.goals === 1 ? 'ゴール！！' : `ゴール！！（${ball.goals}点目）`, 2.2);
      ball.reset = 1.2;
      return;
    }
    if (ball.roll > 0) kickBall(ball.dir, ball.roll);
  }
  function updateNpc(n, dt) {
    if (n.moving) {
      n.t += dt * 3;
      if (n.t >= 1) { n.t = 1; n.moving = false; }
      return;
    }
    if (n.talking || (pendingTarget && pendingTarget.ref === n)) return;
    if (!n.radius) { n.dir = n.idleDir || n.dir; return; }
    n.wait -= dt;
    if (n.wait > 0) return;
    n.wait = 1 + Math.random() * 2.5;
    const dir = pick(Object.keys(DIRS));
    const [dx, dy] = DIRS[dir];
    const nx = n.x + dx, ny = n.y + dy;
    if (Math.abs(nx - n.home[0]) > n.radius || Math.abs(ny - n.home[1]) > n.radius) { n.dir = dir; return; }
    tryStep(n, dir);
  }

  /* ---------- HUD ---------- */
  const areaEl = $('.rpg-area');
  const hintEl = $('.rpg-hint');
  const areaName = (x, y) => {
    if (inRect(PITCH_R, x, y)) return 'グラウンド';
    if (x >= 31 && y >= 13 && y <= 16) return '記念日の小道';
    if (x >= 15 && x <= 24 && y >= 9 && y <= 17) return '中央広場';
    if (x === 13 || x === 14) return y === 13 || y === 23 ? 'あおま橋' : 'あおま川';
    if (x < 13) return y <= 13 ? '工房通り' : '図書館の丘';
    if (x > 24) return y <= 13 ? 'ゲームセンター前' : 'aomaの家のまわり';
    return y < 9 ? '北の小道' : '南の小道';
  };
  let lastArea = '';
  function onTileChange() {
    const a = areaName(player.x, player.y);
    if (a !== lastArea) {
      lastArea = a; areaEl.textContent = a;
      areaEl.classList.remove('is-new'); void areaEl.offsetWidth; areaEl.classList.add('is-new');
    }
  }
  let lastHint = '';
  function updateHint() {
    const t = dialog ? null : frontTarget();
    const touch = coarse.matches;
    const verb = t && t.type === 'ball' ? 'を蹴る' : 'を調べる';
    const text = dialog ? '' : t ? (touch ? `Ⓐ ${t.label}${verb}` : `Space ${t.label}${verb}`)
      : (touch ? 'タップした場所へ歩きます' : '矢印キー / WASD で移動 ・ クリックした場所へ歩きます');
    if (text !== lastHint) { lastHint = text; hintEl.textContent = text; hintEl.classList.toggle('is-target', !!t); }
    return t;
  }

  /* ---------- dialog ---------- */
  const dlg = $('.rpg-dialog');
  const dName = $('.rpg-dialog__name');
  const dText = $('.rpg-dialog__text');
  const dLive = $('.rpg-live');
  const dChoices = $('.rpg-choices');
  const dPortrait = $('.rpg-dialog__portrait');
  let dialog = null;

  function openDialog(spec) {
    if (dialog && dialog.onClose) dialog.onClose();
    dialog = Object.assign({ choices: [], pages: [''] }, spec, { page: 0, shown: 0, done: false });
    if (spec.discover) discover(spec.discover);
    dlg.hidden = false;
    root.classList.add('is-talking');
    dName.textContent = spec.name;
    if (spec.portrait) { dPortrait.src = spec.portrait; dPortrait.hidden = false; } else dPortrait.hidden = true;
    held.clear(); padDir = null; tapDir = null;
    showPage();
    if (document.activeElement !== stage && !stage.contains(document.activeElement)) stage.focus({ preventScroll: true });
    else if (stage.contains(document.activeElement) && document.activeElement !== stage) stage.focus({ preventScroll: true });
  }
  function showPage() {
    const text = dialog.pages[dialog.page];
    dialog.shown = reduceMotion.matches ? text.length : 0;
    dialog.done = false;
    dChoices.replaceChildren();
    dlg.classList.remove('has-choices');
    dLive.textContent = `${dialog.name}：${text}`;
    renderText();
  }
  function renderText() {
    const text = dialog.pages[dialog.page];
    dText.textContent = text.slice(0, Math.floor(dialog.shown));
    if (dialog.shown >= text.length && !dialog.done) {
      dialog.done = true;
      const last = dialog.page === dialog.pages.length - 1;
      dlg.classList.toggle('is-last', last);
      if (last) renderChoices();
    }
  }
  function renderChoices() {
    const items = [...dialog.choices, { label: 'とじる', run: closeDialog, close: true }];
    for (const c of items) {
      const li = document.createElement('li');
      const el = document.createElement(c.href ? 'a' : 'button');
      el.className = 'rpg-choice' + (c.close ? ' rpg-choice--close' : '') + (c.img ? ' has-img' : '');
      if (c.href) {
        el.href = c.href;
        if (c.external) { el.target = '_blank'; el.rel = 'noopener'; }
      } else {
        el.type = 'button';
        el.addEventListener('click', e => { e.stopPropagation(); c.run(); });
      }
      if (c.img) {
        const img = document.createElement('img');
        img.src = c.img; img.alt = ''; img.loading = 'lazy'; img.width = 96; img.height = 54;
        el.append(img);
      }
      const label = document.createElement('span');
      label.className = 'rpg-choice__label';
      label.textContent = c.label;
      if (c.sub) { const s = document.createElement('small'); s.textContent = c.sub; label.append(s); }
      el.append(label);
      if (c.external) { const ext = document.createElement('span'); ext.className = 'rpg-choice__ext'; ext.setAttribute('aria-hidden', 'true'); ext.textContent = '↗'; el.append(ext); }
      li.append(el);
      dChoices.append(li);
    }
    dlg.classList.add('has-choices');
    dChoices.scrollTop = 0;
    const first = dChoices.querySelector('.rpg-choice');
    if (first) first.focus({ preventScroll: true });
  }
  function tickDialog(dt) {
    if (!dialog || dialog.done) return;
    dialog.shown += dt * 48;
    renderText();
  }
  function advance(fromKey = true) {
    if (!dialog) return;
    if (!dialog.done) { dialog.shown = Infinity; renderText(); return; }
    if (dialog.page < dialog.pages.length - 1) { dialog.page++; showPage(); return; }
    if (!fromKey && dialog.choices.length) return; // a stray tap shouldn't dismiss a menu
    closeDialog();
  }
  function closeDialog() {
    if (!dialog) return;
    const d = dialog;
    dialog = null;
    dlg.hidden = true;
    root.classList.remove('is-talking');
    held.clear(); padDir = null; tapDir = null;
    if (d.onClose) d.onClose();
    stage.focus({ preventScroll: true });
    if (found.size === DISCOVER.length && !celebrated) {
      celebrated = true; save();
      const share = 'https://x.com/intent/post?text=' + encodeURIComponent('aomaの街の見どころを、ぜんぶ見つけた！ https://aoma23.com/');
      openDialog({
        name: 'ぼうけんの記録', portrait: D.avatar,
        pages: [`すべての見どころ（${DISCOVER.length}/${DISCOVER.length}）を見つけました！`, 'ここまで歩いてくれて、ありがとう。またいつでも遊びにきてね。'],
        choices: [{ label: 'ポストする', href: share, external: true }]
      });
    }
  }
  dlg.addEventListener('click', e => { if (!e.target.closest('.rpg-choice, .rpg-choices')) advance(false); });

  /* ---------- input ---------- */
  const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  const isAction = e => e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'KeyZ';
  let visibleRatio = 0;

  function actionPressed() {
    if (dialog) { advance(); return; }
    const t = frontTarget();
    if (t) { clearPath(); interact(t); } else if (!player.moving) bubble('……', 1.2);
  }

  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const active = document.activeElement;
    const inStage = stage.contains(active);
    if (!inStage) {
      const idle = !active || active === document.body || active === document.documentElement;
      if (!(idle && visibleRatio >= 0.55 && (KEYMAP[e.code] || isAction(e)))) return;
      stage.focus({ preventScroll: true });
    }
    const dir = KEYMAP[e.code];
    if (dialog) {
      const choices = [...dChoices.querySelectorAll('.rpg-choice')];
      const i = choices.indexOf(document.activeElement);
      if (e.key === 'Escape' || e.code === 'KeyX') { e.preventDefault(); closeDialog(); return; }
      if (dir) {
        e.preventDefault();
        if (choices.length && dialog.done) {
          const step = dir === 'down' || dir === 'right' ? 1 : -1;
          choices[(Math.max(i, step > 0 ? -1 : 0) + step + choices.length) % choices.length].focus();
        }
        return;
      }
      if (isAction(e)) {
        if (i >= 0 && dialog.done) {
          if (e.code === 'Enter' || e.code === 'NumpadEnter') return; // native activation
          e.preventDefault(); if (!e.repeat) choices[i].click(); return;
        }
        e.preventDefault(); if (!e.repeat) advance();
      }
      return;
    }
    if (dir) { e.preventDefault(); if (!e.repeat) { held.delete(dir); held.add(dir); tapDir = dir; } return; }
    if (isAction(e) && active === stage || isAction(e) && !inStage) { e.preventDefault(); if (!e.repeat) actionPressed(); }
  });
  window.addEventListener('keyup', e => {
    const dir = KEYMAP[e.code];
    if (dir) held.delete(dir);
    if (!held.size) bumpReady = true;
  });
  window.addEventListener('blur', () => { held.clear(); padDir = null; });
  stage.addEventListener('focusout', e => { if (!stage.contains(e.relatedTarget)) held.clear(); });

  let marker = null;
  canvas.addEventListener('click', e => {
    if (dialog) { advance(false); return; }
    stage.focus({ preventScroll: true });
    const rect = canvas.getBoundingClientRect();
    const lx = ((e.clientX - rect.left) * dpr + camPx.x) / ds;
    const ly = ((e.clientY - rect.top) * dpr + camPx.y) / ds;
    const tx = Math.floor(lx / T), ty = Math.floor(ly / T);
    if (!inMap(tx, ty)) return;
    let t = targetAt(tx, ty);
    if (!t && ly / T - ty > 0.5) { // tall sprites poke up into the tile above
      const below = targetAt(tx, ty + 1);
      if (below && below.type === 'obj' && ['calendar', 'cabinet', 'well', 'tactics'].includes(below.ref.kind)) t = below;
    }
    marker = { x: tx, y: ty, life: 0.6 };
    if (t) { if (!goTo(t, WALK)) bubble('とどかない…', 1.2); return; }
    if (solid[ty * W + tx]) { bubble('……', 1); return; }
    const p = findPath([[tx, ty]]);
    if (p) { path = p; pathGoals = [[tx, ty]]; pendingTarget = null; speed = WALK; } else bubble('とどかない…', 1.2);
  });

  root.querySelectorAll('.rpg-pad [data-dir]').forEach(btn => {
    const dir = btn.dataset.dir;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.setPointerCapture(e.pointerId); clearPath(); padDir = dir; bumpReady = true; });
    const up = () => { if (padDir === dir) padDir = null; };
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('lostpointercapture', up);
  });
  const aBtn = $('.rpg-pad__a');
  if (aBtn) aBtn.addEventListener('click', e => { e.preventDefault(); actionPressed(); });

  root.querySelectorAll('[data-goto]').forEach(a => a.addEventListener('click', e => {
    const b = buildings.find(b => b.id === a.dataset.goto);
    if (!b) return;
    e.preventDefault();
    if (dialog) closeDialog();
    const r = stage.getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) stage.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    stage.focus({ preventScroll: true });
    const t = { type: 'building', ref: b };
    if (!goTo(t, RUN)) {
      player.x = player.fx = b.door.x; player.y = player.fy = b.door.y + 1; player.moving = false;
      snapCamera = true; onTileChange(); interact(t);
    }
  }));

  /* ---------- rendering ---------- */
  let dpr = 1, ds = 3, viewW = 0, viewH = 0;
  const cam = { x: 0, y: 0 };
  const camPx = { x: 0, y: 0 };
  let snapCamera = true;
  function resize() {
    const cssW = stage.clientWidth, cssH = stage.clientHeight;
    if (!cssW || !cssH) return;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    const tiles = cssW < 640 ? 10.5 : cssW < 960 ? 14 : 17;
    ds = Math.max(2, Math.round(canvas.width / (T * tiles)));
    viewW = canvas.width / ds; viewH = canvas.height / ds;
    snapCamera = true;
  }
  new ResizeObserver(resize).observe(stage);

  const C = {
    grass: '#93c472', grassD: '#7fb15f', grassL: '#a8d388',
    path: '#e8d6a6', pathD: '#cdb683', pathDot: '#d9c393',
    stone: '#dcd5c2', stoneD: '#c2b9a2', stoneL: '#ebe6d6',
    water: '#5ba8c9', waterD: '#4a91b2', waterL: '#a5d8e6', foam: '#d5eef0',
    leaf: '#3f7d4e', leafL: '#58995a', leafD: '#2c5f3d', trunk: '#7a5536',
    wood: '#c49460', woodD: '#8e6537', ink: '#2b3a36'
  };
  const pathLike = v => v === PATH || v === BRIDGE || v === STONE;

  const layer = document.createElement('canvas');
  layer.width = W * T; layer.height = H * T;
  const L = layer.getContext('2d');
  const R = (c, x, y, w, h, g = L) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

  function drawGrass(px, py, x, y) {
    R(C.grass, px, py, T, T);
    const h = hash(x, y);
    R(C.grassD, px + (h % 11) + 1, py + ((h >> 4) % 11) + 2, 2, 1);
    R(C.grassD, px + ((h >> 8) % 11) + 2, py + ((h >> 12) % 10) + 3, 1, 2);
    if (h % 3 === 0) R(C.grassL, px + ((h >> 16) % 12) + 1, py + ((h >> 20) % 12) + 1, 2, 1);
  }
  function drawTree(px, py, x, y) {
    R('rgba(30,60,30,.25)', px + 2, py + 12, 13, 3);
    R(C.trunk, px + 6, py + 10, 4, 5);
    R(C.leafD, px + 1, py + 3, 14, 9);
    R(C.leafD, px + 3, py + 1, 10, 12);
    R(C.leaf, px + 2, py + 2, 12, 8);
    R(C.leaf, px + 4, py + 1, 8, 10);
    R(C.leafL, px + 4, py + 3, 5, 3);
    R(C.leafL, px + 3, py + 5, 2, 2);
    if (hash(x, y, 3) % 4 === 0) R('#e46a5a', px + 10, py + 6, 2, 2);
  }
  function drawStatic() {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = get(x, y), px = x * T, py = y * T;
      if (v === GRASS || v === FLOWER || v === TREE) drawGrass(px, py, x, y);
      if (v === FLOWER) {
        const h = hash(x, y, 9);
        const cols = ['#f4d35e', '#f39bb6', '#ffffff', '#b99cf0'];
        for (let k = 0; k < 2; k++) {
          const fx = px + 2 + ((h >> (k * 6)) % 10), fy = py + 3 + ((h >> (k * 6 + 3)) % 9);
          R('#4f8a4a', fx + 1, fy + 2, 1, 2);
          R(cols[(h >> (k * 4)) % 4], fx, fy, 3, 1); R(cols[(h >> (k * 4)) % 4], fx + 1, fy - 1, 1, 3);
          R('#e9a23b', fx + 1, fy, 1, 1);
        }
      }
      if (v === PATH) {
        R(C.path, px, py, T, T);
        const h = hash(x, y, 2);
        R(C.pathDot, px + (h % 12) + 2, py + ((h >> 5) % 12) + 2, 2, 1);
        R(C.pathDot, px + ((h >> 10) % 12) + 1, py + ((h >> 15) % 12) + 2, 1, 1);
        if (!pathLike(get(x, y - 1))) R(C.pathD, px, py, T, 1);
        if (!pathLike(get(x, y + 1))) R(C.pathD, px, py + T - 1, T, 1);
        if (!pathLike(get(x - 1, y))) R(C.pathD, px, py, 1, T);
        if (!pathLike(get(x + 1, y))) R(C.pathD, px + T - 1, py, 1, T);
      }
      if (v === STONE) {
        R(C.stone, px, py, T, T);
        R(C.stoneD, px, py + 7, T, 1); R(C.stoneD, px, py + 15, T, 1);
        const off = (y % 2) * 4;
        R(C.stoneD, px + 3 + off, py, 1, 7); R(C.stoneD, px + 11 + off - (off ? 8 : 0), py + 8, 1, 7);
        R(C.stoneL, px + 1, py + 1, 3, 1);
        if (get(x, y - 1) !== STONE && !pathLike(get(x, y - 1))) R(C.stoneD, px, py, T, 2);
        if (get(x - 1, y) !== STONE && !pathLike(get(x - 1, y))) R(C.stoneD, px, py, 2, T);
        if (get(x + 1, y) !== STONE && !pathLike(get(x + 1, y))) R(C.stoneD, px + T - 2, py, 2, T);
        if (get(x, y + 1) !== STONE && !pathLike(get(x, y + 1))) R(C.stoneD, px, py + T - 2, T, 2);
      }
      if (v === WATER || v === BRIDGE) {
        R(C.water, px, py, T, T);
        const h = hash(x, y, 4);
        R(C.waterD, px + (h % 10) + 1, py + ((h >> 4) % 12) + 2, 4, 1);
        const land = (a, b) => { const n = get(a, b); return n !== WATER && n !== BRIDGE; };
        if (land(x, y - 1) && y > 0) { R(C.foam, px, py, T, 2); R(C.waterL, px, py + 2, T, 1); }
        if (land(x - 1, y)) R(C.foam, px, py, 2, T);
        if (land(x + 1, y)) R(C.foam, px + T - 2, py, 2, T);
        if (land(x, y + 1) && y < H - 1) R(C.waterD, px, py + T - 2, T, 2);
      }
      if (v === BRIDGE) {
        R(C.wood, px, py + 1, T, 14);
        for (let i = 0; i < T; i += 4) R(C.woodD, px + i, py + 1, 1, 14);
        R(C.woodD, px, py, T, 2); R(C.woodD, px, py + 14, T, 2);
        R('#e0b67e', px, py + 2, T, 1);
      }
      if (v === PITCH) {
        R(x % 2 ? '#7cbc5c' : '#88c867', px, py, T, T);
      }
      if (v === TREE) drawTree(px, py, x, y);
    }
    // pitch lines and goals
    const lx = PITCH_R.x * T + 2, ly = PITCH_R.y * T + 2, lw = PITCH_R.w * T - 4, lh = PITCH_R.h * T - 4;
    R('#f4f7ee', lx, ly, lw, 1); R('#f4f7ee', lx, ly + lh - 1, lw, 1);
    R('#f4f7ee', lx, ly, 1, lh); R('#f4f7ee', lx + lw - 1, ly, 1, lh);
    const cx = (PITCH_R.x + PITCH_R.w / 2) * T, cy = (PITCH_R.y + PITCH_R.h / 2) * T;
    R('#f4f7ee', cx, ly, 1, lh);
    R('#f4f7ee', cx - 6, cy - 9, 13, 1); R('#f4f7ee', cx - 6, cy + 9, 13, 1); R('#f4f7ee', cx - 9, cy - 6, 1, 13); R('#f4f7ee', cx + 9, cy - 6, 1, 13);
    R('#f4f7ee', cx - 8, cy - 8, 2, 2); R('#f4f7ee', cx + 7, cy - 8, 2, 2); R('#f4f7ee', cx - 8, cy + 7, 2, 2); R('#f4f7ee', cx + 7, cy + 7, 2, 2);
    GOALS.forEach(([gx, gy], i) => {
      const px = gx * T, py = gy * T, left = i === 0;
      const ox = left ? px : px + 9;
      R('rgba(255,255,255,.35)', ox, py - 3, 7, 22);
      for (let k = 0; k < 22; k += 3) R('rgba(255,255,255,.6)', ox, py - 3 + k, 7, 1);
      for (let k = 0; k < 7; k += 3) R('rgba(255,255,255,.6)', ox + k, py - 3, 1, 22);
      R('#ffffff', left ? px + 6 : px + 9, py - 4, 2, 24);
      R('#ffffff', ox, py - 4, 7, 2); R('#ffffff', ox, py + 18, 7, 2);
    });
    buildings.forEach(drawBuilding);
  }
  function drawBuilding(b) {
    const bx = b.x * T, by = b.y * T, bw = b.w * T, bh = b.h * T;
    const wallTop = by + 2 * T + 2;
    R('rgba(20,40,20,.25)', bx + 3, by + bh - 3, bw, 5);
    R(b.wall, bx + 2, wallTop, bw - 4, bh - (wallTop - by));
    R('rgba(0,0,0,.08)', bx + 2, wallTop, bw - 4, 3);
    R('rgba(0,0,0,.12)', bx + 2, by + bh - 2, bw - 4, 2);
    if (b.columns) for (let i = 0; i < b.w; i++) R('#d8dccd', bx + i * T + 2, wallTop, 3, bh - (wallTop - by));
    // roof
    R(b.roofDark, bx, by + 4, bw, 2 * T);
    R(b.roof, bx + 1, by + 3, bw - 2, 2 * T - 2);
    for (let j = 0; j < 7; j++) R(b.roofDark, bx + 1, by + 7 + j * 4, bw - 2, 1);
    for (let j = 0; j < 7; j++) for (let i = (j % 2) * 4; i < bw - 2; i += 8) R(b.roofDark, bx + 1 + i, by + 4 + j * 4, 1, 3);
    R('rgba(255,255,255,.25)', bx + 1, by + 3, bw - 2, 2);
    R(b.roofDark, bx - 1, by + 2 * T + 1, bw + 2, 3);
    if (b.chimney) { R('#8b6b5a', bx + bw - 26, by - 4, 8, 10); R('#6c5144', bx + bw - 27, by - 5, 10, 3); }
    // windows
    const doorCol = b.door.x - b.x;
    for (let i = 1; i < b.w - 1; i++) {
      if (Math.abs(i - doorCol) < 1) continue;
      const wx = bx + i * T + 3, wy = wallTop + 8;
      R('#6b5a4a', wx - 1, wy - 1, 12, 11);
      R(b.neon ? '#ffd86e' : '#9fd0e6', wx, wy, 10, 9);
      R('#6b5a4a', wx + 4, wy, 1, 9); R('#6b5a4a', wx, wy + 4, 10, 1);
      R('rgba(255,255,255,.55)', wx + 1, wy + 1, 2, 2);
      if (b.id === 'library') { R('#b5543c', wx, wy + 6, 3, 3); R('#3f6f9e', wx + 6, wy + 6, 3, 3); }
    }
    // door
    const dx = b.door.x * T, dy = b.door.y * T;
    R('#5b3f2a', dx + 2, dy - 2, 12, 18);
    R('#8b5e3a', dx + 3, dy - 1, 10, 17);
    R('#a7754a', dx + 4, dy, 3, 15); R('#a7754a', dx + 9, dy, 3, 15);
    R('#f0c75e', dx + 10, dy + 7, 2, 2);
    R('#bfae8c', dx + 1, dy + 15, 14, 1);
    // signboard
    R('#5b3f2a', dx - 7, wallTop - 1, 30, 9);
    R('#f6e7bf', dx - 6, wallTop, 28, 7);
  }
  drawStatic();

  /* sprites */
  let avatar = null, avatarBack = null, avatarSide = null;
  (function loadAvatar() {
    const img = new Image();
    img.onload = () => {
      const s = img.naturalWidth / 300;
      const tmp = document.createElement('canvas');
      tmp.width = img.naturalWidth; tmp.height = img.naturalHeight;
      const t = tmp.getContext('2d');
      t.drawImage(img, 0, 0);
      let px;
      try { px = t.getImageData(0, 0, tmp.width, tmp.height).data; } catch (e) { return; }
      // The source is a 10x13-cell pixel character (16px cells). Rows 0-7 are the head, eyes sit in rows 5-6.
      const cells = [];
      for (let j = 0; j < 13; j++) for (let i = 0; i < 10; i++) {
        const sx = Math.floor((70 + i * 16 + 8) * s), sy = Math.floor((68 + j * 16 + 8) * s);
        const k = (sy * tmp.width + sx) * 4;
        cells.push(px[k + 3] < 128 ? null : [px[k], px[k + 1], px[k + 2]]);
      }
      const isSkin = c => c && c[0] > 240 && c[1] > 220 && c[2] > 200;
      const isEye = c => c && c[0] < 70 && c[1] < 55 && c[2] < 20 && c[0] > 20;
      const make = mode => {
        const c = document.createElement('canvas'); c.width = 10; c.height = 13;
        const g = c.getContext('2d');
        for (let j = 0; j < 13; j++) for (let i = 0; i < 10; i++) {
          let col = cells[j * 10 + i];
          if (!col) continue;
          if (mode === 'back' && j <= 7 && (isSkin(col) || isEye(col))) col = [81, 71, 15]; // back of the head: hair only
          if (mode === 'side' && (j === 5 || j === 6)) {
            // look left: move each eye one cell left
            const right = cells[j * 10 + i + 1];
            if (isEye(col)) col = [255, 236, 223];
            if (isEye(right)) col = [60, 46, 11];
          }
          g.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`; g.fillRect(i, j, 1, 1);
        }
        return c;
      };
      avatar = make('front'); avatarBack = make('back'); avatarSide = make('side');
    };
    img.src = D.avatar;
  })();

  const rp = v => Math.round(v * ds) / ds;
  const entPos = e => ({ x: rp((e.fx + (e.x - e.fx) * e.t) * T), y: rp((e.fy + (e.y - e.fy) * e.t) * T) });

  function drawPlayer(time) {
    const { x, y } = entPos(player);
    const walking = player.moving;
    const bob = walking && Math.floor(time * 8) % 2 ? -1 : 0;
    R('rgba(20,40,20,.25)', x + 3, y + 13, 10, 3, ctx);
    if (!avatar) { R('#51470f', x + 3, y + 1 + bob, 10, 7, ctx); R('#ffecdf', x + 4, y + 5 + bob, 8, 4, ctx); R('#111', x + 4, y + 9 + bob, 8, 5, ctx); return; }
    const img = player.dir === 'up' ? avatarBack : player.dir === 'down' ? avatar : avatarSide;
    ctx.save();
    // the side sprite looks left; mirror it when walking right
    if (player.dir === 'right') { ctx.translate(x + 13, 0); ctx.scale(-1, 1); ctx.drawImage(img, 0, y + 2 + bob); }
    else ctx.drawImage(img, x + 3, y + 2 + bob);
    ctx.restore();
  }
  function drawCat(n, time) {
    const { x, y } = entPos(n);
    const flip = n.dir === 'right';
    const g = ctx;
    g.save();
    if (flip) { g.translate(x * 2 + T, 0); g.scale(-1, 1); }
    const hop = n.moving && Math.floor(time * 8) % 2 ? -1 : 0;
    R('rgba(20,40,20,.25)', x + 3, y + 13, 11, 2, g);
    R('#f0a24b', x + 5, y + 8 + hop, 9, 5, g);
    R('#d9822e', x + 7, y + 8 + hop, 1, 3, g); R('#d9822e', x + 10, y + 8 + hop, 1, 3, g);
    R('#f0a24b', x + 2, y + 5 + hop, 6, 5, g);
    R('#f0a24b', x + 2, y + 4 + hop, 1, 1, g); R('#f0a24b', x + 6, y + 4 + hop, 1, 1, g);
    R('#fff3e0', x + 3, y + 8 + hop, 3, 2, g);
    R('#3a2a1a', x + 3, y + 6 + hop, 1, 1, g); R('#3a2a1a', x + 6, y + 6 + hop, 1, 1, g);
    const wag = Math.floor(time * 3) % 2;
    R('#f0a24b', x + 14, y + 5 + wag + hop, 2, 4, g);
    R('#f0a24b', x + 5, y + 13, 2, 1, g); R('#f0a24b', x + 11, y + 13, 2, 1, g);
    g.restore();
  }
  function drawRobot(n, time) {
    const { x, y } = entPos(n);
    const hop = n.moving && Math.floor(time * 8) % 2 ? -1 : 0;
    R('rgba(20,40,20,.25)', x + 3, y + 13, 10, 3, ctx);
    R('#6d7886', x + 7, y + 0 + hop, 2, 3, ctx);
    R(Math.floor(time * 2) % 2 ? '#ff6b5b' : '#ffd25e', x + 7, y - 1 + hop, 2, 2, ctx);
    R('#6d7886', x + 3, y + 3 + hop, 10, 7, ctx);
    R('#b9c4d0', x + 4, y + 3 + hop, 8, 6, ctx);
    const eyeOff = n.dir === 'left' ? -1 : n.dir === 'right' ? 1 : 0;
    if (n.dir !== 'up') { R('#2ec4d6', x + 5 + eyeOff, y + 5 + hop, 2, 2, ctx); R('#2ec4d6', x + 9 + eyeOff, y + 5 + hop, 2, 2, ctx); }
    R('#6d7886', x + 4, y + 10 + hop, 8, 4, ctx);
    R('#ef8a5b', x + 7, y + 11 + hop, 2, 1, ctx);
    R('#4b5560', x + 4, y + 14, 3, 1, ctx); R('#4b5560', x + 9, y + 14, 3, 1, ctx);
  }
  function drawPerson(n, time, hair, shirt, pants, hat) {
    const { x, y } = entPos(n);
    const step = n.moving && Math.floor(time * 8) % 2;
    const bob = step ? -1 : 0;
    R('rgba(20,40,20,.25)', x + 3, y + 13, 10, 3, ctx);
    R(pants, x + 5, y + 11, 2, 4 - step, ctx); R(pants, x + 9, y + 11, 2, 3 + step, ctx);
    R(shirt, x + 4, y + 7 + bob, 8, 5, ctx);
    R('#f6d3b5', x + 4, y + 1 + bob, 8, 7, ctx);
    R(hair, x + 4, y + 1 + bob, 8, 2, ctx);
    if (n.dir === 'up') R(hair, x + 4, y + 1 + bob, 8, 6, ctx);
    else if (n.dir === 'left') { R(hair, x + 10, y + 1 + bob, 2, 5, ctx); R('#2b2b2b', x + 5, y + 4 + bob, 1, 2, ctx); }
    else if (n.dir === 'right') { R(hair, x + 4, y + 1 + bob, 2, 5, ctx); R('#2b2b2b', x + 10, y + 4 + bob, 1, 2, ctx); }
    else { R(hair, x + 4, y + 1 + bob, 1, 4, ctx); R(hair, x + 11, y + 1 + bob, 1, 4, ctx); R('#2b2b2b', x + 6, y + 4 + bob, 1, 2, ctx); R('#2b2b2b', x + 9, y + 4 + bob, 1, 2, ctx); }
    if (hat) { R(hat, x + 3, y + 1 + bob, 10, 1, ctx); R(hat, x + 5, y - 1 + bob, 6, 2, ctx); }
  }
  function drawFisher(n, time) {
    drawPerson(n, time, '#5b4636', '#4f7f6a', '#3d4b66', '#d9b45e');
    if (n.dir !== 'right') return;
    const { x, y } = entPos(n);
    R('#7a5536', x + 12, y + 8, 1, 1, ctx);
    for (let i = 0; i < 7; i++) R('#7a5536', x + 13 + i, y + 7 - i, 1, 1, ctx);
    const bob = reduceMotion.matches ? 0 : Math.floor(time * 1.5) % 2;
    R('rgba(255,255,255,.7)', x + 20, y + 1, 1, 9 + bob, ctx);
    R('#e0483b', x + 19, y + 10 + bob, 3, 2, ctx);
  }
  function drawBall() {
    const { x, y } = entPos(ball);
    R('rgba(20,40,20,.3)', x + 5, y + 13, 7, 2, ctx);
    R('#2b2b2b', x + 5, y + 6, 7, 7, ctx);
    R('#ffffff', x + 6, y + 6, 5, 7, ctx); R('#ffffff', x + 5, y + 7, 7, 5, ctx);
    const f = Math.floor(ball.spin) % 2;
    R('#2b2b2b', x + 7 + f, y + 8, 2, 2, ctx);
    R('#2b2b2b', x + (f ? 5 : 10), y + (f ? 10 : 7), 1, 2, ctx);
  }
  const NPC_DRAW = {
    cat: drawCat, robot: drawRobot, fisher: drawFisher,
    coach: (n, time) => { drawPerson(n, time, '#3b2f2a', '#2f6fc0', '#1e2f4a', '#e0483b'); const { x, y } = entPos(n); R('#f2d24b', x + 7, y + 9, 2, 2, ctx); },
    couple: (n, time) => n.id === 'couple1'
      ? drawPerson(n, time, '#3a2c22', '#5b8fd0', '#38425a')
      : (drawPerson(n, time, '#7a4a2a', '#e78fa8', '#6a4a6a'), R('#7a4a2a', entPos(n).x + 3, entPos(n).y + 2, 1, 8, ctx), R('#7a4a2a', entPos(n).x + 12, entPos(n).y + 2, 1, 8, ctx)),
    villager: (n, time) => drawPerson(n, time, '#2f2a28', '#d88b3d', '#5a4a3a')
  };
  function drawObject(o, time) {
    const x = o.x * T, y = o.y * T, g = ctx;
    switch (o.kind) {
      case 'sign':
        R('rgba(20,40,20,.25)', x + 4, y + 14, 9, 2, g);
        R(C.trunk, x + 7, y + 8, 2, 8, g);
        R('#7a5536', x + 1, y + 1, 14, 9, g); R('#d7a96b', x + 2, y + 2, 12, 7, g);
        R('#7a5536', x + 4, y + 4, 8, 1, g); R('#7a5536', x + 4, y + 6, 6, 1, g);
        break;
      case 'board':
        R('rgba(20,40,20,.25)', x + 1, y + 14, 15, 2, g);
        R('#6e4c2e', x + 2, y + 9, 2, 7, g); R('#6e4c2e', x + 12, y + 9, 2, 7, g);
        R('#6e4c2e', x, y, 16, 11, g); R('#a8784a', x + 1, y + 1, 14, 9, g);
        R('#fff6dc', x + 2, y + 2, 5, 6, g); R('#ffe28a', x + 8, y + 3, 5, 4, g); R('#d9483b', x + 4, y + 2, 1, 1, g); R('#d9483b', x + 10, y + 3, 1, 1, g);
        break;
      case 'fountain': {
        R('rgba(20,40,20,.25)', x + 2, y + 27, 30, 4, g);
        R('#9e9786', x + 1, y + 9, 30, 21, g);
        R('#c8c1ad', x + 2, y + 8, 28, 20, g);
        R(C.water, x + 5, y + 11, 22, 14, g);
        R(C.waterL, x + 5, y + 11, 22, 2, g);
        R('#c8c1ad', x + 13, y + 6, 6, 12, g); R('#9e9786', x + 13, y + 16, 6, 2, g);
        R('#c8c1ad', x + 11, y + 4, 10, 3, g);
        const f = reduceMotion.matches ? 0 : Math.floor(time * 6) % 3;
        R(C.waterL, x + 15, y - 1 - f, 2, 5 + f, g);
        R('#ffffff', x + 10 - f, y + 2 + f, 1, 1, g); R('#ffffff', x + 21 + f, y + 2 + f, 1, 1, g);
        R(C.waterL, x + 9 - f, y + 5 + f, 1, 2, g); R(C.waterL, x + 22 + f, y + 5 + f, 1, 2, g);
        R('#ffffff', x + 8 + ((time * 7) | 0) % 16, y + 15 + ((time * 3) | 0) % 6, 2, 1, g);
        break;
      }
      case 'cabinet': {
        R('rgba(20,40,20,.25)', x + 2, y + 14, 13, 2, g);
        R('#2b2048', x + 2, y - 6, 12, 21, g);
        R('#46357a', x + 3, y - 5, 10, 19, g);
        const hue = ['#ff5f8f', '#5fd3ff', '#ffd75f'][o.i % 3];
        R(hue, x + 3, y - 5, 10, 3, g);
        const blink = reduceMotion.matches ? 0 : Math.floor(time * 3 + o.i) % 3;
        R('#14102a', x + 4, y - 1, 8, 6, g);
        R(['#7dfc9a', '#5fd3ff', '#ff9f5f'][blink], x + 5 + blink, y + 1, 2, 2, g);
        R('#ffffff', x + 9, y + 2 - (blink % 2), 1, 1, g);
        R('#2b2048', x + 2, y + 6, 12, 3, g); R('#ff5f5f', x + 5, y + 7, 1, 1, g); R('#5fd3ff', x + 9, y + 7, 1, 1, g);
        break;
      }
      case 'chest': {
        const open = opened.has(o.id);
        R('rgba(20,40,20,.25)', x + 2, y + 14, 13, 2, g);
        if (open) { R('#6e4520', x + 2, y + 1, 12, 5, g); R('#f0c75e', x + 2, y + 5, 12, 1, g); }
        R('#6e4520', x + 1, y + 5, 14, 10, g);
        R('#a86f36', x + 2, y + 6, 12, 8, g);
        if (!open) { R('#6e4520', x + 1, y + 3, 14, 5, g); R('#c48745', x + 2, y + 4, 12, 3, g); }
        R('#f0c75e', x + 1, y + 8, 14, 1, g);
        R('#f0c75e', x + 7, y + 7, 2, 3, g);
        if (!open && !reduceMotion.matches && Math.floor(time * 2) % 4 === 0) R('#ffffff', x + 12, y + 3, 1, 1, g);
        break;
      }
      case 'well':
        R('rgba(20,40,20,.25)', x + 1, y + 13, 15, 3, g);
        R('#7a5536', x + 2, y - 4, 2, 12, g); R('#7a5536', x + 12, y - 4, 2, 12, g);
        R('#a23227', x, y - 6, 16, 3, g); R('#c95757', x + 1, y - 7, 14, 2, g);
        R('#8c8678', x + 1, y + 4, 14, 11, g); R('#b3ad9c', x + 1, y + 4, 14, 3, g);
        R('#2c4a5a', x + 3, y + 5, 10, 2, g);
        R('#8c8678', x + 4, y + 9, 1, 1, g); R('#9e9786', x + 9, y + 11, 3, 1, g);
        R('#c49460', x + 6, y - 1, 4, 3, g); R('#bbbbbb', x + 7, y - 4, 1, 3, g);
        break;
      case 'pot':
        R('rgba(20,40,20,.25)', x + 3, y + 13, 11, 3, g);
        R('#8a5236', x + 4, y + 4, 8, 11, g); R('#b26c45', x + 3, y + 6, 10, 7, g);
        R('#6e3f28', x + 5, y + 2, 6, 2, g); R('#d18b5f', x + 5, y + 7, 2, 3, g);
        break;
      case 'bench':
        R('rgba(20,40,20,.25)', x, y + 13, 16, 3, g);
        R('#6e4c2e', x + 1, y + 9, 2, 6, g); R('#6e4c2e', x + 13, y + 9, 2, 6, g);
        R('#a8784a', x, y + 7, 16, 3, g); R('#a8784a', x, y + 2, 16, 3, g);
        R('#6e4c2e', x + 2, y + 5, 1, 2, g); R('#6e4c2e', x + 13, y + 5, 1, 2, g);
        R('#c4965f', x, y + 7, 16, 1, g);
        break;
      case 'stump':
        R('rgba(20,40,20,.25)', x + 2, y + 13, 13, 3, g);
        R('#6b4a2e', x + 3, y + 7, 10, 8, g); R('#d6b07a', x + 3, y + 5, 10, 4, g);
        R('#b88f5c', x + 5, y + 6, 6, 2, g); R('#d6b07a', x + 7, y + 6, 2, 1, g);
        R('#6b4a2e', x + 1, y + 13, 3, 2, g); R('#6b4a2e', x + 12, y + 13, 3, 2, g);
        break;
      case 'duck': {
        const dx = reduceMotion.matches ? 0 : Math.round(Math.sin(time * 0.8) * 2);
        const bob = reduceMotion.matches ? 0 : Math.floor(time * 2) % 2;
        R(C.waterL, x + 3 + dx, y + 12, 11, 1, g);
        R('#ffffff', x + 4 + dx, y + 7 + bob, 9, 5, g); R('#ffffff', x + 4 + dx, y + 3 + bob, 5, 5, g);
        R('#e6e6e6', x + 9 + dx, y + 9 + bob, 4, 2, g);
        R('#2b2b2b', x + 5 + dx, y + 4 + bob, 1, 1, g);
        R('#f2a63b', x + 2 + dx, y + 5 + bob, 2, 2, g);
        break;
      }
      case 'tactics':
        R('rgba(20,40,20,.25)', x + 1, y + 14, 15, 2, g);
        R('#4b5560', x + 3, y + 9, 2, 7, g); R('#4b5560', x + 11, y + 9, 2, 7, g);
        R('#e9ecef', x, y - 1, 16, 12, g);
        R('#3f9a5c', x + 1, y, 14, 10, g);
        R('#bfe6c9', x + 7, y, 1, 10, g); R('#bfe6c9', x + 1, y, 14, 1, g); R('#bfe6c9', x + 1, y + 9, 14, 1, g);
        [[3, 2], [3, 6], [5, 4], [9, 2]].forEach(([a, b]) => R('#2f6fc0', x + a, y + b, 2, 2, g));
        [[11, 3], [12, 6], [9, 7], [13, 1]].forEach(([a, b]) => R('#e0483b', x + a, y + b, 2, 2, g));
        break;
      case 'calendar': {
        R('rgba(20,40,20,.25)', x + 2, y + 14, 13, 2, g);
        R('#6e4c2e', x + 7, y + 10, 2, 6, g);
        R('#6e4c2e', x + 1, y - 3, 14, 14, g);
        R('#ffffff', x + 2, y - 2, 12, 12, g);
        R('#e0483b', x + 2, y - 2, 12, 3, g);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) R('#c9ced6', x + 3 + c * 3, y + 2 + r * 3, 2, 2, g);
        const blink = reduceMotion.matches || Math.floor(time * 2) % 2;
        if (blink) { R('#e0483b', x + 8, y + 4, 4, 1, g); R('#e0483b', x + 8, y + 7, 4, 1, g); R('#e0483b', x + 7, y + 5, 1, 2, g); R('#e0483b', x + 12, y + 5, 1, 2, g); }
        break;
      }
      case 'mailbox':
        R('rgba(20,40,20,.25)', x + 4, y + 14, 9, 2, g);
        R('#6b4a2e', x + 7, y + 9, 2, 7, g);
        R('#a23227', x + 3, y + 2, 10, 8, g); R('#d9483b', x + 3, y + 2, 10, 7, g);
        R('#7a1f18', x + 5, y + 4, 6, 1, g); R('#f2d24b', x + 13, y + 2, 1, 5, g); R('#f2d24b', x + 13, y + 2, 3, 2, g);
        break;
    }
  }
  function drawDecor(time) {
    if (reduceMotion.matches) return;
    // water glints
    const f = Math.floor(time * 2);
    const x0 = Math.max(0, Math.floor(cam.x / T)), y0 = Math.max(0, Math.floor(cam.y / T));
    const x1 = Math.min(W, Math.ceil((cam.x + viewW) / T) + 1), y1 = Math.min(H, Math.ceil((cam.y + viewH) / T) + 1);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (get(x, y) !== WATER) continue;
      const h = hash(x, y, 5 + (f % 3));
      if (h % 3 === 0) R(C.waterL, x * T + (h >> 3) % 10 + 2, y * T + (h >> 7) % 10 + 3, 3, 1, ctx);
    }
    // chimney smoke
    buildings.forEach(b => {
      if (!b.chimney) return;
      const cx = b.x * T + b.w * T - 24, cy = b.y * T - 8;
      for (let i = 0; i < 3; i++) {
        const p = (time * 0.6 + i / 3) % 1;
        R(`rgba(240,240,240,${0.7 * (1 - p)})`, cx + Math.round(Math.sin((p + i) * 5) * 2), cy - Math.round(p * 14), 4 - i, 3 - (i >> 1), ctx);
      }
    });
    // arcade marquee lights
    const gb = buildings.find(b => b.neon);
    const cols = ['#ff5f8f', '#5fd3ff', '#ffd75f'];
    for (let i = 0; i < gb.w * 4; i++) R(cols[(i + Math.floor(time * 4)) % 3], gb.x * T + 2 + i * 4, gb.y * T + 2 * T + 1, 2, 2, ctx);
  }
  function drawBubble(x, y, time) {
    const b = reduceMotion.matches ? 0 : Math.floor(time * 3) % 2;
    R(C.ink, x + 4, y - 11 - b, 9, 10, ctx); R('#ffffff', x + 5, y - 10 - b, 7, 8, ctx);
    R(C.ink, x + 7, y - 1 - b, 3, 2, ctx);
    R('#d9483b', x + 8, y - 9 - b, 1, 4, ctx); R('#d9483b', x + 8, y - 4 - b, 1, 1, ctx);
  }

  let bubbleMsg = null;
  const bubble = (text, life) => { bubbleMsg = { text, life }; };
  const labelFont = px => `${px}px "DotGothic16", "Hiragino Kaku Gothic ProN", system-ui, sans-serif`;
  function pill(text, sx, sy, fontPx, bg, fg, border) {
    ctx.font = labelFont(fontPx);
    const w = Math.ceil(ctx.measureText(text).width) + fontPx;
    const h = Math.round(fontPx * 1.6);
    const x = Math.round(sx - w / 2), y = Math.round(sy - h);
    const u = Math.max(1, Math.round(fontPx / 8));
    ctx.fillStyle = border; ctx.fillRect(x - u, y - u, w + 2 * u, h + 2 * u);
    ctx.fillStyle = bg; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = fg; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(text, x + w / 2, y + h / 2 + u * 0.5);
    return { x, y, w, h };
  }

  function render(time, front) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = C.leafD; ctx.fillRect(0, 0, canvas.width, canvas.height);
    camPx.x = Math.round(cam.x * ds); camPx.y = Math.round(cam.y * ds);
    ctx.setTransform(ds, 0, 0, ds, -camPx.x, -camPx.y);
    ctx.drawImage(layer, 0, 0);
    drawDecor(time);
    if (marker) {
      R(`rgba(255,255,255,${marker.life})`, marker.x * T + 2, marker.y * T + 2, 12, 1, ctx);
      R(`rgba(255,255,255,${marker.life})`, marker.x * T + 2, marker.y * T + 13, 12, 1, ctx);
      R(`rgba(255,255,255,${marker.life})`, marker.x * T + 2, marker.y * T + 2, 1, 12, ctx);
      R(`rgba(255,255,255,${marker.life})`, marker.x * T + 13, marker.y * T + 2, 1, 12, ctx);
    }
    const items = [];
    objects.forEach(o => items.push({ y: (o.y + o.h - 1) * T, draw: () => drawObject(o, time) }));
    npcs.forEach(n => items.push({ y: entPos(n).y, draw: () => NPC_DRAW[n.kind](n, time) }));
    items.push({ y: entPos(player).y + 0.5, draw: () => drawPlayer(time) });
    if (!ball.reset) items.push({ y: entPos(ball).y, draw: () => drawBall(time) });
    items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
    if (front && !dialog && front.type !== 'ball') {
      const r = front.ref;
      if (front.type === 'building') drawBubble(r.door.x * T, r.door.y * T - 2, time);
      else if (front.type === 'npc') { const p = entPos(r); drawBubble(p.x, p.y, time); }
      else drawBubble((r.x + (r.w - 1) / 2) * T, r.y * T - (r.kind === 'cabinet' ? 6 : 0), time);
    }

    // screen-space labels
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const fontPx = Math.round((stage.clientWidth < 640 ? 11 : 13) * dpr);
    buildings.forEach(b => {
      const sx = (b.x + b.w / 2) * T * ds - camPx.x;
      const sy = (b.y * T + 2 * T - 1) * ds - camPx.y;
      if (sx < -200 || sx > canvas.width + 200 || sy < -50 || sy > canvas.height + 80) return;
      const active = front && front.ref === b;
      pill(`${b.name}  ${b.sub}`, sx, sy, fontPx, active ? '#fff0b0' : '#fffbea', '#2b3a36', active ? '#8b5e3a' : '#2b3a36');
    });
    if (bubbleMsg) {
      const p = entPos(player);
      pill(bubbleMsg.text, (p.x + 8) * ds - camPx.x, (p.y - 1) * ds - camPx.y, fontPx, '#ffffff', '#2b3a36', '#2b3a36');
    }
  }

  function updateCamera(dt) {
    const p = entPos(player);
    const mapW = W * T, mapH = H * T;
    let tx = p.x + T / 2 - viewW / 2, ty = p.y + T / 2 - viewH / 2;
    tx = viewW >= mapW ? (mapW - viewW) / 2 : Math.max(0, Math.min(mapW - viewW, tx));
    ty = viewH >= mapH ? (mapH - viewH) / 2 : Math.max(0, Math.min(mapH - viewH, ty));
    if (snapCamera || reduceMotion.matches) { cam.x = tx; cam.y = ty; snapCamera = false; return; }
    const k = Math.min(1, dt * 9);
    cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k;
    if (Math.abs(tx - cam.x) < 0.05) cam.x = tx;
    if (Math.abs(ty - cam.y) < 0.05) cam.y = ty;
  }

  let visible = true;
  new IntersectionObserver(entries => {
    entries.forEach(e => { visibleRatio = e.intersectionRatio; visible = e.isIntersecting; });
  }, { threshold: [0, 0.25, 0.55, 0.8, 1] }).observe(stage);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible && !document.hidden && viewW) {
      const time = now / 1000;
      updatePlayer(dt);
      npcs.forEach(n => updateNpc(n, dt));
      updateBall(dt);
      tickDialog(dt);
      if (marker) { marker.life -= dt; if (marker.life <= 0) marker = null; }
      if (bubbleMsg) { bubbleMsg.life -= dt; if (bubbleMsg.life <= 0) bubbleMsg = null; }
      updateCamera(dt);
      render(time, updateHint());
    }
    requestAnimationFrame(frame);
  }
  resize();
  onTileChange();
  bubble(found.size ? 'おかえり！' : 'ようこそ！', 3.5);
  if (document.fonts && document.fonts.load) document.fonts.load(labelFont(13)).catch(() => {});
  requestAnimationFrame(frame);
})();
