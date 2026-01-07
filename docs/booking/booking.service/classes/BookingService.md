[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [booking/booking.service](../README.md) / BookingService

# Class: BookingService

Defined in: [src/booking/booking.service.ts:28](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L28)

Booking Service
Handles flight booking operations, offers search, booking confirmation, and booking management

## Constructors

### Constructor

> **new BookingService**(`bookingModel`, `notificationsService`, `rewardsService`, `userService`, `commissionService`, `emailService`): `BookingService`

Defined in: [src/booking/booking.service.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L31)

#### Parameters

##### bookingModel

`Model`\<`Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`\>

##### notificationsService

[`NotificationsService`](../../../notifications/notifications.service/classes/NotificationsService.md)

##### rewardsService

[`RewardsService`](../../../rewards/rewards.service/classes/RewardsService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### commissionService

[`CommissionService`](../../../commission/commission.service/classes/CommissionService.md)

##### emailService

[`EmailService`](../../../auth/email.service/classes/EmailService.md)

#### Returns

`BookingService`

## Methods

### ~~searchOffers()~~

> **searchOffers**(`query`): `Promise`\<`object`[] \| `object`[]\>

Defined in: [src/booking/booking.service.ts:52](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L52)

Search for flight/hotel offers
Returns mock offer data for testing/development purposes.
For production flight search, use the CatalogService endpoints:
- GET /catalog/recommended (personalized flights)
- GET /catalog/explore (explore offers)

#### Parameters

##### query

Search parameters (destination, dates, type)

###### destination?

`string`

###### dates?

`string`

###### type?

`string`

#### Returns

`Promise`\<`object`[] \| `object`[]\>

Array of mock offers with realistic structure

#### Deprecated

Consider using CatalogService for real flight search in production

***

### ~~compare()~~

> **compare**(`offer_id`): `Promise`\<\{ `offer_id`: `string`; `breakdown`: \{ `base_price`: `number`; `taxes`: `number`; `baggage_fees`: `number`; `service_fees`: `number`; `currency`: `string`; \}; `total`: `number`; `savings`: `null`; `notes`: `string`; \}\>

Defined in: [src/booking/booking.service.ts:129](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L129)

Compare offer prices (breakdown of costs)
Returns mock price breakdown for testing/development purposes.
In production, this should fetch actual pricing from the offer provider.

#### Parameters

##### offer\_id

`string`

Offer identifier

#### Returns

`Promise`\<\{ `offer_id`: `string`; `breakdown`: \{ `base_price`: `number`; `taxes`: `number`; `baggage_fees`: `number`; `service_fees`: `number`; `currency`: `string`; \}; `total`: `number`; `savings`: `null`; `notes`: `string`; \}\>

Detailed price breakdown with base price, taxes, fees, and total

#### Deprecated

Consider integrating with actual offer provider for real pricing

***

### confirm()

> **confirm**(`userId`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.service.ts:173](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L173)

Confirm and create a booking
Awards points, sends notification, and creates booking record

#### Parameters

##### userId

`string`

User ID making the booking

##### dto

[`ConfirmBookingDto`](../../booking.dto/classes/ConfirmBookingDto.md)

Booking confirmation data

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Created booking document

#### Throws

BadRequestException if user already has confirmed booking for this offer

***

### ~~history()~~

> **history**(`userId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>[]\>

Defined in: [src/booking/booking.service.ts:352](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L352)

Get booking history (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>[]\>

#### Deprecated

Use historyPaginated instead for better performance

***

### historyPaginated()

> **historyPaginated**(`userId`, `page`, `limit`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/booking/booking.service.ts:367](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L367)

Get paginated booking history

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

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated booking results

***

### create()

> **create**(`userId`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.service.ts:384](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L384)

#### Parameters

##### userId

`string`

##### dto

[`CreateBookingDto`](../../booking.dto/classes/CreateBookingDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### findOne()

> **findOne**(`userId`, `bookingId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.service.ts:401](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L401)

#### Parameters

##### userId

`string`

##### bookingId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### update()

> **update**(`userId`, `bookingId`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.service.ts:414](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L414)

#### Parameters

##### userId

`string`

##### bookingId

`string`

##### dto

[`UpdateBookingDto`](../../booking.dto/classes/UpdateBookingDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### cancel()

> **cancel**(`userId`, `bookingId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/booking/booking.service.ts:513](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L513)

#### Parameters

##### userId

`string`

##### bookingId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object` & `Required`\<\{ \}\>\>

***

### requestRebooking()

> **requestRebooking**(`userId`, `bookingId`): `Promise`\<\{ `message`: `string`; `booking`: \{ `id`: `string`; `confirmation_number`: `string`; `destination`: `string`; `status`: `CANCELLED`; \}; \}\>

Defined in: [src/booking/booking.service.ts:625](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L625)

Request to rebook a cancelled booking
Sends emails to customer support and user

#### Parameters

##### userId

`string`

##### bookingId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `booking`: \{ `id`: `string`; `confirmation_number`: `string`; `destination`: `string`; `status`: `CANCELLED`; \}; \}\>

***

### delete()

> **delete**(`userId`, `bookingId`): `Promise`\<`void`\>

Defined in: [src/booking/booking.service.ts:718](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.service.ts#L718)

#### Parameters

##### userId

`string`

##### bookingId

`string`

#### Returns

`Promise`\<`void`\>
