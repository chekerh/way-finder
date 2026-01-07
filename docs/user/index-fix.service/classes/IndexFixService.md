[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [user/index-fix.service](../README.md) / IndexFixService

# Class: IndexFixService

Defined in: [src/user/index-fix.service.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/index-fix.service.ts#L11)

Service to fix the google_id index on application startup
Drops the old non-sparse index and lets Mongoose recreate it with sparse: true

## Implements

- `OnApplicationBootstrap`

## Constructors

### Constructor

> **new IndexFixService**(`userModel`): `IndexFixService`

Defined in: [src/user/index-fix.service.ts:14](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/index-fix.service.ts#L14)

#### Parameters

##### userModel

`Model`\<`Document`\<`unknown`, \{ \}, `User`, \{ \}, \{ \}\> & `User` & `object` & `object`\>

#### Returns

`IndexFixService`

## Methods

### onApplicationBootstrap()

> **onApplicationBootstrap**(): `Promise`\<`void`\>

Defined in: [src/user/index-fix.service.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/index-fix.service.ts#L16)

#### Returns

`Promise`\<`void`\>

#### Implementation of

`OnApplicationBootstrap.onApplicationBootstrap`
