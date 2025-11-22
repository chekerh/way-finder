# AI-Powered Destination Video Generation

This module generates cinematic videos by aggregating all images from a user's posts for a specific destination.

## Features

- **One video per destination**: Groups all photos from all posts for a user+destination pair
- **Ken Burns effect**: Smooth zoom and pan animations
- **Crossfade transitions**: 0.5-1s smooth transitions between images
- **AI-selected music**: Dynamically fetches royalty-free music from Pixabay based on destination
- **Text overlays**: Intro title and subtitle
- **Vertical format**: 1080x1920 MP4 output optimized for mobile

## Installation

### Python Dependencies

```bash
cd backend/video_generation
pip install -r requirements.txt
```

**Required packages:**
- `moviepy>=1.0.3` - Video editing
- `Pillow>=10.0.0` - Image processing
- `requests>=2.31.0` - HTTP requests
- `numpy>=1.24.0` - Numerical operations

**Note:** MoviePy requires ImageMagick for text rendering. Install it:

- **macOS**: `brew install imagemagick`
- **Linux**: `sudo apt-get install imagemagick`
- **Windows**: Download from [ImageMagick website](https://imagemagick.org/script/download.php)

### Environment Variables

Add to your `.env` file:

```bash
# Optional: Pixabay API key for music selection
# Get free key from: https://pixabay.com/api/docs/
PIXABAY_API_KEY=your_pixabay_api_key_here
```

If `PIXABAY_API_KEY` is not set, the system will use fallback music.

## Usage

### Backend API

#### Generate Video
```http
POST /api/users/{userId}/destinations/{destination}/generate-video
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "processing",
  "userId": "...",
  "destination": "Paris",
  "imageCount": 15,
  "message": "Video generation started"
}
```

#### Check Video Status
```http
GET /api/users/{userId}/destinations/{destination}/video-status
Authorization: Bearer {token}
```

**Response:**
```json
{
  "status": "ready",
  "videoUrl": "https://...",
  "imageCount": 15,
  "generatedAt": "2025-11-21T...",
  "errorMessage": null
}
```

#### Get All User Destinations
```http
GET /api/users/{userId}/destinations
Authorization: Bearer {token}
```

**Response:**
```json
{
  "destinations": [
    {
      "destination": "Paris",
      "videoStatus": "ready",
      "videoUrl": "https://...",
      "imageCount": 15
    },
    {
      "destination": "Berlin",
      "videoStatus": "not_started",
      "videoUrl": null,
      "imageCount": 8
    }
  ]
}
```

## How It Works

1. **Image Aggregation**: Collects all images from all posts where `user_id = X` and `destination = Y`
2. **Music Selection**: Fetches royalty-free music from Pixabay based on destination mood
3. **Video Generation**: Python script creates video with:
   - Intro title: "Trip to {Destination}"
   - Subtitle: "Shared by @username"
   - Ken Burns effect on images
   - Crossfade transitions
   - Background music
4. **Storage**: Video saved to `uploads/destination-videos/` and URL stored in database

## File Structure

```
backend/
├── src/
│   └── video-generation/
│       ├── destination-video.schema.ts      # MongoDB schema
│       ├── destination-video.service.ts     # Main service
│       ├── destination-video.controller.ts  # API endpoints
│       ├── destination-video.module.ts      # NestJS module
│       ├── image-aggregator.service.ts      # Image collection
│       └── music-selector.service.ts        # Music fetching
└── video_generation/
    ├── video_generator.py                   # Python video generator
    └── requirements.txt                     # Python dependencies
```

## Notes

- Videos are generated asynchronously (non-blocking)
- Processing status is polled every 5 seconds in Android app
- Music files are cleaned up after video generation
- Videos are served statically from `/uploads/destination-videos/`

