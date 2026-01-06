[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [outfit-weather/outfit-weather.controller](../README.md) / OutfitWeatherController

# Class: OutfitWeatherController

Defined in: [src/outfit-weather/outfit-weather.controller.ts:29](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L29)

## Constructors

### Constructor

> **new OutfitWeatherController**(`outfitWeatherService`): `OutfitWeatherController`

Defined in: [src/outfit-weather/outfit-weather.controller.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L30)

#### Parameters

##### outfitWeatherService

[`OutfitWeatherService`](../../outfit-weather.service/classes/OutfitWeatherService.md)

#### Returns

`OutfitWeatherController`

## Methods

### uploadOutfitImage()

> **uploadOutfitImage**(`req`, `file`, `dto`): `Promise`\<\{ `message`: `string`; `image_url`: `string`; `analysis`: `any`; \}\>

Defined in: [src/outfit-weather/outfit-weather.controller.ts:64](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L64)

Upload outfit image for analysis
Rate limited: 5 requests per minute to prevent abuse

#### Parameters

##### req

`any`

##### file

`File`

##### dto

[`UploadOutfitDto`](../../outfit-weather.dto/classes/UploadOutfitDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `image_url`: `string`; `analysis`: `any`; \}\>

***

### analyzeOutfit()

> **analyzeOutfit**(`req`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

Defined in: [src/outfit-weather/outfit-weather.controller.ts:111](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L111)

#### Parameters

##### req

`any`

##### dto

[`AnalyzeOutfitDto`](../../outfit-weather.dto/classes/AnalyzeOutfitDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

***

### getOutfitsForBooking()

> **getOutfitsForBooking**(`req`, `bookingId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`[]\>

Defined in: [src/outfit-weather/outfit-weather.controller.ts:120](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L120)

#### Parameters

##### req

`any`

##### bookingId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`[]\>

***

### getOutfit()

> **getOutfit**(`req`, `outfitId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

Defined in: [src/outfit-weather/outfit-weather.controller.ts:131](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L131)

#### Parameters

##### req

`any`

##### outfitId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

***

### approveOutfit()

> **approveOutfit**(`req`, `outfitId`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

Defined in: [src/outfit-weather/outfit-weather.controller.ts:136](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L136)

#### Parameters

##### req

`any`

##### outfitId

`string`

##### dto

[`ApproveOutfitDto`](../../outfit-weather.dto/classes/ApproveOutfitDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

***

### deleteOutfit()

> **deleteOutfit**(`req`, `outfitId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/outfit-weather/outfit-weather.controller.ts:145](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.controller.ts#L145)

#### Parameters

##### req

`any`

##### outfitId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>
