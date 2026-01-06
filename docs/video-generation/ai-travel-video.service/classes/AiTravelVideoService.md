[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/ai-travel-video.service](../README.md) / AiTravelVideoService

# Class: AiTravelVideoService

Defined in: [src/video-generation/ai-travel-video.service.ts:57](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L57)

AI Travel Video Service
Generates travel-themed videos from text prompts using AI models

Uses Replicate API with specialized travel video generation models
Enhances user prompts with travel-specific context for better results

## Constructors

### Constructor

> **new AiTravelVideoService**(`httpService`): `AiTravelVideoService`

Defined in: [src/video-generation/ai-travel-video.service.ts:144](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L144)

#### Parameters

##### httpService

`HttpService`

#### Returns

`AiTravelVideoService`

## Methods

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/video-generation/ai-travel-video.service.ts:161](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L161)

Check if the service is configured and available

#### Returns

`boolean`

***

### enhancePrompt()

> **enhancePrompt**(`userPrompt`): `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:179](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L179)

Enhance user prompt with travel-specific context
This improves the quality of generated travel videos

#### Parameters

##### userPrompt

`string`

#### Returns

`string`

***

### generateVideo()

> **generateVideo**(`userId`, `prompt`): `Promise`\<\{ `predictionId`: `string`; `status`: `string`; `prompt`: `string`; `enhancedPrompt`: `string`; \}\>

Defined in: [src/video-generation/ai-travel-video.service.ts:208](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L208)

Generate a travel video from a text prompt
Uses Replicate API with travel-optimized models

#### Parameters

##### userId

`string`

##### prompt

`string`

#### Returns

`Promise`\<\{ `predictionId`: `string`; `status`: `string`; `prompt`: `string`; `enhancedPrompt`: `string`; \}\>

***

### checkPredictionStatus()

> **checkPredictionStatus**(`predictionId`): `Promise`\<\{ `status`: `string`; `videoUrl?`: `string`; `error?`: `string`; `progress?`: `number`; \}\>

Defined in: [src/video-generation/ai-travel-video.service.ts:352](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L352)

Check the status of a video generation prediction

#### Parameters

##### predictionId

`string`

#### Returns

`Promise`\<\{ `status`: `string`; `videoUrl?`: `string`; `error?`: `string`; `progress?`: `number`; \}\>

***

### cancelPrediction()

> **cancelPrediction**(`predictionId`): `Promise`\<`void`\>

Defined in: [src/video-generation/ai-travel-video.service.ts:421](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L421)

Cancel a video generation prediction

#### Parameters

##### predictionId

`string`

#### Returns

`Promise`\<`void`\>

***

### getSuggestions()

> **getSuggestions**(): `string`[]

Defined in: [src/video-generation/ai-travel-video.service.ts:449](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L449)

Get travel video prompt suggestions

#### Returns

`string`[]

***

### getMusicTracks()

> **getMusicTracks**(): [`MusicTrack`](../interfaces/MusicTrack.md)[]

Defined in: [src/video-generation/ai-travel-video.service.ts:467](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L467)

Get available music tracks for video creation

#### Returns

[`MusicTrack`](../interfaces/MusicTrack.md)[]

***

### getTravelPlanSuggestions()

> **getTravelPlanSuggestions**(`preferences?`): [`TravelPlanSuggestion`](../interfaces/TravelPlanSuggestion.md)[]

Defined in: [src/video-generation/ai-travel-video.service.ts:531](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L531)

Get AI-generated travel plan suggestions based on user preferences

#### Parameters

##### preferences?

###### tripType?

`string`

###### duration?

`string`

###### budget?

`string`

#### Returns

[`TravelPlanSuggestion`](../interfaces/TravelPlanSuggestion.md)[]

***

### generateVideoWithMedia()

> **generateVideoWithMedia**(`userId`, `prompt`, `images`, `musicTrackId?`): `Promise`\<\{ `predictionId`: `string`; `status`: `string`; `prompt`: `string`; `enhancedPrompt`: `string`; `musicTrack?`: [`MusicTrack`](../interfaces/MusicTrack.md); \}\>

Defined in: [src/video-generation/ai-travel-video.service.ts:668](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L668)

Generate video with images and music (montage style)
Uses uploaded images to create a travel montage video

#### Parameters

##### userId

`string`

##### prompt

`string`

##### images

`string`[]

##### musicTrackId?

`string`

#### Returns

`Promise`\<\{ `predictionId`: `string`; `status`: `string`; `prompt`: `string`; `enhancedPrompt`: `string`; `musicTrack?`: [`MusicTrack`](../interfaces/MusicTrack.md); \}\>
