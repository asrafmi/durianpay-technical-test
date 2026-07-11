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

## API documentation

Once the server is running, the API docs are available at:

- Swagger UI: `http://localhost:8080/swagger`
- Raw OpenAPI spec: `http://localhost:8080/openapi.yaml`

## API endpoints

- `POST /dashboard/v1/auth/login` - authenticate with `{email, password}`, returns a JWT and user role
- `GET /dashboard/v1/payments` - list payments, optionally filtered with `?status=<completed|processing|failed>` (requires `Authorization: Bearer <token>`)

## Makefile targets

- `make dep` - install Go dependencies
- `make tool-openapi` - install the `oapi-codegen` CLI
- `make openapi-gen` - regenerate types/server code from `openapi.yaml`
- `make gen-secret` - generate a JWT secret
- `make run` - run the server locally (reads `.env`)
- `make build` - build a production binary into `./bin/mygolangapp`
