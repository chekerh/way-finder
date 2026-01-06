[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [reviews/reviews.service](../README.md) / ReviewsService

# Class: ReviewsService

Defined in: [src/reviews/reviews.service.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L21)

Reviews Service
Handles reviews and ratings for destinations, hotels, flights, and other items
Awards points for reviews and provides statistics

## Constructors

### Constructor

> **new ReviewsService**(`reviewModel`, `rewardsService`, `userService`): `ReviewsService`

Defined in: [src/reviews/reviews.service.ts:24](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L24)

#### Parameters

##### reviewModel

`Model`\<`Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object`\>

##### rewardsService

[`RewardsService`](../../../rewards/rewards.service/classes/RewardsService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

#### Returns

`ReviewsService`

## Methods

### createReview()

> **createReview**(`userId`, `createReviewDto`): `Promise`\<`Review`\>

Defined in: [src/reviews/reviews.service.ts:39](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L39)

Create a new review
Checks for duplicate reviews and awards points for destination reviews

#### Parameters

##### userId

`string`

User ID creating the review

##### createReviewDto

[`CreateReviewDto`](../../reviews.dto/classes/CreateReviewDto.md)

Review data

#### Returns

`Promise`\<`Review`\>

Created review document

#### Throws

BadRequestException if user already reviewed this item

***

### updateReview()

> **updateReview**(`userId`, `reviewId`, `updateReviewDto`): `Promise`\<`Review`\>

Defined in: [src/reviews/reviews.service.ts:97](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L97)

#### Parameters

##### userId

`string`

##### reviewId

`string`

##### updateReviewDto

[`UpdateReviewDto`](../../reviews.dto/classes/UpdateReviewDto.md)

#### Returns

`Promise`\<`Review`\>

***

### deleteReview()

> **deleteReview**(`userId`, `reviewId`): `Promise`\<`void`\>

Defined in: [src/reviews/reviews.service.ts:118](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L118)

#### Parameters

##### userId

`string`

##### reviewId

`string`

#### Returns

`Promise`\<`void`\>

***

### ~~getReviews()~~

> **getReviews**(`itemType`, `itemId`): `Promise`\<`Review`[]\>

Defined in: [src/reviews/reviews.service.ts:132](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L132)

Get reviews for an item (non-paginated - for backward compatibility)

#### Parameters

##### itemType

`ReviewItemType`

##### itemId

`string`

#### Returns

`Promise`\<`Review`[]\>

#### Deprecated

Use getReviewsPaginated instead for better performance

***

### getReviewsPaginated()

> **getReviewsPaginated**(`itemType`, `itemId`, `page`, `limit`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/reviews/reviews.service.ts:152](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L152)

Get paginated reviews for an item

#### Parameters

##### itemType

`ReviewItemType`

Type of item (destination, hotel, etc.)

##### itemId

`string`

ID of the item

##### page

`number`

Page number (1-based)

##### limit

`number`

Items per page

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated review results

***

### ~~getUserReviews()~~

> **getUserReviews**(`userId`, `itemType?`): `Promise`\<`Review`[]\>

Defined in: [src/reviews/reviews.service.ts:179](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L179)

Get user reviews (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### itemType?

`ReviewItemType`

#### Returns

`Promise`\<`Review`[]\>

#### Deprecated

Use getUserReviewsPaginated instead for better performance

***

### getUserReviewsPaginated()

> **getUserReviewsPaginated**(`userId`, `page`, `limit`, `itemType?`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/reviews/reviews.service.ts:203](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L203)

Get paginated user reviews

#### Parameters

##### userId

`string`

User ID

##### page

`number`

Page number (1-based)

##### limit

`number`

Items per page

##### itemType?

`ReviewItemType`

Optional filter by item type

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated review results

***

### getReviewStats()

> **getReviewStats**(`itemType`, `itemId`): `Promise`\<\{ `averageRating`: `number`; `totalReviews`: `number`; `ratingDistribution`: \{\[`key`: `number`\]: `number`; \}; \}\>

Defined in: [src/reviews/reviews.service.ts:229](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L229)

#### Parameters

##### itemType

`ReviewItemType`

##### itemId

`string`

#### Returns

`Promise`\<\{ `averageRating`: `number`; `totalReviews`: `number`; `ratingDistribution`: \{\[`key`: `number`\]: `number`; \}; \}\>

***

### checkUserReview()

> **checkUserReview**(`userId`, `itemType`, `itemId`): `Promise`\<`Review` \| `null`\>

Defined in: [src/reviews/reviews.service.ts:264](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.service.ts#L264)

#### Parameters

##### userId

`string`

##### itemType

`ReviewItemType`

##### itemId

`string`

#### Returns

`Promise`\<`Review` \| `null`\>
