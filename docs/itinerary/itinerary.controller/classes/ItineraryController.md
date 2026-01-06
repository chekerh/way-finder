[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [itinerary/itinerary.controller](../README.md) / ItineraryController

# Class: ItineraryController

Defined in: [src/itinerary/itinerary.controller.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L31)

Itinerary Controller
Handles travel itineraries, activities, and itinerary management

## Constructors

### Constructor

> **new ItineraryController**(`itineraryService`): `ItineraryController`

Defined in: [src/itinerary/itinerary.controller.ts:32](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L32)

#### Parameters

##### itineraryService

[`ItineraryService`](../../itinerary.service/classes/ItineraryService.md)

#### Returns

`ItineraryController`

## Methods

### create()

> **create**(`req`, `createItineraryDto`): `Promise`\<`any`\>

Defined in: [src/itinerary/itinerary.controller.ts:35](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L35)

#### Parameters

##### req

`any`

##### createItineraryDto

[`CreateItineraryDto`](../../itinerary.dto/classes/CreateItineraryDto.md)

#### Returns

`Promise`\<`any`\>

***

### findAll()

> **findAll**(`req`, `includePublic?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/itinerary/itinerary.controller.ts:56](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L56)

Get user itineraries with pagination

#### Parameters

##### req

`any`

##### includePublic?

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

includePublic - Include public itineraries from other users (optional)

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### findOne()

> **findOne**(`req`, `id`): `Promise`\<`any`\>

Defined in: [src/itinerary/itinerary.controller.ts:80](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L80)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<`any`\>

***

### update()

> **update**(`req`, `id`, `updateItineraryDto`): `Promise`\<`any`\>

Defined in: [src/itinerary/itinerary.controller.ts:89](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L89)

#### Parameters

##### req

`any`

##### id

`string`

##### updateItineraryDto

[`UpdateItineraryDto`](../../itinerary.dto/classes/UpdateItineraryDto.md)

#### Returns

`Promise`\<`any`\>

***

### remove()

> **remove**(`req`, `id`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/itinerary/itinerary.controller.ts:106](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L106)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### addActivity()

> **addActivity**(`req`, `id`, `dayDate`, `activity`): `Promise`\<`any`\>

Defined in: [src/itinerary/itinerary.controller.ts:112](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L112)

#### Parameters

##### req

`any`

##### id

`string`

##### dayDate

`string`

##### activity

[`ActivityDto`](../../itinerary.dto/classes/ActivityDto.md)

#### Returns

`Promise`\<`any`\>

***

### removeActivity()

> **removeActivity**(`req`, `id`, `dayDate`, `activityIndex`): `Promise`\<`any`\>

Defined in: [src/itinerary/itinerary.controller.ts:131](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/itinerary/itinerary.controller.ts#L131)

#### Parameters

##### req

`any`

##### id

`string`

##### dayDate

`string`

##### activityIndex

`string`

#### Returns

`Promise`\<`any`\>
