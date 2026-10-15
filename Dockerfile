# ==============================================================================
# Stage 1: Build the React + TypeScript frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /build/frontend

# Install dependencies first for optimal Docker layer caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy frontend source files and compile production bundle
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Python runtime with FastAPI and Scikit-Learn
# ==============================================================================
FROM python:3.12-slim AS runner

# Prevent Python from writing .pyc files and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8080

WORKDIR /app

# Install Python backend dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend source code
COPY backend/ /app/backend/

# Copy compiled frontend distribution from builder stage
COPY --from=frontend-builder /build/frontend/dist /app/frontend/dist

# Create and switch to non-root user for container security
RUN useradd -m -u 10001 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose default Cloud Run port
EXPOSE 8080

# Bind to 0.0.0.0 and listen on the port provided by Cloud Run's PORT env var
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
