[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [booking/booking.controller](../README.md) / BookingController

# Class: BookingController

Defined in: [src/booking/booking.controller.ts:34](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L34)

Booking Controller
Handles flight and hotel booking operations, offers search, and booking management

## Constructors

### Constructor

> **new BookingController**(`bookingService`): `BookingController`

Defined in: [src/booking/booking.controller.ts:35](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L35)

#### Parameters

##### bookingService

[`BookingService`](../../booking.service/classes/BookingService.md)

#### Returns

`BookingController`

## Methods

### ~~offers()~~

> **offers**(`query`): `Promise`\<`object`[] \| `object`[]\>

Defined in: [src/booking/booking.controller.ts:46](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L46)

Search for flight/hotel offers (mock data)

#### Parameters

##### query

`any`

#### Returns

`Promise`\<`object`[] \| `object`[]\>

Array of mock offers

#### Query

destination - Destination location

#### Query

dates - Travel dates

#### Query

type - Offer type (flight/hotel)

#### Deprecated

Consider using /catalog/recommended or /catalog/explore for real flight search

***

### compare()

> **compare**(`offer_id`): `Promise`\<\{ `offer_id`: `string`; `breakdown`: \{ `base_price`: `number`; `taxes`: `number`; `baggage_fees`: `number`; `service_fees`: `number`; `currency`: `string`; \}; `total`: `number`; `savings`: `null`; `notes`: `string`; \}\>

Defined in: [src/booking/booking.controller.ts:56](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L56)

Compare offer prices and get detailed breakdown

#### Parameters

##### offer\_id

`string`

#### Returns

`Promise`\<\{ `offer_id`: `string`; `breakdown`: \{ `base_price`: `number`; `taxes`: `number`; `baggage_fees`: `number`; `service_fees`: `number`; `currency`: `string`; \}; `total`: `number`; `savings`: `null`; `notes`: `string`; \}\>

Price breakdown with base price, taxes, fees, and total

#### Query

offer_id - Offer identifier

***

### confirm()

> **confirm**(`req`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.controller.ts:74](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L74)

Confirm a booking
Rate limited: 30 requests per minute to allow normal usage while preventing abuse

#### Parameters

##### req

`any`

##### dto

[`ConfirmBookingDto`](../../booking.dto/classes/ConfirmBookingDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### history()

> **history**(`req`, `pagination`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>\>

Defined in: [src/booking/booking.controller.ts:85](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L85)

Get booking history with pagination

#### Parameters

##### req

`any`

##### pagination

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### list()

> **list**(`req`, `pagination`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>\>

Defined in: [src/booking/booking.controller.ts:102](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L102)

List bookings with pagination (alias for history)

#### Parameters

##### req

`any`

##### pagination

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### findOne()

> **findOne**(`req`, `id`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.controller.ts:114](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L114)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### create()

> **create**(`req`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.controller.ts:120](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L120)

#### Parameters

##### req

`any`

##### dto

[`CreateBookingDto`](../../booking.dto/classes/CreateBookingDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### update()

> **update**(`req`, `id`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.controller.ts:126](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L126)

#### Parameters

##### req

`any`

##### id

`string`

##### dto

[`UpdateBookingDto`](../../booking.dto/classes/UpdateBookingDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### cancel()

> **cancel**(`req`, `id`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.controller.ts:136](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L136)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### requestRebooking()

> **requestRebooking**(`req`, `id`): `Promise`\<\{ `message`: `string`; `booking`: \{ `id`: `string`; `confirmation_number`: `string`; `destination`: `string`; `status`: `CANCELLED`; \}; \}\>

Defined in: [src/booking/booking.controller.ts:146](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L146)

Request to rebook a cancelled booking
Sends emails to customer support and user

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `booking`: \{ `id`: `string`; `confirmation_number`: `string`; `destination`: `string`; `status`: `CANCELLED`; \}; \}\>

***

### delete()

> **delete**(`req`, `id`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/booking/booking.controller.ts:152](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.controller.ts#L152)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>
