# Nomameshi - UI/UX Rebranding Design Brief

## 1. Project Overview
We are rebranding a menu translation & visualization app for global nomads from "menumenu" to **"Nomameshi"**.
The name is inspired by NHK's popular show "Salameshi" (a play on "salaryman's lunch"), reimagined for the global workforce. **"Nomameshi"** = **Nomad + Meshi (everyday meal in Japanese)**. It positions the app as a practical, everyday tool that supports **global workers' daily meals** while they live and work around the world.

## 2. Target Persona
- **Work Style**: Slow nomads — not rapid city-hoppers, but people who settle in one place for weeks or months, "living like a local while working remotely."
- **Food Preferences**:
  - Foodies with adventurous, omnivorous palates.
  - Prefer **traditional local cuisine and neighborhood eateries** over tourist-oriented restaurants or resort food.
  - Enjoy alcohol (while also respecting sober-curious choices depending on mood).
- **Communication**:
  - Love connecting with local restaurant staff, exchanging various expressions for "delicious" in the local language, and building genuine local connections through food.

## 3. Design Direction (Tone & Manner)
- **Desired Impression**: "Everyday life, tactile warmth, local authenticity, approachability, utility"
- **Current Problem**: The existing "dark & solid" UI feels too cyber/techy — it gives off a cold, technology-first impression.
- **What to Avoid**: No "resort vibes, vacation feel, or tourist look." This is about **daily meals during a work day**, not holiday dining.
- **Hints & Requests**:
  - Soften the cold tech feel. Consider warm tones that blend naturally into a local eatery's menu board or a nomad's calm workspace (e.g., earth tones, warm grays, craft-paper textures).
  - Backgrounds and decorations should be understated — the hero content is **the analyzed dish photography (AI-generated table-spread image displayed as the background)**, and the UI should serve as a noise-free canvas that makes the food look its most appetizing.

## 4. Existing UI Architecture (Technical Constraints)
The designer should work within these structural assumptions:

### 4-1. Background Layer & Glassmorphism
- After the user submits a menu photo for analysis, an **AI-generated table-spread image** (vertical 9:16 ratio, dark cinematic food photography) is displayed as the **full-bleed background layer** (furthest back).
- Menu item cards are overlaid on top of this image using **glassmorphism** (semi-transparent frosted-glass effect via `backdrop-filter`).
- **Design requirement**: Card design must maintain **text legibility (contrast)** while allowing the appetizing background imagery to subtly show through.
- Current implementation: `backdrop-filter: blur(12px)` with `rgba(10, 10, 10, 0.75)` dark overlay. This can be revised.

### 4-2. Loading Screen "Tips" Section
- Menu image analysis takes several seconds. During this loading time, the app displays **rotating cultural tips** — bite-sized local food customs and nomad dining etiquette (e.g., "Tipping is not customary in Japan", "Dinner in Spain starts at 9 PM").
- Tips rotate every 3.5 seconds with a fade-in animation.
- **Design request**: Make this loading experience feel engaging and delightful, not boring. Consider animation, micro-interactions, or visual treatments that keep users entertained.

## 5. Deliverables
We are requesting the following design work:

1. **"Nomameshi" logo** (typography-focused, minimal — no elaborate illustration needed)
2. **Redefined color palette** (primary + secondary + accent colors) to replace the current dark/cyber theme
3. **Typography selection** (high legibility, with a touch of warmth and approachability)
4. **Mockups of key screens** with the new color scheme applied:
   - **Scan mode** (initial screen with upload button, region/language selectors, and loading Tips section)
   - **Result mode** (glassmorphism menu card overlaid on the AI-generated table-spread background image)

## Appendix: Current Implementation Reference

### Tech Stack
- Next.js 16 + React 19, deployed on Vercel
- Mobile-first (max-width: 600px container)
- No component library — custom CSS with CSS variables

### Current Color Tokens
| Token | Value | Usage |
|---|---|---|
| `--background` | `#050505` | Page background |
| `--surface` | `#121212` | Card surfaces |
| `--foreground` | `#EDEDED` | Primary text |
| `--foreground-muted` | `#A1A1AA` | Secondary text |
| `--primary` | `#FF4B2B` | Accent / CTA (orange-red) |
| `--secondary` | `#FF416C` | Error states (pink) |
| `--accent` | `#FFD700` | Section titles (gold) |

### Current Typography
- **Headings**: Outfit (Google Font), 700 weight
- **Body**: Inter (Google Font)

### Supported Languages (UI content is multilingual)
Japanese, English, Chinese (Simplified), Korean, Spanish, French

### Supported Regions
Japan, Italy, Spain, France, USA, Korea, Thailand, Taiwan (+ Auto-Detect)
