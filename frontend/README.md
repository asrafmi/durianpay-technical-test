# Frontend

Vue 3 + TypeScript dashboard for the DurianPay payment monitoring app, built with Vite.

## Prerequisites

- Node 20+

## Setup

```bash
npm install
```

## Configuration

The frontend reads its backend API base URL from `window.__API_BASE_URL__`, set by `public/config.js`:

```js
window.__API_BASE_URL__ = 'http://localhost:8080';
```

This is a runtime (not build-time) value, so the same production Docker image can point at different backends without rebuilding - see [Docker](#docker) below. For local development, edit `public/config.js` directly if the backend runs somewhere other than `http://localhost:8080`.

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

_To be documented once component tests are added._

## Pages

_To be documented once the login page and dashboard are implemented._
