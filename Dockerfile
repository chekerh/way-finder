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
    && pip3 install --upgrade pip setuptools wheel

# Copy package files first (for better caching)
COPY package*.json ./
RUN npm ci --silent

# Copy Python requirements and install dependencies
COPY video_generation/ ./video_generation/
RUN pip3 install --no-cache-dir -r video_generation/requirements.txt || \
    (echo "Warning: Python dependencies installation had issues, but continuing..." && true)

# Copy all application files
COPY . .

# Build the NestJS application
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

