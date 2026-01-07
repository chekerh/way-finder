[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-processing/ai-video.service](../README.md) / AiVideoService

# Class: AiVideoService

Defined in: [src/video-processing/ai-video.service.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-processing/ai-video.service.ts#L23)

AI Video Service for generating travel montage videos from images
Supports multiple AI providers:
1. Cloudinary (if CLOUDINARY_* env vars are set) - Best for reliable video montages
2. Custom AI service via AI_VIDEO_SERVICE_URL
3. Replicate API (if REPLICATE_API_TOKEN is set) - Best for AI video generation
4. Kaggle Notebook API (if KAGGLE_USERNAME and KAGGLE_KEY are set) - For custom models
5. Hugging Face Inference API (if HUGGINGFACE_API_KEY is set)
6. Fallback placeholder for development

## Constructors

### Constructor

> **new AiVideoService**(`httpService`): `AiVideoService`

Defined in: [src/video-processing/ai-video.service.ts:35](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-processing/ai-video.service.ts#L35)

#### Parameters

##### httpService

`HttpService`

#### Returns

`AiVideoService`

## Methods

### generateVideo()

> **generateVideo**(`payload`): `Promise`\<`AiVideoResponse`\>

Defined in: [src/video-processing/ai-video.service.ts:95](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-processing/ai-video.service.ts#L95)

#### Parameters

##### payload

[`VideoJobPayload`](../../interfaces/video-job-payload.interface/interfaces/VideoJobPayload.md)

#### Returns

`Promise`\<`AiVideoResponse`\>
