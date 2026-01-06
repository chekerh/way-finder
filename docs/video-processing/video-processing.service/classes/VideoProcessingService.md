[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-processing/video-processing.service](../README.md) / VideoProcessingService

# Class: VideoProcessingService

Defined in: [src/video-processing/video-processing.service.ts:7](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-processing/video-processing.service.ts#L7)

## Constructors

### Constructor

> **new VideoProcessingService**(`videoQueue`): `VideoProcessingService`

Defined in: [src/video-processing/video-processing.service.ts:8](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-processing/video-processing.service.ts#L8)

#### Parameters

##### videoQueue

`Queue`\<[`VideoJobPayload`](../../interfaces/video-job-payload.interface/interfaces/VideoJobPayload.md)\>

#### Returns

`VideoProcessingService`

## Methods

### enqueueJourneyVideo()

> **enqueueJourneyVideo**(`payload`): `Promise`\<`void`\>

Defined in: [src/video-processing/video-processing.service.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-processing/video-processing.service.ts#L13)

#### Parameters

##### payload

[`VideoJobPayload`](../../interfaces/video-job-payload.interface/interfaces/VideoJobPayload.md)

#### Returns

`Promise`\<`void`\>
