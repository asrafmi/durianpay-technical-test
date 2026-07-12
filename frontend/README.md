# Frontend

Vue 3 + TypeScript dashboard for the DurianPay payment monitoring app, built with Vite.

## Prerequisites

- Node 20+

## Setup

```bash
npm install
```

## Configuration

The frontend resolves its backend API base URL in this order:

1. `window.__API_BASE_URL__`, set by `public/config.js`:

   ```js
   window.__API_BASE_URL__ = 'http://localhost:8080';
   ```

   This is a runtime (not build-time) value - the same production Docker image can point at different backends without rebuilding, since `entrypoint.sh` regenerates `config.js` from the `API_BASE_URL` env var at container startup (see [Docker](#docker) below).

2. `VITE_API_BASE_URL` from `.env`, as a build-time fallback for local development outside Docker (`npm run dev` / `npm run build`).

For local development, edit `public/config.js` directly, or set `VITE_API_BASE_URL` in `.env`, if the backend runs somewhere other than `http://localhost:8080`.

## Running the dev server

```bash
npm run dev
```

Starts on `http://localhost:5173` by default.

## Build for production

```bash
npm run build
```

Outputs a static bundle to `dist/`.

```bash
npm run preview
```

Serves the production build locally for a final check.

## Docker

The [Dockerfile](build/docker/Dockerfile) has two build targets:

- `dev` - runs the Vite dev server with HMR; source code is bind-mounted from the host.
- `production` - builds the static bundle and serves it via nginx.

Dev (hot-reload):

```bash
docker compose -f build/docker/docker-compose.yml up -d --build
```

Production:

```bash
docker compose -f build/docker/docker-compose.production.yml up -d --build
```

Either way, the app is available at `http://localhost:5173`. In production mode, the backend URL is injected at container startup via the `API_BASE_URL` environment variable (see [Configuration](#configuration)) - no rebuild needed to point at a different backend. See [docker-compose.yml](build/docker/docker-compose.yml) / [docker-compose.production.yml](build/docker/docker-compose.production.yml) for details, or use the root-level `npm run docker:frontend:*` / `npm run docker:production:frontend:*` scripts documented in the [repo root README](../README.md).

## Testing

Unit tests run on [Vitest](https://vitest.dev/) with [`@vue/test-utils`](https://test-utils.vuejs.org/) for composables/store-backed component logic, in a `jsdom` environment.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Test files are colocated with the source they cover, as `*.spec.ts`. Current coverage:

- **`lib/`** - pure helpers (`omit-empty`, `await-to-error`)
- **`data/payments.ts`** - formatting/percentage helpers
- **`composables/`** - `useSlidingIndicator` (shared sliding pill/indicator geometry), `usePaymentFilters` (search/status/sort/page state + fetch orchestration)
- **`stores/`** - `auth` (login/logout, localStorage hydration) and `payment` (fetch payments/summary), with `axios` mocked so no real network calls are made

Component mount tests (e.g. `PaymentTable.vue`, `Pagination.vue`) are not yet covered.

`src/test-setup.ts` polyfills `localStorage` for the test environment - some Node/jsdom version combinations don't reliably expose it, so this keeps `stores/auth.spec.ts` deterministic regardless of the local Node version. It's a no-op if the environment already provides `localStorage`.

CI runs this suite on every push/PR touching `frontend/**` (see [`.github/workflows/frontend.yml`](../.github/workflows/frontend.yml)), before the build step.

## Pages

- **Login** (`/login`) - email/password sign-in against `POST /dashboard/v1/auth/login`; redirects to the dashboard if already authenticated.
- **Dashboard** (`/dashboard`) - payments table with search, status filter, sort-by-date, pagination, summary cards (total/completed/processing/failed), and a payment detail side panel.
- **Settlements** (`/settlements`) - placeholder "coming soon" page.
- Unmatched routes render a 404 "coming soon" page outside the dashboard layout.

All authenticated pages live under a shared `DashboardLayout` (sidebar navigation, header greeting, user info) rendered via nested routes so the layout persists across navigation.
