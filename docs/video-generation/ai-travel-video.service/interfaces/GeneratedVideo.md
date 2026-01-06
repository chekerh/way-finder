[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/ai-travel-video.service](../README.md) / GeneratedVideo

# Interface: GeneratedVideo

Defined in: [src/video-generation/ai-travel-video.service.ts:9](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L9)

Generated Video Document Schema

## Properties

### \_id?

> `optional` **\_id**: `ObjectId`

Defined in: [src/video-generation/ai-travel-video.service.ts:10](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L10)

***

### userId

> **userId**: `ObjectId`

Defined in: [src/video-generation/ai-travel-video.service.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L11)

***

### prompt

> **prompt**: `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:12](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L12)

***

### enhancedPrompt

> **enhancedPrompt**: `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L13)

***

### videoUrl?

> `optional` **videoUrl**: `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:14](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L14)

***

### status

> **status**: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`

Defined in: [src/video-generation/ai-travel-video.service.ts:15](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L15)

***

### provider

> **provider**: `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L16)

***

### predictionId?

> `optional` **predictionId**: `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L17)

***

### createdAt

> **createdAt**: `Date`

Defined in: [src/video-generation/ai-travel-video.service.ts:18](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L18)

***

### completedAt?

> `optional` **completedAt**: `Date`

Defined in: [src/video-generation/ai-travel-video.service.ts:19](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L19)

***

### error?

> `optional` **error**: `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:20](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L20)

***

### images?

> `optional` **images**: `string`[]

Defined in: [src/video-generation/ai-travel-video.service.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L21)

***

### musicTrack?

> `optional` **musicTrack**: `string`

Defined in: [src/video-generation/ai-travel-video.service.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/ai-travel-video.service.ts#L22)
