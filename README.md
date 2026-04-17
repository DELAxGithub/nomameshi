# Nomameshi

**Your local meal companion — 旅先のローカル食堂、相棒AI**

観光客向けの店じゃなくて、地元の人が通う小さな食堂で食べたい。Nomameshi はそういう旅人の食卓の相棒です。外国語メニューを撮るとAIが翻訳し、その料理が実際どう見えるかのビジュアルまで生成。さらに国ごとの食文化Tipsで「料理を待つ時間」まで楽しくなります。

「メニュー翻訳アプリ」はたくさんあります。Nomameshi が違うのは、**翻訳の先に「ローカルで食べる体験」を置いている**ことです。

## 主要機能

1. **料理特化の翻訳** — Gemini APIでメニューをOCRし、料理名・食材・調理法のニュアンスを保った翻訳を生成
2. **テーブルスプレッド画像** — AI が料理の雰囲気を視覚化した背景を生成、その上にグラスモーフィズムのカードで翻訳をオーバーレイ
3. **Local Tips** — 国別にキュレーションされた食文化豆知識（スペイン84件・フランス43件ほか拡充中）
4. **履歴** — 翻訳結果を localStorage に自動保存（最大20件＝旅ログ）
5. **保存・シェア** — 美しい1枚のPNGとしてエクスポート / ネイティブShare / クリップボード

## ターゲット

- スローノマド（数週間〜数ヶ月単位で海外滞在しながら働く人）
- 観光客向けより地元の定食屋・バル・タベルナを好む旅人
- 「旅行ツール」ではなく「日常の食事の道具」として使いたい人

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 / React 19 / TypeScript |
| AI (Analysis) | Gemini 2.5 Flash (`gemini-2.5-flash`) |
| AI (Image) | Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) |
| Mobile | Capacitor 8 (iOS) |
| Hosting | Vercel (SSR + Serverless API Routes) |
| Design | Pencil.dev (source: `design/nomameshi.pen`) |

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

- API キーはサーバーサイド専用（`GEMINI_API_KEY`）。クライアントに露出しない
- IP ベースのレートリミット（1分10リクエスト）
- iOS 版は Capacitor 経由で Vercel URL からリモート読み込み

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variable
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### iOS Build

```bash
npm run build:ios    # Next build + cap sync ios
npx cap open ios     # Open in Xcode
```

### TestFlight (fastlane)

```bash
npm run ios:beta     # Next build → Xcode archive → TestFlight upload
```

App Store Connect API Key は `~/.appstoreconnect/` に配置、`ASC_*` env vars で読まれます。

## Design System

- **Palette**: Ivory `#FCFBF9` / Charcoal `#1E2432` / Coral `#E85A4F` / Olive `#8A9178` / Soy `#C9A86C`
- **Logo**: `noma` (Charcoal 700) + `meshi` (Coral 700), letter-spacing -0.04em
- **Style**: Warm consumer — hero upload card, pill selectors, glassmorphism result cards, food photography background

詳細は `docs/design_review_brief_2026Q1.md` および `design/nomameshi.pen`.

## Links

- **Web**: https://nomameshi-delaxs-projects.vercel.app
- **GitHub**: https://github.com/DELAxGithub/nomameshi
- **App Store**: Nomameshi (v1.3 進行中)
