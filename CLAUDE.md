# nomameshi - 海外旅行×食 AI アプリ

## Phase: active

> 規律強度・active→beta 昇格ゲートは agent-harness の `project-phase.md` 参照。
> beta 昇格には Telemetry 層（euroquest ADR-0007 の telemetry-client 横展開）が必要。

旅行先の食情報をAIで提案するiOSアプリ。Tips ES84件+FR43件。

## Stack
Next.js 16 + React 19 + TypeScript + Capacitor iOS + Gemini API

## Design System
- Pencil source: `design/nomameshi.pen`
- Style: Warm consumer — glassmorphism cards, food photography背景, 暖色系
- Design brief: `docs/design_brief.md`

## Commands
| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバー |
| `npm run build` | Next.js ビルド |
| `npm run build:ios` | build + cap sync ios |
| `npm run cap:open` | Xcode起動 |
| `npm run lint` | ESLint |
