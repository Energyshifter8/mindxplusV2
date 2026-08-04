# MindX Plus — Talent Recruitment & Survey Dashboard

A modern, dark-themed admin dashboard built with Next.js 16 for managing talent recruitment evaluations and surveys. The UI is fully localized in Mongolian.

## Overview

MindX Plus provides a centralized platform for HR teams to create, manage, and track recruitment assessments and candidate surveys. The dashboard surfaces real-time stats (published counts, respondent totals, invitation balances) and lists with live-refetching data.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Component Library | shadcn/ui (Base UI primitives) |
| State / Data Fetching | TanStack React Query v5 |
| HTTP Client | Native `fetch` (wrapped in `lib/api.ts`) |
| Icons | Lucide React |
| Package Manager | pnpm |
| Linting | Biome + ESLint (Next.js config) |

## Architecture

```
my-app/
├── app/                          # Next.js App Router (file-based routing)
│   ├── layout.tsx                # Root layout — Geist font, Providers wrapper
│   ├── page.tsx                  # Landing page → AuthForm (login/signup)
│   ├── globals.css               # CSS variables, Tailwind theme, dark palette
│   ├── login/
│   │   └── page.tsx              # Login/signup page
│   └── dashboard/
│       ├── layout.tsx            # Dashboard layout — Sidebar + main content area
│       ├── page.tsx              # Dashboard home — stat cards + data tables
│       ├── recruitments/
│       │   └── page.tsx          # Talent recruitment list (active + completed)
│       └── surveys/
│           └── page.tsx          # Survey list
├── components/                   # Shared React components
│   ├── AuthForm.tsx              # Login/signup form with validation
│   ├── Dashboard.tsx             # Main dashboard view (stats, tables, panels)
│   ├── Sidebar.tsx               # Navigation sidebar with section grouping
│   ├── providers.tsx             # React Query provider + token refresh timer
│   └── ui/                       # shadcn/ui primitives (button, input, field, etc.)
├── lib/                          # Shared utilities and API layer
│   ├── api.ts                    # API client, typed fetch wrappers, interfaces
│   └── utils.ts                  # `cn()` helper (clsx + tailwind-merge)
├── next.config.ts                # Next.js config (Turbopack root, strict mode)
├── tsconfig.json                 # TypeScript config with path aliases
├── biome.json                    # Biome formatter/linter config
├── components.json               # shadcn/ui config
└── postcss.config.mjs            # PostCSS (Tailwind)
```

## How It Works

### Authentication Flow

1. User lands on `/` or `/login` → `AuthForm` component renders login/signup tabs.
2. On submit, credentials are POSTed to the backend (`user/login` or `/api/auth/register`).
3. On success, the JWT token is stored in `localStorage` and the user is redirected to `/dashboard`.
4. A `useEffect` in the dashboard layout checks for the token on mount — redirects to `/login` if missing.
5. Token refresh runs automatically every 9 minutes via `NineMinuteTimer` in `providers.tsx`. If a 401 is returned, the token is cleared and the user is logged out.

### Data Fetching

All API calls go through `lib/api.ts`, which provides typed `apiGet` and `apiPost` wrappers around native `fetch`:

```typescript
// lib/api.ts
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  // ... returns { success, data, error }
}
```

Components consume data via TanStack React Query:

```typescript
const { data: recruitmentStats } = useQuery({
  queryKey: ['recruitmentStats'],
  queryFn: () => getRecruitmentStats<RecruitmentStats>(),
  refetchInterval: 30000,  // auto-refresh every 30s
});
```

### API Endpoints Used

| Endpoint | Method | Purpose |
|---|---|---|
| `user/login` | POST | Authenticate user, return JWT |
| `/api/auth/register` | POST | Register new account |
| `/user/auth/refresh` | GET | Refresh JWT (every 9 min) |
| `/customer/surveys-home/statistics` | GET | Survey dashboard stats |
| `/customer/recruitments/statistics` | GET | Recruitment dashboard stats |
| `/customer/surveys` | GET | List all surveys |
| `/customer/recruitments` | GET | List all recruitments |
| `/customer/hiring-invitations/latest-completed` | GET | Recent completed invitations |

### Dashboard Layout

The dashboard uses a two-panel layout:

- **Left panel (272px):** `Sidebar` — grouped navigation (Home, Surveys, Recruitment), user info, warning banner
- **Right panel:** Main content area — stat cards at top, data tables below

The main dashboard (`components/Dashboard.tsx`) renders two side-by-side panels:

1. **Survey Stats Panel (55%)** — 3 stat cards (published count, respondents, balance) + survey table
2. **Recruitment Stats Panel (45%)** — 3 stat cards (invitations sent, completed, balance) + recruitment table + recent completions

### Design System

The UI follows a dark, grid-textured design language:

- **Background:** `#0A0A0A` (near-black)
- **Cards:** `#141414` with `#2A2A2A` borders
- **Accent:** `#0B9A46` (green) for primary actions, active states, and highlights
- **Typography:** Barlow Condensed (headings), JetBrains Mono (labels/data), Geist (body)
- **Layout:** CSS Grid textures with subtle green gridlines, uppercase tracking, monospace labels

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://service-staging.mindxplus.com
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
pnpm build
pnpm start
```

## Project Structure Highlights

- **No API routes in the app** — this is a pure frontend client. All data comes from the external MindX Plus backend service.
- **Server Components are minimal** — only `layout.tsx` files and page wrappers are server components. All interactive views (`AuthForm`, `Dashboard`, `Sidebar`, list pages) are client components (`'use client'`).
- **Type-safe API layer** — every endpoint has TypeScript interfaces (`ModuleStats`, `RecruitmentStats`, `SurveyListItem`, `RecruitmentListItem`, etc.) defined in `lib/api.ts`.
- **Auto-refresh** — all data tables and stat cards poll every 30 seconds via `refetchInterval`.

## License

Private — MindX Plus internal project.
