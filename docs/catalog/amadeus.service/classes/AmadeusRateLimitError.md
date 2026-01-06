[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [catalog/amadeus.service](../README.md) / AmadeusRateLimitError

# Class: AmadeusRateLimitError

Defined in: [src/catalog/amadeus.service.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L11)

## Extends

- `Error`

## Constructors

### Constructor

> **new AmadeusRateLimitError**(`message`, `retryAfter?`): `AmadeusRateLimitError`

Defined in: [src/catalog/amadeus.service.ts:12](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L12)

#### Parameters

##### message

`string`

##### retryAfter?

`number`

#### Returns

`AmadeusRateLimitError`

#### Overrides

`Error.constructor`

## Properties

### retryAfter?

> `optional` **retryAfter**: `number`

Defined in: [src/catalog/amadeus.service.ts:14](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L14)
