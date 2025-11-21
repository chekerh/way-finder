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
    libpng-dev; \
    python3 -m pip install --upgrade --no-cache-dir pip setuptools wheel || true

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm ci --silent

# Copy all application files (including Python scripts)
COPY . .

# Install Python dependencies for video generation
# Verify Pillow is installed (via py3-pillow), then install other dependencies
RUN echo "=== Installing Python dependencies ===" && \
    python3 -c "from PIL import Image; print('✓ Pillow OK')" 2>&1 || (echo "Installing Pillow..." && python3 -m pip install --no-cache-dir Pillow>=10.0.0) && \
    echo "Installing numpy..." && \
    python3 -m pip install --no-cache-dir numpy>=1.24.0 && \
    echo "Installing requests..." && \
    python3 -m pip install --no-cache-dir requests>=2.31.0 && \
    echo "Installing moviepy (this may take several minutes)..." && \
    python3 -m pip install --no-cache-dir moviepy>=1.0.3 && \
    echo "=== Verifying installations ===" && \
    python3 -c "from PIL import Image; print('✓ Pillow')" && \
    python3 -c "import numpy; print('✓ numpy')" && \
    python3 -c "import requests; print('✓ requests')" && \
    python3 -c "import moviepy; print('✓ moviepy')" && \
    echo "All Python dependencies installed successfully"

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

