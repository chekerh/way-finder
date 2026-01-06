[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [travel-tips/travel-tips.service](../README.md) / TravelTipsService

# Class: TravelTipsService

Defined in: [src/travel-tips/travel-tips.service.ts:12](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.service.ts#L12)

## Constructors

### Constructor

> **new TravelTipsService**(`travelTipModel`): `TravelTipsService`

Defined in: [src/travel-tips/travel-tips.service.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.service.ts#L13)

#### Parameters

##### travelTipModel

`Model`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

#### Returns

`TravelTipsService`

## Methods

### getTipsForDestination()

> **getTipsForDestination**(`dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`[]\>

Defined in: [src/travel-tips/travel-tips.service.ts:18](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.service.ts#L18)

#### Parameters

##### dto

[`GetTravelTipsDto`](../../travel-tips.dto/classes/GetTravelTipsDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`[]\>

***

### generateTipsForDestination()

> **generateTipsForDestination**(`destinationId`, `destinationName`, `city?`, `country?`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`[]\>

Defined in: [src/travel-tips/travel-tips.service.ts:48](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.service.ts#L48)

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

Defined in: [src/travel-tips/travel-tips.service.ts:219](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.service.ts#L219)

#### Parameters

##### dto

[`CreateTravelTipDto`](../../travel-tips.dto/classes/CreateTravelTipDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

***

### markTipHelpful()

> **markTipHelpful**(`tipId`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

Defined in: [src/travel-tips/travel-tips.service.ts:223](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.service.ts#L223)

#### Parameters

##### tipId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

***

### getTipById()

> **getTipById**(`tipId`): `Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>

Defined in: [src/travel-tips/travel-tips.service.ts:235](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/travel-tips/travel-tips.service.ts#L235)

#### Parameters

##### tipId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `TravelTip`, \{ \}, \{ \}\> & `TravelTip` & `object` & `object`\>
