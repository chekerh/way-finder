[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [rewards/rewards.controller](../README.md) / RewardsController

# Class: RewardsController

Defined in: [src/rewards/rewards.controller.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.controller.ts#L22)

Rewards Controller
Handles user rewards, points system, and transaction history

## Constructors

### Constructor

> **new RewardsController**(`rewardsService`, `recalculatePointsService`): `RewardsController`

Defined in: [src/rewards/rewards.controller.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.controller.ts#L23)

#### Parameters

##### rewardsService

[`RewardsService`](../../rewards.service/classes/RewardsService.md)

##### recalculatePointsService

[`RecalculatePointsService`](../../recalculate-points.service/classes/RecalculatePointsService.md)

#### Returns

`RewardsController`

## Methods

### getUserPoints()

> **getUserPoints**(`req`, `pagination?`): `Promise`\<`any`\>

Defined in: [src/rewards/rewards.controller.ts:35](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.controller.ts#L35)

Get user points with paginated transaction history

#### Parameters

##### req

`any`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<`any`\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### awardPoints()

> **awardPoints**(`req`, `dto`): `Promise`\<\{ `transaction_id`: `string`; `total_points`: `number`; `points_awarded`: `number`; \}\>

Defined in: [src/rewards/rewards.controller.ts:54](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.controller.ts#L54)

#### Parameters

##### req

`any`

##### dto

`Omit`\<[`AwardPointsDto`](../../rewards.dto/classes/AwardPointsDto.md), `"userId"`\>

#### Returns

`Promise`\<\{ `transaction_id`: `string`; `total_points`: `number`; `points_awarded`: `number`; \}\>

***

### redeemPoints()

> **redeemPoints**(`req`, `body`): `Promise`\<\{ `transaction_id`: `string`; `remaining_points`: `number`; \}\>

Defined in: [src/rewards/rewards.controller.ts:67](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.controller.ts#L67)

#### Parameters

##### req

`any`

##### body

###### points

`number`

###### description

`string`

###### metadata?

`Record`\<`string`, `any`\>

#### Returns

`Promise`\<\{ `transaction_id`: `string`; `remaining_points`: `number`; \}\>

***

### recalculatePoints()

> **recalculatePoints**(`req`): `Promise`\<\{ `message`: `string`; `user_id`: `any`; \}\>

Defined in: [src/rewards/rewards.controller.ts:86](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.controller.ts#L86)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `message`: `string`; `user_id`: `any`; \}\>

***

### recalculateAllPoints()

> **recalculateAllPoints**(`req`): `Promise`\<\{ `totalUsers`: `number`; `usersUpdated`: `number`; `errors`: `string`[]; `message`: `string`; \}\>

Defined in: [src/rewards/rewards.controller.ts:97](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/rewards.controller.ts#L97)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `totalUsers`: `number`; `usersUpdated`: `number`; `errors`: `string`[]; `message`: `string`; \}\>
