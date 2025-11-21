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
# Install with verbose output and verify installation
RUN if command -v python3 > /dev/null 2>&1 && [ -f video_generation/requirements.txt ]; then \
      echo "Installing Python dependencies for video generation..."; \
      echo "Python version: $(python3 --version)"; \
      echo "Pip version: $(python3 -m pip --version)"; \
      \
      echo "Installing numpy..."; \
      python3 -m pip install --no-cache-dir --verbose numpy>=1.24.0 || (echo "ERROR: numpy installation failed" && exit 1); \
      python3 -c "import numpy; print(f'numpy {numpy.__version__} installed successfully')" || (echo "ERROR: numpy verification failed" && exit 1); \
      \
      echo "Installing Pillow..."; \
      python3 -m pip install --no-cache-dir --verbose Pillow>=10.0.0 || (echo "ERROR: Pillow installation failed" && exit 1); \
      python3 -c "from PIL import Image; print('Pillow installed successfully')" || (echo "ERROR: Pillow verification failed" && exit 1); \
      \
      echo "Installing requests..."; \
      python3 -m pip install --no-cache-dir --verbose requests>=2.31.0 || (echo "ERROR: requests installation failed" && exit 1); \
      python3 -c "import requests; print(f'requests {requests.__version__} installed successfully')" || (echo "ERROR: requests verification failed" && exit 1); \
      \
      echo "Installing moviepy (this may take a while)..."; \
      python3 -m pip install --no-cache-dir --verbose moviepy>=1.0.3 || (echo "ERROR: moviepy installation failed" && exit 1); \
      python3 -c "import moviepy; print('moviepy installed successfully')" || (echo "ERROR: moviepy verification failed" && exit 1); \
      \
      echo "All Python dependencies installed and verified successfully!"; \
      python3 -m pip list | grep -E "(numpy|Pillow|requests|moviepy)"; \
    else \
      echo "WARNING: Python3 not available or requirements.txt missing. Video generation will be disabled."; \
    fi

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

