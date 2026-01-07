[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [journey/journey.service](../README.md) / JourneyService

# Class: JourneyService

Defined in: [src/journey/journey.service.ts:36](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L36)

## Constructors

### Constructor

> **new JourneyService**(`journeyModel`, `journeyLikeModel`, `journeyCommentModel`, `bookingService`, `videoProcessingService`, `aiVideoService`, `imgbbService`, `notificationsService`, `userService`, `rewardsService`): `JourneyService`

Defined in: [src/journey/journey.service.ts:39](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L39)

#### Parameters

##### journeyModel

`Model`\<`Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`\>

##### journeyLikeModel

`Model`\<`Document`\<`unknown`, \{ \}, `JourneyLike`, \{ \}, \{ \}\> & `JourneyLike` & `object` & `object`\>

##### journeyCommentModel

`Model`\<`Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object`\>

##### bookingService

[`BookingService`](../../../booking/booking.service/classes/BookingService.md)

##### videoProcessingService

[`VideoProcessingService`](../../../video-processing/video-processing.service/classes/VideoProcessingService.md)

##### aiVideoService

[`AiVideoService`](../../../video-processing/ai-video.service/classes/AiVideoService.md)

##### imgbbService

[`ImgBBService`](../../imgbb.service/classes/ImgBBService.md)

##### notificationsService

[`NotificationsService`](../../../notifications/notifications.service/classes/NotificationsService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### rewardsService

[`RewardsService`](../../../rewards/rewards.service/classes/RewardsService.md)

#### Returns

`JourneyService`

## Methods

### uploadImagesToImgBB()

> **uploadImagesToImgBB**(`files`): `Promise`\<`string`[]\>

Defined in: [src/journey/journey.service.ts:70](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L70)

Upload images to ImgBB and return their URLs

#### Parameters

##### files

`File`[]

Array of uploaded files from Multer

#### Returns

`Promise`\<`string`[]\>

Array of ImgBB URLs

***

### createJourney()

> **createJourney**(`userId`, `dto`, `imageUrls`): `Promise`\<\{ `user_id`: `ObjectId`; `booking_id`: `ObjectId`; `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `likes_count`: `number`; `comments_count`: `number`; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `image_urls`: `string`[]; \}\>

Defined in: [src/journey/journey.service.ts:145](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L145)

#### Parameters

##### userId

`string`

##### dto

[`CreateJourneyDto`](../../journey.dto/classes/CreateJourneyDto.md)

##### imageUrls

`string`[]

#### Returns

`Promise`\<\{ `user_id`: `ObjectId`; `booking_id`: `ObjectId`; `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `likes_count`: `number`; `comments_count`: `number`; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `image_urls`: `string`[]; \}\>

***

### ~~getJourneys()~~

> **getJourneys**(`userId?`, `limit?`, `skip?`): `Promise`\<`object`[]\>

Defined in: [src/journey/journey.service.ts:398](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L398)

Get journeys (non-paginated - for backward compatibility)

#### Parameters

##### userId?

`string`

##### limit?

`number` = `20`

##### skip?

`number` = `0`

#### Returns

`Promise`\<`object`[]\>

#### Deprecated

Use getJourneysPaginated instead for better performance

***

### getJourneyById()

> **getJourneyById**(`journeyId`, `userId?`): `Promise`\<\{ `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `user_id`: `any`; `user`: \{ `_id`: `any`; `username`: `any`; `firstName`: `any`; `lastName`: `any`; `profileImageUrl`: `any`; \} \| `null`; `booking_id`: `string` \| `ObjectId`; `image_urls`: `any`[]; `likes_count`: `number`; `comments_count`: `number`; `is_liked`: `boolean`; \}\>

Defined in: [src/journey/journey.service.ts:483](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L483)

#### Parameters

##### journeyId

`string`

##### userId?

`string`

#### Returns

`Promise`\<\{ `destination`: `string`; `slides`: `object`[]; `music_theme?`: `string`; `caption_text?`: `string`; `video_url?`: `string`; `video_status`: `"pending"` \| `"processing"` \| `"completed"` \| `"failed"`; `description?`: `string`; `tags`: `string`[]; `is_public`: `boolean`; `is_visible`: `boolean`; `metadata`: `Record`\<`string`, `any`\>; `user_id`: `any`; `user`: \{ `_id`: `any`; `username`: `any`; `firstName`: `any`; `lastName`: `any`; `profileImageUrl`: `any`; \} \| `null`; `booking_id`: `string` \| `ObjectId`; `image_urls`: `any`[]; `likes_count`: `number`; `comments_count`: `number`; `is_liked`: `boolean`; \}\>

***

### canUserShareJourney()

> **canUserShareJourney**(`userId`): `Promise`\<\{ `canShare`: `boolean`; `confirmedBookingsCount`: `number`; `message`: `string`; \}\>

Defined in: [src/journey/journey.service.ts:562](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L562)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `canShare`: `boolean`; `confirmedBookingsCount`: `number`; `message`: `string`; \}\>

***

### getUserJourneys()

> **getUserJourneys**(`userId`, `limit`, `skip`): `Promise`\<`object`[]\>

Defined in: [src/journey/journey.service.ts:592](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L592)

#### Parameters

##### userId

`string`

##### limit

`number` = `20`

##### skip

`number` = `0`

#### Returns

`Promise`\<`object`[]\>

***

### updateJourney()

> **updateJourney**(`userId`, `journeyId`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/journey/journey.service.ts:652](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L652)

#### Parameters

##### userId

`string`

##### journeyId

`string`

##### dto

[`UpdateJourneyDto`](../../journey.dto/classes/UpdateJourneyDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

***

### deleteJourney()

> **deleteJourney**(`userId`, `journeyId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/journey/journey.service.ts:676](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L676)

#### Parameters

##### userId

`string`

##### journeyId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object` & `Required`\<\{ \}\>\>

***

### likeJourney()

> **likeJourney**(`userId`, `journeyId`): `Promise`\<\{ `liked`: `boolean`; `message`: `string`; \}\>

Defined in: [src/journey/journey.service.ts:691](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L691)

#### Parameters

##### userId

`string`

##### journeyId

`string`

#### Returns

`Promise`\<\{ `liked`: `boolean`; `message`: `string`; \}\>

***

### addComment()

> **addComment**(`userId`, `journeyId`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/journey/journey.service.ts:763](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L763)

#### Parameters

##### userId

`string`

##### journeyId

`string`

##### dto

[`CreateJourneyCommentDto`](../../journey.dto/classes/CreateJourneyCommentDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `JourneyComment`, \{ \}, \{ \}\> & `JourneyComment` & `object` & `object` & `Required`\<\{ \}\>\>

***

### ~~getComments()~~

> **getComments**(`journeyId`, `limit`, `skip`): `Promise`\<`object`[]\>

Defined in: [src/journey/journey.service.ts:822](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L822)

Get journey comments (non-paginated - for backward compatibility)

#### Parameters

##### journeyId

`string`

##### limit

`number` = `50`

##### skip

`number` = `0`

#### Returns

`Promise`\<`object`[]\>

#### Deprecated

Use getCommentsPaginated instead for better performance

***

### getCommentsPaginated()

> **getCommentsPaginated**(`journeyId`, `page`, `limit`): `Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Defined in: [src/journey/journey.service.ts:876](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L876)

Get paginated journey comments

#### Parameters

##### journeyId

`string`

Journey ID

##### page

`number`

Page number (1-based)

##### limit

`number`

Items per page

#### Returns

`Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Paginated comment results

***

### deleteComment()

> **deleteComment**(`userId`, `commentId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/journey/journey.service.ts:932](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L932)

#### Parameters

##### userId

`string`

##### commentId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### regenerateVideo()

> **regenerateVideo**(`userId`, `journeyId`): `Promise`\<\{ `message`: `string`; `journey_id`: `string`; `video_status`: `string`; \}\>

Defined in: [src/journey/journey.service.ts:947](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/journey.service.ts#L947)

#### Parameters

##### userId

`string`

##### journeyId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `journey_id`: `string`; `video_status`: `string`; \}\>
