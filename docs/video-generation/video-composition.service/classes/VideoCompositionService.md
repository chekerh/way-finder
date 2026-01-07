[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/video-composition.service](../README.md) / VideoCompositionService

# Class: VideoCompositionService

Defined in: [src/video-generation/video-composition.service.ts:25](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-composition.service.ts#L25)

## Constructors

### Constructor

> **new VideoCompositionService**(`videoGenerationModel`): `VideoCompositionService`

Defined in: [src/video-generation/video-composition.service.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-composition.service.ts#L30)

#### Parameters

##### videoGenerationModel

`Model`\<`VideoGenerationDocument`\>

#### Returns

`VideoCompositionService`

## Methods

### createVideoFromImages()

> **createVideoFromImages**(`predictionId`, `imageUrls`, `musicTrackUrl?`, `durationPerImage?`, `transitionDuration?`): `Promise`\<`string`\>

Defined in: [src/video-generation/video-composition.service.ts:72](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-composition.service.ts#L72)

Create video from images with smooth transitions and background music

#### Parameters

##### predictionId

`string`

##### imageUrls

`string`[]

##### musicTrackUrl?

`string`

##### durationPerImage?

`number` = `3`

##### transitionDuration?

`number` = `1.0`

#### Returns

`Promise`\<`string`\>

***

### generateVideoFromImages()

> **generateVideoFromImages**(`predictionId`, `images`, `musicTrackUrl?`): `Promise`\<`string`\>

Defined in: [src/video-generation/video-composition.service.ts:549](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/video-composition.service.ts#L549)

Create video from images (main public method)

#### Parameters

##### predictionId

`string`

##### images

`string`[]

##### musicTrackUrl?

`string`

#### Returns

`Promise`\<`string`\>
