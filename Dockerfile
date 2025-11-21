# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install Python and system dependencies for video generation
# ImageMagick and FFmpeg require additional packages on Alpine
# Pillow requires additional image libraries
RUN apk add --no-cache \
    python3 \
    py3-pip \
    py3-pillow \
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
# NOTE: Build will continue even if Python deps fail - errors will be caught at runtime
RUN set +e && \
    if [ -f video_generation/requirements.txt ]; then \
      echo "=== Installing Python dependencies ===" && \
      echo "Checking Pillow (py3-pillow)..." && \
      python3 -c "from PIL import Image" 2>/dev/null && echo "✓ Pillow OK" || \
        (echo "Installing Pillow via pip..." && python3 -m pip install --no-cache-dir Pillow>=10.0.0 2>&1 | tail -5 || true) && \
      echo "Installing numpy..." && python3 -m pip install --no-cache-dir numpy>=1.24.0 2>&1 | tail -3 || true && \
      echo "Installing requests..." && python3 -m pip install --no-cache-dir requests>=2.31.0 2>&1 | tail -3 || true && \
      echo "Installing moviepy (this may take several minutes)..." && python3 -m pip install --no-cache-dir moviepy>=1.0.3 2>&1 | tail -5 || true && \
      echo "=== Verification ===" && \
      python3 -c "from PIL import Image; print('✓ Pillow')" 2>/dev/null || echo "✗ Pillow" && \
      python3 -c "import numpy; print('✓ numpy')" 2>/dev/null || echo "✗ numpy" && \
      python3 -c "import requests; print('✓ requests')" 2>/dev/null || echo "✗ requests" && \
      python3 -c "import moviepy; print('✓ moviepy')" 2>/dev/null || echo "✗ moviepy" && \
      echo "Python deps installation completed"; \
    else \
      echo "Skipping Python deps (requirements.txt not found)"; \
    fi && \
    true

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

