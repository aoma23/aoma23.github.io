---
title: "QuickBoardのOG画像を動的生成したくてCloudflareと格闘した話"
date: 2025-08-14
categories:
  - 開発
  - Web技術
tags:
  - Cloudflare
  - Workers
  - Pages Functions
  - OG画像
  - SVG
---

QuickBoardで作ったフォーメーション画像をそのままOG画像として表示させたくて、Cloudflareを使って実装してみました。結果的にはうまくいかなかったんですが、いろいろ学べたので備忘録として残しておきます。

## やりたかったこと

QuickBoard、今はSNSでシェアしても固定の画像しか表示されず、実際に作ったフォーメーション画像がそのまま表示されたら絶対UX良いと思って。

**実現したかった機能：**
- フォーメーションデータから動的にOG画像を生成
- URLパラメータでフォーメーション情報を受け取り
- PNG形式の画像を返すAPI

**なぜCloudflareを選んだか：**
- 無料枠が太っ腹（月100万リクエスト vs Vercelの1000リクエスト）
- GitHub Pagesとの相性が良さそう
- 速度も期待できる

## 第1ラウンド: Pages Functions + Canvas APIで行けるでしょ

最初はPages FunctionsでOffscreenCanvasを使えば普通にできると思ってました。甘かった。

### 実装内容

```javascript
// functions/api/quickboard-og.js
function generateOGImage(state) {
  const canvas = new OffscreenCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // フィールド描画
  ctx.fillStyle = '#060';
  ctx.fillRect(0, 0, 1200, 630);
  
  // プレイヤー描画
  if (state && state.players) {
    state.players.forEach(player => {
      const x = 50 + (player.x / 100) * 1100;
      const y = 50 + (player.y / 100) * 530;
      // ...プレイヤー描画処理
    });
  }
  
  return canvas;
}
```

### いきなり現実を突きつけられる

**1. OffscreenCanvas使用不可エラー**
```
ReferenceError: OffscreenCanvas is not defined
```

ここで衝撃の事実が判明：**Cloudflare Workers/Pages FunctionsはCanvas API使えない**

まじかよ。

### 設定の試行錯誤

wrangler.tomlの設定も何度も調整しました：

```toml
name = "aoma23-github-io"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "app/quickboard"

[build]
command = "cd app/quickboard && npm run build"
```

しかし、Pages Functionsでは`[build]`セクションがサポートされていないことが判明し、設定からbuildセクションを除去する必要がありました。

## 第2ラウンド: じゃあSVGでやればいいじゃん

Canvas APIがダメなら、SVGで生成すればいいでしょ、ということで方針転換。

### SVG生成実装

```javascript
function generateOGImageSVG(state) {
  let playerElements = '';
  
  if (state && state.players) {
    state.players.forEach(player => {
      const x = 50 + (player.x / 100) * 1100;
      const y = 50 + (player.y / 100) * 530;
      
      let color = '#36f';
      switch (player.color) {
        case 'red': color = '#e44'; break;
        case 'blue': color = '#36f'; break;
        case 'yellow': color = '#fc3'; break;
        case 'green': color = '#3b3'; break;
        case 'ball': color = '#fff'; break;
      }
      
      playerElements += `<circle cx="${x}" cy="${y}" r="16" fill="${color}"/>`;
      
      if (player.num) {
        const textColor = player.color === 'yellow' ? '#000' : '#fff';
        playerElements += `<text x="${x}" y="${y + 5}" fill="${textColor}" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle">${player.num}</text>`;
      }
    });
  }
  
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#060"/>
    <g stroke="#fff" stroke-width="3" fill="none">
      <rect x="50" y="50" width="1100" height="530"/>
      <line x1="600" y1="50" x2="600" y2="580"/>
      <circle cx="600" cy="315" r="73"/>
      <!-- ... その他のフィールドライン -->
    </g>
    ${playerElements}
    <text x="50" y="40" fill="#fff" font-family="Arial" font-size="36" font-weight="bold">QuickBoard</text>
  </svg>`;
}
```

### 結果

