# Twitter自動投稿セットアップ手順

## 1. Twitter Developer Accountの取得

### 手順
1. [Twitter Developer Portal](https://developer.twitter.com/)にアクセス
2. 「Apply for a developer account」をクリック
3. 用途を選択：「Building tools for Twitter users」
4. 詳細情報を入力：
   - **用途**: ブログ記事の自動ツイート
   - **利用目的**: ブログ更新時の自動通知
   - **月間ツイート数**: 10回程度（月1-2記事想定）

### 必要な情報
- Twitterアカウント（@aoma23）
- 電話番号認証
- 利用目的の詳細説明

## 2. Twitterアプリケーションの作成

### アプリ作成手順
1. Developer Portalで「Create App」
2. アプリ情報を入力：
   - **App name**: `aoma-blog-auto-tweet`
   - **Description**: `自動ブログ記事ツイート用アプリ`
   - **Website URL**: `https://aoma23.com`
   - **Callback URL**: 不要（OAuth不使用）

### 権限設定
- **App permissions**: `Read and Write`（ツイート投稿のため）
- **Type of App**: `Web App`

## 3. API キーの取得

### 必要なキー
以下のキーを取得してGitHub Secretsに設定：

1. **API Key** (`TWITTER_API_KEY`)
2. **API Secret Key** (`TWITTER_API_SECRET`)  
3. **Access Token** (`TWITTER_ACCESS_TOKEN`)
4. **Access Token Secret** (`TWITTER_ACCESS_TOKEN_SECRET`)

**注意**: Bearer Tokenは不要です（OAuth 1.0a認証を使用）

### キー取得方法
1. アプリのダッシュボードで「Keys and tokens」タブ
2. 「Generate」ボタンでそれぞれのキーを生成
3. **重要**: 生成後は二度と表示されないため、必ず保存

## 4. GitHub Secretsの設定

### 設定手順
1. GitHubリポジトリで「Settings」→「Secrets and variables」→「Actions」
2. 「New repository secret」で以下を追加：

```
TWITTER_API_KEY = <API Keyの値>
TWITTER_API_SECRET = <API Secret Keyの値>
TWITTER_ACCESS_TOKEN = <Access Tokenの値>
TWITTER_ACCESS_TOKEN_SECRET = <Access Token Secretの値>
```

### セキュリティ注意事項
- キーは絶対に公開コードに含めない
- GitHub Secretsでのみ管理
- 定期的にキーを再生成することを推奨

## 5. 動作テスト

### テスト手順
1. 新しいブログ記事を`_posts/`に追加
2. mainブランチにコミット・プッシュ
3. GitHub Actionsの実行を確認
4. Twitterでツイートが投稿されたか確認

### トラブルシューティング
- **403エラー**: API権限を確認
- **401エラー**: キーが正しく設定されているか確認
- **文字数エラー**: タイトルが長すぎる場合は自動で短縮される

## 6. カスタマイズ設定

### ツイートしたくない記事の場合
記事のfront matterに以下を追加：
```yaml
---
title: "記事タイトル"
tweet: false  # この記事はツイートしない
---
```

### カスタムツイート文
front matterでカスタマイズ可能：
```yaml
---
title: "記事タイトル" 
custom_tweet: "カスタムツイート文 #タグ"
---
```

## 7. ワークフロー概要

1. **トリガー**: `_posts/*.md`への新しいファイル追加
2. **メタデータ抽出**: タイトル、タグ、日付を自動抽出
3. **URL生成**: ファイル名からブログURLを生成
4. **ツイート文生成**: テンプレートに基づいて自動生成
5. **文字数調整**: 280文字制限に合わせて自動調整
6. **API投稿**: ethomson/send-tweet-actionを使用してツイート投稿
7. **結果通知**: GitHub Actionsで結果表示

## 注意事項
- OAuth 1.0a認証を使用（確実で安定）
- GitHub Actionの`ethomson/send-tweet-action`を使用
- 無料プランは月1,500ツイートまで
- レート制限: 300ツイート/15分
- ブログの更新頻度なら制限に引っかかることはなし

## 使用しているGitHub Action
- **ethomson/send-tweet-action@v1**: Twitter投稿用の公式アクション
- OAuth 1.0a署名を自動生成してくれるため安全で確実