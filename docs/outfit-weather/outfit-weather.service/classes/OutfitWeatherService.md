[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [outfit-weather/outfit-weather.service](../README.md) / OutfitWeatherService

# Class: OutfitWeatherService

Defined in: [src/outfit-weather/outfit-weather.service.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L22)

## Constructors

### Constructor

> **new OutfitWeatherService**(`outfitModel`, `weatherService`, `imageAnalysisService`, `bookingService`, `imgbbService`, `rewardsService`, `userService`): `OutfitWeatherService`

Defined in: [src/outfit-weather/outfit-weather.service.ts:25](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L25)

#### Parameters

##### outfitModel

`Model`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

##### weatherService

[`WeatherService`](../../weather.service/classes/WeatherService.md)

##### imageAnalysisService

[`ImageAnalysisService`](../../image-analysis.service/classes/ImageAnalysisService.md)

##### bookingService

[`BookingService`](../../../booking/booking.service/classes/BookingService.md)

##### imgbbService

[`ImgBBService`](../../../journey/imgbb.service/classes/ImgBBService.md)

##### rewardsService

[`RewardsService`](../../../rewards/rewards.service/classes/RewardsService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

#### Returns

`OutfitWeatherService`

## Methods

### uploadOutfitImage()

> **uploadOutfitImage**(`file`): `Promise`\<`string`\>

Defined in: [src/outfit-weather/outfit-weather.service.ts:39](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L39)

Upload outfit image and get URL

#### Parameters

##### file

`File`

#### Returns

`Promise`\<`string`\>

***

### analyzeOutfit()

> **analyzeOutfit**(`userId`, `bookingId`, `imageUrl`, `imageFile?`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

Defined in: [src/outfit-weather/outfit-weather.service.ts:61](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L61)

Analyze an outfit for a booking

#### Parameters

##### userId

`string`

##### bookingId

`string`

##### imageUrl

`string`

##### imageFile?

`File`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

***

### getOutfitsForBooking()

> **getOutfitsForBooking**(`userId`, `bookingId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`[]\>

Defined in: [src/outfit-weather/outfit-weather.service.ts:193](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L193)

Get all outfits for a booking

#### Parameters

##### userId

`string`

##### bookingId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`[]\>

***

### getOutfit()

> **getOutfit**(`userId`, `outfitId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

Defined in: [src/outfit-weather/outfit-weather.service.ts:209](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L209)

Get a specific outfit

#### Parameters

##### userId

`string`

##### outfitId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

***

### approveOutfit()

> **approveOutfit**(`userId`, `outfitId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

Defined in: [src/outfit-weather/outfit-weather.service.ts:227](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L227)

Approve an outfit

#### Parameters

##### userId

`string`

##### outfitId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Outfit`, \{ \}, \{ \}\> & `Outfit` & `object` & `object`\>

***

### deleteOutfit()

> **deleteOutfit**(`userId`, `outfitId`): `Promise`\<`void`\>

Defined in: [src/outfit-weather/outfit-weather.service.ts:239](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/outfit-weather.service.ts#L239)

Delete an outfit

#### Parameters

##### userId

`string`

##### outfitId

`string`

#### Returns

`Promise`\<`void`\>
