# ── Builder stage ─────────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# System deps for psycopg2 / bcrypt compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Runtime system dep (libpq client)
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy source
COPY . .

# Non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Development default — docker-compose.yml overrides CMD for migrations + seed
CMD ["gunicorn", "app.main:app", "-c", "gunicorn.conf.py"]
