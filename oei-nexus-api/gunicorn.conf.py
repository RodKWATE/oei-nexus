"""
Gunicorn configuration for production deployment.

Usage:
  gunicorn app.main:app -c gunicorn.conf.py
"""
import multiprocessing
import os

# ── Binding ───────────────────────────────────────────────────────────────────
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# ── Workers ───────────────────────────────────────────────────────────────────
# Uvicorn worker class for ASGI
worker_class = "uvicorn.workers.UvicornWorker"

# (2 * CPU) + 1 is the recommended starting point
workers = int(os.getenv("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))

# ── Timeouts ──────────────────────────────────────────────────────────────────
timeout = 120
keepalive = 5
graceful_timeout = 30

# ── Logging ───────────────────────────────────────────────────────────────────
accesslog = "-"     # stdout
errorlog = "-"      # stderr
loglevel = os.getenv("LOG_LEVEL", "info").lower()
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)sµs'

# ── Process management ────────────────────────────────────────────────────────
preload_app = True   # Load app before forking — saves memory via copy-on-write
max_requests = 1000
max_requests_jitter = 50
