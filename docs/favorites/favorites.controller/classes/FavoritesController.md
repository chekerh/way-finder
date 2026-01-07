[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [favorites/favorites.controller](../README.md) / FavoritesController

# Class: FavoritesController

Defined in: [src/favorites/favorites.controller.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.controller.ts#L26)

Favorites Controller
Handles user favorites for destinations, hotels, activities, and other items

## Constructors

### Constructor

> **new FavoritesController**(`favoritesService`): `FavoritesController`

Defined in: [src/favorites/favorites.controller.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.controller.ts#L27)

#### Parameters

##### favoritesService

[`FavoritesService`](../../favorites.service/classes/FavoritesService.md)

#### Returns

`FavoritesController`

## Methods

### addFavorite()

> **addFavorite**(`req`, `createFavoriteDto`): `Promise`\<`Favorite`\>

Defined in: [src/favorites/favorites.controller.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.controller.ts#L30)

#### Parameters

##### req

`any`

##### createFavoriteDto

[`CreateFavoriteDto`](../../favorites.dto/classes/CreateFavoriteDto.md)

#### Returns

`Promise`\<`Favorite`\>

***

### getFavorites()

> **getFavorites**(`req`, `itemType?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object` & `Required`\<\{ \}\>\>\>

Defined in: [src/favorites/favorites.controller.ts:44](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.controller.ts#L44)

Get user favorites with pagination

#### Parameters

##### req

`any`

##### itemType?

[`FavoriteItemType`](../../favorites.dto/enumerations/FavoriteItemType.md)

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object` & `Required`\<\{ \}\>\>\>

#### Query

type - Optional filter by item type

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getFavoriteCount()

> **getFavoriteCount**(`req`, `itemType?`): `Promise`\<\{ `count`: `number`; \}\>

Defined in: [src/favorites/favorites.controller.ts:60](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.controller.ts#L60)

#### Parameters

##### req

`any`

##### itemType?

[`FavoriteItemType`](../../favorites.dto/enumerations/FavoriteItemType.md)

#### Returns

`Promise`\<\{ `count`: `number`; \}\>

***

### checkFavorite()

> **checkFavorite**(`req`, `itemType`, `itemId`): `Promise`\<\{ `isFavorite`: `boolean`; \}\>

Defined in: [src/favorites/favorites.controller.ts:72](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.controller.ts#L72)

#### Parameters

##### req

`any`

##### itemType

`string`

##### itemId

`string`

#### Returns

`Promise`\<\{ `isFavorite`: `boolean`; \}\>

***

### removeFavorite()

> **removeFavorite**(`req`, `itemType`, `itemId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/favorites/favorites.controller.ts:86](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.controller.ts#L86)

#### Parameters

##### req

`any`

##### itemType

`string`

##### itemId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>
