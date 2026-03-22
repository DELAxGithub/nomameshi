# Nomameshi

## Don't just read the menu. See the flavor.

---

## What is Nomameshi?

An AI-powered menu translation and visualization app.
Snap a photo of a foreign-language menu, and get structured translations
of every dish — with descriptions, prices, and an AI-generated table spread image.

---

## Problem

You're at a local restaurant abroad. The menu is unreadable.

- Google Translate gives you word-by-word output. It won't explain what "Secreto Ibérico" actually is
- Most local spots don't have photo menus
- You end up at tourist traps with English menus and inflated prices

---

## Solution

Photograph the menu → AI translates & explains every dish → Visualize with generated food imagery

1. **Capture or upload** a menu photo
2. **AI analysis** — Extracts dish names, descriptions, prices, and restaurant vibe
3. **Visualize** — AI generates a cinematic table spread image of the dishes
4. **Save & share** — Export as PNG, auto-saved to history

---

## Target User

**Slow nomads** — Remote workers who stay weeks to months in a single location abroad.
They prefer neighborhood eateries over tourist restaurants.
Not a travel tool — an **everyday meal companion**.

---

## Key Features

### Menu Analysis & Translation
- Gemini AI-powered OCR + structured translation
- Goes beyond dish names: cooking methods, ingredients, cultural context
- UI in Japanese / English; translation supports 6 languages
- 8 regions: JP / IT / ES / FR / US / KR / TH / TW

### AI Table Spread Image
- Generates a photorealistic table spread from the translated dish list
- Dark, moody food photography aesthetic
- Glassmorphism card UI overlays translation on the generated image

### Cultural Tips
- During analysis loading time, displays local food culture tips
- 8 countries × up to 43 tips each (France)
- Fisher-Yates shuffle for randomized display, swipe left/right navigation

### Menu History
- Auto-saves translations to localStorage (max 20 entries)
- List view with restaurant name, date, dish count
- Tap to revisit any past translation

### Share & Export
- Export translated menu as PNG image
- Native Share API / clipboard copy

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
- Streams Gemini API responses to the client via ReadableStream
- Extracts country code from partial JSON mid-stream to instantly display relevant Tips
- Auto-repairs truncated JSON from network interruptions

### Server-Side API Key Protection
- API key is server-only (`GEMINI_API_KEY`, no `NEXT_PUBLIC_` exposure)
- IP-based rate limiting (10 requests/minute)
- Client only calls `/api/analyze` and `/api/generate-image`

### Component Architecture
- Refactored page.tsx from 1,277 lines → 61 lines
- 4 custom hooks / 10 components / 3 data modules
- 2,639 total lines of code (excluding tests)

### Cross-Platform
- Web (Vercel) + iOS (Capacitor) from a single codebase
- Capacitor uses remote loading (server.url) — web updates reflect instantly on iOS

---

## Design System (Current)

| Token | Value | Usage |
|---|---|---|
| Primary | `#E85A4F` | CTA, accent (terracotta) |
| Secondary | `#8A9178` | Subtle elements (sage green) |
| Accent | `#C9A86C` | Section titles (gold) |
| Background | `#FCFBF9` | Page background (warm cream) |
| Foreground | `#1E2432` | Text (dark navy) |

**Typography**: Outfit (headings) / Inter (body)
**Border Radius**: 8px / 16px / 24px

---

## Design Improvement Areas

Areas where a designer's input would elevate the product:

1. **Home screen first impression** — Currently too plain. Needs stronger brand presence
2. **Logo refinement** — Typographic logo polish or minimal icon addition
3. **Result card legibility** — Text contrast is inconsistent across varying AI-generated backgrounds
4. **Tips section engagement** — Make the loading experience more delightful
5. **Overall craft & polish** — Maintain the "warm & local" direction while raising finish quality

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
| 2026-02 | MVP: Menu translation + hero image generation |
| 2026-02 | iOS App Store release (v1.0) |
| 2026-03 | Rebrand (menumenu → nomameshi) |
| 2026-03 | Cultural tips expansion (8 countries, FR: 43 tips) |
| 2026-03 | API server-side migration + component architecture refactor |
| 2026-03 | Rate limiting + menu history |
| 2026-03 | OCR model upgrade (Gemini 3.1 Flash Lite) |

76 commits / Solo development

---

## Links

- **Web**: https://menumenu-three.vercel.app
- **GitHub**: https://github.com/DELAxGithub/nomameshi
- **App Store**: (TestFlight)

---

*Built by Dela — Global nomad, based in Málaga, Spain*
