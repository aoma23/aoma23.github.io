const { createCanvas } = require('@napi-rs/canvas');
const LZString = require('lz-string');

// 36進数デコード関数（本体のboard_original.jsから移植）
function fromBase36(str) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  let result = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = chars.indexOf(char);
    if (value === -1) return 0; // 不正な文字の場合
    result = result * 36 + value;
  }
  
  return result;
}

exports.handler = async (event, context) => {
  // CORSヘッダー設定
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // OPTIONSリクエストの処理
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // URLパラメータから圧縮データを取得
    const compressedData = event.queryStringParameters?.q;
    let state = { players: [] };

    if (compressedData) {
      try {
        // LZ-stringで解凍
        const dataStr = LZString.decompressFromEncodedURIComponent(compressedData);
        if (dataStr) {
          // 本体のloadState関数のロジックを移植
          // カンマで分割して各選手データを取得
          const playerStrings = dataStr.split(',');
          
          // 各選手データを解析
          state.players = playerStrings.map((playerStr, index) => {
            // 空文字列の場合はスキップ
            if (!playerStr.trim()) return null;
            
            let pos = 0;
            let colorFullName = 'blue'; // デフォルトは自チーム
            
            // 色の判定（先頭が大文字A-Zの場合）
            if (playerStr.length > 0 && /^[A-Z]/.test(playerStr[0])) {
              const colorCode = playerStr[0];
              pos = 1;
              
              if (colorCode === 'B') {
                colorFullName = 'ball';
              } else if (colorCode === 'C') {
                colorFullName = 'red';
              } else if (colorCode === 'D') {
                colorFullName = 'yellow';
              } else if (colorCode === 'E') {
                colorFullName = 'green';
              }
            }
            
            // 座標部分を抽出（色の後の4文字、または先頭4文字）
            if (playerStr.length < pos + 4) {
              return null; // 不正なデータ
            }
            
            const xStr = playerStr.substr(pos, 2);
            const yStr = playerStr.substr(pos + 2, 2);
            
            // 36進数から10進数に変換
            const x = fromBase36(xStr);
            const y = fromBase36(yStr);
            
            // 基本プレイヤーオブジェクトを作成
            const player = {
              id: (index + 1).toString(),
              color: colorFullName,
              x: x / 10,
              y: y / 10,
              num: ''
            };
            
            // 残りの文字列から背番号と名前を解析
            let remaining = playerStr.substr(pos + 4);
            
            // 背番号の解析（Zで始まる場合）
            const zIndex = remaining.indexOf('Z');
            if (zIndex === 0) {
              // 名前の開始位置を探す
              const yIndex = remaining.indexOf('Y');
              if (yIndex > 1) {
                // 背番号と名前の両方がある場合
                player.num = remaining.substring(1, yIndex);
                player.name = remaining.substring(yIndex + 1);
              } else if (yIndex === -1) {
                // 背番号のみの場合
                player.num = remaining.substring(1);
              }
            } else {
              // 名前のみの場合（Yで始まる）
              const yIndex = remaining.indexOf('Y');
              if (yIndex === 0) {
                player.name = remaining.substring(1);
              }
            }
            
            return player;
          }).filter(p => p !== null); // nullを除外
        }
      } catch (err) {
        console.error('Failed to decode data:', err);
        state = { players: [] };
      }
    }

    // Canvas作成（1200x630のOG画像サイズ）
    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    // 背景を緑色（サッカーフィールド）に設定
    ctx.fillStyle = '#060';
    ctx.fillRect(0, 0, 1200, 630);

    // フィールドの実寸法（本体のboard_original.jsとの互換性を重視）
    // OG画像（1200x630）の中央に配置し、上下に余白を設ける
    const fieldWidth = 800;   // フィールド幅
    const fieldHeight = 520;  // フィールド高さ（本体に合わせて調整）
    const fieldX = (1200 - fieldWidth) / 2;   // 水平中央配置 = 200  
    const fieldY = (630 - fieldHeight) / 2;    // 垂直中央配置 = 55

    // フィールドラインを描画
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#fff';

    // 外枠
    ctx.strokeRect(fieldX, fieldY, fieldWidth, fieldHeight);

    // センターライン
    ctx.beginPath();
    ctx.moveTo(fieldX + fieldWidth / 2, fieldY);
    ctx.lineTo(fieldX + fieldWidth / 2, fieldY + fieldHeight);
    ctx.stroke();

    // センターサークル（半径はフィールド高さの約14%）
    const centerRadius = fieldHeight * 0.14;
    ctx.beginPath();
    ctx.arc(fieldX + fieldWidth / 2, fieldY + fieldHeight / 2, centerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // ペナルティエリア（幅：フィールド幅の約22%、高さ：フィールド高さの約46%）
    const penaltyWidth = fieldWidth * 0.22;
    const penaltyHeight = fieldHeight * 0.46;
    const penaltyY = fieldY + (fieldHeight - penaltyHeight) / 2;

    // ペナルティエリア（左）
    ctx.strokeRect(fieldX, penaltyY, penaltyWidth, penaltyHeight);

    // ペナルティエリア（右）
    ctx.strokeRect(fieldX + fieldWidth - penaltyWidth, penaltyY, penaltyWidth, penaltyHeight);

    // ゴールエリア（幅：フィールド幅の約7.5%、高さ：フィールド高さの約30%）
    const goalWidth = fieldWidth * 0.075;
    const goalHeight = fieldHeight * 0.30;
    const goalY = fieldY + (fieldHeight - goalHeight) / 2;

    // ゴールエリア（左）
    ctx.strokeRect(fieldX, goalY, goalWidth, goalHeight);

    // ゴールエリア（右）
    ctx.strokeRect(fieldX + fieldWidth - goalWidth, goalY, goalWidth, goalHeight);

    // ペナルティマーク
    ctx.beginPath();
    ctx.arc(fieldX + penaltyWidth * 0.55, fieldY + fieldHeight / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(fieldX + fieldWidth - penaltyWidth * 0.55, fieldY + fieldHeight / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // ゴールの描画（本体SVGと完全一致）
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    
    // ゴールの高さ（フィールド高さの約27%、中央に配置）
    const goalPostHeight = fieldHeight * 0.27;
    const goalTop = fieldY + (fieldHeight - goalPostHeight) / 2;
    const goalBottom = goalTop + goalPostHeight;
    const goalDepth = 20; // ゴールの奥行き
    
    // 左ゴール
    ctx.beginPath();
    // 上のクロスバー
    ctx.moveTo(fieldX - goalDepth, goalTop);
    ctx.lineTo(fieldX, goalTop);
    // 下のクロスバー
    ctx.moveTo(fieldX - goalDepth, goalBottom);
    ctx.lineTo(fieldX, goalBottom);
    // 左のゴールポスト
    ctx.moveTo(fieldX - goalDepth, goalTop);
    ctx.lineTo(fieldX - goalDepth, goalBottom);
    ctx.stroke();
    
    // 右ゴール
    ctx.beginPath();
    // 上のクロスバー
    ctx.moveTo(fieldX + fieldWidth, goalTop);
    ctx.lineTo(fieldX + fieldWidth + goalDepth, goalTop);
    // 下のクロスバー
    ctx.moveTo(fieldX + fieldWidth, goalBottom);
    ctx.lineTo(fieldX + fieldWidth + goalDepth, goalBottom);
    // 右のゴールポスト
    ctx.moveTo(fieldX + fieldWidth + goalDepth, goalTop);
    ctx.lineTo(fieldX + fieldWidth + goalDepth, goalBottom);
    ctx.stroke();

    // プレイヤーを描画
    if (state && state.players && Array.isArray(state.players)) {
      state.players.forEach(player => {
        // 座標を画面サイズに変換（パーセンテージ → ピクセル）
        const x = fieldX + (player.x / 100) * fieldWidth;
        const y = fieldY + (player.y / 100) * fieldHeight;

        // プレイヤーの色とサッカーボールの描画
        if (player.color === 'ball') {
          // サッカーボールの描画（本体のSVGパターンを再現）
          const ballRadius = 16;
          
          // 白いベース円
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
          ctx.fill();
          
          // 黒い枠線
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
          ctx.stroke();
          
          // 中央の黒い五角形
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          const pentagonRadius = ballRadius * 0.35;
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const px = x + pentagonRadius * Math.cos(angle);
            const py = y + pentagonRadius * Math.sin(angle);
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();
          ctx.fill();
          
          // 五角形から放射状の線
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
            const innerRadius = ballRadius * 0.35;
            const outerRadius = ballRadius * 0.9;
            const x1 = x + innerRadius * Math.cos(angle);
            const y1 = y + innerRadius * Math.sin(angle);
            const x2 = x + outerRadius * Math.cos(angle);
            const y2 = y + outerRadius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        } else {
          // 通常のプレイヤー円
          let playerColor = '#36f'; // デフォルトは青
          switch (player.color) {
            case 'red':
              playerColor = '#e44';
              break;
            case 'blue':
              playerColor = '#36f';
              break;
            case 'yellow':
              playerColor = '#fc3';
              break;
            case 'green':
              playerColor = '#3b3';
              break;
          }

          // プレイヤーの円を描画
          ctx.fillStyle = playerColor;
          ctx.beginPath();
          ctx.arc(x, y, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        // 番号を描画（確実なテキスト描画）
        if (player.num !== undefined && player.num !== null && player.num !== '') {
          ctx.save();
          
          // 複数フォントフォールバック + 強化されたスタイル
          const textColor = player.color === 'yellow' ? '#000000' : '#ffffff';
          const strokeColor = player.color === 'yellow' ? '#ffffff' : '#000000';
          
          ctx.font = 'bold 16px Arial, Helvetica, "Arial Black", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // ストローク（枠線）で文字を強調
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 3;
          ctx.strokeText(String(player.num), x, y);
          
          // フィル（塗りつぶし）
          ctx.fillStyle = textColor;
          ctx.fillText(String(player.num), x, y);
          
          ctx.restore();
        }

        // 名前を描画
        if (player.name && String(player.name).trim() !== '') {
          ctx.save();
          
          ctx.font = '12px Arial, Helvetica, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // 名前には黒い枠線を付けて見やすくする
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeText(String(player.name), x, y + 28);
          
          ctx.fillStyle = '#ffffff';
          ctx.fillText(String(player.name), x, y + 28);
          
          ctx.restore();
        }
      });
    }

    // タイトルを描画
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('QuickBoard', 50, 30);

    ctx.font = '18px Arial';
    ctx.fillText('サッカー戦術・作戦ボード', 250, 30);

    // PNGバッファを生成
    const buffer = canvas.toBuffer('image/png');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        ...headers,
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error('Error generating OG image:', error);

    // エラー時はシンプルなエラー画像を返す
    try {
      const errorCanvas = createCanvas(1200, 630);
      const errorCtx = errorCanvas.getContext('2d');

      errorCtx.fillStyle = '#222';
      errorCtx.fillRect(0, 0, 1200, 630);

      errorCtx.fillStyle = '#fff';
      errorCtx.font = 'bold 36px Arial';
      errorCtx.textAlign = 'center';
      errorCtx.textBaseline = 'middle';
      errorCtx.fillText('QuickBoard', 600, 315);

      const errorBuffer = errorCanvas.toBuffer('image/png');

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=300',
          ...headers,
        },
        body: errorBuffer.toString('base64'),
        isBase64Encoded: true,
      };
    } catch (fallbackError) {
      console.error('Error generating fallback image:', fallbackError);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to generate image' }),
      };
    }
  }
};