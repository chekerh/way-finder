# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install Python and system dependencies for video generation
# ImageMagick and FFmpeg require additional packages on Alpine
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
    && python3 -m pip install --upgrade --no-cache-dir pip setuptools wheel

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm ci --silent

# Copy all application files (including Python scripts)
COPY . .

# Install Python dependencies for video generation (optional - won't fail build if it fails)
# Note: Video generation feature may not work if Python dependencies fail to install
RUN if [ -f video_generation/requirements.txt ]; then \
      echo "Installing Python dependencies..."; \
      python3 -m pip install --no-cache-dir -r video_generation/requirements.txt || \
      (echo "WARNING: Python dependencies installation failed. Video generation may not work." && exit 0); \
    else \
      echo "WARNING: video_generation/requirements.txt not found. Skipping Python dependencies."; \
    fi

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

