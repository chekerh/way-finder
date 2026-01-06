[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [social/social.controller](../README.md) / SocialController

# Class: SocialController

Defined in: [src/social/social.controller.ts:33](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L33)

Social Controller
Handles social features including following users, sharing trips, and social feed

## Constructors

### Constructor

> **new SocialController**(`socialService`, `imgbbService`): `SocialController`

Defined in: [src/social/social.controller.ts:34](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L34)

#### Parameters

##### socialService

[`SocialService`](../../social.service/classes/SocialService.md)

##### imgbbService

[`ImgBBService`](../../../journey/imgbb.service/classes/ImgBBService.md)

#### Returns

`SocialController`

## Methods

### followUser()

> **followUser**(`req`, `followUserDto`): `Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

Defined in: [src/social/social.controller.ts:48](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L48)

Follow a user

#### Parameters

##### req

`any`

##### followUserDto

[`FollowUserDto`](../../social.dto/classes/FollowUserDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

Follow relationship status

#### Body

FollowUserDto - User ID to follow

***

### unfollowUser()

> **unfollowUser**(`req`, `followUserDto`): `Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

Defined in: [src/social/social.controller.ts:59](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L59)

Unfollow a user

#### Parameters

##### req

`any`

##### followUserDto

[`FollowUserDto`](../../social.dto/classes/FollowUserDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

Unfollow confirmation

#### Body

FollowUserDto - User ID to unfollow

***

### checkFollowStatus()

> **checkFollowStatus**(`req`, `userId`): `Promise`\<\{ `isFollowing`: `boolean`; \}\>

Defined in: [src/social/social.controller.ts:65](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L65)

#### Parameters

##### req

`any`

##### userId

`string`

#### Returns

`Promise`\<\{ `isFollowing`: `boolean`; \}\>

***

### getFollowers()

> **getFollowers**(`req`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/social/social.controller.ts:80](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L80)

Get user's followers with pagination

#### Parameters

##### req

`any`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getFollowing()

> **getFollowing**(`req`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/social/social.controller.ts:97](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L97)

Get users that the authenticated user is following with pagination

#### Parameters

##### req

`any`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getFollowCounts()

> **getFollowCounts**(`req`): `Promise`\<\{ `followers`: `number`; `following`: `number`; \}\>

Defined in: [src/social/social.controller.ts:109](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L109)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `followers`: `number`; `following`: `number`; \}\>

***

### getFollowCountsByUserId()

> **getFollowCountsByUserId**(`userId`): `Promise`\<\{ `followers`: `number`; `following`: `number`; \}\>

Defined in: [src/social/social.controller.ts:114](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L114)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `followers`: `number`; `following`: `number`; \}\>

***

### shareTrip()

> **shareTrip**(`req`, `shareTripDto`): `Promise`\<`any`\>

Defined in: [src/social/social.controller.ts:122](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L122)

#### Parameters

##### req

`any`

##### shareTripDto

[`ShareTripDto`](../../social.dto/classes/ShareTripDto.md)

#### Returns

`Promise`\<`any`\>

***

### updateSharedTrip()

> **updateSharedTrip**(`req`, `tripId`, `updateDto`): `Promise`\<`any`\>

Defined in: [src/social/social.controller.ts:130](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L130)

#### Parameters

##### req

`any`

##### tripId

`string`

##### updateDto

[`UpdateSharedTripDto`](../../social.dto/classes/UpdateSharedTripDto.md)

#### Returns

`Promise`\<`any`\>

***

### deleteSharedTrip()

> **deleteSharedTrip**(`req`, `tripId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/social/social.controller.ts:146](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L146)

#### Parameters

##### req

`any`

##### tripId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### getSharedTrip()

> **getSharedTrip**(`req`, `tripId`): `Promise`\<`any`\>

Defined in: [src/social/social.controller.ts:152](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L152)

#### Parameters

##### req

`any`

##### tripId

`string`

#### Returns

`Promise`\<`any`\>

***

### getUserSharedTrips()

> **getUserSharedTrips**(`userId`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/social/social.controller.ts:165](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L165)

Get user's shared trips with pagination

#### Parameters

##### userId

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

### getSocialFeed()

> **getSocialFeed**(`req`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/social/social.controller.ts:191](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L191)

Get social feed with pagination

#### Parameters

##### req

`any`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### likeSharedTrip()

> **likeSharedTrip**(`req`, `tripId`): `Promise`\<\{ `message`: `string`; `likesCount`: `number`; \}\>

Defined in: [src/social/social.controller.ts:209](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L209)

#### Parameters

##### req

`any`

##### tripId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `likesCount`: `number`; \}\>

***

### getMapMemories()

> **getMapMemories**(`req`): `Promise`\<`any`\>

Defined in: [src/social/social.controller.ts:215](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.controller.ts#L215)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<`any`\>
