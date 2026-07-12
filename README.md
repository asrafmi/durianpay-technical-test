# DurianPay Payment Dashboard

A fullstack payment monitoring dashboard: Go REST API backend, Vue 3 + TypeScript frontend.

- `backend/` - Go REST API (chi router, SQLite, JWT auth, OpenAPI-generated types)
- `frontend/` - Vue 3 + TypeScript dashboard

The API contract is defined in [`openapi.yaml`](openapi.yaml) at the repo root and is the source of truth for both the generated Go server types and the frontend API client.

## Prerequisites

- Go 1.21+ (developed against 1.25)
- Node 20+
- CGO-enabled C toolchain (required by the SQLite driver on the backend)
- Docker & Docker Compose (optional, for containerized setup)

## Quick start (local, no Docker)

From the repo root:

```bash
npm i
```
This install root dependencies like concurrently for running both backend and frontend in parallel.

Then run:
```
npm run install:dependencies
```

This installs backend dependencies (`oapi-codegen`, Go modules, generates OpenAPI types, generates a JWT secret) and frontend dependencies (`npm install`).

> **Note:** `oapi-codegen` is installed via `go install`, which places the binary in `$(go env GOPATH)/bin` (usually `~/go/bin`). If you get `oapi-codegen: command not found`, add that directory to your `PATH` (e.g. in `~/.zshrc` or `~/.bashrc`): `export PATH=$PATH:$(go env GOPATH)/bin`, then open a new terminal and re-run the command.

Run both backend and frontend in development mode:

```bash
npm run start:all:dev
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

Or run them individually:

```bash
npm run start:backend:dev
npm run start:frontend:dev
```

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for details on each service, including the full list of `make` targets and environment variables.

## Quick start (Docker)

Each service has one Dockerfile with two build targets - `dev` and `production` - selected via `target:` in the respective Compose file. Compose files live under `<service>/build/docker/`:

- `docker-compose.yml` - **dev**: hot-reload (`air` for the backend, Vite dev server for the frontend), source code bind-mounted from the host.
- `docker-compose.production.yml` - **production**: compiled binary / static bundle served by nginx, no source mount.

### Dev containers (hot-reload)

```bash
npm run docker:up
```

- Backend: `http://localhost:8080` (rebuilds automatically on `.go` file changes)
- Frontend: `http://localhost:5173` (Vite HMR on file changes)

```bash
npm run docker:build   # build both dev images without starting
npm run docker:down    # stop and remove both dev containers
npm run docker:logs    # tail logs from both dev containers
```

### Production containers

```bash
npm run docker:production:up
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

```bash
npm run docker:production:build
npm run docker:production:down
npm run docker:production:logs
```

Backend and frontend can also be run independently in either mode, e.g. `npm run docker:backend:up` (dev) or `npm run docker:production:backend:up` (production).

The backend container persists its SQLite database in a named Docker volume, so data survives container restarts. Delete the volume (`docker volume ls` to find the name, then `docker volume rm <name>`) to reset to a clean seeded state.

## Seed data

On first run (local or Docker), the backend automatically creates its SQLite schema and seeds:

- Two users (see [backend/README.md](backend/README.md) for credentials) with roles `cs` and `operation`
- A set of sample payments across `completed`, `processing`, and `failed` statuses

Seeding is idempotent - it only runs if the respective table is empty, so restarting the server does not duplicate data.

## Build for production

```bash
npm run build:all
```

Builds the backend binary (`backend/bin/mygolangapp`) and the frontend static bundle (`frontend/dist`).

## Testing

```bash
npm run test:backend
npm run test:frontend
```

Testing strategy is documented in [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).

## API documentation

Once the backend is running, interactive API docs are available at:

- Swagger UI: `http://localhost:8080/swagger`
- Raw OpenAPI spec: `http://localhost:8080/openapi.yaml`

## Login

Use one of the seeded accounts (see [backend/README.md](backend/README.md)) on the frontend login page at `http://localhost:5173`, or authenticate directly via `POST /dashboard/v1/auth/login`.
