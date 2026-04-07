# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline
COPY . .
RUN npm run build            # outputs to /app/dist


# ── Runtime stage (Nginx) ────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Replace default config with our SPA-friendly config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run injects PORT — Nginx listens on it
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "sed -i 's/__PORT__/$PORT/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
