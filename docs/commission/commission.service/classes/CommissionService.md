[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [commission/commission.service](../README.md) / CommissionService

# Class: CommissionService

Defined in: [src/commission/commission.service.ts:14](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L14)

## Constructors

### Constructor

> **new CommissionService**(`commissionModel`): `CommissionService`

Defined in: [src/commission/commission.service.ts:15](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L15)

#### Parameters

##### commissionModel

`Model`\<`CommissionDocument`\>

#### Returns

`CommissionService`

## Methods

### calculateCommission()

> **calculateCommission**(`basePrice`, `productType`, `upsellCategory?`): [`CommissionCalculation`](../interfaces/CommissionCalculation.md)

Defined in: [src/commission/commission.service.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L23)

Calculate commission for different product types

#### Parameters

##### basePrice

`number`

##### productType

`"flight"` | `"accommodation"` | `"upsell"`

##### upsellCategory?

`string`

#### Returns

[`CommissionCalculation`](../interfaces/CommissionCalculation.md)

***

### createCommissions()

> **createCommissions**(`bookingId`, `userId`, `items`): `Promise`\<`CommissionDocument`[]\>

Defined in: [src/commission/commission.service.ts:77](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L77)

Create commission records for a booking

#### Parameters

##### bookingId

`string`

##### userId

`string`

##### items

`object`[]

#### Returns

`Promise`\<`CommissionDocument`[]\>

***

### getCommissionsByBookingId()

> **getCommissionsByBookingId**(`bookingId`): `Promise`\<`CommissionDocument`[]\>

Defined in: [src/commission/commission.service.ts:116](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L116)

Get commissions for a booking

#### Parameters

##### bookingId

`string`

#### Returns

`Promise`\<`CommissionDocument`[]\>

***

### getTotalCommission()

> **getTotalCommission**(`bookingId`): `Promise`\<`number`\>

Defined in: [src/commission/commission.service.ts:125](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L125)

Get total commission for a booking

#### Parameters

##### bookingId

`string`

#### Returns

`Promise`\<`number`\>

***

### updateCommissionStatus()

> **updateCommissionStatus**(`commissionId`, `status`): `Promise`\<`CommissionDocument` \| `null`\>

Defined in: [src/commission/commission.service.ts:136](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L136)

Update commission status

#### Parameters

##### commissionId

`string`

##### status

`"pending"` | `"confirmed"` | `"paid"` | `"cancelled"`

#### Returns

`Promise`\<`CommissionDocument` \| `null`\>

***

### confirmCommissions()

> **confirmCommissions**(`bookingId`): `Promise`\<`void`\>

Defined in: [src/commission/commission.service.ts:152](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L152)

Mark all commissions for a booking as confirmed

#### Parameters

##### bookingId

`string`

#### Returns

`Promise`\<`void`\>

***

### getUserCommissions()

> **getUserCommissions**(`userId`, `status?`): `Promise`\<`CommissionDocument`[]\>

Defined in: [src/commission/commission.service.ts:161](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/commission/commission.service.ts#L161)

Get user's total commissions

#### Parameters

##### userId

`string`

##### status?

`string`

#### Returns

`Promise`\<`CommissionDocument`[]\>
