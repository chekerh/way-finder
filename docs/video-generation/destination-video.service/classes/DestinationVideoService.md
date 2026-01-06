[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/destination-video.service](../README.md) / DestinationVideoService

# Class: DestinationVideoService

Defined in: [src/video-generation/destination-video.service.ts:20](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.service.ts#L20)

## Constructors

### Constructor

> **new DestinationVideoService**(`destinationVideoModel`, `imageAggregator`, `musicSelector`, `imgbbService`, `aiVideoService`): `DestinationVideoService`

Defined in: [src/video-generation/destination-video.service.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.service.ts#L23)

#### Parameters

##### destinationVideoModel

`Model`\<`Document`\<`unknown`, \{ \}, `DestinationVideo`, \{ \}, \{ \}\> & `DestinationVideo` & `object` & `object`\>

##### imageAggregator

[`ImageAggregatorService`](../../image-aggregator.service/classes/ImageAggregatorService.md)

##### musicSelector

[`MusicSelectorService`](../../music-selector.service/classes/MusicSelectorService.md)

##### imgbbService

[`ImgBBService`](../../../journey/imgbb.service/classes/ImgBBService.md)

##### aiVideoService

[`AiVideoService`](../../../video-processing/ai-video.service/classes/AiVideoService.md)

#### Returns

`DestinationVideoService`

## Methods

### generateVideo()

> **generateVideo**(`userId`, `destination`): `Promise`\<`Document`\<`unknown`, \{ \}, `DestinationVideo`, \{ \}, \{ \}\> & `DestinationVideo` & `object` & `object`\>

Defined in: [src/video-generation/destination-video.service.ts:42](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.service.ts#L42)

Generate video for a user and destination

#### Parameters

##### userId

`string`

##### destination

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `DestinationVideo`, \{ \}, \{ \}\> & `DestinationVideo` & `object` & `object`\>

***

### getVideoStatus()

> **getVideoStatus**(`userId`, `destination`): `Promise`\<`Document`\<`unknown`, \{ \}, `DestinationVideo`, \{ \}, \{ \}\> & `DestinationVideo` & `object` & `object` \| `null`\>

Defined in: [src/video-generation/destination-video.service.ts:225](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.service.ts#L225)

Get video status for a user and destination

#### Parameters

##### userId

`string`

##### destination

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `DestinationVideo`, \{ \}, \{ \}\> & `DestinationVideo` & `object` & `object` \| `null`\>

***

### getUserDestinationVideos()

> **getUserDestinationVideos**(`userId`): `Promise`\<`Document`\<`unknown`, \{ \}, `DestinationVideo`, \{ \}, \{ \}\> & `DestinationVideo` & `object` & `object`[]\>

Defined in: [src/video-generation/destination-video.service.ts:242](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.service.ts#L242)

Get all destination videos for a user

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `DestinationVideo`, \{ \}, \{ \}\> & `DestinationVideo` & `object` & `object`[]\>

***

### getUserDestinationsWithVideoStatus()

> **getUserDestinationsWithVideoStatus**(`userId`): `Promise`\<`object`[]\>

Defined in: [src/video-generation/destination-video.service.ts:256](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/destination-video.service.ts#L256)

Get all destinations for a user (with video status)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`object`[]\>
