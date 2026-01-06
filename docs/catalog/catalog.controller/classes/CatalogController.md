[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [catalog/catalog.controller](../README.md) / CatalogController

# Class: CatalogController

Defined in: [src/catalog/catalog.controller.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L17)

Catalog Controller
Handles flight catalog, recommended flights, explore offers, activities, and hotels

## Constructors

### Constructor

> **new CatalogController**(`catalogService`, `hotelsService`, `amadeusService`): `CatalogController`

Defined in: [src/catalog/catalog.controller.ts:18](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L18)

#### Parameters

##### catalogService

[`CatalogService`](../../catalog.service/classes/CatalogService.md)

##### hotelsService

[`HotelsService`](../../hotels.service/classes/HotelsService.md)

##### amadeusService

[`AmadeusService`](../../amadeus.service/classes/AmadeusService.md)

#### Returns

`CatalogController`

## Methods

### getRecommended()

> **getRecommended**(`req`, `query`): `Promise`\<`any`\>

Defined in: [src/catalog/catalog.controller.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L31)

Get personalized recommended flights for the authenticated user

#### Parameters

##### req

`any`

##### query

[`RecommendedQueryDto`](../../dto/flight-search.dto/interfaces/RecommendedQueryDto.md)

#### Returns

`Promise`\<`any`\>

Array of recommended flight offers

#### Query

RecommendedQueryDto - Flight search parameters (origin, destination, dates, etc.)

***

### getExplore()

> **getExplore**(`query`): `Promise`\<\{ \}\>

Defined in: [src/catalog/catalog.controller.ts:49](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L49)

Explore flight offers based on search criteria

#### Parameters

##### query

[`ExploreSearchDto`](../../dto/explore-search.dto/interfaces/ExploreSearchDto.md)

#### Returns

`Promise`\<\{ \}\>

Array of flight offers matching the criteria

#### Query

ExploreSearchDto - Explore search parameters (origin, destination, dates, budget)

***

### getActivities()

> **getActivities**(`query`): `Promise`\<[`ActivityFeedResponse`](../../activities.service/interfaces/ActivityFeedResponse.md)\>

Defined in: [src/catalog/catalog.controller.ts:66](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L66)

Get activities feed for a specific city

#### Parameters

##### query

[`ActivitySearchDto`](../../dto/activity-search.dto/interfaces/ActivitySearchDto.md)

#### Returns

`Promise`\<[`ActivityFeedResponse`](../../activities.service/interfaces/ActivityFeedResponse.md)\>

ActivityFeedResponse with activities matching the criteria

#### Query

ActivitySearchDto - Activity search parameters (city, themes, limit, radius)

***

### searchHotels()

> **searchHotels**(`cityCode?`, `cityName?`, `checkInDate?`, `checkOutDate?`, `adults?`, `tripType?`, `accommodationType?`, `ratings?`, `limit?`, `currency?`): `Promise`\<[`HotelSearchResponse`](../../dto/hotel-search.dto/interfaces/HotelSearchResponse.md)\>

Defined in: [src/catalog/catalog.controller.ts:99](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L99)

Search for hotels by city

#### Parameters

##### cityCode?

`string`

##### cityName?

`string`

##### checkInDate?

`string`

##### checkOutDate?

`string`

##### adults?

`string`

##### tripType?

[`TripType`](../../dto/hotel-search.dto/type-aliases/TripType.md)

##### accommodationType?

`string`

##### ratings?

`string`

##### limit?

`string`

##### currency?

`string`

#### Returns

`Promise`\<[`HotelSearchResponse`](../../dto/hotel-search.dto/interfaces/HotelSearchResponse.md)\>

HotelSearchResponse with hotels matching criteria

#### Query

cityCode - IATA city code (e.g., 'PAR' for Paris)

#### Query

checkInDate - Check-in date (YYYY-MM-DD)

#### Query

checkOutDate - Check-out date (YYYY-MM-DD)

#### Query

adults - Number of adults (default: 2)

#### Query

tripType - Trip type for smart filtering (business, honeymoon, family, etc.)

#### Query

ratings - Minimum star ratings (comma-separated, e.g., "3,4,5")

#### Query

limit - Maximum results to return

***

### getHotelOffers()

> **getHotelOffers**(`hotelIds`, `checkInDate`, `checkOutDate`, `adults?`, `currency?`): `Promise`\<[`HotelOffersResponse`](../../dto/hotel-search.dto/interfaces/HotelOffersResponse.md)\>

Defined in: [src/catalog/catalog.controller.ts:135](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L135)

Get hotel offers (rooms and prices) for specific hotels

#### Parameters

##### hotelIds

`string`

##### checkInDate

`string`

##### checkOutDate

`string`

##### adults?

`string`

##### currency?

`string`

#### Returns

`Promise`\<[`HotelOffersResponse`](../../dto/hotel-search.dto/interfaces/HotelOffersResponse.md)\>

HotelOffersResponse with available rooms and prices

#### Query

hotelIds - Comma-separated hotel IDs

#### Query

checkInDate - Check-in date (YYYY-MM-DD)

#### Query

checkOutDate - Check-out date (YYYY-MM-DD)

***

### getHotelById()

> **getHotelById**(`hotelId`): `Promise`\<\{ `error`: `string`; `hotelId`: `string`; `hotel?`: `undefined`; `reviews?`: `undefined`; \} \| \{ `error?`: `undefined`; `hotelId?`: `undefined`; `hotel`: [`Hotel`](../../dto/hotel-search.dto/interfaces/Hotel.md); `reviews`: `any`[]; \}\>

Defined in: [src/catalog/catalog.controller.ts:159](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L159)

Get detailed information for a specific hotel

#### Parameters

##### hotelId

`string`

Hotel ID

#### Returns

`Promise`\<\{ `error`: `string`; `hotelId`: `string`; `hotel?`: `undefined`; `reviews?`: `undefined`; \} \| \{ `error?`: `undefined`; `hotelId?`: `undefined`; `hotel`: [`Hotel`](../../dto/hotel-search.dto/interfaces/Hotel.md); `reviews`: `any`[]; \}\>

Hotel details with reviews (if available)

***

### getHotelReviews()

> **getHotelReviews**(`placeId`): `Promise`\<\{ `reviews`: `never`[]; `message`: `string`; \} \| \{ `message?`: `undefined`; `reviews`: `any`[]; \}\>

Defined in: [src/catalog/catalog.controller.ts:188](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L188)

Get reviews for a hotel using Google Place ID

#### Parameters

##### placeId

`string`

Google Place ID

#### Returns

`Promise`\<\{ `reviews`: `never`[]; `message`: `string`; \} \| \{ `message?`: `undefined`; `reviews`: `any`[]; \}\>

Array of reviews

***

### getAmadeusHealth()

> **getAmadeusHealth**(): `Promise`\<\{ `status`: `string`; `details`: `any`; \}\>

Defined in: [src/catalog/catalog.controller.ts:215](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L215)

Health check for Amadeus API service

#### Returns

`Promise`\<\{ `status`: `string`; `details`: `any`; \}\>

Health status and circuit breaker information

***

### resetCircuitBreaker()

> **resetCircuitBreaker**(): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/catalog/catalog.controller.ts:223](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L223)

