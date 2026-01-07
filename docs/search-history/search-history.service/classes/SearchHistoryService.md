[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [search-history/search-history.service](../README.md) / SearchHistoryService

# Class: SearchHistoryService

Defined in: [src/search-history/search-history.service.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L17)

Search History Service
Handles search history tracking, recording, and retrieval
Supports both recent and saved searches with deduplication

## Constructors

### Constructor

> **new SearchHistoryService**(`searchHistoryModel`): `SearchHistoryService`

Defined in: [src/search-history/search-history.service.ts:18](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L18)

#### Parameters

##### searchHistoryModel

`Model`\<`Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object`\>

#### Returns

`SearchHistoryService`

## Methods

### recordSearch()

> **recordSearch**(`userId`, `createSearchDto`): `Promise`\<`SearchHistory`\>

Defined in: [src/search-history/search-history.service.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L23)

#### Parameters

##### userId

`string`

##### createSearchDto

[`CreateSearchHistoryDto`](../../search-history.dto/classes/CreateSearchHistoryDto.md)

#### Returns

`Promise`\<`SearchHistory`\>

***

### ~~getRecentSearches()~~

> **getRecentSearches**(`userId`, `searchType?`, `limit?`, `skip?`): `Promise`\<`SearchHistory`[]\>

Defined in: [src/search-history/search-history.service.ts:70](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L70)

Get recent searches (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### searchType?

`string`

##### limit?

`number` = `20`

##### skip?

`number` = `0`

#### Returns

`Promise`\<`SearchHistory`[]\>

#### Deprecated

Use getRecentSearchesPaginated instead for better performance

***

### getRecentSearchesPaginated()

> **getRecentSearchesPaginated**(`userId`, `page`, `limit`, `searchType?`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/search-history/search-history.service.ts:97](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L97)

Get paginated recent searches

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

##### searchType?

`string`

Optional filter by search type

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated search history results

***

### ~~getSavedSearches()~~

> **getSavedSearches**(`userId`, `searchType?`, `limit?`, `skip?`): `Promise`\<`SearchHistory`[]\>

Defined in: [src/search-history/search-history.service.ts:126](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L126)

Get saved searches (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### searchType?

`string`

##### limit?

`number` = `50`

##### skip?

`number` = `0`

#### Returns

`Promise`\<`SearchHistory`[]\>

#### Deprecated

Use getSavedSearchesPaginated instead for better performance

***

### getSavedSearchesPaginated()

> **getSavedSearchesPaginated**(`userId`, `page`, `limit`, `searchType?`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/search-history/search-history.service.ts:153](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L153)

Get paginated saved searches

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

##### searchType?

`string`

Optional filter by search type

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `SearchHistory`, \{ \}, \{ \}\> & `SearchHistory` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated saved search results

***

### saveSearch()

> **saveSearch**(`userId`, `searchId`, `saveSearchDto`): `Promise`\<`SearchHistory`\>

Defined in: [src/search-history/search-history.service.ts:178](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L178)

#### Parameters

##### userId

`string`

##### searchId

`string`

##### saveSearchDto

[`SaveSearchDto`](../../search-history.dto/classes/SaveSearchDto.md)

#### Returns

`Promise`\<`SearchHistory`\>

***

### unsaveSearch()

> **unsaveSearch**(`userId`, `searchId`): `Promise`\<`SearchHistory`\>

Defined in: [src/search-history/search-history.service.ts:197](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L197)

#### Parameters

##### userId

`string`

##### searchId

`string`

#### Returns

`Promise`\<`SearchHistory`\>

***

### updateSearchHistory()

> **updateSearchHistory**(`userId`, `searchId`, `updateDto`): `Promise`\<`SearchHistory`\>

Defined in: [src/search-history/search-history.service.ts:212](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L212)

#### Parameters

##### userId

`string`

##### searchId

`string`

##### updateDto

[`UpdateSearchHistoryDto`](../../search-history.dto/classes/UpdateSearchHistoryDto.md)

#### Returns

`Promise`\<`SearchHistory`\>

***

### deleteSearchHistory()

> **deleteSearchHistory**(`userId`, `searchId`): `Promise`\<`void`\>

Defined in: [src/search-history/search-history.service.ts:230](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L230)

#### Parameters

##### userId

`string`

##### searchId

`string`

#### Returns

`Promise`\<`void`\>

***

### clearRecentSearches()

> **clearRecentSearches**(`userId`, `searchType?`): `Promise`\<`void`\>

Defined in: [src/search-history/search-history.service.ts:240](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L240)

#### Parameters

##### userId

`string`

##### searchType?

`string`

#### Returns

`Promise`\<`void`\>

***

### getSearchStats()

> **getSearchStats**(`userId`): `Promise`\<\{ `totalSearches`: `number`; `savedSearches`: `number`; `searchesByType`: `Record`\<`string`, `number`\>; `mostSearchedDestination?`: `string`; \}\>

Defined in: [src/search-history/search-history.service.ts:252](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/search-history/search-history.service.ts#L252)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `totalSearches`: `number`; `savedSearches`: `number`; `searchesByType`: `Record`\<`string`, `number`\>; `mostSearchedDestination?`: `string`; \}\>
