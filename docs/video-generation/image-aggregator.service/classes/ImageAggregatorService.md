[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/image-aggregator.service](../README.md) / ImageAggregatorService

# Class: ImageAggregatorService

Defined in: [src/video-generation/image-aggregator.service.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/image-aggregator.service.ts#L21)

## Constructors

### Constructor

> **new ImageAggregatorService**(`journeyModel`): `ImageAggregatorService`

Defined in: [src/video-generation/image-aggregator.service.ts:24](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/image-aggregator.service.ts#L24)

#### Parameters

##### journeyModel

`Model`\<`Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`\>

#### Returns

`ImageAggregatorService`

## Methods

### aggregateImagesByDestination()

> **aggregateImagesByDestination**(`userId`, `destination`): `Promise`\<[`AggregatedImages`](../interfaces/AggregatedImages.md)\>

Defined in: [src/video-generation/image-aggregator.service.ts:42](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/image-aggregator.service.ts#L42)

Aggregate all images from all posts for a given user and destination

#### Parameters

##### userId

`string`

User ID

##### destination

`string`

Destination name (e.g., "Paris")

#### Returns

`Promise`\<[`AggregatedImages`](../interfaces/AggregatedImages.md)\>

Aggregated images with metadata

***

### getUserDestinations()

> **getUserDestinations**(`userId`): `Promise`\<`string`[]\>

Defined in: [src/video-generation/image-aggregator.service.ts:151](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/image-aggregator.service.ts#L151)

Get all unique destinations for a user

#### Parameters

##### userId

`string`

User ID

#### Returns

`Promise`\<`string`[]\>

List of unique destinations
