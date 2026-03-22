# Nomameshi

## Don't just read the menu. See the flavor.

---

## What is Nomameshi?

AI駆動のメニュー翻訳・視覚化アプリ。
外国語のメニューを撮影するだけで、料理名・説明・価格を構造化翻訳し、
AIが生成したテーブルスプレッド画像とともに美しく表示する。

---

## Problem

海外のローカル食堂で、メニューが読めない。

- Google翻訳は単語を訳すだけ。「Secreto Ibérico」が何かは教えてくれない
- 写真付きメニューがない店が大半
- 観光客向けレストランに逃げるしかない

---

## Solution

メニューを撮影 → AIが全品翻訳＆解説 → 料理のビジュアルを自動生成

1. **撮影 or アップロード**
2. **AI解析** — 料理名、説明、価格、レストランの雰囲気を構造化
3. **ビジュアライズ** — AIが料理のテーブルスプレッド画像を生成
4. **保存 & シェア** — PNG画像でエクスポート、履歴に自動保存

---

## Target User

**スローノマド** — 数週間〜数ヶ月単位で海外に滞在しながら働く人。
観光客向けレストランより、地元の人が通うローカル食堂を好む。
旅行ツールではなく、**日常の食事の道具**。

---

## Key Features

### Menu Analysis & Translation
- Gemini AIによるOCR + 構造化翻訳
- 料理名だけでなく、調理法・食材の解説まで
- 対応言語: 日本語 / 英語（UIは2言語、翻訳は6言語対応）
- 8リージョン対応: JP / IT / ES / FR / US / KR / TH / TW

### AI Table Spread Image
- 翻訳されたメニューの料理群からAIがテーブルスプレッド画像を生成
- ダークムーディーなフードフォトグラフィースタイル
- グラスモーフィズムのカードUIで翻訳テキストをオーバーレイ

### Cultural Tips
- 解析中の待ち時間に、その地域の食文化Tips（豆知識）を表示
- 8カ国 × 最大43件/国（フランス）のコンテンツ
- Fisher-Yatesシャッフルでランダム表示、左右スワイプ対応

### Menu History
- 翻訳結果をlocalStorageに自動保存（最大20件）
- レストラン名・日時・料理数で一覧表示
- タップで過去の翻訳を再表示

### Share & Export
- 翻訳結果をPNG画像としてエクスポート
- ネイティブShare API / クリップボードコピー

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 / React 19 / TypeScript |
| AI | Google Gemini API (3.1 Flash Lite / 2.5 Flash Image) |
| Mobile | Capacitor 8 (iOS) |
| Hosting | Vercel (SSR + Serverless API Routes) |
| Styling | CSS Custom Properties (no UI library) |

---

## Architecture

```
[Client]                    [Server (Vercel)]
  │                              │
  ├── ScanView                   │
  │    ├── RegionSelector        │
  │    ├── LanguageToggle        │
  │    ├── UploadArea            │
  │    └── TipCard               │
  │                              │
  ├── fetch /api/analyze ──────► API Route (streaming)
  │    ReadableStream ◄───────── └── gemini-service.ts
  │                              │     └── Gemini 3.1 Flash Lite
  │                              │
  ├── fetch /api/generate-image► API Route
  │    JSON ◄──────────────────── └── Gemini 2.5 Flash Image
  │                              │
  ├── MenuResultView             │
  │    ├── HeroBackground        │
  │    ├── MenuCard (glass)      │
  │    └── MenuToolbar           │
  │                              │
  └── HistoryView                │
       └── localStorage          │
```

---

## Engineering Highlights

### Streaming UX
- Gemini APIのストリーミングレスポンスをReadableStreamでクライアントに中継
- JSONチャンクから国コードを最速で抽出し、即座にTips表示を開始
- 壊れたJSON（ネットワーク切断時）の自動修復ロジック

### Server-Side API Key Protection
- APIキーはサーバーサイドのみ（`GEMINI_API_KEY`、`NEXT_PUBLIC_` なし）
- IPベースのレートリミット（1分10リクエスト）
- クライアントからは `/api/analyze`, `/api/generate-image` を叩くだけ

### Component Architecture
- page.tsx: 1,277行 → 61行にリファクタリング
- 4 Custom Hooks / 10 Components / 3 Data Modules に分割
- 全2,639行（テスト除く）

### Cross-Platform
- Web (Vercel) + iOS (Capacitor) 同一コードベース
- Capacitorはリモート読み込み方式（server.url）でWeb更新が即反映

---

## Design System (Current)

| Token | Value | Usage |
|---|---|---|
| Primary | `#E85A4F` | CTA、アクセント（テラコッタ） |
| Secondary | `#8A9178` | サブ要素（セージグリーン） |
| Accent | `#C9A86C` | セクションタイトル（ゴールド） |
| Background | `#FCFBF9` | ページ背景（ウォームクリーム） |
| Foreground | `#1E2432` | テキスト（ダークネイビー） |

**Typography**: Outfit (headings) / Inter (body)
**Border Radius**: 8px / 16px / 24px

---

## Design Improvement Areas

デザイナーに改善を依頼したいポイント：

1. **ホーム画面の第一印象** — 素朴すぎる。ブランド感が薄い
2. **ロゴまわりの洗練** — タイポロゴの改善 or ミニマルアイコン追加
3. **結果カードの可読性** — AI生成画像の明暗で文字のコントラストが不安定
4. **Tipsセクションの演出** — ローディング体験をもっと楽しく
5. **全体のクラフト感** — 「ウォーム＆ローカル」の方向性は維持しつつ仕上げ品質を向上

---

## Screenshots

| Screen | File |
|---|---|
| Home | `docs/screenshots/01_home.png` |
| Home (Spain) | `Store/Screenshot 2026-03-01 at 9.55.26.png` |
| Result (top) | `Store/Screenshot 2026-03-01 at 10.07.39.png` |
| Result (scroll) | `Store/Screenshot 2026-03-01 at 10.07.45-1.png` |

---

## Development Timeline

| Period | Milestone |
|---|---|
| 2026-02 | MVP: メニュー翻訳 + Hero画像生成 |
| 2026-02 | iOS App Store リリース (v1.0) |
| 2026-03 | リブランディング (menumenu → nomameshi) |
| 2026-03 | Tips拡充 (8カ国、FR 43件) |
| 2026-03 | APIサーバーサイド化 + コンポーネント分割 |
| 2026-03 | レートリミット + 履歴機能 |
| 2026-03 | OCRモデル改善 (Gemini 3.1 Flash Lite) |

76 commits / Solo development

---

## Links

- **Web**: https://menumenu-three.vercel.app
- **GitHub**: https://github.com/DELAxGithub/nomameshi
- **App Store**: (TestFlight)

---

*Built by Dela — Global nomad, based in Málaga, Spain*
