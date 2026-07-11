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

```bash
docker compose -f build/docker/docker-compose.yml up -d --build
```

The server is available at `http://localhost:8080`. The SQLite database is persisted in a named volume (`backend-data`) so data survives container restarts. See the [Dockerfile](build/docker/Dockerfile) and [docker-compose.yml](build/docker/docker-compose.yml) for details, or use the root-level `npm run docker:backend:*` scripts documented in the [repo root README](../README.md).

## API documentation

Once the server is running, the API docs are available at:

- Swagger UI: `http://localhost:8080/swagger`
- Raw OpenAPI spec: `http://localhost:8080/openapi.yaml`

## API endpoints

- `POST /dashboard/v1/auth/login` - authenticate with `{email, password}`, returns a JWT and user role
- `GET /dashboard/v1/payments` - list payments (requires `Authorization: Bearer <token>`), supports:
  - `status=<completed|processing|failed>` - filter by status
  - `search=<text>` - filter by merchant name (substring match)
  - `page=<n>` - page number, 1-indexed (default `1`)
  - `limit=<n>` - items per page, max `100` (default `10`)

## Makefile targets

- `make dep` - install Go dependencies
- `make tool-openapi` - install the `oapi-codegen` CLI
- `make openapi-gen` - regenerate types/server code from `openapi.yaml`
- `make gen-secret` - generate a JWT secret
- `make run` - run the server locally (reads `.env`)
- `make build` - build a production binary into `./bin/mygolangapp`
