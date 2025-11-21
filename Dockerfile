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
# Install with verification but don't fail the build if installation fails
# Video generation will fail gracefully at runtime with clear error messages
RUN if command -v python3 > /dev/null 2>&1 && [ -f video_generation/requirements.txt ]; then \
      echo "Installing Python dependencies for video generation..."; \
      echo "Python version: $(python3 --version)"; \
      echo "Pip version: $(python3 -m pip --version)"; \
      \
      echo "Installing numpy..."; \
      if python3 -m pip install --no-cache-dir numpy>=1.24.0 && python3 -c "import numpy; print(f'numpy {numpy.__version__} installed')"; then \
        echo "✓ numpy installed successfully"; \
      else \
        echo "✗ ERROR: numpy installation failed - video generation will not work"; \
      fi; \
      \
      echo "Installing Pillow..."; \
      if python3 -m pip install --no-cache-dir Pillow>=10.0.0 && python3 -c "from PIL import Image; print('Pillow installed')"; then \
        echo "✓ Pillow installed successfully"; \
      else \
        echo "✗ ERROR: Pillow installation failed - video generation will not work"; \
      fi; \
      \
      echo "Installing requests..."; \
      if python3 -m pip install --no-cache-dir requests>=2.31.0 && python3 -c "import requests; print(f'requests {requests.__version__} installed')"; then \
        echo "✓ requests installed successfully"; \
      else \
        echo "✗ ERROR: requests installation failed - video generation will not work"; \
      fi; \
      \
      echo "Installing moviepy (this may take several minutes)..."; \
      if timeout 600 python3 -m pip install --no-cache-dir moviepy>=1.0.3 2>&1 && python3 -c "import moviepy; print('moviepy installed')"; then \
        echo "✓ moviepy installed successfully"; \
      else \
        echo "✗ ERROR: moviepy installation failed or timed out - video generation will not work"; \
      fi; \
      \
      echo "Python dependencies installation completed. Summary:"; \
      python3 -m pip list 2>/dev/null | grep -E "(numpy|Pillow|requests|moviepy)" || echo "Some dependencies may not be installed"; \
    else \
      echo "WARNING: Python3 not available or requirements.txt missing. Video generation will be disabled."; \
    fi

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