フィールドは表示されたんですが、**選手の配置がうまくできず、フィールドも微妙に歪んでる**...。しかもSNSって基本的にはPNG画像の方が良いみたいなので、結局SVG→PNG変換が必要という結論に。

## 第3ラウンド: SVG→PNG変換でファイナルアンサー

PNG作るために`@resvg/resvg-wasm`っていうライブラリを使ってSVG→PNG変換に挑戦しました。

### 依存関係の導入

```bash
npm install @resvg/resvg-wasm
```

### 実装コード

```javascript
import initWasm, { Resvg } from '@resvg/resvg-wasm/web';

let wasmInitialized = false;

export default {
  async fetch(request) {
    // Wasm初期化
    if (!wasmInitialized) {
      await initWasm();
      wasmInitialized = true;
    }
    
    const svg = generateOGImageSVG(state);
    
    // SVG→PNG変換
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    return new Response(pngBuffer, {
      headers: { 'Content-Type': 'image/png' }
    });
  }
}
```

### エラーとの果てしない戦い

**1. Wasm初期化エラー**
```
Error: Wasm has not been initialized. Call `initWasm()` function.
```

**2. インポートエラー**
```
No matching export in "node_modules/@resvg/resvg-wasm/index.mjs" for import "default"
```

**3. Worker形式エラー**
```
Your worker has no default export, which means it is assumed to be a Service Worker format Worker.
Did you mean to create a ES Module format Worker?
```

**4. URL解析エラー**
```
TypeError: Invalid URL string.
```

もうエラーのオンパレード。一個直すと次のエラー、また直すと次のエラー...

### 設定ファイルの試行錯誤

wrangler.jsonc での設定調整：

```jsonc
{
  "name": "quickboard-og",
  "main": "src/index.js",
  "compatibility_date": "2025-08-13",
  "compatibility_flags": ["nodejs_compat"],
  "build": {
    "upload": {
      "format": "modules",
      "rules": [
        {
          "type": "CompiledWasm",
          "globs": ["**/*.wasm"]
        }
      ]
    }
  }
}
```

しかし、`build.upload`設定もサポートされていないことが判明。

さらに、Service Worker形式からES Module形式への変更：

```javascript
// Before: Service Worker形式
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// After: ES Module形式
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
}
```

### 最終的な壁

ブラウザからアクセスすると、favicon.icoへのリクエストでも「Invalid URL string」エラーが出続け、WebAssembly周りで根本的に何かが間違ってるっぽい。

## 今回の学び

### Cloudflare Workersでハマったポイント

1. **Canvas API使用不可**: OffscreenCanvasが使えない（そもそもここで詰み）
2. **WebAssembly周りが厳しい**: 複雑なライブラリだと動作が不安定
3. **Node.js互換性の罠**: 思ったより互換性が低い
4. **デバッグの困難さ**: ローカル環境との差異が大きい
### 設定周りも複雑

- wrangler.toml vs wrangler.jsonc（どっち使えばいいの？）
- Pages Functions vs Workers の微妙な違い
- Service Worker vs ES Module 形式（古い書き方だとエラーになる）
- ビルド設定の制約（サポートされてない設定が多い）

でも、Cloudflareを初めて触ってみて、どういう仕組みなのかとか、Workersの思想みたいなのを理解できたのは良い経験でした。制約は多いけど、シンプルな用途だったら良さそう！

## 諦めて次へ

Cloudflareでの動的OG画像生成は、SVG→PNG変換の部分で技術的な壁が高すぎることが分かりました。WebAssemblyライブラリとの相性問題とか、デバッグの大変さを考えると、今回は退散。


次は**Vercel Edge Functions**か**Netlify Functions**を試してみようと思います。特にVercelはCanvas APIをサポートしてるらしいので、今度こそできるはず。無料枠は1,000リクエスト/月とCloudflareより少ないけど、QuickBoardの規模なら全然大丈夫でしょう。

Netlify Functionsも125,000リクエスト/月の無料枠があるので、こっちも候補ですね。

画像処理が必要な場合は、素直にVercelかNetlifyの方が良さそう、というのが今回の結論です。Cloudflareは別の用途で使ってみたい。

それではまた！