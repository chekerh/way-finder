[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [rewards/discounts.controller](../README.md) / DiscountsController

# Class: DiscountsController

Defined in: [src/rewards/discounts.controller.ts:25](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.controller.ts#L25)

Discounts Controller
Handles point-based discount operations

## Constructors

### Constructor

> **new DiscountsController**(`discountsService`): `DiscountsController`

Defined in: [src/rewards/discounts.controller.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.controller.ts#L26)

#### Parameters

##### discountsService

[`DiscountsService`](../../discounts.service/classes/DiscountsService.md)

#### Returns

`DiscountsController`

## Methods

### getAvailableDiscounts()

> **getAvailableDiscounts**(`req`, `type?`): `Promise`\<[`AvailableDiscountsResponse`](../../discounts.dto/classes/AvailableDiscountsResponse.md)\>

Defined in: [src/rewards/discounts.controller.ts:33](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.controller.ts#L33)

Get all available discounts for the authenticated user

#### Parameters

##### req

`any`

##### type?

[`DiscountType`](../../discounts.dto/enumerations/DiscountType.md)

Optional filter by discount type

#### Returns

`Promise`\<[`AvailableDiscountsResponse`](../../discounts.dto/classes/AvailableDiscountsResponse.md)\>

***

### applyDiscount()

> **applyDiscount**(`req`, `dto`): `Promise`\<[`DiscountApplicationResponse`](../../discounts.dto/classes/DiscountApplicationResponse.md)\>

Defined in: [src/rewards/discounts.controller.ts:44](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.controller.ts#L44)

Apply a discount using user points

#### Parameters

##### req

`any`

##### dto

[`ApplyDiscountDto`](../../discounts.dto/classes/ApplyDiscountDto.md)

#### Returns

`Promise`\<[`DiscountApplicationResponse`](../../discounts.dto/classes/DiscountApplicationResponse.md)\>

***

### getBestDiscount()

> **getBestDiscount**(`req`, `type`, `amount`): `Promise`\<\{ `discount`: [`DiscountDto`](../../discounts.dto/classes/DiscountDto.md) \| `null`; `has_discount`: `boolean`; \}\>

Defined in: [src/rewards/discounts.controller.ts:55](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.controller.ts#L55)

Get the best available discount for a specific amount and type

#### Parameters

##### req

`any`

##### type

[`DiscountType`](../../discounts.dto/enumerations/DiscountType.md)

##### amount

`number`

#### Returns

`Promise`\<\{ `discount`: [`DiscountDto`](../../discounts.dto/classes/DiscountDto.md) \| `null`; `has_discount`: `boolean`; \}\>
