[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [commission/commission.controller](../README.md) / CommissionController

# Class: CommissionController

Defined in: [src/commission/commission.controller.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.controller.ts#L16)

## Constructors

### Constructor

> **new CommissionController**(`commissionService`): `CommissionController`

Defined in: [src/commission/commission.controller.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.controller.ts#L17)

#### Parameters

##### commissionService

[`CommissionService`](../../commission.service/classes/CommissionService.md)

#### Returns

`CommissionController`

## Methods

### getBookingCommissions()

> **getBookingCommissions**(`bookingId`): `Promise`\<`CommissionDocument`[]\>

Defined in: [src/commission/commission.controller.ts:20](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.controller.ts#L20)

#### Parameters

##### bookingId

`string`

#### Returns

`Promise`\<`CommissionDocument`[]\>

***

### getBookingTotalCommission()

> **getBookingTotalCommission**(`bookingId`): `Promise`\<\{ `total`: `number`; \}\>

Defined in: [src/commission/commission.controller.ts:25](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.controller.ts#L25)

#### Parameters

##### bookingId

`string`

#### Returns

`Promise`\<\{ `total`: `number`; \}\>

***

### getUserCommissions()

> **getUserCommissions**(`user`, `status?`): `Promise`\<`CommissionDocument`[]\>

Defined in: [src/commission/commission.controller.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.controller.ts#L31)

#### Parameters

##### user

`any`

##### status?

`string`

#### Returns

`Promise`\<`CommissionDocument`[]\>

***

### updateCommissionStatus()

> **updateCommissionStatus**(`id`, `status`): `Promise`\<`CommissionDocument` \| `null`\>

Defined in: [src/commission/commission.controller.ts:39](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.controller.ts#L39)

#### Parameters

##### id

`string`

##### status

`"pending"` | `"confirmed"` | `"paid"` | `"cancelled"`

#### Returns

`Promise`\<`CommissionDocument` \| `null`\>
