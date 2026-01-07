[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [journey/journey.controller](../README.md) / JourneyController

# Class: JourneyController

Defined in: [src/journey/journey.controller.ts:33](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L33)

## Constructors

### Constructor

> **new JourneyController**(`journeyService`): `JourneyController`

Defined in: [src/journey/journey.controller.ts:36](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L36)

#### Parameters

##### journeyService

[`JourneyService`](../../journey.service/classes/JourneyService.md)

#### Returns

`JourneyController`

## Methods

### createJourney()

> **createJourney**(`req`, `dto`, `files`): `Promise`\<\{ `user_id`: `ObjectId`; `booking_id`: `ObjectId`; `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `likes_count`: `number`; `comments_count`: `number`; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `image_urls`: `string`[]; \}\>

Defined in: [src/journey/journey.controller.ts:67](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L67)

#### Parameters

##### req

`any`

##### dto

[`CreateJourneyDto`](../../journey.dto/classes/CreateJourneyDto.md)

##### files

`File`[]

#### Returns

`Promise`\<\{ `user_id`: `ObjectId`; `booking_id`: `ObjectId`; `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `likes_count`: `number`; `comments_count`: `number`; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `image_urls`: `string`[]; \}\>

***

### getJourneys()

> **getJourneys**(`req`, `limit?`, `skip?`): `Promise`\<`object`[]\>

Defined in: [src/journey/journey.controller.ts:100](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L100)

#### Parameters

##### req

`any`

##### limit?

`string`

##### skip?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### getMyJourneys()

> **getMyJourneys**(`req`, `limit?`, `skip?`): `Promise`\<`object`[]\>

Defined in: [src/journey/journey.controller.ts:113](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L113)

#### Parameters

##### req

`any`

##### limit?

`string`

##### skip?

`string`

#### Returns

`Promise`\<`object`[]\>

***

### canShareJourney()

> **canShareJourney**(`req`): `Promise`\<\{ `canShare`: `boolean`; `confirmedBookingsCount`: `number`; `message`: `string`; \}\>

Defined in: [src/journey/journey.controller.ts:125](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L125)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `canShare`: `boolean`; `confirmedBookingsCount`: `number`; `message`: `string`; \}\>

***

### getJourneyById()

> **getJourneyById**(`req`, `id`): `Promise`\<\{ `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `user_id`: `any`; `user`: \{ `_id`: `any`; `username`: `any`; `firstName`: `any`; `lastName`: `any`; `profileImageUrl`: `any`; \} \| `null`; `booking_id`: `string` \| `ObjectId`; `image_urls`: `any`[]; `likes_count`: `number`; `comments_count`: `number`; `is_liked`: `boolean`; \}\>

Defined in: [src/journey/journey.controller.ts:130](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L130)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `user_id`: `any`; `user`: \{ `_id`: `any`; `username`: `any`; `firstName`: `any`; `lastName`: `any`; `profileImageUrl`: `any`; \} \| `null`; `booking_id`: `string` \| `ObjectId`; `image_urls`: `any`[]; `likes_count`: `number`; `comments_count`: `number`; `is_liked`: `boolean`; \}\>

***

### updateJourney()

> **updateJourney**(`req`, `id`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/journey/journey.controller.ts:137](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L137)

#### Parameters

##### req

`any`

##### id

`string`

##### dto

[`UpdateJourneyDto`](../../journey.dto/classes/UpdateJourneyDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

***

### deleteJourney()

> **deleteJourney**(`req`, `id`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/journey/journey.controller.ts:147](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L147)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

***

### likeJourney()

> **likeJourney**(`req`, `id`): `Promise`\<\{ `liked`: `boolean`; `message`: `string`; \}\>

Defined in: [src/journey/journey.controller.ts:153](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L153)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `liked`: `boolean`; `message`: `string`; \}\>

***

### addComment()

> **addComment**(`req`, `id`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/journey/journey.controller.ts:159](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L159)

#### Parameters

##### req

`any`

##### id

`string`

##### dto

[`CreateJourneyCommentDto`](../../journey.dto/classes/CreateJourneyCommentDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object` & `Required`\<\{ \}\>\>

***

### getComments()

> **getComments**(`id`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<\{ `content`: `string`; `user_id`: `any`; `user`: \{ `_id`: `any`; `username`: `any`; `firstName`: `any`; `lastName`: `any`; `profileImageUrl`: `any`; \} \| `null`; `journey_id`: `string` \| `ObjectId`; `parent_comment_id`: `string` \| `ObjectId` \| `undefined`; \}\>\>

Defined in: [src/journey/journey.controller.ts:173](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L173)

Get journey comments with pagination

#### Parameters

##### id

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<\{ `content`: `string`; `user_id`: `any`; `user`: \{ `_id`: `any`; `username`: `any`; `firstName`: `any`; `lastName`: `any`; `profileImageUrl`: `any`; \} \| `null`; `journey_id`: `string` \| `ObjectId`; `parent_comment_id`: `string` \| `ObjectId` \| `undefined`; \}\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 50, max: 100)

***

### deleteComment()

> **deleteComment**(`req`, `commentId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/journey/journey.controller.ts:188](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L188)

#### Parameters

##### req

`any`

##### commentId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### regenerateVideo()

> **regenerateVideo**(`req`, `id`): `Promise`\<\{ `message`: `string`; `journey_id`: `string`; `video_status`: `string`; \}\>

Defined in: [src/journey/journey.controller.ts:194](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.controller.ts#L194)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `journey_id`: `string`; `video_status`: `string`; \}\>
