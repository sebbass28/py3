# Build Vue SPA (Vite) and serve it through the existing Django SPA shell (frontend/build + index.html catch-all).
FROM node:22-alpine AS vue_build
WORKDIR /frontend-vue

COPY frontend-vue/package.json frontend-vue/package-lock.json ./
RUN npm install --no-audit --fund=false

COPY frontend-vue/ ./
ENV NODE_OPTIONS=--max-old-space-size=2048
ENV GENERATE_SOURCEMAP=false
ENV CI=false
RUN npm run build

FROM python:3.12-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    libpq-dev \
    libcairo2-dev \
    pkg-config \
    python3-dev \
    libpango1.0-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/static

COPY --from=vue_build /frontend-vue/dist ./frontend/build

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
