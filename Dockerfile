# Stage 1: Build React Frontend
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./

# Limitamos la memoria de Node para no colapsar el micro-servidor de AWS
ENV NODE_OPTIONS="--max-old-space-size=768"

RUN npm install --legacy-peer-deps --no-audit --no-fund
COPY frontend/ ./
RUN GENERATE_SOURCEMAP=false npm run build

# Stage 2: Build Django Backend
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Copy frontend build from stage 1
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Start command with migrations
CMD ["sh", "-c", "python manage.py migrate && gunicorn talento360.wsgi:application --bind 0.0.0.0:8000"]
