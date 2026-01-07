[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [catalog/catalog.service](../README.md) / CatalogService

# Class: CatalogService

Defined in: [src/catalog/catalog.service.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L21)

## Constructors

### Constructor

> **new CatalogService**(`amadeus`, `activities`, `userService`, `cacheService`): `CatalogService`

Defined in: [src/catalog/catalog.service.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L27)

#### Parameters

##### amadeus

[`AmadeusService`](../../amadeus.service/classes/AmadeusService.md)

##### activities

[`ActivitiesService`](../../activities.service/classes/ActivitiesService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### cacheService

[`CacheService`](../../../common/cache/cache.service/classes/CacheService.md)

#### Returns

`CatalogService`

## Methods

### getRecommendedFlights()

> **getRecommendedFlights**(`userId`, `overrides`): `Promise`\<`any`\>

Defined in: [src/catalog/catalog.service.ts:81](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L81)

#### Parameters

##### userId

`string`

##### overrides

[`RecommendedQueryDto`](../../dto/flight-search.dto/interfaces/RecommendedQueryDto.md)

#### Returns

`Promise`\<`any`\>

***

### getExploreOffers()

> **getExploreOffers**(`params`): `Promise`\<\{ \}\>

Defined in: [src/catalog/catalog.service.ts:366](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L366)

#### Parameters

##### params

[`ExploreSearchDto`](../../dto/explore-search.dto/interfaces/ExploreSearchDto.md)

#### Returns

`Promise`\<\{ \}\>

***

### getActivitiesFeed()

> **getActivitiesFeed**(`params`): `Promise`\<[`ActivityFeedResponse`](../../activities.service/interfaces/ActivityFeedResponse.md)\>

Defined in: [src/catalog/catalog.service.ts:416](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L416)

#### Parameters

##### params

[`ActivitySearchDto`](../../dto/activity-search.dto/interfaces/ActivitySearchDto.md)

#### Returns

`Promise`\<[`ActivityFeedResponse`](../../activities.service/interfaces/ActivityFeedResponse.md)\>

***

### searchHotels()

> **searchHotels**(`params`): `Promise`\<\{ \}\>

Defined in: [src/catalog/catalog.service.ts:701](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L701)

#### Parameters

##### params

###### cityCode

`string`

###### checkInDate

`string`

###### checkOutDate

`string`

###### adults?

`number`

###### tripType?

`string`

###### ratings?

`string`

###### limit?

`number`

###### currency?

`string`

#### Returns

`Promise`\<\{ \}\>

***

### getHotelOffers()

> **getHotelOffers**(`params`): `Promise`\<\{ `data`: `object`[]; `meta`: \{ `count`: `number`; \}; \}\>

Defined in: [src/catalog/catalog.service.ts:862](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L862)

#### Parameters

##### params

###### hotelIds

`string`[]

###### checkInDate

`string`

###### checkOutDate

`string`

###### adults?

`number`

###### currency?

`string`

#### Returns

`Promise`\<\{ `data`: `object`[]; `meta`: \{ `count`: `number`; \}; \}\>

***

### getHotelById()

> **getHotelById**(`hotelId`): `Promise`\<\{ `hotel`: \{ `id`: `string`; `hotelId`: `string`; `name`: `string`; `rating`: `number`; `description`: `string`; \}; `reviews`: `never`[]; `error`: `null`; \}\>

Defined in: [src/catalog/catalog.service.ts:882](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L882)

#### Parameters

##### hotelId

`string`

#### Returns

`Promise`\<\{ `hotel`: \{ `id`: `string`; `hotelId`: `string`; `name`: `string`; `rating`: `number`; `description`: `string`; \}; `reviews`: `never`[]; `error`: `null`; \}\>

***

### getHotelReviews()

> **getHotelReviews**(`hotelId`, `placeId?`): `Promise`\<\{ `reviews`: `never`[]; `message`: `null`; \}\>

Defined in: [src/catalog/catalog.service.ts:896](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.service.ts#L896)

#### Parameters

##### hotelId

`string`

##### placeId?

`string`

#### Returns

`Promise`\<\{ `reviews`: `never`[]; `message`: `null`; \}\>
