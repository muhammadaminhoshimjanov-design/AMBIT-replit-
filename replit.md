# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains an Expo mobile app (Ambit) and a shared Express API server.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Mobile**: Expo (React Native) with expo-router
- **Database**: Supabase (PostgreSQL with RLS)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Ambit (Mobile App) — `artifacts/ambit/`
A premium student network app with multi-step onboarding and a full social feed. Dark cinematic UI: deep navy → blue-purple gradients, glass-morphism cards, glow effects.

**6-Step Onboarding:**
1. Welcome — animated logo + Leo mascot intro
2. Account — real Supabase email/password signup & signin
3. Nickname — saves nickname + bio to `profiles`
4. Photo — avatar color picker, saves `avatar_style` to `profiles`
5. Goals — saves `focus_topics` + `student_identity`
6. Circles — joins starter circles in `circle_members`
7. Summary — sets `onboarding_completed = true`, enters main app

**Main App (MainAppScreen) Features:**
- **Feed tab** — real posts from Supabase with filter tabs (All / My circles / Following)
- **My circles strip** — horizontal scroll of joined circles at top of feed
- **Like/unlike** — optimistic UI using `toggle_like` RPC function (atomic, secure)
- **Comments** — threaded comments modal with live posting, tap author to view profile
- **Create post** — modal with 4 post types (Question/Debate/Experience/General) + circle picker
- **Circles tab** — all 10 seeded circles with join/leave
- **Profile tab** — shows avatar, nickname, bio, topics, own posts
- **UserProfileModal** — tap any author avatar/name to open profile slide-up with follow/unfollow
- **Following feed** — filter to see only posts from people you follow
- **Real-time** — Supabase realtime subscription auto-prepends new posts
- **Sign out** — clears session, returns to auth screen

**Supabase Setup:**
- URL: stored in `EXPO_PUBLIC_SUPABASE_URL` env var
- Key: stored in `EXPO_PUBLIC_SUPABASE_ANON_KEY` env var
- Schema: run `artifacts/ambit/lib/db-setup.sql` in Supabase SQL Editor
- 8 tables: profiles, circles, circle_members, posts, comments, post_likes, follows
- RPC: `toggle_like(p_post_id, p_user_id)` — atomic like/unlike with SECURITY DEFINER

**Key Files:**
- `lib/supabase.ts` — Supabase client
- `lib/db-setup.sql` — full DB schema (MUST run in Supabase SQL Editor)
- `context/AuthContext.tsx` — session + profile management, `useAuth()`
- `context/OnboardingContext.tsx` — onboarding step state
- `app/index.tsx` — root flow controller with auth gates
- `app/_layout.tsx` — providers (AuthProvider, SafeAreaProvider)
- `screens/MainAppScreen.tsx` — full main app: feed/circles/profile + modals
- `screens/AccountScreen.tsx` — real Supabase auth
- `screens/PhotoScreen.tsx` — avatar style picker, saves to Supabase
- `components/UserProfileModal.tsx` — profile slide-up with follow/unfollow

**Design tokens:**
- Background: `#050813`
- Primary: `#6366F1`, Blue: `#3B82F6`
- Cards: `rgba(14-20, 19-26, 50-60, 0.85-0.95)` with `rgba(255,255,255,0.04)` borders
- Avatar palettes: 6 gradient pairs (A–F)

### API Server — `artifacts/api-server/`
Shared Express backend (currently health check only, port 8080).

## Key Commands

- `pnpm --filter @workspace/ambit run dev` — run Expo app
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm run typecheck` — full typecheck across all packages
