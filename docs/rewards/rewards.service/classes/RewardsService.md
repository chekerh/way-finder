[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [rewards/rewards.service](../README.md) / RewardsService

# Class: RewardsService

Defined in: [src/rewards/rewards.service.ts:14](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.service.ts#L14)

## Constructors

### Constructor

> **new RewardsService**(`pointsTransactionModel`, `userModel`): `RewardsService`

Defined in: [src/rewards/rewards.service.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.service.ts#L17)

#### Parameters

##### pointsTransactionModel

`Model`\<`Document`\<`unknown`, \{ \}, `PointsTransaction`, \{ \}, \{ \}\> & `PointsTransaction` & `object` & `object`\>

##### userModel

`Model`\<`Document`\<`unknown`, \{ \}, `User`, \{ \}, \{ \}\> & `User` & `object` & `object`\>

#### Returns

`RewardsService`

## Methods

### awardPoints()

> **awardPoints**(`dto`): `Promise`\<\{ `transaction_id`: `string`; `total_points`: `number`; `points_awarded`: `number`; \}\>

Defined in: [src/rewards/rewards.service.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.service.ts#L27)

Award points to a user

#### Parameters

##### dto

[`AwardPointsDto`](../../rewards.dto/classes/AwardPointsDto.md)

#### Returns

`Promise`\<\{ `transaction_id`: `string`; `total_points`: `number`; `points_awarded`: `number`; \}\>

***

### ~~getUserPoints()~~

> **getUserPoints**(`userId`): `Promise`\<\{ `total_points`: `number`; `available_points`: `number`; `lifetime_points`: `number`; `recent_transactions`: `any`[]; \}\>

Defined in: [src/rewards/rewards.service.ts:76](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.service.ts#L76)

Get user's points summary (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `total_points`: `number`; `available_points`: `number`; `lifetime_points`: `number`; `recent_transactions`: `any`[]; \}\>

#### Deprecated

Use getUserPointsWithPagination instead for better performance

***

### getUserPointsWithPagination()

> **getUserPointsWithPagination**(`userId`, `page`, `limit`): `Promise`\<\{ `total_points`: `number`; `available_points`: `number`; `lifetime_points`: `number`; `transactions`: \{ `data`: `object`[]; `total`: `number`; \}; \}\>

Defined in: [src/rewards/rewards.service.ts:116](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.service.ts#L116)

Get user's points summary with paginated transaction history

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

#### Returns

`Promise`\<\{ `total_points`: `number`; `available_points`: `number`; `lifetime_points`: `number`; `transactions`: \{ `data`: `object`[]; `total`: `number`; \}; \}\>

User points summary with paginated transactions

***

### redeemPoints()

> **redeemPoints**(`userId`, `points`, `description`, `metadata?`): `Promise`\<\{ `transaction_id`: `string`; `remaining_points`: `number`; \}\>

Defined in: [src/rewards/rewards.service.ts:163](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.service.ts#L163)

Redeem points (for future use - discounts, perks, etc.)

#### Parameters

##### userId

`string`

##### points

`number`

##### description

`string`

##### metadata?

`Record`\<`string`, `any`\>

#### Returns

`Promise`\<\{ `transaction_id`: `string`; `remaining_points`: `number`; \}\>

***

### getPointsForAction()

> **getPointsForAction**(`source`, `metadata?`): `number`

Defined in: [src/rewards/rewards.service.ts:229](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.service.ts#L229)

Calculate points for different actions

#### Parameters

##### source

[`PointsSource`](../../rewards.dto/enumerations/PointsSource.md)

##### metadata?

`Record`\<`string`, `any`\>

#### Returns

`number`
