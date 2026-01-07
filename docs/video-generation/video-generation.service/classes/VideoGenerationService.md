[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/video-generation.service](../README.md) / VideoGenerationService

# Class: VideoGenerationService

Defined in: [src/video-generation/video-generation.service.ts:24](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L24)

## Constructors

### Constructor

> **new VideoGenerationService**(`videoGenerationModel`, `musicTrackModel`, `travelPlanModel`, `videoCompositionService`): `VideoGenerationService`

Defined in: [src/video-generation/video-generation.service.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L27)

#### Parameters

##### videoGenerationModel

`Model`\<`VideoGenerationDocument`\>

##### musicTrackModel

`Model`\<`MusicTrackDocument`\>

##### travelPlanModel

`Model`\<`TravelPlanDocument`\>

##### videoCompositionService

[`VideoCompositionService`](../../video-composition.service/classes/VideoCompositionService.md)

#### Returns

`VideoGenerationService`

## Methods

### getAiVideoStatus()

> **getAiVideoStatus**(): `Promise`\<[`AiVideoStatusResponse`](../../dto/video-generation.dto/classes/AiVideoStatusResponse.md)\>

Defined in: [src/video-generation/video-generation.service.ts:198](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L198)

Check if AI video generation service is available

#### Returns

`Promise`\<[`AiVideoStatusResponse`](../../dto/video-generation.dto/classes/AiVideoStatusResponse.md)\>

***

### getAiVideoSuggestions()

> **getAiVideoSuggestions**(): `Promise`\<`string`[]\>

Defined in: [src/video-generation/video-generation.service.ts:226](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L226)

Get AI video generation suggestions

#### Returns

`Promise`\<`string`[]\>

***

### generateAiTravelVideo()

> **generateAiTravelVideo**(`userId`, `request`): `Promise`\<`any`\>

Defined in: [src/video-generation/video-generation.service.ts:243](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L243)

Generate travel video from text prompt (creates video from stock images based on prompt)

#### Parameters

##### userId

`string`

##### request

[`AiVideoGenerateRequest`](../../dto/video-generation.dto/classes/AiVideoGenerateRequest.md)

#### Returns

`Promise`\<`any`\>

***

### generateAiTravelVideoWithMedia()

> **generateAiTravelVideoWithMedia**(`userId`, `request`): `Promise`\<`any`\>

Defined in: [src/video-generation/video-generation.service.ts:291](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L291)

Generate AI travel video with media (images and music)

#### Parameters

##### userId

`string`

##### request

[`AiVideoGenerateWithMediaRequest`](../../dto/video-generation.dto/classes/AiVideoGenerateWithMediaRequest.md)

#### Returns

`Promise`\<`any`\>

***

### checkAiVideoStatus()

> **checkAiVideoStatus**(`predictionId`): `Promise`\<[`AiVideoCheckStatusResponse`](../../dto/video-generation.dto/classes/AiVideoCheckStatusResponse.md)\>

Defined in: [src/video-generation/video-generation.service.ts:350](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L350)

Check status of video generation

#### Parameters

##### predictionId

`string`

#### Returns

`Promise`\<[`AiVideoCheckStatusResponse`](../../dto/video-generation.dto/classes/AiVideoCheckStatusResponse.md)\>

***

### cancelAiVideo()

> **cancelAiVideo**(`predictionId`): `Promise`\<`any`\>

Defined in: [src/video-generation/video-generation.service.ts:389](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L389)

Cancel video generation

#### Parameters

##### predictionId

`string`

#### Returns

`Promise`\<`any`\>

***

### getMusicTracks()

> **getMusicTracks**(): `Promise`\<[`MusicTracksResponse`](../../dto/video-generation.dto/classes/MusicTracksResponse.md)\>

Defined in: [src/video-generation/video-generation.service.ts:415](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L415)

Get available music tracks

#### Returns

`Promise`\<[`MusicTracksResponse`](../../dto/video-generation.dto/classes/MusicTracksResponse.md)\>

***

### getTravelPlans()

> **getTravelPlans**(): `Promise`\<[`TravelPlansResponse`](../../dto/video-generation.dto/classes/TravelPlansResponse.md)\>

Defined in: [src/video-generation/video-generation.service.ts:441](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L441)

Get travel plan suggestions

#### Returns

`Promise`\<[`TravelPlansResponse`](../../dto/video-generation.dto/classes/TravelPlansResponse.md)\>

***

### uploadVideoImage()

> **uploadVideoImage**(`userId`, `file`): `Promise`\<[`ImageUploadResponse`](../../dto/video-generation.dto/classes/ImageUploadResponse.md)\>

Defined in: [src/video-generation/video-generation.service.ts:469](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-generation.service.ts#L469)

Upload image for video generation

#### Parameters

##### userId

`string`

##### file

`File`

#### Returns

`Promise`\<[`ImageUploadResponse`](../../dto/video-generation.dto/classes/ImageUploadResponse.md)\>
