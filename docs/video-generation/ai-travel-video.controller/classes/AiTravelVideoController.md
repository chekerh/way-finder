[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/ai-travel-video.controller](../README.md) / AiTravelVideoController

# Class: AiTravelVideoController

Defined in: [src/video-generation/ai-travel-video.controller.ts:61](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L61)

AI Travel Video Controller
Handles text-to-video generation for travel content

## Constructors

### Constructor

> **new AiTravelVideoController**(`aiTravelVideoService`, `imgbbService`): `AiTravelVideoController`

Defined in: [src/video-generation/ai-travel-video.controller.ts:62](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L62)

#### Parameters

##### aiTravelVideoService

[`AiTravelVideoService`](../../ai-travel-video.service/classes/AiTravelVideoService.md)

##### imgbbService

[`ImgBBService`](../../../journey/imgbb.service/classes/ImgBBService.md)

#### Returns

`AiTravelVideoController`

## Methods

### getStatus()

> **getStatus**(): `object`

Defined in: [src/video-generation/ai-travel-video.controller.ts:72](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L72)

Check if AI video generation is available

#### Returns

`object`

availability status and suggestions

##### available

> **available**: `boolean`

##### suggestions

> **suggestions**: `string`[]

##### message

> **message**: `string`

***

### getSuggestions()

> **getSuggestions**(): `object`

Defined in: [src/video-generation/ai-travel-video.controller.ts:87](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L87)

Get prompt suggestions for travel videos

#### Returns

`object`

list of example prompts

##### suggestions

> **suggestions**: `string`[]

***

### generateVideo()

> **generateVideo**(`req`, `body`): `Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `predictionId`: `string`; `status`: `string`; `originalPrompt`: `string`; `enhancedPrompt`: `string`; `estimatedTime`: `string`; \}; \}\>

Defined in: [src/video-generation/ai-travel-video.controller.ts:100](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L100)

Generate a travel video from a text prompt

#### Parameters

##### req

`any`

##### body

`GenerateVideoDto`

#### Returns

`Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `predictionId`: `string`; `status`: `string`; `originalPrompt`: `string`; `enhancedPrompt`: `string`; `estimatedTime`: `string`; \}; \}\>

prediction ID and status

#### Body

prompt - The text description of the travel scene

***

### checkStatus()

> **checkStatus**(`predictionId`): `Promise`\<\{ `success`: `boolean`; `data`: \{ `predictionId`: `string`; `status`: `string`; `videoUrl`: `string` \| `undefined`; `progress`: `number` \| `undefined`; `error`: `string` \| `undefined`; `isComplete`: `boolean`; `isFailed`: `boolean`; \}; \}\>

Defined in: [src/video-generation/ai-travel-video.controller.ts:132](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L132)

Check the status of a video generation

#### Parameters

##### predictionId

`string`

The Replicate prediction ID

#### Returns

`Promise`\<\{ `success`: `boolean`; `data`: \{ `predictionId`: `string`; `status`: `string`; `videoUrl`: `string` \| `undefined`; `progress`: `number` \| `undefined`; `error`: `string` \| `undefined`; `isComplete`: `boolean`; `isFailed`: `boolean`; \}; \}\>

current status and video URL if completed

***

### cancelGeneration()

> **cancelGeneration**(`predictionId`): `Promise`\<\{ `success`: `boolean`; `message`: `string`; \}\>

Defined in: [src/video-generation/ai-travel-video.controller.ts:160](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L160)

Cancel a video generation in progress

#### Parameters

##### predictionId

`string`

The Replicate prediction ID

#### Returns

`Promise`\<\{ `success`: `boolean`; `message`: `string`; \}\>

***

### previewPrompt()

> **previewPrompt**(`req`): `object`

Defined in: [src/video-generation/ai-travel-video.controller.ts:178](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L178)

Preview how a prompt will be enhanced
Useful for debugging and understanding prompt engineering

#### Parameters

##### req

`any`

#### Returns

`object`

##### original

> **original**: `string` = `prompt`

##### enhanced

> **enhanced**: `string`

***

### getMusicTracks()

> **getMusicTracks**(): `object`

Defined in: [src/video-generation/ai-travel-video.controller.ts:197](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L197)

Get available music tracks for video creation

#### Returns

`object`

list of music tracks

##### success

> **success**: `boolean` = `true`

##### tracks

> **tracks**: [`MusicTrack`](../../ai-travel-video.service/interfaces/MusicTrack.md)[]

***

### getTravelPlans()

> **getTravelPlans**(`req`): `object`

Defined in: [src/video-generation/ai-travel-video.controller.ts:209](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L209)

Get AI-generated travel plan suggestions

#### Parameters

##### req

`any`

#### Returns

`object`

list of travel plan suggestions with video prompts

##### success

> **success**: `boolean` = `true`

##### plans

> **plans**: [`TravelPlanSuggestion`](../../ai-travel-video.service/interfaces/TravelPlanSuggestion.md)[]

***

### generateVideoWithMedia()

> **generateVideoWithMedia**(`req`, `body`): `Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `predictionId`: `string`; `status`: `string`; `originalPrompt`: `string`; `enhancedPrompt`: `string`; `musicTrack`: [`MusicTrack`](../../ai-travel-video.service/interfaces/MusicTrack.md) \| `undefined`; `estimatedTime`: `string`; \}; \}\>

Defined in: [src/video-generation/ai-travel-video.controller.ts:231](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L231)

Generate a travel video with images and music
Allows users to upload their own photos and select background music

#### Parameters

##### req

`any`

##### body

`GenerateVideoWithMediaDto`

#### Returns

`Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `predictionId`: `string`; `status`: `string`; `originalPrompt`: `string`; `enhancedPrompt`: `string`; `musicTrack`: [`MusicTrack`](../../ai-travel-video.service/interfaces/MusicTrack.md) \| `undefined`; `estimatedTime`: `string`; \}; \}\>

#### Body

prompt - Text description

#### Body

images - Array of image URLs

#### Body

musicTrackId - Selected music track ID

***

### uploadImage()

> **uploadImage**(`file`): `Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `url`: `string`; `originalName`: `string`; `size`: `number`; \}; \}\>

Defined in: [src/video-generation/ai-travel-video.controller.ts:290](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L290)

Upload a single image from phone to ImgBB
Returns the URL that can be used for video generation

#### Parameters

##### file

`File`

#### Returns

`Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `url`: `string`; `originalName`: `string`; `size`: `number`; \}; \}\>

***

### uploadImages()

> **uploadImages**(`files`): `Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `images`: `object`[]; `count`: `number`; \}; \}\>

Defined in: [src/video-generation/ai-travel-video.controller.ts:343](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.controller.ts#L343)

Upload multiple images from phone to ImgBB
Returns array of URLs that can be used for video generation

#### Parameters

##### files

`File`[]

#### Returns

`Promise`\<\{ `success`: `boolean`; `message`: `string`; `data`: \{ `images`: `object`[]; `count`: `number`; \}; \}\>
