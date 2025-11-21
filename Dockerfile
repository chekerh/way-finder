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
RUN if command -v python3 > /dev/null 2>&1 && [ -f video_generation/requirements.txt ]; then \
      echo "=== Installing Python dependencies for video generation ==="; \
      echo "Python: $(python3 --version)"; \
      echo "Pip: $(python3 -m pip --version)"; \
      \
      echo "Installing numpy..."; \
      python3 -m pip install --no-cache-dir numpy>=1.24.0 2>&1 | tail -5 || echo "numpy install had issues"; \
      python3 -c "import numpy" 2>/dev/null && echo "✓ numpy OK" || echo "✗ numpy failed"; \
      \
      echo "Installing Pillow..."; \
      python3 -m pip install --no-cache-dir Pillow>=10.0.0 2>&1 | tail -5 || echo "Pillow install had issues"; \
      python3 -c "from PIL import Image" 2>/dev/null && echo "✓ Pillow OK" || echo "✗ Pillow failed"; \
      \
      echo "Installing requests..."; \
      python3 -m pip install --no-cache-dir requests>=2.31.0 2>&1 | tail -5 || echo "requests install had issues"; \
      python3 -c "import requests" 2>/dev/null && echo "✓ requests OK" || echo "✗ requests failed"; \
      \
      echo "Installing moviepy (may take 5-10 minutes)..."; \
      python3 -m pip install --no-cache-dir moviepy>=1.0.3 2>&1 | tail -10 || echo "moviepy install had issues"; \
      python3 -c "import moviepy" 2>/dev/null && echo "✓ moviepy OK" || echo "✗ moviepy failed"; \
      \
      echo "=== Python dependencies summary ==="; \
      python3 -m pip list 2>/dev/null | grep -E "(numpy|Pillow|requests|moviepy)" || echo "Check logs above for installation status"; \
      echo "Build continuing regardless of Python deps status..."; \
    else \
      echo "Python3 or requirements.txt not found - video generation disabled"; \
    fi || echo "Python dependencies installation encountered errors but build continues"

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

