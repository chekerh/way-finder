[**WayFinder Backend API Documentation v0.0.1**](../../../../README.md)

***

[WayFinder Backend API Documentation](../../../../README.md) / [common/cache/cache.service](../README.md) / CacheService

# Class: CacheService

Defined in: [src/common/cache/cache.service.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L16)

Cache Service
Provides Redis-based caching functionality with TTL support
Gracefully handles Redis unavailability (falls back to no caching)

## Implements

- `OnModuleInit`
- `OnModuleDestroy`

## Constructors

### Constructor

> **new CacheService**(): `CacheService`

Defined in: [src/common/cache/cache.service.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L21)

#### Returns

`CacheService`

## Methods

### onModuleInit()

> **onModuleInit**(): `Promise`\<`void`\>

Defined in: [src/common/cache/cache.service.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L23)

#### Returns

`Promise`\<`void`\>

#### Implementation of

`OnModuleInit.onModuleInit`

***

### onModuleDestroy()

> **onModuleDestroy**(): `Promise`\<`void`\>

Defined in: [src/common/cache/cache.service.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L27)

#### Returns

`Promise`\<`void`\>

#### Implementation of

`OnModuleDestroy.onModuleDestroy`

***

### get()

> **get**\<`T`\>(`key`): `Promise`\<`T` \| `null`\>

Defined in: [src/common/cache/cache.service.ts:161](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L161)

Get cached value by key

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

Cache key

#### Returns

`Promise`\<`T` \| `null`\>

Cached value or null if not found

***

### set()

> **set**(`key`, `value`, `ttlSeconds?`): `Promise`\<`void`\>

Defined in: [src/common/cache/cache.service.ts:184](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L184)

Set cached value with optional TTL

#### Parameters

##### key

`string`

Cache key

##### value

`any`

Value to cache

##### ttlSeconds?

`number`

Time to live in seconds (optional)

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`key`): `Promise`\<`void`\>

Defined in: [src/common/cache/cache.service.ts:205](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L205)

Delete cached value by key

#### Parameters

##### key

`string`

Cache key

#### Returns

`Promise`\<`void`\>

***

### deleteByPattern()

> **deleteByPattern**(`pattern`): `Promise`\<`void`\>

Defined in: [src/common/cache/cache.service.ts:221](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L221)

Delete multiple cached values by pattern

#### Parameters

##### pattern

`string`

Cache key pattern (e.g., 'catalog:*')

#### Returns

`Promise`\<`void`\>

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [src/common/cache/cache.service.ts:244](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L244)

Clear all cached values (use with caution)

#### Returns

`Promise`\<`void`\>

***

### isCacheEnabled()

> **isCacheEnabled**(): `boolean`

Defined in: [src/common/cache/cache.service.ts:260](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/cache/cache.service.ts#L260)

Check if caching is enabled and Redis is connected

#### Returns

`boolean`
