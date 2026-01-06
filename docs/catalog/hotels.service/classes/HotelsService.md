[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [catalog/hotels.service](../README.md) / HotelsService

# Class: HotelsService

Defined in: [src/catalog/hotels.service.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L26)

Hotels Service
Integrates with Amadeus Hotel Search API for real hotel data
Falls back to curated mock data when API is unavailable

## Constructors

### Constructor

> **new HotelsService**(`http`, `cacheService`): `HotelsService`

Defined in: [src/catalog/hotels.service.ts:37](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L37)

#### Parameters

##### http

`HttpService`

##### cacheService

[`CacheService`](../../../common/cache/cache.service/classes/CacheService.md)

#### Returns

`HotelsService`

## Methods

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/catalog/hotels.service.ts:45](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L45)

Check if Amadeus credentials are configured

#### Returns

`boolean`

***

### searchHotels()

> **searchHotels**(`params`): `Promise`\<[`HotelSearchResponse`](../../dto/hotel-search.dto/interfaces/HotelSearchResponse.md)\>

Defined in: [src/catalog/hotels.service.ts:165](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L165)

Search for hotels by city
Uses Amadeus Hotel List API to find hotels in a city

#### Parameters

##### params

[`HotelSearchDto`](../../dto/hotel-search.dto/interfaces/HotelSearchDto.md)

#### Returns

`Promise`\<[`HotelSearchResponse`](../../dto/hotel-search.dto/interfaces/HotelSearchResponse.md)\>

***

### getHotelOffers()

> **getHotelOffers**(`hotelIds`, `checkInDate`, `checkOutDate`, `adults`, `currency`): `Promise`\<[`HotelOffersResponse`](../../dto/hotel-search.dto/interfaces/HotelOffersResponse.md)\>

Defined in: [src/catalog/hotels.service.ts:354](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L354)

Get hotel offers (rooms and prices) for specific hotels
Uses Amadeus Hotel Offers API

#### Parameters

##### hotelIds

`string`[]

##### checkInDate

`string`

##### checkOutDate

`string`

##### adults

`number` = `2`

##### currency

`string` = `'EUR'`

#### Returns

`Promise`\<[`HotelOffersResponse`](../../dto/hotel-search.dto/interfaces/HotelOffersResponse.md)\>

***

### getHotelById()

> **getHotelById**(`hotelId`): `Promise`\<[`Hotel`](../../dto/hotel-search.dto/interfaces/Hotel.md) \| `null`\>

Defined in: [src/catalog/hotels.service.ts:411](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L411)

Get detailed information for a single hotel

#### Parameters

##### hotelId

`string`

#### Returns

`Promise`\<[`Hotel`](../../dto/hotel-search.dto/interfaces/Hotel.md) \| `null`\>

***

### enrichWithImages()

> **enrichWithImages**(`hotel`, `cityCode`): `Promise`\<[`Hotel`](../../dto/hotel-search.dto/interfaces/Hotel.md)\>

Defined in: [src/catalog/hotels.service.ts:433](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L433)

Enrich hotel with images from free APIs (Pixabay, Unsplash)

#### Parameters

##### hotel

[`Hotel`](../../dto/hotel-search.dto/interfaces/Hotel.md)

##### cityCode

`string`

#### Returns

`Promise`\<[`Hotel`](../../dto/hotel-search.dto/interfaces/Hotel.md)\>

***

### getHotelReviews()

> **getHotelReviews**(`placeId`): `Promise`\<`any`[]\>

Defined in: [src/catalog/hotels.service.ts:511](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/hotels.service.ts#L511)

Get reviews for a hotel (placeholder - can be extended with other review sources)

#### Parameters

##### placeId

`string`

#### Returns

`Promise`\<`any`[]\>
