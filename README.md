# Daily Stamp - 歯磨き習慣化アプリ

子供が楽しく歯磨きを習慣化できるよう、カレンダー上でスタンプを押し、達成状況に応じてキャラクターが成長するアプリです。キャラクターとは音声とテキストで会話でき、会話エンジンにはGPT-4o-miniを使用しています。

## 主要機能

### 📅 カレンダー機能
- 月表示のカレンダー
- 各日にスタンプを押せるUI
- 複数のスタンプタイプから選択可能（歯磨き完了、うがい完了、時間チェック、パーフェクト）

### 🐣 キャラクター成長システム
- 5つの成長ステージ：卵 → ひよこ → にわとり → たか → ほうおう
- 連続日数または累計日数で次ステージに進化
- ステージアップ時のアニメーション演出

### 💬 AI会話機能
- GPT-4o-miniを使用したキャラクターとの会話
- 音声認識（Web Speech API）で音声入力
- テキスト読み上げ（Text-to-Speech）で音声出力
- 子供向けの優しいトーン

### 🔐 ユーザー認証
- JWT認証システム
- ユーザー登録・ログイン機能

## 技術スタック

### フロントエンド
- **React** (TypeScript)
- **Styled Components** - スタイリング
- **React Calendar** - カレンダーコンポーネント
- **Axios** - API通信
- **Web Speech API** - 音声認識・合成

### バックエンド
- **FastAPI** (Python)
- **SQLAlchemy** - ORM
- **PostgreSQL** - データベース
- **JWT** - 認証
- **OpenAI API** - GPT-4o-mini会話エンジン

### インフラ
- **Docker** - コンテナ化
- **Docker Compose** - 開発環境

## セットアップ

### 1. 環境変数の設定
```bash
cp .env.example .env
```

`.env`ファイルを編集してOpenAI APIキーを設定：
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Docker環境の起動
```bash
docker-compose up --build
```

### 3. アクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8000
- PostgreSQL: localhost:5432

## API仕様

### 認証
- `POST /auth/signup` - 新規登録
- `POST /auth/login` - ログイン

### プロフィール
- `GET /profile` - プロフィール取得
- `PUT /profile` - プロフィール更新

### 歯磨き記録
- `GET /brushes?month=YYYY-MM` - 月別記録取得
- `POST /brushes` - 記録作成・更新

### 会話
- `POST /chat` - AI会話

## キャラクター成長条件

| ステージ | 条件 |
|---------|------|
| 卵 → ひよこ | 連続3日 または 累計5日 |
| ひよこ → にわとり | 連続7日 または 累計10日 |
| にわとり → たか | 連続14日 または 累計20日 |
| たか → ほうおう | 連続30日 または 累計40日 |

## スタンプタイプ

- 🦷 **歯磨き完了** - 基本の歯磨き
- 💧 **うがい完了** - うがいもバッチリ
- ⏰ **時間チェック** - 適切な時間に実施
- ⭐ **パーフェクト** - 完璧な歯磨き

## 開発

### フロントエンド開発
```bash
cd frontend
npm install
npm start
```

### バックエンド開発
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## ライセンス

MIT License