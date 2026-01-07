[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [rewards/recalculate-points.service](../README.md) / RecalculatePointsService

# Class: RecalculatePointsService

Defined in: [src/rewards/recalculate-points.service.ts:24](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/recalculate-points.service.ts#L24)

## Constructors

### Constructor

> **new RecalculatePointsService**(`userModel`, `bookingModel`, `journeyModel`, `outfitModel`, `commentModel`, `reviewModel`, `onboardingModel`, `pointsTransactionModel`, `rewardsService`, `userService`): `RecalculatePointsService`

Defined in: [src/rewards/recalculate-points.service.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/recalculate-points.service.ts#L27)

#### Parameters

##### userModel

`Model`\<`Document`\<`unknown`, \{ \}, `User`, \{ \}, \{ \}\> & `User` & `object` & `object`\>

##### bookingModel

`Model`\<`Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`\>

##### journeyModel

`Model`\<`Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`\>

##### outfitModel

`Model`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

##### commentModel

`Model`\<`Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`\>

##### reviewModel

`Model`\<`Document`\<`unknown`, \{ \}, `Review`, \{ \}, \{ \}\> & `Review` & `object` & `object`\>

##### onboardingModel

`Model`\<`Document`\<`unknown`, \{ \}, `OnboardingSession`, \{ \}, \{ \}\> & `OnboardingSession` & `object` & `object`\>

##### pointsTransactionModel

`Model`\<`Document`\<`unknown`, \{ \}, `PointsTransaction`, \{ \}, \{ \}\> & `PointsTransaction` & `object` & `object`\>

##### rewardsService

[`RewardsService`](../../rewards.service/classes/RewardsService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

#### Returns

`RecalculatePointsService`

## Methods

### recalculateAllUsers()

> **recalculateAllUsers**(): `Promise`\<\{ `totalUsers`: `number`; `usersUpdated`: `number`; `errors`: `string`[]; \}\>

Defined in: [src/rewards/recalculate-points.service.ts:51](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/recalculate-points.service.ts#L51)

Recalculate points and lifetime metrics for all users based on their existing activities

#### Returns

`Promise`\<\{ `totalUsers`: `number`; `usersUpdated`: `number`; `errors`: `string`[]; \}\>

***

### recalculateUserPoints()

> **recalculateUserPoints**(`userId`): `Promise`\<`void`\>

Defined in: [src/rewards/recalculate-points.service.ts:86](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/recalculate-points.service.ts#L86)

Recalculate points and lifetime metrics for a specific user

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`void`\>
