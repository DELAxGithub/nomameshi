# Nomameshi (メニュー翻訳＆視覚化アプリ)

**Don't just read the menu. See the flavor.**

AI駆動のメニュー翻訳・解析・視覚化アプリ。外国語のメニュー画像を撮影するだけで、料理の構成やレストランの雰囲気を解析し、美しいUIで多言語化して表示します。

## 主要機能

1. **メニューの解析・翻訳** — Gemini APIによるOCR＆構造化翻訳。料理名、説明、価格、レストランの雰囲気を抽出
2. **テーブルスプレッド画像の自動生成** — AIが料理群のビジュアルを生成し、グラスモーフィズムのカードUIで翻訳をオーバーレイ
3. **Cultural Tips** — 解析中の待ち時間に、その地域の食文化豆知識を表示（8カ国対応）
4. **履歴** — 翻訳結果をlocalStorageに自動保存（最大20件）
5. **共有・保存** — PNG画像エクスポート / ネイティブShare / クリップボード

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 / React 19 / TypeScript |
| AI (Analysis) | Gemini 2.5 Flash (`gemini-2.5-flash`) |
| AI (Image) | Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) |
| Mobile | Capacitor 8 (iOS) |
| Hosting | Vercel (SSR + Serverless API Routes) |

## Architecture

```
Client (React)           Server (Vercel API Routes)
  │                              │
  ├── /api/analyze ────────────► streaming Gemini response
  ├── /api/generate-image ─────► Gemini image generation
  │                              │
  └── localStorage               GEMINI_API_KEY (server-only)
       └── history (20 items)     └── IP rate limit (10 req/min)
```

- APIキーはサーバーサイド専用（`GEMINI_API_KEY`）。クライアントに露出しない
- IPベースのレートリミット（1分10リクエスト）
- iOS版はCapacitor経由でVercel URLからリモート読み込み

## 開発ノート

### Geminiモデルの選定
- **解析**: `gemini-2.5-flash` — OCR精度と速度のバランスを重視。`flash-lite` は速いが品数の多いメニューで抜けが発生するため、`flash` を採用
- **画像生成**: `gemini-2.5-flash-image` — テーブルスプレッド画像生成用
- `gemini-3.1-flash-lite` はベンチマーク上優秀だがAPI未公開（2026-03時点）。GA後に検証予定

### コード構成
page.tsx を61行に圧縮。4 custom hooks / 10 components / 3 data modules に分割済み。

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variable
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### iOS Build

```bash
npm run build:ios    # Build + sync to iOS
npx cap open ios     # Open in Xcode
```

## Links

- **Web**: https://menumenu-three.vercel.app
- **GitHub**: https://github.com/DELAxGithub/nomameshi
