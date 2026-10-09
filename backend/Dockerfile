# ==============================================================================
# NAVIX Backend FastAPI Dockerfile
# Production-oriented, non-root, multi-stage Python container
# ==============================================================================

FROM python:3.10-slim AS builder

WORKDIR /app

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Final Runtime Stage
FROM python:3.10-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Install runtime dependencies (libpq for psycopg2) & curl for healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python dependencies from builder stage
COPY --from=builder /install /usr/local

# Create non-root system user for container security
RUN groupadd -g 10001 navix && \
    useradd -u 10001 -g navix -s /bin/bash -m navix

# Copy application source code
COPY app /app/app

# Change ownership to non-root user
RUN chown -R navix:navix /app

USER navix:navix

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
