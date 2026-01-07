[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [favorites/favorites.service](../README.md) / FavoritesService

# Class: FavoritesService

Defined in: [src/favorites/favorites.service.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L16)

Favorites Service
Handles user favorites management for destinations, hotels, flights, etc.

## Constructors

### Constructor

> **new FavoritesService**(`favoriteModel`): `FavoritesService`

Defined in: [src/favorites/favorites.service.ts:17](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L17)

#### Parameters

##### favoriteModel

`Model`\<`Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object`\>

#### Returns

`FavoritesService`

## Methods

### addFavorite()

> **addFavorite**(`userId`, `createFavoriteDto`): `Promise`\<`Favorite`\>

Defined in: [src/favorites/favorites.service.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L22)

#### Parameters

##### userId

`string`

##### createFavoriteDto

[`CreateFavoriteDto`](../../favorites.dto/classes/CreateFavoriteDto.md)

#### Returns

`Promise`\<`Favorite`\>

***

### removeFavorite()

> **removeFavorite**(`userId`, `itemType`, `itemId`): `Promise`\<`void`\>

Defined in: [src/favorites/favorites.service.ts:48](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L48)

#### Parameters

##### userId

`string`

##### itemType

`string`

##### itemId

`string`

#### Returns

`Promise`\<`void`\>

***

### ~~getFavorites()~~

> **getFavorites**(`userId`, `itemType?`): `Promise`\<`Favorite`[]\>

Defined in: [src/favorites/favorites.service.ts:68](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L68)

Get favorites (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### itemType?

`string`

#### Returns

`Promise`\<`Favorite`[]\>

#### Deprecated

Use getFavoritesPaginated instead for better performance

***

### getFavoritesPaginated()

> **getFavoritesPaginated**(`userId`, `page`, `limit`, `itemType?`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/favorites/favorites.service.ts:89](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L89)

Get paginated favorites

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

##### itemType?

`string`

Optional filter by item type

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Favorite`, \{ \}, \{ \}\> & `Favorite` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated favorite results

***

### isFavorite()

> **isFavorite**(`userId`, `itemType`, `itemId`): `Promise`\<`boolean`\>

Defined in: [src/favorites/favorites.service.ts:114](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L114)

#### Parameters

##### userId

`string`

##### itemType

`string`

##### itemId

`string`

#### Returns

`Promise`\<`boolean`\>

***

### getFavoriteCount()

> **getFavoriteCount**(`userId`, `itemType?`): `Promise`\<`number`\>

Defined in: [src/favorites/favorites.service.ts:128](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/favorites/favorites.service.ts#L128)

#### Parameters

##### userId

`string`

##### itemType?

`string`

#### Returns

`Promise`\<`number`\>
