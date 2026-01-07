[**WayFinder Backend API Documentation v0.0.1**](../../README.md)

***

[WayFinder Backend API Documentation](../../README.md) / [app.controller](../README.md) / AppController

# Class: AppController

Defined in: [src/app.controller.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L16)

Main application controller
Handles root routes, configuration, and health checks

## Constructors

### Constructor

> **new AppController**(`appService`, `mongooseConnection`): `AppController`

Defined in: [src/app.controller.ts:19](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L19)

#### Parameters

##### appService

[`AppService`](../../app.service/classes/AppService.md)

##### mongooseConnection

`Connection`

#### Returns

`AppController`

## Methods

### getHello()

> **getHello**(): `string`

Defined in: [src/app.controller.ts:28](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L28)

Root endpoint - simple hello world

#### Returns

`string`

***

### getGoogleMapsApiKey()

> **getGoogleMapsApiKey**(): `object`

Defined in: [src/app.controller.ts:36](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L36)

Google Maps API key configuration endpoint

#### Returns

`object`

##### apiKey

> **apiKey**: `string` \| `null`

***

### getHealth()

> **getHealth**(): `Promise`\<\{ `status`: `string`; `timestamp`: `string`; `uptime`: `number`; `environment`: `string`; `version`: `string`; `ready`: `boolean`; `services`: \{ `database`: \{ `status`: `string`; `latency`: `number`; `ready`: `boolean`; \}; `redis`: \{ `status`: `string`; `configured`: `boolean`; \}; \}; \}\>

Defined in: [src/app.controller.ts:46](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L46)

Health check endpoint for Render monitoring
Returns application status and basic metrics
Enhanced to verify that services are truly ready (not just responding)

#### Returns

`Promise`\<\{ `status`: `string`; `timestamp`: `string`; `uptime`: `number`; `environment`: `string`; `version`: `string`; `ready`: `boolean`; `services`: \{ `database`: \{ `status`: `string`; `latency`: `number`; `ready`: `boolean`; \}; `redis`: \{ `status`: `string`; `configured`: `boolean`; \}; \}; \}\>

***

### getReady()

> **getReady**(): `Promise`\<\{ `status`: `string`; `timestamp`: `string`; \}\>

Defined in: [src/app.controller.ts:116](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L116)

Readiness probe endpoint
Returns 200 if the application is ready to serve traffic
Used by orchestration platforms (Render, Kubernetes, etc.)

#### Returns

`Promise`\<\{ `status`: `string`; `timestamp`: `string`; \}\>

***

### getLive()

> **getLive**(): `object`

Defined in: [src/app.controller.ts:144](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L144)

Liveness probe endpoint
Returns 200 if the application is alive (not crashed)
Used by orchestration platforms to restart containers if needed

#### Returns

`object`

##### status

> **status**: `string` = `'alive'`

##### timestamp

> **timestamp**: `string`

***

### warmup()

> **warmup**(): `Promise`\<\{ `status`: `string`; `timestamp`: `string`; `totalLatency`: `number`; `services`: `Record`\<`string`, \{ `status`: `string`; `latency?`: `number`; \}\>; `ready`: `boolean`; \}\>

Defined in: [src/app.controller.ts:155](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/app.controller.ts#L155)

Warm-up endpoint to pre-initialize critical services
This helps reduce cold start latency on Render by initializing
services before they're needed
Returns immediately if already warmed up to avoid blocking

#### Returns

`Promise`\<\{ `status`: `string`; `timestamp`: `string`; `totalLatency`: `number`; `services`: `Record`\<`string`, \{ `status`: `string`; `latency?`: `number`; \}\>; `ready`: `boolean`; \}\>
