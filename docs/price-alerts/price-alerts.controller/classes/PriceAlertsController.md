[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [price-alerts/price-alerts.controller](../README.md) / PriceAlertsController

# Class: PriceAlertsController

Defined in: [src/price-alerts/price-alerts.controller.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L22)

## Constructors

### Constructor

> **new PriceAlertsController**(`priceAlertsService`): `PriceAlertsController`

Defined in: [src/price-alerts/price-alerts.controller.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L23)

#### Parameters

##### priceAlertsService

[`PriceAlertsService`](../../price-alerts.service/classes/PriceAlertsService.md)

#### Returns

`PriceAlertsController`

## Methods

### createPriceAlert()

> **createPriceAlert**(`req`, `createPriceAlertDto`): `Promise`\<`any`\>

Defined in: [src/price-alerts/price-alerts.controller.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L27)

#### Parameters

##### req

`any`

##### createPriceAlertDto

[`CreatePriceAlertDto`](../../price-alerts.dto/classes/CreatePriceAlertDto.md)

#### Returns

`Promise`\<`any`\>

***

### getUserPriceAlerts()

> **getUserPriceAlerts**(`req`, `activeOnly?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/price-alerts/price-alerts.controller.ts:49](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L49)

Get user price alerts with pagination

#### Parameters

##### req

`any`

##### activeOnly?

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

activeOnly - Filter to active alerts only (default: false)

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getPriceAlert()

> **getPriceAlert**(`req`, `alertId`): `Promise`\<`any`\>

Defined in: [src/price-alerts/price-alerts.controller.ts:74](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L74)

#### Parameters

##### req

`any`

##### alertId

`string`

#### Returns

`Promise`\<`any`\>

***

### updatePriceAlert()

> **updatePriceAlert**(`req`, `alertId`, `updateDto`): `Promise`\<`any`\>

Defined in: [src/price-alerts/price-alerts.controller.ts:87](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L87)

#### Parameters

##### req

`any`

##### alertId

`string`

##### updateDto

[`UpdatePriceAlertDto`](../../price-alerts.dto/classes/UpdatePriceAlertDto.md)

#### Returns

`Promise`\<`any`\>

***

### deletePriceAlert()

> **deletePriceAlert**(`req`, `alertId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/price-alerts/price-alerts.controller.ts:105](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L105)

#### Parameters

##### req

`any`

##### alertId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### deactivatePriceAlert()

> **deactivatePriceAlert**(`req`, `alertId`): `Promise`\<`any`\>

Defined in: [src/price-alerts/price-alerts.controller.ts:112](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/price-alerts/price-alerts.controller.ts#L112)

#### Parameters

##### req

`any`

##### alertId

`string`

#### Returns

`Promise`\<`any`\>
