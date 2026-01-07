[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [price-alerts/price-alerts.service](../README.md) / PriceAlertsService

# Class: PriceAlertsService

Defined in: [src/price-alerts/price-alerts.service.ts:9](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L9)

## Constructors

### Constructor

> **new PriceAlertsService**(`priceAlertModel`, `notificationsService`): `PriceAlertsService`

Defined in: [src/price-alerts/price-alerts.service.ts:10](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L10)

#### Parameters

##### priceAlertModel

`Model`\<`Document`\<`unknown`, \{ \}, `PriceAlert`, \{ \}, \{ \}\> & `PriceAlert` & `object` & `object`\>

##### notificationsService

[`NotificationsService`](../../../notifications/notifications.service/classes/NotificationsService.md)

#### Returns

`PriceAlertsService`

## Methods

### createPriceAlert()

> **createPriceAlert**(`userId`, `createPriceAlertDto`): `Promise`\<`PriceAlert`\>

Defined in: [src/price-alerts/price-alerts.service.ts:16](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L16)

#### Parameters

##### userId

`string`

##### createPriceAlertDto

[`CreatePriceAlertDto`](../../price-alerts.dto/classes/CreatePriceAlertDto.md)

#### Returns

`Promise`\<`PriceAlert`\>

***

### ~~getUserPriceAlerts()~~

> **getUserPriceAlerts**(`userId`, `activeOnly`): `Promise`\<`PriceAlert`[]\>

Defined in: [src/price-alerts/price-alerts.service.ts:71](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L71)

Get user price alerts (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### activeOnly

`boolean` = `false`

#### Returns

`Promise`\<`PriceAlert`[]\>

#### Deprecated

Use getUserPriceAlertsPaginated instead for better performance

***

### getUserPriceAlertsPaginated()

> **getUserPriceAlertsPaginated**(`userId`, `page`, `limit`, `activeOnly`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `PriceAlert`, \{ \}, \{ \}\> & `PriceAlert` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `PriceAlert`, \{ \}, \{ \}\> & `PriceAlert` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/price-alerts/price-alerts.service.ts:96](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L96)

Get paginated user price alerts

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

##### activeOnly

`boolean` = `false`

Filter to active alerts only

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `PriceAlert`, \{ \}, \{ \}\> & `PriceAlert` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `PriceAlert`, \{ \}, \{ \}\> & `PriceAlert` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated price alert results

***

### getPriceAlert()

> **getPriceAlert**(`userId`, `alertId`): `Promise`\<`PriceAlert`\>

Defined in: [src/price-alerts/price-alerts.service.ts:122](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L122)

#### Parameters

##### userId

`string`

##### alertId

`string`

#### Returns

`Promise`\<`PriceAlert`\>

***

### updatePriceAlert()

> **updatePriceAlert**(`userId`, `alertId`, `updateDto`): `Promise`\<`PriceAlert`\>

Defined in: [src/price-alerts/price-alerts.service.ts:134](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L134)

#### Parameters

##### userId

`string`

##### alertId

`string`

##### updateDto

[`UpdatePriceAlertDto`](../../price-alerts.dto/classes/UpdatePriceAlertDto.md)

#### Returns

`Promise`\<`PriceAlert`\>

***

### deletePriceAlert()

> **deletePriceAlert**(`userId`, `alertId`): `Promise`\<`void`\>

Defined in: [src/price-alerts/price-alerts.service.ts:164](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L164)

#### Parameters

##### userId

`string`

##### alertId

`string`

#### Returns

`Promise`\<`void`\>

***

### deactivatePriceAlert()

> **deactivatePriceAlert**(`userId`, `alertId`): `Promise`\<`PriceAlert`\>

Defined in: [src/price-alerts/price-alerts.service.ts:174](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L174)

#### Parameters

##### userId

`string`

##### alertId

`string`

#### Returns

`Promise`\<`PriceAlert`\>

***

### checkPriceAlert()

> **checkPriceAlert**(`alert`, `currentPrice`): `Promise`\<`boolean`\>

Defined in: [src/price-alerts/price-alerts.service.ts:192](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L192)

#### Parameters

##### alert

`Document`\<`unknown`, \{ \}, `PriceAlert`, \{ \}, \{ \}\> & `PriceAlert` & `object` & `object`

##### currentPrice

`number`

#### Returns

`Promise`\<`boolean`\>

***

### checkAllActiveAlerts()

> **checkAllActiveAlerts**(): `Promise`\<`number`\>

Defined in: [src/price-alerts/price-alerts.service.ts:249](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L249)

#### Returns

`Promise`\<`number`\>

***

### getActiveAlertsForItem()

> **getActiveAlertsForItem**(`alertType`, `itemId`): `Promise`\<`PriceAlert`[]\>

Defined in: [src/price-alerts/price-alerts.service.ts:274](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.service.ts#L274)

#### Parameters

##### alertType

`string`

##### itemId

`string`

#### Returns

`Promise`\<`PriceAlert`[]\>
