# Video Generation Guide

## Overview

The video generation system supports multiple providers with automatic fallback. Choose the best option for your needs.

## Quick Setup (Recommended: Shotstack)

Shotstack is the **recommended** service for generating video montages from multiple images. It's specifically designed for this use case.

### Step 1: Get Shotstack API Key

1. Go to https://shotstack.io/
2. Sign up for a free account
3. Navigate to **Tools → API Keys**
4. Copy your **Sandbox Key** (for development/testing) or **Production Key** (for production)

**Sandbox Key:**
- Free, unlimited videos
- Watermarked output
- Perfect for development/testing
- Keys typically start with `zk` or similar

**Production Key:**
- Requires credits (pay-per-use)
- No watermarks
- For production use
- Keys typically start with `iw` or similar

### Step 2: Add to Environment Variables

Add to your `.env` file or Render environment variables:

```bash
# For development/testing (sandbox - free, watermarked)
SHOTSTACK_API_KEY=your_sandbox_key_here

# For production (requires credits, no watermark)
# SHOTSTACK_API_KEY=your_production_key_here
```

### Step 3: Optional - Add Background Music

```bash
SHOTSTACK_MUSIC_URL=https://your-music-file-url.mp3
```

You can use:
- Free music from Pixabay: https://pixabay.com/music/
- Your own hosted music file
- Any publicly accessible MP3/audio file URL

## Alternative Video Generation Services

### 1. Cloudinary (For Image-to-Video Montages)

**Best for:** Creating video montages from travel photos with transitions and effects

**Setup:**
1. Sign up at https://cloudinary.com (free tier available)
2. Get your credentials from https://cloudinary.com/console
3. Add to Render environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

**Features:**
- ✅ Reliable video montage generation
- ✅ Automatic transitions between images
- ✅ Support for effects and music
- ✅ CDN delivery (fast loading)
- ✅ Free tier: 25GB storage, 25GB bandwidth/month

**Note:** Free tier doesn't support multi-image montages. Requires paid plan for video montages.

### 2. Replicate API (For AI Video Generation)

**Best for:** AI-powered video generation from text/prompts or advanced image-to-video

**Setup:**
1. Sign up at https://replicate.com
2. Get API token from https://replicate.com/account/api-tokens
3. Add to Render:
   ```
   REPLICATE_API_TOKEN=your_token_here
   REPLICATE_VIDEO_MODEL=anotherjesse/zeroscope-v2-xl
   ```

**Features:**
- ✅ Advanced AI video generation
- ✅ Multiple model options
- ✅ High-quality output
- ⚠️ Can be slower (1-5 minutes)
- ⚠️ Pay-per-use pricing

### 3. Custom AI Service

**Best for:** Your own video generation service or third-party API

**Setup:**
```
AI_VIDEO_SERVICE_URL=https://your-service.com/generate
```

The service should accept POST requests with:
```json
{
  "journeyId": "string",
  "destination": "string",
  "slides": [
    {
      "imageUrl": "string",
      "caption": "string"
    }
  ],
  "musicTheme": "string",
  "captionText": "string"
}
```

And return:
```json
{
  "videoUrl": "https://..."
}
```

## How It Works

1. **Image Upload**: User uploads images via Android/iOS app
2. **Image Storage**: Images are uploaded to ImgBB and URLs are stored
3. **Video Generation**: Backend receives all image URLs
4. **Image Validation**: System validates all image URLs are accessible
5. **Video Creation**: Selected service creates a video montage with:
   - All provided images (3 seconds each)
   - Fade transitions between images
   - Zoom effects
   - Optional background music
6. **Video Storage**: Generated video URL is stored in database
7. **Display**: Video appears in journey feed

## Current Implementation Status

✅ **Image URL Validation**: All images are validated before video generation  
✅ **Multi-Image Support**: All provided images are used in video  
✅ **Shotstack Integration**: Fully implemented and tested  
✅ **Multiple Provider Support**: Cloudinary, Replicate, Custom Service, Hugging Face  
✅ **Error Handling**: Comprehensive error handling and logging  
✅ **Fallback Support**: Multiple service fallbacks if primary fails  

## Troubleshooting

### Video shows "processing" forever
- Check backend logs for errors
- Verify API key is set correctly (`SHOTSTACK_API_KEY` or `REPLICATE_API_TOKEN`)
- Check image URLs are accessible (not broken links)

### Video generation fails
- Ensure at least one image URL is valid
- Check API key is valid
- Verify image URLs are publicly accessible (not behind authentication)

### Images not appearing in video
- Check image URLs are accessible via HTTP/HTTPS
- Verify images are in supported formats (JPG, PNG, WebP)
- Check backend logs for image validation errors

### Video Status Stays "processing"
- Check backend logs for errors
- Verify API credentials are correct in Render
- Ensure images are accessible

### Video takes too long
- Replicate can take 1-5 minutes (normal)
- Cloudinary/Shotstack is faster (usually < 30 seconds)
- Check network connectivity

### No video appears
- Check `video_status` in database (should be `completed`)
- Verify `video_url` is set and valid
- Check frontend logs for VideoView errors

## Testing

After configuring a service, test video generation by:
1. Sharing a journey with photos in the app
2. The system will automatically generate a video
3. Check backend logs for generation status
4. Video will appear in the journey feed once complete

## Next Steps

1. Set up Shotstack API key (recommended) or another service
2. Test video generation with real images
3. Monitor backend logs for any issues
4. Adjust video duration/timing if needed (currently 3 seconds per image)

## Migration Notes

The system has been migrated from Python-based video generation to AI-powered services:
- ✅ No Python dependencies required
- ✅ Uses cloud-based AI services that scale automatically
- ✅ Supports multiple providers with fallback options
- ✅ Simpler codebase without Python subprocess management

