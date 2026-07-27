# Depth Capital — Private Debt Investor Dashboard

Frontend-only Next.js investor portal with mock data, role-based auth, and admin tooling.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query & Table, Zustand, Recharts, Framer Motion.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@buyback.com | Admin@123 |
| Investor | investor@buyback.com | Investor@123 |

Use the **Demo credentials** panel on the login page for one-click fill, copy, or login.

## Routes

- **Investor:** `/dashboard`, investment, timeline, schedule, reports, contracts, profile, settings
- **Admin:** `/admin/dashboard`, investors, investments, loans, payments, schedules, timeline, reports, contracts, notifications, settings, profile
- **Auth:** `/login`, `/forgot-password`, `/verify-otp`, `/reset-password`, `/unauthorized`

Password reset flow (demo): **Forgot password** → **OTP** (`123456`) → **Reset password** → login.

Session is stored in `localStorage` via Zustand (`depth-auth`).
