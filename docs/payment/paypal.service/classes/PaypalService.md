[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [payment/paypal.service](../README.md) / PaypalService

# Class: PaypalService

Defined in: [src/payment/paypal.service.ts:18](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/paypal.service.ts#L18)

## Constructors

### Constructor

> **new PaypalService**(`http`): `PaypalService`

Defined in: [src/payment/paypal.service.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/paypal.service.ts#L23)

#### Parameters

##### http

`HttpService`

#### Returns

`PaypalService`

## Methods

### createOrder()

> **createOrder**(`dto`, `userId`): `Promise`\<`any`\>

Defined in: [src/payment/paypal.service.ts:98](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/paypal.service.ts#L98)

#### Parameters

##### dto

[`CreatePaypalOrderDto`](../../dto/paypal-order.dto/classes/CreatePaypalOrderDto.md)

##### userId

`string`

#### Returns

`Promise`\<`any`\>

***

### captureOrder()

> **captureOrder**(`orderId`): `Promise`\<`any`\>

Defined in: [src/payment/paypal.service.ts:153](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/paypal.service.ts#L153)

#### Parameters

##### orderId

`string`

#### Returns

`Promise`\<`any`\>

***

### getOrder()

> **getOrder**(`orderId`): `Promise`\<`any`\>

Defined in: [src/payment/paypal.service.ts:160](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/paypal.service.ts#L160)

#### Parameters

##### orderId

`string`

#### Returns

`Promise`\<`any`\>

***

### getApprovalLink()

> **getApprovalLink**(`order`): `string` \| `undefined`

Defined in: [src/payment/paypal.service.ts:167](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/paypal.service.ts#L167)

#### Parameters

##### order

`any`

#### Returns

`string` \| `undefined`
