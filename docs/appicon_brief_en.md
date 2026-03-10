# Nomameshi — App Icon Design Brief

## 1. Overview

We need an **app icon** for "Nomameshi," a menu translation app for iOS and web. The current icon is a placeholder (Capacitor default). We need a professional icon that represents the brand and looks great on a home screen.

**This brief is specifically for the app icon.** A separate logo wordmark brief exists ([logo_brief_en.md](logo_brief_en.md)) — the icon should be designed to work as a cohesive family with the eventual wordmark, but this deliverable is icon-only.

## 2. About Nomameshi

- **What it does**: Users photograph a foreign-language restaurant menu → AI instantly translates it and generates food visuals
- **Name origin**: Nomad + Meshi (everyday meal in Japanese, as in NHK's "Salameshi")
- **Tagline**: "See the Flavor"
- **Target users**: Slow nomads, adventurous foodies, global workers having everyday meals abroad
- **Live app**: https://nomameshi-delaxs-projects.vercel.app

## 3. Brand Personality

| Attribute | Description |
|---|---|
| **Warm** | Like a handwritten menu at a neighborhood cafe |
| **Approachable** | Friendly, not techy or corporate |
| **Authentic** | Real local dining, not curated Instagram food |
| **Practical** | A daily-use utility, not a luxury experience |
| **Global** | Works across cultures without being tied to one |

**What to avoid**: Cold/tech/cyber aesthetic. Resort or vacation vibes. Overly cute mascots. Clip-art style food illustrations.

## 4. Color Palette (Established)

The icon should use colors from our existing palette:

| Color | Hex | Role |
|---|---|---|
| Ivory | `#FCFBF9` | Background |
| Charcoal | `#1E2432` | Primary text / dark elements |
| Coral | `#E85A4F` | Primary accent / CTA |
| Olive | `#8A9178` | Secondary accent |
| Soy/Gold | `#C9A86C` | Warm accent |

**Preferred direction**: Coral (`#E85A4F`) as the dominant color or background, with Charcoal/Ivory as contrast. The icon should feel warm and immediately recognizable among other apps.

## 5. Icon Concept Directions

We're open to the designer's creativity, but here are some starting directions to explore:

### Direction A — Abstract "N" Mark
A stylized letter "N" (for Nomameshi) with subtle food/warmth cues — perhaps incorporating a chopstick stroke, a gentle curve suggesting steam, or a fold reminiscent of a menu page.

### Direction B — Menu + Lens
A simplified menu or card shape combined with a camera/lens element, representing the core action of "photograph a menu." Minimal, geometric, modern.

### Direction C — Bowl / Table Symbol
An abstract symbol inspired by a dish, bowl, or table setting — evoking "meshi" (meal). Not literal or illustrative, but a refined geometric form that hints at food culture.

### Direction D — Typography Icon
A bold, compact typographic treatment of "の" (no) or "N" that works as a standalone icon. Strong enough to be recognizable at 29x29px.

## 6. Technical Requirements

### Sizes & Format
| Context | Size | Notes |
|---|---|---|
| App Store | 1024 x 1024 px | Primary deliverable, PNG, no alpha/transparency |
| iOS Home Screen | 180 x 180 px (@3x) | Auto-derived from 1024 |
| Spotlight | 120 x 120 px (@3x) | Auto-derived from 1024 |
| Settings | 87 x 87 px (@3x) | Auto-derived from 1024 |
| Favicon | 32 x 32, 16 x 16 px | Simplified version if needed |
| Web (PWA) | 192 x 192, 512 x 512 px | For manifest.json |

### Apple Guidelines
- **No alpha channel / transparency** (iOS icons have no transparent areas)
- iOS automatically applies rounded corners (superellipse) — **do NOT include rounded corners** in the asset
- Must be legible and recognizable at small sizes (29pt / 87px)
- Avoid excessive detail that gets lost at small sizes
- Avoid text in the icon (Apple discourages it)
- Single focal point, simple composition

### File Deliverables
1. **1024x1024 PNG** (no alpha) — for App Store & iOS
2. **512x512 PNG** — for PWA
3. **192x192 PNG** — for PWA
4. **32x32 & 16x16 PNG** — for favicon
5. **SVG** (vector source) — for scalability
6. **Source file** (Figma / Illustrator / Sketch)

## 7. Context: How It Appears

The icon will be seen in these contexts:
- **iPhone home screen**: Among dozens of other colorful app icons — needs to stand out
- **App Store search results**: Small thumbnail next to the app name "Nomameshi"
- **Safari / browser tab**: As a tiny favicon
- **Share sheets & notifications**: At various small sizes

## 8. Competitive Landscape

Similar apps in the translation / food category for reference (differentiate from these):
- **Google Translate**: Blue & white, camera icon — too corporate
- **Papago**: Green parrot — too cute/mascot-heavy
- **Yelp**: Red star — too generic
- **Uber Eats**: Green/black — too delivery-focused

We want to feel more like: **Airbnb** (warm, travel, approachable), **Notion** (clean, minimal), **Bear** (warm color, simple icon).

## 9. Reference: Current CSS Wordmark

The app currently uses a CSS wordmark in the header:
- `noma` in Charcoal (`#1E2432`) + `meshi` in Coral (`#E85A4F`)
- Font: Outfit, weight 800, letter-spacing: -0.04em
- The icon does not need to replicate this, but should feel like part of the same family.

## 10. Timeline & Budget

| Item | Detail |
|---|---|
| Deadline | Flexible — aiming for App Store launch within 1-2 weeks |
| Budget | To be discussed |
| Rounds of revision | 2-3 rounds expected |

## 11. Deliverables Checklist

- [ ] 3 initial concept directions (rough mockups at 1024px)
- [ ] Home screen mockup showing the icon among other real apps
- [ ] 1 selected direction refined
- [ ] All size variants (Section 6)
- [ ] Source vector file
