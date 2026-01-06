[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [catalog/amadeus.service](../README.md) / AmadeusService

# Class: AmadeusService

Defined in: [src/catalog/amadeus.service.ts:50](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L50)

## Constructors

### Constructor

> **new AmadeusService**(`http`): `AmadeusService`

Defined in: [src/catalog/amadeus.service.ts:95](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L95)

#### Parameters

##### http

`HttpService`

#### Returns

`AmadeusService`

## Methods

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/catalog/amadeus.service.ts:105](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L105)

#### Returns

`boolean`

***

### getCircuitStatus()

> **getCircuitStatus**(): `object`

Defined in: [src/catalog/amadeus.service.ts:339](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L339)

Get circuit breaker status for monitoring

#### Returns

`object`

##### state

> **state**: [`CircuitState`](../enumerations/CircuitState.md)

##### failureCount

> **failureCount**: `number`

##### lastFailureTime

> **lastFailureTime**: `number`

##### nextAttemptTime

> **nextAttemptTime**: `number`

##### queueLength

> **queueLength**: `number`

##### rateLimitCooldown

> **rateLimitCooldown**: `number`

***

### resetCircuitBreaker()

> **resetCircuitBreaker**(): `void`

Defined in: [src/catalog/amadeus.service.ts:353](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L353)

Manually reset circuit breaker (for admin use)

#### Returns

`void`

***

### clearFlightCache()

> **clearFlightCache**(): `void`

Defined in: [src/catalog/amadeus.service.ts:364](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L364)

Clear flight cache (for admin use)

#### Returns

`void`

***

### getCacheStats()

> **getCacheStats**(): `object`

Defined in: [src/catalog/amadeus.service.ts:373](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L373)

Get cache statistics

#### Returns

`object`

##### totalEntries

> **totalEntries**: `number`

##### validEntries

> **validEntries**: `number`

##### expiredEntries

> **expiredEntries**: `number`

##### cacheDuration

> **cacheDuration**: `number`

##### errorCacheDuration

> **errorCacheDuration**: `number`

***

### healthCheck()

> **healthCheck**(): `Promise`\<\{ `status`: `string`; `details`: `any`; \}\>

Defined in: [src/catalog/amadeus.service.ts:435](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L435)

Health check for Amadeus API

#### Returns

`Promise`\<\{ `status`: `string`; `details`: `any`; \}\>

***

### searchFlights()

> **searchFlights**(`params`): `Promise`\<`any`\>

Defined in: [src/catalog/amadeus.service.ts:595](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/amadeus.service.ts#L595)

#### Parameters

##### params

[`FlightSearchDto`](../../dto/flight-search.dto/interfaces/FlightSearchDto.md)

#### Returns

`Promise`\<`any`\>