Reset Amadeus circuit breaker (admin use)

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### clearFlightCache()

> **clearFlightCache**(): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/catalog/catalog.controller.ts:232](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L232)

Clear Amadeus flight cache (admin use)

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### getAmadeusStats()

> **getAmadeusStats**(): `Promise`\<\{ `health`: \{ `status`: `string`; `details`: `any`; \}; `circuitStatus`: \{ `state`: [`CircuitState`](../../amadeus.service/enumerations/CircuitState.md); `failureCount`: `number`; `lastFailureTime`: `number`; `nextAttemptTime`: `number`; `queueLength`: `number`; `rateLimitCooldown`: `number`; \}; `cacheStats`: \{ `totalEntries`: `number`; `validEntries`: `number`; `expiredEntries`: `number`; `cacheDuration`: `number`; `errorCacheDuration`: `number`; \}; `timestamp`: `string`; \}\>

Defined in: [src/catalog/catalog.controller.ts:241](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/catalog.controller.ts#L241)

Get detailed Amadeus service statistics

#### Returns

`Promise`\<\{ `health`: \{ `status`: `string`; `details`: `any`; \}; `circuitStatus`: \{ `state`: [`CircuitState`](../../amadeus.service/enumerations/CircuitState.md); `failureCount`: `number`; `lastFailureTime`: `number`; `nextAttemptTime`: `number`; `queueLength`: `number`; `rateLimitCooldown`: `number`; \}; `cacheStats`: \{ `totalEntries`: `number`; `validEntries`: `number`; `expiredEntries`: `number`; `cacheDuration`: `number`; `errorCacheDuration`: `number`; \}; `timestamp`: `string`; \}\>
