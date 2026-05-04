# Build Vue SPA (Vite)
FROM node:22-alpine AS vue_build
WORKDIR /frontend-vue

COPY frontend-vue/package.json frontend-vue/package-lock.json ./
RUN npm install --no-audit --fund=false

COPY frontend-vue/ ./
ENV NODE_OPTIONS=--max-old-space-size=2048
ENV GENERATE_SOURCEMAP=false
ENV CI=false
RUN npm run build

# Python Backend
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies (including libraries for PDF/Logo generation)
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

# Copy project files
COPY . .

# Ensure static dir exists
RUN mkdir -p /app/static

# Copy built assets from the frontend stage
COPY --from=vue_build /frontend-vue/dist ./frontend-vue/dist

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
