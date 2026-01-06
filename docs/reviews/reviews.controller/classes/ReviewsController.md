[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [reviews/reviews.controller](../README.md) / ReviewsController

# Class: ReviewsController

Defined in: [src/reviews/reviews.controller.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L27)

Reviews Controller
Handles reviews and ratings for destinations, hotels, activities, and other items

## Constructors

### Constructor

> **new ReviewsController**(`reviewsService`): `ReviewsController`

Defined in: [src/reviews/reviews.controller.ts:28](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L28)

#### Parameters

##### reviewsService

[`ReviewsService`](../../reviews.service/classes/ReviewsService.md)

#### Returns

`ReviewsController`

## Methods

### createReview()

> **createReview**(`req`, `createReviewDto`): `Promise`\<`any`\>

Defined in: [src/reviews/reviews.controller.ts:32](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L32)

#### Parameters

##### req

`any`

##### createReviewDto

[`CreateReviewDto`](../../reviews.dto/classes/CreateReviewDto.md)

#### Returns

`Promise`\<`any`\>

***

### updateReview()

> **updateReview**(`req`, `reviewId`, `updateReviewDto`): `Promise`\<`any`\>

Defined in: [src/reviews/reviews.controller.ts:48](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L48)

#### Parameters

##### req

`any`

##### reviewId

`string`

##### updateReviewDto

[`UpdateReviewDto`](../../reviews.dto/classes/UpdateReviewDto.md)

#### Returns

`Promise`\<`any`\>

***

### deleteReview()

> **deleteReview**(`req`, `reviewId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/reviews/reviews.controller.ts:66](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L66)

#### Parameters

##### req

`any`

##### reviewId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### getReviews()

> **getReviews**(`itemType`, `itemId`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/reviews/reviews.controller.ts:77](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L77)

Get reviews for an item with pagination

#### Parameters

##### itemType

`ReviewItemType`

##### itemId

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getReviewStats()

> **getReviewStats**(`itemType`, `itemId`): `Promise`\<\{ `averageRating`: `number`; `totalReviews`: `number`; `ratingDistribution`: \{\[`key`: `number`\]: `number`; \}; \}\>

Defined in: [src/reviews/reviews.controller.ts:101](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L101)

#### Parameters

##### itemType

`ReviewItemType`

##### itemId

`string`

#### Returns

`Promise`\<\{ `averageRating`: `number`; `totalReviews`: `number`; `ratingDistribution`: \{\[`key`: `number`\]: `number`; \}; \}\>

***

### getUserReviews()

> **getUserReviews**(`req`, `itemType?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/reviews/reviews.controller.ts:116](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L116)

Get user's reviews with pagination

#### Parameters

##### req

`any`

##### itemType?

`ReviewItemType`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

type - Optional filter by item type

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### checkUserReview()

> **checkUserReview**(`req`, `itemType`, `itemId`): `Promise`\<`any`\>

Defined in: [src/reviews/reviews.controller.ts:141](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/reviews/reviews.controller.ts#L141)

#### Parameters

##### req

`any`

##### itemType

`ReviewItemType`

##### itemId

`string`

#### Returns

`Promise`\<`any`\>
