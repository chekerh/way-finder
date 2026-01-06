[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [payment/payment.controller](../README.md) / PaymentController

# Class: PaymentController

Defined in: [src/payment/payment.controller.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.controller.ts#L26)

Payment Controller
Handles payment processing, payment history, and PayPal integration

## Constructors

### Constructor

> **new PaymentController**(`paymentService`, `paypalService`): `PaymentController`

Defined in: [src/payment/payment.controller.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.controller.ts#L27)

#### Parameters

##### paymentService

[`PaymentService`](../../payment.service/classes/PaymentService.md)

##### paypalService

[`PaypalService`](../../paypal.service/classes/PaypalService.md)

#### Returns

`PaymentController`

## Methods

### history()

> **history**(`req`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>\>\>

Defined in: [src/payment/payment.controller.ts:39](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.controller.ts#L39)

Get user payment history with pagination

#### Parameters

##### req

`any`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### record()

> **record**(`req`, `body`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/payment/payment.controller.ts:59](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.controller.ts#L59)

Record a payment transaction manually
Useful for testing or recording payments from external systems

#### Parameters

##### req

`any`

##### body

`any`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>\>

Saved payment document with notification sent

#### Body

amount - Payment amount

#### Body

payment_method - Payment method (Stripe, PayPal, etc.)

#### Body

payment_status - Payment status (success, failed, pending)

***

### createPaypalOrder()

> **createPaypalOrder**(`req`, `dto`): `Promise`\<\{ `orderId`: `any`; `status`: `any`; `approvalUrl`: `string` \| `undefined`; `purchaseUnits`: `any`; \}\>

Defined in: [src/payment/payment.controller.ts:77](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.controller.ts#L77)

Create a PayPal order for payment
Rate limited: 10 requests per minute to prevent abuse

#### Parameters

##### req

`any`

##### dto

[`CreatePaypalOrderDto`](../../dto/paypal-order.dto/classes/CreatePaypalOrderDto.md)

#### Returns

`Promise`\<\{ `orderId`: `any`; `status`: `any`; `approvalUrl`: `string` \| `undefined`; `purchaseUnits`: `any`; \}\>

PayPal order details with approval URL

#### Body

CreatePaypalOrderDto - PayPal order creation data (amount, currency, bookingId, etc.)

***

### capturePaypalOrder()

> **capturePaypalOrder**(`orderId`, `body?`): `Promise`\<`any`\>

Defined in: [src/payment/payment.controller.ts:119](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.controller.ts#L119)

Capture a PayPal order payment
Rate limited: 5 requests per minute to prevent abuse

#### Parameters

##### orderId

`string`

##### body?

###### bookingId?

`string`

#### Returns

`Promise`\<`any`\>

***

### getPaypalOrder()

> **getPaypalOrder**(`orderId`): `Promise`\<`any`\>

Defined in: [src/payment/payment.controller.ts:148](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.controller.ts#L148)

Get PayPal order status

#### Parameters

##### orderId

`string`

PayPal order ID

#### Returns

`Promise`\<`any`\>

PayPal order status and details
