## FFOracle Frontend

Fantasy Football Assistant Manager – frontend web app built with the Next.js App Router.


---

## Tech stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript / React
- **Styling:** Tailwind CSS 4, custom CSS in `app/globals.css`
- **Auth & data:** Supabase (`lib/supabase/*`)
- **Payments:** Stripe (`app/components/Payment/*`)

---

## Project structure (key paths)

Only the most relevant paths are listed here; see the repo for full details.

### Top-level

- `app/` – Next.js App Router entry point and all routes/components
	- `app/layout.tsx` – root layout wrapper
	- `app/page.tsx` – landing page
- `lib/` – shared libraries and utilities
	- `lib/supabase/` – Supabase client and auth helpers
	- `lib/utils/` – app-specific utilities (cached advice, formatting, roster slots)
- `public/` – static assets (fonts, images)
- `eslint.config.mjs` – ESLint configuration
- `tsconfig.json` – TypeScript configuration
- `next.config.ts` – Next.js configuration

### App routes

Under `app/`:

- `app/dashboard/page.tsx` – main user dashboard
- `app/dashboard/advice/page.tsx` – AI fantasy advice view
- `app/performance/page.tsx` – player performance page
- `app/settings/page.tsx` – settings hub
- `app/stats/page.tsx` – stats view
- `app/signin/page.tsx` – sign-in page
- `app/signup/page.tsx` – sign-up page
- `app/articles/page.tsx` – player news & articles

### API routes

- `app/api/deleteUser/route.ts` – API route to delete a user account

### Shared UI & logic

- `app/components/Navigation/` – nav bars (`AppNav`, `LandingNav`, `Navigation`)
- `app/components/Overlay/` – overlays & modals (player stats, swap, advice reasoning, etc.)
- `app/components/Payment/` – Stripe checkout and payment completion UI
- `app/components/Settings/` – settings tab components
- `app/components/Tour/` – dashboard product tour
- `app/context/AuthProvider.tsx` – authentication context provider
- `app/context/UserDataProvider.tsx` – user data context provider
- `app/hooks/` – custom hooks (e.g. `usePlayersByPosition`, `useRedirectIfLoggedIn`)
- `app/interfaces/` – TypeScript interfaces for API and app data shapes

---

## Setup & installation

From the project root (`FFOracle-Frontend`):

```bash
npm install
```

You can also use `yarn`/`pnpm`/`bun` if you prefer, but the scripts below assume `npm`.

You'll need the appropriate environment variables configured for Supabase and Stripe in `.env.local`:

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_BACKEND_BASE_URL=
```


Consult your backend / env docs for the exact variable names.

---

## Running the app locally

Start the development server:

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.

The main entry is `app/page.tsx`. Any changes in files under `app/` will hot-reload.

To build for production:

```bash
npm run build
```

To run the production build locally:

```bash
npm run start
```

---

