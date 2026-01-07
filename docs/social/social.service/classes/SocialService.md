[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [social/social.service](../README.md) / SocialService

# Class: SocialService

Defined in: [src/social/social.service.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L16)

## Constructors

### Constructor

> **new SocialService**(`userFollowModel`, `sharedTripModel`, `journeyModel`): `SocialService`

Defined in: [src/social/social.service.ts:19](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L19)

#### Parameters

##### userFollowModel

`Model`\<`Document`\<`unknown`, \{ \}, `UserFollow`, \{ \}, \{ \}\> & `UserFollow` & `object` & `object`\>

##### sharedTripModel

`Model`\<`Document`\<`unknown`, \{ \}, `SharedTrip`, \{ \}, \{ \}\> & `SharedTrip` & `object` & `object`\>

##### journeyModel

`Model`\<`Document`\<`unknown`, \{ \}, `Journey`, \{ \}, \{ \}\> & `Journey` & `object` & `object`\>

#### Returns

`SocialService`

## Methods

### followUser()

> **followUser**(`followerId`, `followingId`): `Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

Defined in: [src/social/social.service.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L30)

#### Parameters

##### followerId

`string`

##### followingId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

***

### unfollowUser()

> **unfollowUser**(`followerId`, `followingId`): `Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

Defined in: [src/social/social.service.ts:58](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L58)

#### Parameters

##### followerId

`string`

##### followingId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `following`: `boolean`; \}\>

***

### checkFollowStatus()

> **checkFollowStatus**(`followerId`, `followingId`): `Promise`\<`boolean`\>

Defined in: [src/social/social.service.ts:76](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L76)

#### Parameters

##### followerId

`string`

##### followingId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### ~~getFollowers()~~

> **getFollowers**(`userId`, `limit`, `skip`): `Promise`\<`any`[]\>

Defined in: [src/social/social.service.ts:94](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L94)

Get followers (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### limit

`number` = `50`

##### skip

`number` = `0`

#### Returns

`Promise`\<`any`[]\>

#### Deprecated

Use getFollowersPaginated instead for better performance

***

### getFollowersPaginated()

> **getFollowersPaginated**(`userId`, `page`, `limit`): `Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Defined in: [src/social/social.service.ts:125](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L125)

Get paginated followers

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

`Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Paginated followers results

***

### ~~getFollowing()~~

> **getFollowing**(`userId`, `limit`, `skip`): `Promise`\<`any`[]\>

Defined in: [src/social/social.service.ts:160](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L160)

Get following (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### limit

`number` = `50`

##### skip

`number` = `0`

#### Returns

`Promise`\<`any`[]\>

#### Deprecated

Use getFollowingPaginated instead for better performance

***

### getFollowingPaginated()

> **getFollowingPaginated**(`userId`, `page`, `limit`): `Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Defined in: [src/social/social.service.ts:194](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L194)

Get paginated following

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

`Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Paginated following results

***

### getFollowCounts()

> **getFollowCounts**(`userId`): `Promise`\<\{ `followers`: `number`; `following`: `number`; \}\>

Defined in: [src/social/social.service.ts:225](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L225)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `followers`: `number`; `following`: `number`; \}\>

***

### shareTrip()

> **shareTrip**(`userId`, `shareTripDto`): `Promise`\<`SharedTrip`\>

Defined in: [src/social/social.service.ts:241](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L241)

#### Parameters

##### userId

`string`

##### shareTripDto

[`ShareTripDto`](../../social.dto/classes/ShareTripDto.md)

#### Returns

`Promise`\<`SharedTrip`\>

***

### updateSharedTrip()

> **updateSharedTrip**(`userId`, `tripId`, `updateDto`): `Promise`\<`SharedTrip`\>

Defined in: [src/social/social.service.ts:259](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L259)

#### Parameters

##### userId

`string`

##### tripId

`string`

##### updateDto

[`UpdateSharedTripDto`](../../social.dto/classes/UpdateSharedTripDto.md)

#### Returns

`Promise`\<`SharedTrip`\>

***

### deleteSharedTrip()

> **deleteSharedTrip**(`userId`, `tripId`): `Promise`\<`void`\>

Defined in: [src/social/social.service.ts:282](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L282)

#### Parameters

##### userId

`string`

##### tripId

`string`

#### Returns

`Promise`\<`void`\>

***

### getSharedTrip()

> **getSharedTrip**(`tripId`, `viewerId?`): `Promise`\<`SharedTrip`\>

Defined in: [src/social/social.service.ts:294](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L294)

#### Parameters

##### tripId

`string`

##### viewerId?

`string`

#### Returns

`Promise`\<`SharedTrip`\>

***

### ~~getUserSharedTrips()~~

> **getUserSharedTrips**(`userId`, `limit`, `skip`): `Promise`\<`SharedTrip`[]\>

Defined in: [src/social/social.service.ts:324](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L324)

Get user shared trips (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### limit

`number` = `20`

##### skip

`number` = `0`

#### Returns

`Promise`\<`SharedTrip`[]\>

#### Deprecated

Use getUserSharedTripsPaginated instead for better performance

***

### getUserSharedTripsPaginated()

> **getUserSharedTripsPaginated**(`userId`, `page`, `limit`): `Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Defined in: [src/social/social.service.ts:345](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L345)

Get paginated user shared trips (includes both SharedTrips and Journeys)

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

`Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Paginated shared trips results

***

### ~~getSocialFeed()~~

> **getSocialFeed**(`userId`, `limit`, `skip`): `Promise`\<`SharedTrip`[]\>

Defined in: [src/social/social.service.ts:503](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L503)

Get social feed (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### limit

`number` = `20`

##### skip

`number` = `0`

#### Returns

`Promise`\<`SharedTrip`[]\>

#### Deprecated

Use getSocialFeedPaginated instead for better performance

***

### getSocialFeedPaginated()

> **getSocialFeedPaginated**(`userId`, `page`, `limit`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `SharedTrip`, \{ \}, \{ \}\> & `SharedTrip` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `SharedTrip`, \{ \}, \{ \}\> & `SharedTrip` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/social/social.service.ts:541](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L541)

Get paginated social feed

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

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `SharedTrip`, \{ \}, \{ \}\> & `SharedTrip` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `SharedTrip`, \{ \}, \{ \}\> & `SharedTrip` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated social feed results

***

### likeSharedTrip()

> **likeSharedTrip**(`userId`, `tripId`): `Promise`\<\{ `message`: `string`; `likesCount`: `number`; \}\>

Defined in: [src/social/social.service.ts:575](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L575)

#### Parameters

##### userId

`string`

##### tripId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `likesCount`: `number`; \}\>

***

### getMapMemories()

> **getMapMemories**(`userId`): `Promise`\<`any`\>

Defined in: [src/social/social.service.ts:592](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/social/social.service.ts#L592)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`any`\>
