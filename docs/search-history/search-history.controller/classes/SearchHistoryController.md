[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [search-history/search-history.controller](../README.md) / SearchHistoryController

# Class: SearchHistoryController

Defined in: [src/search-history/search-history.controller.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L26)

## Constructors

### Constructor

> **new SearchHistoryController**(`searchHistoryService`): `SearchHistoryController`

Defined in: [src/search-history/search-history.controller.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L27)

#### Parameters

##### searchHistoryService

[`SearchHistoryService`](../../search-history.service/classes/SearchHistoryService.md)

#### Returns

`SearchHistoryController`

## Methods

### recordSearch()

> **recordSearch**(`req`, `createSearchDto`): `Promise`\<`any`\>

Defined in: [src/search-history/search-history.controller.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L31)

#### Parameters

##### req

`any`

##### createSearchDto

[`CreateSearchHistoryDto`](../../search-history.dto/classes/CreateSearchHistoryDto.md)

#### Returns

`Promise`\<`any`\>

***

### getRecentSearches()

> **getRecentSearches**(`req`, `searchType?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/search-history/search-history.controller.ts:53](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L53)

Get recent searches with pagination

#### Parameters

##### req

`any`

##### searchType?

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

type - Optional filter by search type

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getSavedSearches()

> **getSavedSearches**(`req`, `searchType?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/search-history/search-history.controller.ts:84](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L84)

Get saved searches with pagination

#### Parameters

##### req

`any`

##### searchType?

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

type - Optional filter by search type

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 50, max: 100)

***

### saveSearch()

> **saveSearch**(`req`, `searchId`, `saveSearchDto`): `Promise`\<`any`\>

Defined in: [src/search-history/search-history.controller.ts:109](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L109)

#### Parameters

##### req

`any`

##### searchId

`string`

##### saveSearchDto

[`SaveSearchDto`](../../search-history.dto/classes/SaveSearchDto.md)

#### Returns

`Promise`\<`any`\>

***

### unsaveSearch()

> **unsaveSearch**(`req`, `searchId`): `Promise`\<`any`\>

Defined in: [src/search-history/search-history.controller.ts:127](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L127)

#### Parameters

##### req

`any`

##### searchId

`string`

#### Returns

`Promise`\<`any`\>

***

### updateSearchHistory()

> **updateSearchHistory**(`req`, `searchId`, `updateDto`): `Promise`\<`any`\>

Defined in: [src/search-history/search-history.controller.ts:140](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L140)

#### Parameters

##### req

`any`

##### searchId

`string`

##### updateDto

[`UpdateSearchHistoryDto`](../../search-history.dto/classes/UpdateSearchHistoryDto.md)

#### Returns

`Promise`\<`any`\>

***

### deleteSearchHistory()

> **deleteSearchHistory**(`req`, `searchId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/search-history/search-history.controller.ts:158](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L158)

#### Parameters

##### req

`any`

##### searchId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### clearRecentSearches()

> **clearRecentSearches**(`req`, `searchType?`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/search-history/search-history.controller.ts:165](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L165)

#### Parameters

##### req

`any`

##### searchType?

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### getSearchStats()

> **getSearchStats**(`req`): `Promise`\<\{ `totalSearches`: `number`; `savedSearches`: `number`; `searchesByType`: `Record`\<`string`, `number`\>; `mostSearchedDestination?`: `string`; \}\>

Defined in: [src/search-history/search-history.controller.ts:178](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.controller.ts#L178)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `totalSearches`: `number`; `savedSearches`: `number`; `searchesByType`: `Record`\<`string`, `number`\>; `mostSearchedDestination?`: `string`; \}\>
