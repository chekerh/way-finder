[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [catalog/amadeus.service](../README.md) / AmadeusServerError

# Class: AmadeusServerError

Defined in: [src/catalog/amadeus.service.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L21)

## Extends

- `Error`

## Constructors

### Constructor

> **new AmadeusServerError**(`message`, `retryAfter?`): `AmadeusServerError`

Defined in: [src/catalog/amadeus.service.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L22)

#### Parameters

##### message

`string`

##### retryAfter?

`number`

#### Returns

`AmadeusServerError`

#### Overrides

`Error.constructor`

## Properties

### retryAfter?

> `optional` **retryAfter**: `number`

Defined in: [src/catalog/amadeus.service.ts:24](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L24)
