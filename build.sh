#!/bin/bash

# Exit on any error
set -e

# Build the React frontend
echo "Building frontend..."
npm install --prefix frontend
npm run build --prefix frontend

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate
