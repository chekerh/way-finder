# Video Generation Guide

## Overview

The video generation system supports multiple providers with automatic fallback. Choose the best option for your needs.

## Recommended Solutions (in order of reliability)

### 1. Cloudinary (⭐ RECOMMENDED for Image-to-Video Montages)

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

**Installation (for full support):**
```bash
npm install cloudinary
```

### 2. Replicate API (⭐ BEST for AI Video Generation)

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

### 3. Kaggle Notebook API (For Custom Models)

**Best for:** Using custom video generation models you've trained or found on Kaggle

**Setup:**
1. Create a Kaggle account at https://www.kaggle.com
2. Get API credentials from https://www.kaggle.com/settings
3. Create a notebook with your video generation model
4. Add to Render:
   ```
   KAGGLE_USERNAME=your_username
   KAGGLE_KEY=your_api_key
   KAGGLE_NOTEBOOK_URL=https://www.kaggle.com/api/v1/kernels/output
   ```

**Features:**
- ✅ Use any model from Kaggle
- ✅ Full control over the model
- ⚠️ Requires notebook setup
- ⚠️ More complex integration

### 4. Custom AI Service

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

### 5. Hugging Face API

**Best for:** Using Hugging Face models (limited image-to-video support)

**Setup:**
```
HUGGINGFACE_API_KEY=your_key
HUGGINGFACE_SPACE_URL=https://your-space.hf.space/api/predict
```

## Current Implementation Status

- ✅ **Cloudinary**: Structure added, requires `cloudinary` npm package for full implementation
- ✅ **Replicate**: Fully implemented and tested
- ✅ **Kaggle**: Structure added, requires notebook setup
- ✅ **Custom Service**: Fully implemented
- ✅ **Hugging Face**: Partially implemented (better for text-to-video)
- ✅ **Fallback**: Reliable placeholder video (always works)

## Quick Start (Recommended)

For the most reliable video generation, use **Cloudinary**:

1. Install Cloudinary SDK:
   ```bash
   cd backend
   npm install cloudinary
   ```

2. Add credentials to Render:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

3. The system will automatically use Cloudinary for video generation.

## Testing

After configuring a service, test video generation by:
1. Sharing a journey with photos in the app
2. Clicking "Generate" on the video
3. Checking backend logs for generation status
4. Verifying the video appears in the app

## Troubleshooting

### Video shows "Erreur inconnue"
- Check backend logs for generation errors
- Verify API credentials are correct in Render
- Ensure images are accessible (not broken URLs)

### Video takes too long
- Replicate can take 1-5 minutes (normal)
- Cloudinary is faster (usually < 30 seconds)
- Check network connectivity

### No video appears
- Check `video_status` in database (should be `completed`)
- Verify `video_url` is set and valid
- Check frontend logs for VideoView errors

## Next Steps

1. **For Production**: Install Cloudinary SDK and configure credentials
2. **For AI Videos**: Configure Replicate API token
3. **For Custom Models**: Set up Kaggle notebook and configure API

