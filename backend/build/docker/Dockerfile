# syntax=docker/dockerfile:1

FROM golang:1.25-bookworm AS builder

WORKDIR /src/backend
COPY backend/go.mod backend/go.sum ./
RUN go mod download

WORKDIR /src
COPY backend ./backend
COPY openapi.yaml ./openapi.yaml

WORKDIR /src/backend
RUN CGO_ENABLED=1 go build -o /out/mygolangapp main.go

FROM debian:bookworm-slim

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
