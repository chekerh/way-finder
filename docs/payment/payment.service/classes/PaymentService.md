[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [payment/payment.service](../README.md) / PaymentService

# Class: PaymentService

Defined in: [src/payment/payment.service.ts:8](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.service.ts#L8)

## Constructors

### Constructor

> **new PaymentService**(`paymentModel`, `notificationsService`): `PaymentService`

Defined in: [src/payment/payment.service.ts:9](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.service.ts#L9)

#### Parameters

##### paymentModel

`Model`\<`Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`\>

##### notificationsService

[`NotificationsService`](../../../notifications/notifications.service/classes/NotificationsService.md)

#### Returns

`PaymentService`

## Methods

### record()

> **record**(`params`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/payment/payment.service.ts:28](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.service.ts#L28)

Record a payment transaction

#### Parameters

##### params

Payment parameters

###### userId

`string`

User ID

###### amount

`number`

Payment amount

###### payment_method

`string`

Payment method (Stripe, PayPal, etc.)

###### payment_status

`string`

Payment status (success, failed, pending)

###### transaction_id?

`string`

Optional transaction ID (auto-generated if not provided)

###### currency?

`string`

Currency code (default: USD)

###### metadata?

`Record`\<`string`, `any`\>

Additional metadata

###### bookingId?

`string`

Associated booking ID

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>\>

Saved payment document

***

### ~~findByUser()~~

> **findByUser**(`userId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>[]\>

Defined in: [src/payment/payment.service.ts:76](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.service.ts#L76)

Get user payments (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>[]\>

#### Deprecated

Use findByUserPaginated instead for better performance

***

### findByUserPaginated()

> **findByUserPaginated**(`userId`, `page`, `limit`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/payment/payment.service.ts:91](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.service.ts#L91)

Get paginated user payment history

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

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated payment results

***

### findByTransactionId()

> **findByTransactionId**(`transactionId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\> \| `null`\>

Defined in: [src/payment/payment.service.ts:113](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.service.ts#L113)

Find payment by transaction ID

#### Parameters

##### transactionId

`string`

Transaction ID

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\> \| `null`\>

Payment document or null if not found

***

### updateStatus()

> **updateStatus**(`transactionId`, `status`, `metadata?`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\> \| `null`\>

Defined in: [src/payment/payment.service.ts:124](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/payment/payment.service.ts#L124)

Update payment status

#### Parameters

##### transactionId

`string`

Transaction ID

##### status

`string`

New payment status

##### metadata?

`Record`\<`string`, `any`\>

Optional metadata to merge

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Payment`, \{ \}, \{ \}\> & `Payment` & `object` & `object` & `Required`\<\{ \}\> \| `null`\>

Updated payment document or null if not found
