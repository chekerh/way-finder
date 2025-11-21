# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install Python and system dependencies for video generation
# ImageMagick and FFmpeg require additional packages on Alpine
# Pillow requires additional image libraries
RUN apk add --no-cache \
    python3 \
    py3-pip \
    imagemagick \
    imagemagick-dev \
    ffmpeg \
    ffmpeg-dev \
    g++ \
    gcc \
    make \
    musl-dev \
    python3-dev \
    libffi-dev \
    openblas-dev \
    libjpeg-turbo-dev \
    zlib-dev \
    jpeg-dev \
    freetype-dev \
    lcms2-dev \
    openjpeg-dev \
    tiff-dev \
    tk-dev \
    tcl-dev \
    harfbuzz-dev \
    fribidi-dev \
    libimagequant-dev \
    libxcb-dev \
    libpng-dev \
    && python3 -m pip install --upgrade --no-cache-dir pip setuptools wheel

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm ci --silent

# Copy all application files (including Python scripts)
COPY . .

# Install Python dependencies for video generation
# Try to install but don't fail the build - video generation will show errors at runtime if deps are missing
RUN set -e; \
    if command -v python3 > /dev/null 2>&1 && [ -f video_generation/requirements.txt ]; then \
      echo "=== Installing Python dependencies for video generation ==="; \
      python3 --version || true; \
      python3 -m pip --version || true; \
      \
      echo "Installing numpy..."; \
      python3 -m pip install --no-cache-dir numpy>=1.24.0 || echo "numpy install failed"; \
      python3 -c "import numpy; print('numpy OK')" 2>/dev/null || echo "numpy import failed"; \
      \
      echo "Installing Pillow..."; \
      python3 -m pip install --no-cache-dir Pillow>=10.0.0 || echo "Pillow install failed"; \
      python3 -c "from PIL import Image; print('Pillow OK')" 2>/dev/null || echo "Pillow import failed"; \
      \
      echo "Installing requests..."; \
      python3 -m pip install --no-cache-dir requests>=2.31.0 || echo "requests install failed"; \
      python3 -c "import requests; print('requests OK')" 2>/dev/null || echo "requests import failed"; \
      \
      echo "Installing moviepy (may take 5-10 minutes)..."; \
      python3 -m pip install --no-cache-dir moviepy>=1.0.3 || echo "moviepy install failed"; \
      python3 -c "import moviepy; print('moviepy OK')" 2>/dev/null || echo "moviepy import failed"; \
      \
      echo "=== Python dependencies summary ==="; \
      python3 -m pip list 2>/dev/null | grep -E "(numpy|Pillow|requests|moviepy)" || echo "Some deps may not be installed"; \
      echo "Build continuing..."; \
    else \
      echo "Python3 or requirements.txt not found - video generation disabled"; \
    fi || true

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

