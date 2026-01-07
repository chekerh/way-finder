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
    libpng-dev

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm install --silent --legacy-peer-deps --no-fund --no-audit

# Copy all application files (including Python scripts)
COPY . .

# Install Python dependencies for video generation
# NOTE: Build will continue even if Python deps fail - errors will be caught at runtime
RUN set +e || true; \
    echo "=== Installing Python dependencies ==="; \
    python3 -c "from PIL import Image" 2>/dev/null && echo "✓ Pillow OK" || (echo "Installing Pillow..." && python3 -m pip install --break-system-packages --no-cache-dir Pillow>=10.0.0 2>&1 | tail -3 || echo "Pillow install failed"); \
    python3 -m pip install --break-system-packages --no-cache-dir numpy>=1.24.0 2>&1 | tail -2 || echo "numpy install failed"; \
    python3 -m pip install --break-system-packages --no-cache-dir requests>=2.31.0 2>&1 | tail -2 || echo "requests install failed"; \
    python3 -m pip install --break-system-packages --no-cache-dir moviepy>=1.0.3 2>&1 | tail -3 || echo "moviepy install failed"; \
    echo "Python deps installation step completed"; \
    exit 0

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

