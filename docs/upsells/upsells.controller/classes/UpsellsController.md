[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [upsells/upsells.controller](../README.md) / UpsellsController

# Class: UpsellsController

Defined in: [src/upsells/upsells.controller.ts:7](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/upsells/upsells.controller.ts#L7)

## Constructors

### Constructor

> **new UpsellsController**(`upsellsService`): `UpsellsController`

Defined in: [src/upsells/upsells.controller.ts:8](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/upsells/upsells.controller.ts#L8)

#### Parameters

##### upsellsService

[`UpsellsService`](../../upsells.service/classes/UpsellsService.md)

#### Returns

`UpsellsController`

## Methods

### getProducts()

> **getProducts**(`destinationId?`, `dates?`): `Promise`\<\{ `products`: [`UpsellProduct`](../../upsells.service/interfaces/UpsellProduct.md)[]; `destination`: `string` \| `undefined`; `dates`: `string` \| `undefined`; \}\>

Defined in: [src/upsells/upsells.controller.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/upsells/upsells.controller.ts#L11)

#### Parameters

##### destinationId?

`string`

##### dates?

`string`

#### Returns

`Promise`\<\{ `products`: [`UpsellProduct`](../../upsells.service/interfaces/UpsellProduct.md)[]; `destination`: `string` \| `undefined`; `dates`: `string` \| `undefined`; \}\>
