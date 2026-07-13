# Backend

Go REST API scaffold demonstrating entity / repository / usecase / handler separation, with request/response types generated from an OpenAPI spec.

## Prerequisites

- Go 1.21+
- CGO enabled toolchain (required by the SQLite driver)
- `oapi-codegen` (installed automatically via `make tool-openapi`)

## Setup

```bash
cp env.sample .env
make tool-openapi
make openapi-gen
make dep
make gen-secret
```

This installs `oapi-codegen`, generates request/response types and the server interface from `../openapi.yaml`, installs Go dependencies, and generates a JWT secret.

## Running the server

```bash
make run
```

The server starts on the address configured in `.env` (default `:8080`).

## Build

```bash
make build
```

Produces a binary at `./bin/mygolangapp`.

## Hot reload (optional)

For local development with automatic reload on file changes, install [air](https://github.com/air-verse/air):

```bash
go install github.com/air-verse/air@latest
```

Make sure `$(go env GOPATH)/bin` is in your `$PATH`, then run:

```bash
air
```

This is optional; `make run` works without it.

## Seed data

On first run, the server creates its SQLite schema (if missing) and seeds it:

| Email | Password | Role |
|---|---|---|
| `cs@test.com` | `password` | `cs` |
| `operation@test.com` | `password` | `operation` |

A set of sample payments (varying `completed`/`processing`/`failed` statuses and merchants) is seeded as well. Seeding only runs when the respective table is empty, so it is safe to restart the server without duplicating data.

## Docker

The [Dockerfile](build/docker/Dockerfile) has two build targets:

- `dev` - runs `air` for hot-reload; source code is bind-mounted from the host.
- `production` - compiles a static binary and runs it directly, no source mount.

Dev (hot-reload):

```bash
docker compose -f build/docker/docker-compose.yml up -d --build
```

Production:

```bash
docker compose -f build/docker/docker-compose.production.yml up -d --build
```

Either way, the server is available at `http://localhost:8080`. The SQLite database is persisted in a named volume so data survives container restarts. See [docker-compose.yml](build/docker/docker-compose.yml) / [docker-compose.production.yml](build/docker/docker-compose.production.yml) for details, or use the root-level `npm run docker:backend:*` / `npm run docker:production:backend:*` scripts documented in the [repo root README](../README.md).

## Testing

```bash
go test ./...
go test ./... -cover
```

**Strategy:** unit tests focus on the usecase layer, since that is where the critical business logic lives (JWT issuance/verification, credential checks, pagination normalization, filter pass-through, date-range/timezone handling). Usecases depend on their repositories through interfaces (`UserRepository`, `PaymentRepository`), so tests use small hand-written fakes instead of a real database or a mocking library - no test doubles beyond a plain struct implementing the interface are needed.

`payment/repository` is the one repository with a unit test, covering the SQL query-building logic for filters (status, search, date range) against an in-memory SQLite instance, since a subtle mistake there (e.g. an off-by-one in a date boundary) would silently return wrong data rather than error.

Handlers are not unit-tested here: they are thin adapters with little logic of their own beyond binding requests and calling the usecase.

Current coverage: `auth/usecase` ~87.5%, `payment/usecase` ~84.6%, `payment/repository` ~61.1%, `pkg/pagination` 100%.

## API documentation

Once the server is running, the API docs are available at:

- Swagger UI: `http://localhost:8080/swagger`
- Raw OpenAPI spec: `http://localhost:8080/openapi.yaml`

## API endpoints

- `POST /dashboard/v1/auth/login` - authenticate with `{email, password}`, returns a JWT and user role
- `GET /dashboard/v1/payments` - list payments (requires `Authorization: Bearer <token>`), supports:
  - `status=<completed|processing|failed>` - filter by status
  - `search=<text>` - filter by merchant name or payment ID (substring match on either)
  - `date_from=<YYYY-MM-DD>` / `date_to=<YYYY-MM-DD>` - filter by creation date, inclusive on both ends. Dates are interpreted in the `Asia/Jakarta` (WIB) business timezone before being compared against `created_at` (stored in UTC) - see `businessTimezone` in `internal/module/payment/repository/payment.go`.
  - `sort=<field>` - comma-separated sort fields, prefix `-` for descending (e.g. `-created_at`, `amount`). Valid fields: `created_at`, `amount`, `merchant`, `status`. Defaults to `-created_at`.
  - `page=<n>` - page number, 1-indexed (default `1`)
  - `limit=<n>` - items per page, max `100` (default `10`)
- `GET /dashboard/v1/payments/summary` - aggregate counts (requires `Authorization: Bearer <token>`), returns `{total, success, failed, processing}` across all payments (not affected by the filters above)

## Makefile targets

- `make dep` - install Go dependencies
- `make tool-openapi` - install the `oapi-codegen` CLI
- `make openapi-gen` - regenerate types/server code from `openapi.yaml`
- `make gen-secret` - generate a JWT secret
- `make run` - run the server locally (reads `.env`)
- `make build` - build a production binary into `./bin/mygolangapp`
