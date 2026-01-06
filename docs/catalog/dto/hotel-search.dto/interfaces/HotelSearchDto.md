[**WayFinder Backend API Documentation v0.0.1**](../../../../README.md)

***

[WayFinder Backend API Documentation](../../../../README.md) / [catalog/dto/hotel-search.dto](../README.md) / HotelSearchDto

# Interface: HotelSearchDto

Defined in: [src/catalog/dto/hotel-search.dto.ts:5](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L5)

Hotel Search DTOs for Amadeus Hotel API integration

## Properties

### cityCode?

> `optional` **cityCode**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:7](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L7)

City code (e.g., 'PAR' for Paris) or city name (e.g., 'New York')

***

### cityName?

> `optional` **cityName**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:9](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L9)

City name (e.g., 'New York', 'Paris') - used if cityCode is not provided

***

### checkInDate

> **checkInDate**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L11)

Check-in date (YYYY-MM-DD)

***

### checkOutDate

> **checkOutDate**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L13)

Check-out date (YYYY-MM-DD)

***

### adults?

> `optional` **adults**: `number`

Defined in: [src/catalog/dto/hotel-search.dto.ts:15](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L15)

Number of adults

***

### roomQuantity?

> `optional` **roomQuantity**: `number`

Defined in: [src/catalog/dto/hotel-search.dto.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L17)

Number of rooms needed

***

### currency?

> `optional` **currency**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:19](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L19)

Currency code (e.g., 'EUR', 'USD')

***

### ratings?

> `optional` **ratings**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L21)

Minimum star rating (1-5)

***

### priceRange?

> `optional` **priceRange**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L23)

Maximum price per night

***

### amenities?

> `optional` **amenities**: `string`[]

Defined in: [src/catalog/dto/hotel-search.dto.ts:25](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L25)

Hotel amenities filter

***

### limit?

> `optional` **limit**: `number`

Defined in: [src/catalog/dto/hotel-search.dto.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L27)

Maximum results to return

***

### tripType?

> `optional` **tripType**: [`TripType`](../type-aliases/TripType.md)

Defined in: [src/catalog/dto/hotel-search.dto.ts:29](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L29)

Trip type for smart filtering

***

### accommodationType?

> `optional` **accommodationType**: `string`

Defined in: [src/catalog/dto/hotel-search.dto.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/dto/hotel-search.dto.ts#L31)

Accommodation type filter (hotel, airbnb, hostel, resort, apartment)
