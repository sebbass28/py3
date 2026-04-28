# Build frontend inside Docker (no artifacts in git)
FROM node:22-alpine AS frontend_build
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --no-audit --fund=false

COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    libpq-dev \
    libcairo2-dev \
    pkg-config \
    python3-dev \
    libpango1.0-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files (backend)
COPY . .

# Ensure optional static dir exists (avoids warnings)
RUN mkdir -p /app/static

# Copy built frontend into expected path
COPY --from=frontend_build /frontend/build ./frontend/build

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Start command with migrations
CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
