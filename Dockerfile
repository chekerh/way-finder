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

# Install Python dependencies for video generation (optional - won't fail build)
# Video generation will show clear errors at runtime if dependencies are missing
RUN set +e; \
    if command -v python3 > /dev/null 2>&1 && [ -f video_generation/requirements.txt ]; then \
      echo "=== Attempting to install Python dependencies ==="; \
      python3 -m pip install --no-cache-dir numpy>=1.24.0 || true; \
      python3 -m pip install --no-cache-dir Pillow>=10.0.0 || true; \
      python3 -m pip install --no-cache-dir requests>=2.31.0 || true; \
      python3 -m pip install --no-cache-dir moviepy>=1.0.3 || true; \
      echo "Python dependencies installation attempt completed (check logs above for status)"; \
    else \
      echo "Skipping Python dependencies (python3 or requirements.txt not found)"; \
    fi; \
    set -e

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

