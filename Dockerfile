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

# Install Python dependencies for video generation (optional - won't fail build)
# Video generation will show clear errors at runtime if dependencies are missing
RUN set +e; \
    if command -v python3 > /dev/null 2>&1 && [ -f video_generation/requirements.txt ]; then \
      echo "=== Installing Python dependencies for video generation ==="; \
      echo "Python version: $(python3 --version 2>&1 || echo 'unknown')"; \
      echo "Pip version: $(python3 -m pip --version 2>&1 || echo 'unknown')"; \
      \
      echo "[1/4] Verifying Pillow (should be installed via apk)..."; \
      if python3 -c "from PIL import Image; print('Pillow OK')" 2>/dev/null; then \
        echo "Pillow: ✓ INSTALLED (via apk)"; \
      else \
        echo "Pillow: ✗ NOT FOUND - Installing via pip as fallback..."; \
        python3 -m pip install --no-cache-dir --verbose Pillow>=10.0.0 2>&1 | tail -20 || echo "Pillow pip install failed"; \
        python3 -c "from PIL import Image; print('Pillow OK after pip')" 2>/dev/null && echo "Pillow: ✓ INSTALLED (via pip)" || echo "Pillow: ✗ NOT INSTALLED - video generation will fail"; \
      fi; \
      \
      echo "[2/4] Installing numpy..."; \
      python3 -m pip install --no-cache-dir numpy>=1.24.0 2>&1 | tail -3 || echo "numpy: FAILED"; \
      python3 -c "import numpy" 2>/dev/null && echo "numpy: OK" || echo "numpy: NOT INSTALLED"; \
      \
      echo "[3/4] Installing requests..."; \
      python3 -m pip install --no-cache-dir requests>=2.31.0 2>&1 | tail -3 || echo "requests: FAILED"; \
      python3 -c "import requests" 2>/dev/null && echo "requests: OK" || echo "requests: NOT INSTALLED"; \
      \
      echo "[4/4] Installing moviepy (this may take 5-10 minutes)..."; \
      python3 -m pip install --no-cache-dir --verbose moviepy>=1.0.3 2>&1 | tail -10 || echo "moviepy install: FAILED"; \
      python3 -c "import moviepy" 2>/dev/null && echo "moviepy: OK" || echo "moviepy: NOT INSTALLED - video generation will fail"; \
      \
      echo "=== Final verification of all Python dependencies ==="; \
      python3 -c "from PIL import Image; print('✓ Pillow')" 2>/dev/null || echo "✗ Pillow MISSING"; \
      python3 -c "import numpy; print('✓ numpy')" 2>/dev/null || echo "✗ numpy MISSING"; \
      python3 -c "import requests; print('✓ requests')" 2>/dev/null || echo "✗ requests MISSING"; \
      python3 -c "import moviepy; print('✓ moviepy')" 2>/dev/null || echo "✗ moviepy MISSING" \
      \
      echo "=== Python dependencies status summary ==="; \
      python3 -m pip list 2>/dev/null | grep -E "(numpy|Pillow|requests|moviepy)" || echo "Warning: Some dependencies may not be installed. Check logs above."; \
      echo "Build continuing regardless of Python deps status..."; \
    else \
      echo "Skipping Python dependencies (python3 or requirements.txt not found)"; \
    fi; \
    echo "Python dependencies installation step completed"; \
    true

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

