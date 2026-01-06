[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [travel-tips/travel-tips.controller](../README.md) / TravelTipsController

# Class: TravelTipsController

Defined in: [src/travel-tips/travel-tips.controller.ts:20](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.controller.ts#L20)

## Constructors

### Constructor

> **new TravelTipsController**(`travelTipsService`): `TravelTipsController`

Defined in: [src/travel-tips/travel-tips.controller.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.controller.ts#L21)

#### Parameters

##### travelTipsService

[`TravelTipsService`](../../travel-tips.service/classes/TravelTipsService.md)

#### Returns

`TravelTipsController`

## Methods

### getTips()

> **getTips**(`query`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`[]\>

Defined in: [src/travel-tips/travel-tips.controller.ts:24](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.controller.ts#L24)

#### Parameters

##### query

[`GetTravelTipsDto`](../../travel-tips.dto/classes/GetTravelTipsDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`[]\>

***

### generateTips()

> **generateTips**(`destinationId`, `destinationName`, `city?`, `country?`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`[]\>

Defined in: [src/travel-tips/travel-tips.controller.ts:29](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.controller.ts#L29)

#### Parameters

##### destinationId

`string`

##### destinationName

`string`

##### city?

`string`

##### country?

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`[]\>

***

### createTip()

> **createTip**(`dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

Defined in: [src/travel-tips/travel-tips.controller.ts:45](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.controller.ts#L45)

#### Parameters

##### dto

[`CreateTravelTipDto`](../../travel-tips.dto/classes/CreateTravelTipDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

***

### markTipHelpful()

> **markTipHelpful**(`tipId`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

Defined in: [src/travel-tips/travel-tips.controller.ts:50](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.controller.ts#L50)

#### Parameters

##### tipId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

***

### getTipById()

> **getTipById**(`tipId`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

Defined in: [src/travel-tips/travel-tips.controller.ts:55](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.controller.ts#L55)

#### Parameters

##### tipId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>
