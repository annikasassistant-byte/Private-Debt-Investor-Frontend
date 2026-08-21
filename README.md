# Depth Dashboard — Frontend

**Depth Dashboard** is the German private-debt investor portal for BuyBack Capital. Admins manage investors, investments, repayment schedules, payments, loans, and documents. Investors see only their own portfolio, timeline, and assigned files.

This repository is the **frontend**: a Next.js portal with Admin (`/admin`) and Investor (`/dashboard`) screens. All portfolio data comes from the Express API (MongoDB) via RTK Query.

Companion docs: server [`../server/README.md`](../server/README.md). Public landing site: [`../../BuyBack-Capital/README.md`](../../BuyBack-Capital/README.md).

## Live

| Layer | URL |
|-------|-----|
| Frontend (investor portal) | [https://private-debt-investor-frontend.vercel.app](https://private-debt-investor-frontend.vercel.app) |
| Login | [https://private-debt-investor-frontend.vercel.app/login](https://private-debt-investor-frontend.vercel.app/login) |
| Public landing (BuyBack Capital) | [https://buy-back-capital.vercel.app](https://buy-back-capital.vercel.app) |

API origin is `NEXT_PUBLIC_API_URL` (local default `http://localhost:5000`).

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-UI-000000?logo=shadcnui&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-RTK_Query-764ABC?logo=redux&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-Session-443E38?logo=react&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Client-010101?logo=socketdotio&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-Forms-EC5990?logo=reacthookform&logoColor=white)
![TanStack Table](https://img.shields.io/badge/TanStack-Table-FF4154?logo=reactquery&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-8884d8)
![Vercel](https://img.shields.io/badge/Vercel-Hosting-000000?logo=vercel&logoColor=white)

| Symbol | Piece | Choice |
|--------|-------|--------|
| ⬛ | Framework | Next.js 16 App Router |
| ⚛️ | UI | React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| 🔄 | Data | RTK Query (`authApi` + `domainApi`) |
| 🔐 | Session | Zustand persist `depth-auth` (user only) |
| 📡 | Realtime | Socket.IO client |
| 📝 | Forms / tables | react-hook-form + Zod, TanStack Table |
| 📊 | Charts / toasts | Recharts, Sonner |
| 🧪 | Smoke tests | Playwright (`scripts/smoke-routes.mjs`) |
| ☁️ | Hosting | Vercel |

`@tanstack/react-query` is installed and wrapped but **unused**. Use RTK Query for new API calls.

**No `middleware.ts`.** Soft admin gate is `proxy.ts` (`depth_role_hint` cookie). Route protection is client `AuthGuard` on layouts.

---

## Quick start

```bash
cd client
pnpm install
# .env.local (optional):
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_LANDING_PAGE_URL=https://buy-back-capital.vercel.app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → `/login`.

Backend must be running (see [`../server/README.md`](../server/README.md)). Seed the API first.

| Role | Email | Password |
|------|-------|----------|
| admin | `admin@depthdashboard.local` | `ChangeMeAdmin123!` |
| investor | `investor@depthdashboard.local` | `ChangeMeInvestor123!` |

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Next dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint |
| `pnpm test:smoke` | Route smoke (`scripts/smoke-routes.mjs`) |

---

## Coding structure

```text
client/
├── app/                    # App Router pages
│   ├── layout.tsx          # html lang=de, AppProviders
│   ├── page.tsx            # redirects to /login
│   ├── proxy.ts            # soft /admin gate (investor role hint)
│   ├── login|forgot-password|verify-otp|reset-password|unauthorized/
│   ├── admin/              # AuthGuard admin + admin nav
│   └── dashboard/          # AuthGuard investor + investor nav
├── features/               # Shared screens (not all routes use this yet)
│   ├── auth/login-page.tsx
│   ├── cms/buyback-cms-page.tsx
│   ├── referral/recommend-page.tsx
│   ├── settings/settings-page.tsx
│   ├── profile/profile-settings.tsx
│   └── payments/payment-columns.tsx
├── components/
│   ├── auth/               # AuthGuard, auth-flow-shell
│   ├── layout/             # sidebar, top-navbar, notification-dropdown
│   ├── shared/             # PageHeader, EmptyState, LoadingSkeleton, …
│   ├── dashboard/          # MetricCard, charts
│   ├── charts/ timeline/ documents/ tables/
│   └── ui/                 # shadcn primitives
├── services/               # RTK Query APIs
│   ├── baseQuery.ts        # Bearer + cookies + 401 refresh
│   ├── authApi.ts
│   ├── domainApi.ts
│   ├── config.ts           # API_V1, sessionStorage tokens, landing URL
│   └── auth-mappers.ts
├── store/                  # Redux store (RTK Query only)
├── lib/
│   ├── auth-store.ts       # Zustand session
│   ├── format.ts, download.ts, repayment.ts, investment-status.ts
│   └── timeline-i18n.ts, timeline-notifications.ts, chart-series.ts
├── providers/              # Redux, theme, QueryClient, Socket.IO
├── constants/navigation.ts # adminNavGroups + investorNavGroups
├── types/                  # User, Investor, Investment, Payment, …
└── hooks/
```

### Patterns to follow

- **Dual portal:** `app/admin/*` and `app/dashboard/*` are role-gated. Do not let investors hit `/admin`.
- **German copy** hardcoded in screens (no i18n library). Timeline labels via `lib/timeline-i18n.ts`.
- **RTK Query** + tag invalidation (`Investors`, `Investments`, `Payments`, `Dashboard`, `Timeline`, `BuybackCms`, …).
- **Sonner** toasts. Use `EmptyState` / `LoadingSkeleton` for empty and loading.
- **Role gates:** hide admin writes in the UI **and** rely on server 403. `hasRole("admin")` is not enough by itself.
- Tokens: memory + `sessionStorage` (`depth-access-token` / `depth-refresh-token`). `credentials: "include"`. 401 → `POST /auth/refresh`. Never localStorage for tokens.
- After login: admin → `/admin/dashboard`, investor → `/dashboard`. Set `depth_role_hint` cookie for `proxy.ts`.

---

## Implemented features

### Auth

| Screen | Route | Status |
|--------|-------|--------|
| Login | `/login` | Implemented |
| Forgot password | `/forgot-password` | Implemented |
| Verify OTP | `/verify-otp` | Implemented |
| Reset password | `/reset-password` | Implemented |
| Unauthorized | `/unauthorized` | Implemented |
| Public register page | — | **Not built** (API exists; admin creates investors) |

Session: Zustand `depth-auth` (user + `isAuthenticated`). Profile refresh via `GET /users/me`. Socket `server:force_logout` clears session.

Password reset flow: Forgot password → OTP (email / Redis) → reset token in `sessionStorage` (`depth-reset-email` / `depth-reset-token`) → Reset password → login.

### Dual portals

| Portal | Layout gate | Extra nav |
|--------|-------------|-----------|
| Admin `/admin/*` | `allowedRoles={["admin"]}` | Übersicht, Investoren, Investitionen, Kredite, Zahlungen, Rückzahlungsplan, Zeitachse, Finanzberichte, Verträge, BuyBack Landing CMS, Benachrichtigungen, Einstellungen, Profil |
| Investor `/dashboard/*` | `allowedRoles={["investor"]}` | Übersicht, Meine Investitionen, Zahlungszeitachse, Zahlungsplan, Finanzberichte, Verträge, BuyBack Capital empfehlen, Profil, Einstellungen |

### Portfolio screens (implemented)

| Screen | Routes | What it does |
|--------|--------|----------------|
| Admin dashboard | `/admin/dashboard` | Stats, allocation / growth / P+I charts, recent timeline |
| Investor dashboard | `/dashboard` | Own KPIs (principal, outstanding, interest, next payment), charts, timeline |
| Investors | `/admin/investors` | CRUD (creates login user + Investor profile) |
| Investments | `/admin/investments` | CRUD, regenerate schedule, early repayment |
| Investor investments | `/dashboard/investment` | Read-only own investments |
| Loans | `/admin/loans` | CRUD linked to an investment |
| Payments | `/admin/payments` | List, mark-paid, cancel |
| Schedules | `/admin/repayment-schedule`, `/dashboard/schedule` | Payment rows for investments |
| Timeline | `/admin/timeline`, `/dashboard/timeline` | German status labels + Heute marker |
| Reports / contracts | `…/reports`, `…/contracts` | Admin upload + assign; investor sees assigned files |
| BuyBack CMS | `/admin/buyback-cms` | JSON editor for `site` / `chrome` / `landing` / `dashboard` sections; save / reset |
| Empfehlen | `/dashboard/empfehlen` | Share/copy `NEXT_PUBLIC_LANDING_PAGE_URL` |
| Notifications | `/admin/notifications` + navbar bell | Derived from timeline (`timelineToNotifications`) — not a dedicated notifications API |
| Settings / profile | `…/settings`, `…/profile` | Theme, notification prefs; name, phone, password |

Admin-only **writes** (UI + API): investors, investments, loans, payment mutations, document upload, CMS. Investors **read** scoped data and can share the public landing page.

### Data layer (implemented)

- `domainApi` — dashboards, investors, investments, loans, payments, reports, contracts, timeline, BuyBack CMS
- `authApi` — login/logout/OTP/reset, profile, notification prefs
- `baseQueryWithReauth` — Bearer header, `X-Device-Id`, cookie credentials, refresh on 401
- Socket.IO — `server:payment_updated` / `timeline_updated` / `dashboard_updated` invalidate portfolio tags

### Partial / stub

- Login page has **no** one-click demo-credentials panel (seeded emails are documented here, not in the UI)
- `scripts/smoke-routes.mjs` still logs in with stale `admin@buyback.com` / `investor@buyback.com` and does not visit `/dashboard/empfehlen` or `/admin/buyback-cms`
- `@tanstack/react-query` QueryClient is mounted but unused
- Navbar notifications are timeline-derived; there is no mark-as-read API

<!--
## Keeping this README current
When a frontend feature or bug fix lands, update this file (and the root README Frontend section) in the same change.
-->
