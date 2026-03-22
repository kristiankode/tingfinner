# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build
```

## Architecture

**Tingfinner** is a Norwegian-language mobile inventory app (prototyped from a Figma design). It simulates scanning household items with a camera, AI-processing the photo, and saving them to a categorized inventory.

### Tech Stack

- React 18 + TypeScript, Vite
- Routing: React Router v7
- UI: shadcn/ui (Radix UI primitives) + Tailwind CSS v4 + MUI
- Forms: React Hook Form
- Animation: Motion (Framer Motion fork)

### Key Patterns

**Mobile-only layout**: All pages wrap in `MobileContainer` (max-width 390px). Desktop shows a gray frame around the mobile viewport.

**Routing & state passing**: Routes are defined in `src/app/routes.tsx`. Pages communicate via `location.state` (e.g., camera photo base64 → processing → item form).

**Mock data**: All types (`Item`, `Category`, `Condition`, `Room`) and sample data live in `src/app/lib/data.ts`. There is no backend — data is static.

**AI simulation**: `Processing.tsx` uses a 2.5s timeout to fake AI analysis, then passes mock results to `ItemForm.tsx` for pre-filling.

**Component library**: `src/app/components/ui/` contains 50+ shadcn/ui wrappers. Prefer these over raw HTML or MUI components.

### Localization

The app is in Norwegian Bokmål. Use `'nb-NO'` locale for dates and currency formatting.
