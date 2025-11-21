# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

# Install Python and dependencies for video generation
RUN apk add --no-cache \
    python3 \
    py3-pip \
    imagemagick \
    ffmpeg \
    g++ \
    make \
    python3-dev \
    && pip3 install --upgrade pip

COPY package*.json ./
RUN npm ci --silent

# Install Python dependencies for video generation
COPY video_generation/requirements.txt ./video_generation/requirements.txt
RUN pip3 install --no-cache-dir -r video_generation/requirements.txt

COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

