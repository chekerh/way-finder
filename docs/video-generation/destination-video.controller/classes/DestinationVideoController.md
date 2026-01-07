[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/destination-video.controller](../README.md) / DestinationVideoController

# Class: DestinationVideoController

Defined in: [src/video-generation/destination-video.controller.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.controller.ts#L16)

## Constructors

### Constructor

> **new DestinationVideoController**(`destinationVideoService`): `DestinationVideoController`

Defined in: [src/video-generation/destination-video.controller.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.controller.ts#L17)

#### Parameters

##### destinationVideoService

[`DestinationVideoService`](../../destination-video.service/classes/DestinationVideoService.md)

#### Returns

`DestinationVideoController`

## Methods

### generateVideo()

> **generateVideo**(`userId`, `destination`, `req`): `Promise`\<\{ `status`: `"ready"` \| `"processing"` \| `"failed"` \| `"not_started"`; `userId`: `string`; `destination`: `string`; `imageCount`: `number`; `message`: `string`; \}\>

Defined in: [src/video-generation/destination-video.controller.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.controller.ts#L26)

Generate video for a specific destination
POST /api/users/:userId/destinations/:destination/generate-video

#### Parameters

##### userId

`string`

##### destination

`string`

##### req

`any`

#### Returns

`Promise`\<\{ `status`: `"ready"` \| `"processing"` \| `"failed"` \| `"not_started"`; `userId`: `string`; `destination`: `string`; `imageCount`: `number`; `message`: `string`; \}\>

***

### getVideoStatus()

> **getVideoStatus**(`userId`, `destination`, `req`): `Promise`\<\{ `status`: `string`; `videoUrl`: `null`; `message`: `string`; `imageCount?`: `undefined`; `generatedAt?`: `undefined`; `errorMessage?`: `undefined`; `errorDetails?`: `undefined`; \} \| \{ `message?`: `undefined`; `status`: `"ready"` \| `"processing"` \| `"failed"` \| `"not_started"`; `videoUrl`: `string` \| `null`; `imageCount`: `number`; `generatedAt`: `Date` \| `null`; `errorMessage`: `string` \| `null`; `errorDetails`: `string` \| `null`; \}\>

Defined in: [src/video-generation/destination-video.controller.ts:66](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.controller.ts#L66)

Get video status for a destination
GET /api/users/:userId/destinations/:destination/video-status

#### Parameters

##### userId

`string`

##### destination

`string`

##### req

`any`

#### Returns

`Promise`\<\{ `status`: `string`; `videoUrl`: `null`; `message`: `string`; `imageCount?`: `undefined`; `generatedAt?`: `undefined`; `errorMessage?`: `undefined`; `errorDetails?`: `undefined`; \} \| \{ `message?`: `undefined`; `status`: `"ready"` \| `"processing"` \| `"failed"` \| `"not_started"`; `videoUrl`: `string` \| `null`; `imageCount`: `number`; `generatedAt`: `Date` \| `null`; `errorMessage`: `string` \| `null`; `errorDetails`: `string` \| `null`; \}\>

***

### getUserDestinations()

> **getUserDestinations**(`userId`, `req`): `Promise`\<\{ `destinations`: `object`[]; \}\>

Defined in: [src/video-generation/destination-video.controller.ts:102](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.controller.ts#L102)

Get all destinations with video status for a user
GET /api/users/:userId/destinations

#### Parameters

##### userId

`string`

##### req

`any`

#### Returns

`Promise`\<\{ `destinations`: `object`[]; \}\>

***

### getUserDestinationVideos()

> **getUserDestinationVideos**(`userId`, `req`): `Promise`\<\{ `videos`: `object`[]; \}\>

Defined in: [src/video-generation/destination-video.controller.ts:123](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.controller.ts#L123)

Get all destination videos for a user
GET /api/users/:userId/destination-videos

#### Parameters

##### userId

`string`

##### req

`any`

#### Returns

`Promise`\<\{ `videos`: `object`[]; \}\>
