# syntax=docker/dockerfile:1

FROM golang:1.25-bookworm AS base

WORKDIR /src/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download

WORKDIR /src
COPY backend ./backend
COPY openapi.yaml ./openapi.yaml

WORKDIR /src/backend

# ---------- dev target: hot-reload via air ----------
FROM base AS dev

RUN go install github.com/air-verse/air@latest

ENV HTTP_ADDR=:8080
ENV OPENAPIYAML_LOCATION=../openapi.yaml
ENV JWT_EXPIRED=24h
ENV SQLITE_DB_PATH=/data/dashboard.db

EXPOSE 8080
VOLUME ["/data"]

CMD ["air", "-c", "build/docker/.air.toml"]

# ---------- builder target: compiled binary ----------
FROM base AS builder

RUN CGO_ENABLED=1 go build -o /out/mygolangapp main.go

# ---------- production target: minimal runtime ----------
FROM debian:bookworm-slim AS production

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY --from=builder /out/mygolangapp ./mygolangapp
COPY --from=builder /src/openapi.yaml /app/openapi.yaml

ENV HTTP_ADDR=:8080
ENV OPENAPIYAML_LOCATION=../openapi.yaml
ENV JWT_EXPIRED=24h
ENV SQLITE_DB_PATH=/data/dashboard.db

EXPOSE 8080
VOLUME ["/data"]

CMD ["./mygolangapp"]
