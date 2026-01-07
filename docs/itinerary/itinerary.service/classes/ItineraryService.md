[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [itinerary/itinerary.service](../README.md) / ItineraryService

# Class: ItineraryService

Defined in: [src/itinerary/itinerary.service.ts:12](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L12)

## Constructors

### Constructor

> **new ItineraryService**(`itineraryModel`): `ItineraryService`

Defined in: [src/itinerary/itinerary.service.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L13)

#### Parameters

##### itineraryModel

`Model`\<`Document`\<`unknown`, \{ \}, `Itinerary`, \{ \}, \{ \}\> & `Itinerary` & `object` & `object`\>

#### Returns

`ItineraryService`

## Methods

### create()

> **create**(`userId`, `createItineraryDto`): `Promise`\<`Itinerary`\>

Defined in: [src/itinerary/itinerary.service.ts:18](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L18)

#### Parameters

##### userId

`string`

##### createItineraryDto

[`CreateItineraryDto`](../../itinerary.dto/classes/CreateItineraryDto.md)

#### Returns

`Promise`\<`Itinerary`\>

***

### ~~findAll()~~

> **findAll**(`userId`, `includePublic`): `Promise`\<`Itinerary`[]\>

Defined in: [src/itinerary/itinerary.service.ts:34](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L34)

Get user itineraries (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### includePublic

`boolean` = `false`

#### Returns

`Promise`\<`Itinerary`[]\>

#### Deprecated

Use findAllPaginated instead for better performance

***

### findAllPaginated()

> **findAllPaginated**(`userId`, `page`, `limit`, `includePublic`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Itinerary`, \{ \}, \{ \}\> & `Itinerary` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Itinerary`, \{ \}, \{ \}\> & `Itinerary` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/itinerary/itinerary.service.ts:63](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L63)

Get paginated user itineraries

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

##### includePublic

`boolean` = `false`

Include public itineraries from other users

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Itinerary`, \{ \}, \{ \}\> & `Itinerary` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Itinerary`, \{ \}, \{ \}\> & `Itinerary` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated itinerary results

***

### findOne()

> **findOne**(`id`, `userId`): `Promise`\<`Itinerary`\>

Defined in: [src/itinerary/itinerary.service.ts:93](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L93)

#### Parameters

##### id

`string`

##### userId

`string`

#### Returns

`Promise`\<`Itinerary`\>

***

### update()

> **update**(`id`, `userId`, `updateItineraryDto`): `Promise`\<`Itinerary`\>

Defined in: [src/itinerary/itinerary.service.ts:108](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L108)

#### Parameters

##### id

`string`

##### userId

`string`

##### updateItineraryDto

[`UpdateItineraryDto`](../../itinerary.dto/classes/UpdateItineraryDto.md)

#### Returns

`Promise`\<`Itinerary`\>

***

### remove()

> **remove**(`id`, `userId`): `Promise`\<`void`\>

Defined in: [src/itinerary/itinerary.service.ts:127](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L127)

#### Parameters

##### id

`string`

##### userId

`string`

#### Returns

`Promise`\<`void`\>

***

### addActivity()

> **addActivity**(`id`, `userId`, `dayDate`, `activity`): `Promise`\<`Itinerary`\>

Defined in: [src/itinerary/itinerary.service.ts:141](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L141)

#### Parameters

##### id

`string`

##### userId

`string`

##### dayDate

`string`

##### activity

`any`

#### Returns

`Promise`\<`Itinerary`\>

***

### removeActivity()

> **removeActivity**(`id`, `userId`, `dayDate`, `activityIndex`): `Promise`\<`Itinerary`\>

Defined in: [src/itinerary/itinerary.service.ts:173](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.service.ts#L173)

#### Parameters

##### id

`string`

##### userId

`string`

##### dayDate

`string`

##### activityIndex

`number`

#### Returns

`Promise`\<`Itinerary`\>
