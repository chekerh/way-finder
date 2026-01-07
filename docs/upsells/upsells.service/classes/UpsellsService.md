[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [upsells/upsells.service](../README.md) / UpsellsService

# Class: UpsellsService

Defined in: [src/upsells/upsells.service.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/upsells/upsells.service.ts#L17)

## Constructors

### Constructor

> **new UpsellsService**(): `UpsellsService`

#### Returns

`UpsellsService`

## Methods

### getUpsellProducts()

> **getUpsellProducts**(`destinationId?`, `dates?`): `Promise`\<[`UpsellProduct`](../interfaces/UpsellProduct.md)[]\>

Defined in: [src/upsells/upsells.service.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/upsells/upsells.service.ts#L21)

Get available upsell products for a destination

#### Parameters

##### destinationId?

`string`

##### dates?

`string`

#### Returns

`Promise`\<[`UpsellProduct`](../interfaces/UpsellProduct.md)[]\>
