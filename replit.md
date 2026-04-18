# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains an Expo mobile app (Ambit) and a shared Express API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Ambit (Mobile App) — `artifacts/ambit/`
A premium multi-step onboarding flow for a student network app. Dark luxury UI with deep navy-to-blue-purple gradients.

**7-Step Onboarding Flow:**
1. Welcome / First Impression
2. Account Start / Gmail Verification
3. Nickname + Identity Setup
4. Profile Photo Setup
5. Goals + Student Focus
6. Family / Circle Preferences
7. Final Profile Summary + Enter App

**Design System:**
- Background: `#0A0F1F` to `#1A1F3C` gradient
- Primary: `#3B82F6` (blue), Accent: `#8B5CF6` (purple)
- Radius: 16px
- Lion mascot guide across all screens
- Animated backgrounds, progress bar, micro-interactions

**Key files:**
- `context/OnboardingContext.tsx` — state management for all 7 steps
- `screens/` — one file per onboarding screen + MainAppScreen
- `components/` — GradientBackground, GradientButton, MascotGuide, ProgressBar, SelectableCard
- `constants/colors.ts` — full dark theme design tokens

### API Server — `artifacts/api-server/`
Shared Express backend (currently health check only).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
