# Frontend

Vue 3 + TypeScript dashboard for the DurianPay payment monitoring app, built with Vite.

## Prerequisites

- Node 20+

## Setup

```bash
npm install
```

## Configuration

The frontend talks to the backend API at the URL configured in `VITE_API_BASE_URL` (default `http://localhost:8080` if unset). Set it in a `.env` file at the root of this folder if the backend runs elsewhere:

```
VITE_API_BASE_URL=http://localhost:8080
```

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

```bash
docker compose -f build/docker/docker-compose.yml up -d --build
```

Serves the production build via nginx at `http://localhost:5173`. See the [Dockerfile](build/docker/Dockerfile) and [docker-compose.yml](build/docker/docker-compose.yml) for details, or use the root-level `npm run docker:frontend:*` scripts documented in the [repo root README](../README.md).

## Testing

_To be documented once component tests are added._

## Pages

_To be documented once the login page and dashboard are implemented._
