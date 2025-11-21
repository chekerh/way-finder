# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install Python and system dependencies for video generation (optional)
# ImageMagick and FFmpeg require additional packages on Alpine
# If Python installation fails, continue anyway (video generation will be disabled)
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
    && python3 -m pip install --upgrade --no-cache-dir pip setuptools wheel || \
    (echo "WARNING: Python/pip setup failed, video generation will be disabled" && true)

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm ci --silent

# Copy all application files (including Python scripts)
COPY . .

# Install Python dependencies for video generation (completely optional)
# If any step fails, continue with build (video generation will return errors at runtime)
RUN if command -v python3 > /dev/null 2>&1 && [ -f video_generation/requirements.txt ]; then \
      echo "Installing Python dependencies for video generation..."; \
      python3 -m pip install --no-cache-dir numpy>=1.24.0 2>&1 | head -20 || echo "WARNING: numpy failed"; \
      python3 -m pip install --no-cache-dir Pillow>=10.0.0 2>&1 | head -20 || echo "WARNING: Pillow failed"; \
      python3 -m pip install --no-cache-dir requests>=2.31.0 2>&1 | head -20 || echo "WARNING: requests failed"; \
      python3 -m pip install --no-cache-dir moviepy>=1.0.3 2>&1 | head -20 || echo "WARNING: moviepy failed - video generation disabled"; \
      echo "Python dependencies installation attempt completed."; \
    else \
      echo "INFO: Python3 not available or requirements.txt missing. Video generation will be disabled."; \
    fi || (echo "INFO: Python dependencies installation failed, continuing build..." && true)

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

