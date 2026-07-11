# syntax=docker/dockerfile:1

FROM node:20-bookworm AS base

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# ---------- dev target: Vite dev server with hot-reload ----------
FROM base AS dev

COPY frontend .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---------- builder target: production static bundle ----------
FROM base AS builder

COPY frontend .
RUN npm run build

# ---------- production target: nginx serving the static bundle ----------
FROM nginx:1.27-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/build/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY frontend/build/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
