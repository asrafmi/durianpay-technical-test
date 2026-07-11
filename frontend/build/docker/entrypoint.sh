#!/bin/sh
set -e

CONFIG_PATH="/usr/share/nginx/html/config.js"

cat > "$CONFIG_PATH" <<EOF
window.__API_BASE_URL__ = "${API_BASE_URL:-http://localhost:8080}";
EOF

exec "$@"
