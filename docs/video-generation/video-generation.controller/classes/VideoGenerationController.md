[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/video-generation.controller](../README.md) / VideoGenerationController

# Class: VideoGenerationController

Defined in: [src/video-generation/video-generation.controller.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L22)

## Constructors

### Constructor

> **new VideoGenerationController**(`videoGenerationService`): `VideoGenerationController`

Defined in: [src/video-generation/video-generation.controller.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L23)

#### Parameters

##### videoGenerationService

[`VideoGenerationService`](../../video-generation.service/classes/VideoGenerationService.md)

#### Returns

`VideoGenerationController`

## Methods

### getAiVideoStatus()

> **getAiVideoStatus**(): `Promise`\<[`AiVideoStatusResponse`](../../dto/video-generation.dto/classes/AiVideoStatusResponse.md)\>

Defined in: [src/video-generation/video-generation.controller.ts:28](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L28)

#### Returns

`Promise`\<[`AiVideoStatusResponse`](../../dto/video-generation.dto/classes/AiVideoStatusResponse.md)\>

***

### getAiVideoSuggestions()

> **getAiVideoSuggestions**(): `Promise`\<\{ `suggestions`: `string`[]; \}\>

Defined in: [src/video-generation/video-generation.controller.ts:33](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L33)

#### Returns

`Promise`\<\{ `suggestions`: `string`[]; \}\>

***

### generateAiTravelVideo()

> **generateAiTravelVideo**(`request`, `req`): `Promise`\<`any`\>

Defined in: [src/video-generation/video-generation.controller.ts:40](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L40)

#### Parameters

##### request

[`AiVideoGenerateRequest`](../../dto/video-generation.dto/classes/AiVideoGenerateRequest.md)

##### req

`any`

#### Returns

`Promise`\<`any`\>

***

### checkAiVideoStatus()

> **checkAiVideoStatus**(`predictionId`): `Promise`\<[`AiVideoCheckStatusResponse`](../../dto/video-generation.dto/classes/AiVideoCheckStatusResponse.md)\>

Defined in: [src/video-generation/video-generation.controller.ts:49](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L49)

#### Parameters

##### predictionId

`string`

#### Returns

`Promise`\<[`AiVideoCheckStatusResponse`](../../dto/video-generation.dto/classes/AiVideoCheckStatusResponse.md)\>

***

### cancelAiVideo()

> **cancelAiVideo**(`predictionId`): `Promise`\<`any`\>

Defined in: [src/video-generation/video-generation.controller.ts:54](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L54)

#### Parameters

##### predictionId

`string`

#### Returns

`Promise`\<`any`\>

***

### getMusicTracks()

> **getMusicTracks**(): `Promise`\<[`MusicTracksResponse`](../../dto/video-generation.dto/classes/MusicTracksResponse.md)\>

Defined in: [src/video-generation/video-generation.controller.ts:59](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L59)

#### Returns

`Promise`\<[`MusicTracksResponse`](../../dto/video-generation.dto/classes/MusicTracksResponse.md)\>

***

### getTravelPlans()

> **getTravelPlans**(): `Promise`\<[`TravelPlansResponse`](../../dto/video-generation.dto/classes/TravelPlansResponse.md)\>

Defined in: [src/video-generation/video-generation.controller.ts:64](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L64)

#### Returns

`Promise`\<[`TravelPlansResponse`](../../dto/video-generation.dto/classes/TravelPlansResponse.md)\>

***

### generateAiTravelVideoWithMedia()

> **generateAiTravelVideoWithMedia**(`request`, `req`): `Promise`\<`any`\>

Defined in: [src/video-generation/video-generation.controller.ts:69](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L69)

#### Parameters

##### request

[`AiVideoGenerateWithMediaRequest`](../../dto/video-generation.dto/classes/AiVideoGenerateWithMediaRequest.md)

##### req

`any`

#### Returns

`Promise`\<`any`\>

***

### uploadVideoImage()

> **uploadVideoImage**(`file`, `req`): `Promise`\<[`ImageUploadResponse`](../../dto/video-generation.dto/classes/ImageUploadResponse.md)\>

Defined in: [src/video-generation/video-generation.controller.ts:82](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.controller.ts#L82)

#### Parameters

##### file

`File`

##### req

`any`

#### Returns

`Promise`\<[`ImageUploadResponse`](../../dto/video-generation.dto/classes/ImageUploadResponse.md)\>
