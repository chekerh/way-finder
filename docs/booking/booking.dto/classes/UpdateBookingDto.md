[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [booking/booking.dto](../README.md) / UpdateBookingDto

# Class: UpdateBookingDto

Defined in: [src/booking/booking.dto.ts:150](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L150)

## Extends

- `Partial`\<[`CreateBookingDto`](CreateBookingDto.md)\>

## Constructors

### Constructor

> **new UpdateBookingDto**(): `UpdateBookingDto`

Defined in: node\_modules/@nestjs/mapped-types/dist/mapped-type.interface.d.ts:3

#### Returns

`UpdateBookingDto`

#### Inherited from

`PartialType(CreateBookingDto).constructor`

### Constructor

> **new UpdateBookingDto**(...`args`): `UpdateBookingDto`

Defined in: node\_modules/@nestjs/mapped-types/dist/mapped-type.interface.d.ts:3

#### Parameters

##### args

...`any`[]

#### Returns

`UpdateBookingDto`

#### Inherited from

`PartialType(CreateBookingDto).constructor`

## Properties

### offer\_id?

> `optional` **offer\_id**: `string`

Defined in: [src/booking/booking.dto.ts:94](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L94)

#### Inherited from

[`ConfirmBookingDto`](ConfirmBookingDto.md).[`offer_id`](ConfirmBookingDto.md#offer_id)

***

### payment\_details?

> `optional` **payment\_details**: `Record`\<`string`, `any`\>

Defined in: [src/booking/booking.dto.ts:98](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L98)

#### Inherited from

[`ConfirmBookingDto`](ConfirmBookingDto.md).[`payment_details`](ConfirmBookingDto.md#payment_details)

***

### total\_price?

> `optional` **total\_price**: `number`

Defined in: [src/booking/booking.dto.ts:103](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L103)

#### Inherited from

[`ConfirmBookingDto`](ConfirmBookingDto.md).[`total_price`](ConfirmBookingDto.md#total_price)

***

### trip\_details?

> `optional` **trip\_details**: [`TripDetailsDto`](TripDetailsDto.md)

Defined in: [src/booking/booking.dto.ts:108](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L108)

#### Inherited from

[`ConfirmBookingDto`](ConfirmBookingDto.md).[`trip_details`](ConfirmBookingDto.md#trip_details)

***

### accommodation?

> `optional` **accommodation**: [`AccommodationDto`](AccommodationDto.md)

Defined in: [src/booking/booking.dto.ts:113](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L113)

#### Inherited from

[`ConfirmBookingDto`](ConfirmBookingDto.md).[`accommodation`](ConfirmBookingDto.md#accommodation)

***

### upsells?

> `optional` **upsells**: [`UpsellItemDto`](UpsellItemDto.md)[]

Defined in: [src/booking/booking.dto.ts:119](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L119)

#### Inherited from

[`ConfirmBookingDto`](ConfirmBookingDto.md).[`upsells`](ConfirmBookingDto.md#upsells)

***

### passengers?

> `optional` **passengers**: [`PassengerDto`](PassengerDto.md)[]

Defined in: [src/booking/booking.dto.ts:143](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L143)

#### Inherited from

[`CreateBookingDto`](CreateBookingDto.md).[`passengers`](CreateBookingDto.md#passengers)

***

### notes?

> `optional` **notes**: `string`

Defined in: [src/booking/booking.dto.ts:147](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L147)

#### Inherited from

[`CreateBookingDto`](CreateBookingDto.md).[`notes`](CreateBookingDto.md#notes)

***

### status?

> `optional` **status**: `BookingStatus`

Defined in: [src/booking/booking.dto.ts:153](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/booking/booking.dto.ts#L153)
