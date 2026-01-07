[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [rewards/discounts.service](../README.md) / DiscountsService

# Class: DiscountsService

Defined in: [src/rewards/discounts.service.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L26)

Discount Service
Manages point-based discounts for various services (luggage, taxes, etc.)

## Constructors

### Constructor

> **new DiscountsService**(`userModel`, `rewardsService`): `DiscountsService`

Defined in: [src/rewards/discounts.service.ts:158](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L158)

#### Parameters

##### userModel

`Model`\<`Document`\<`unknown`, \{ \}, `User`, \{ \}, \{ \}\> & `User` & `object` & `object`\>

##### rewardsService

[`RewardsService`](../../rewards.service/classes/RewardsService.md)

#### Returns

`DiscountsService`

## Methods

### getAllDiscounts()

> **getAllDiscounts**(): [`DiscountDto`](../../discounts.dto/classes/DiscountDto.md)[]

Defined in: [src/rewards/discounts.service.ts:167](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L167)

Get all available discounts

#### Returns

[`DiscountDto`](../../discounts.dto/classes/DiscountDto.md)[]

***

### getAvailableDiscounts()

> **getAvailableDiscounts**(`userId`, `type?`): `Promise`\<[`AvailableDiscountsResponse`](../../discounts.dto/classes/AvailableDiscountsResponse.md)\>

Defined in: [src/rewards/discounts.service.ts:174](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L174)

Get available discounts for a user based on their points

#### Parameters

##### userId

`string`

##### type?

[`DiscountType`](../../discounts.dto/enumerations/DiscountType.md)

#### Returns

`Promise`\<[`AvailableDiscountsResponse`](../../discounts.dto/classes/AvailableDiscountsResponse.md)\>

***

### getDiscountById()

> **getDiscountById**(`discountId`): [`DiscountDto`](../../discounts.dto/classes/DiscountDto.md) \| `null`

Defined in: [src/rewards/discounts.service.ts:206](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L206)

Get discount by ID

#### Parameters

##### discountId

`string`

#### Returns

[`DiscountDto`](../../discounts.dto/classes/DiscountDto.md) \| `null`

***

### calculateDiscount()

> **calculateDiscount**(`originalAmount`, `discountPercentage`, `maxDiscountAmount?`): `number`

Defined in: [src/rewards/discounts.service.ts:217](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L217)

Calculate discount amount

#### Parameters

##### originalAmount

`number`

##### discountPercentage

`number`

##### maxDiscountAmount?

`number`

#### Returns

`number`

***

### applyDiscount()

> **applyDiscount**(`userId`, `dto`): `Promise`\<[`DiscountApplicationResponse`](../../discounts.dto/classes/DiscountApplicationResponse.md)\>

Defined in: [src/rewards/discounts.service.ts:232](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L232)

Apply a discount using user points

#### Parameters

##### userId

`string`

##### dto

[`ApplyDiscountDto`](../../discounts.dto/classes/ApplyDiscountDto.md)

#### Returns

`Promise`\<[`DiscountApplicationResponse`](../../discounts.dto/classes/DiscountApplicationResponse.md)\>

***

### getBestDiscount()

> **getBestDiscount**(`userId`, `type`, `amount`): `Promise`\<[`DiscountDto`](../../discounts.dto/classes/DiscountDto.md) \| `null`\>

Defined in: [src/rewards/discounts.service.ts:305](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/rewards/discounts.service.ts#L305)

Get best available discount for a specific amount and type

#### Parameters

##### userId

`string`

##### type

[`DiscountType`](../../discounts.dto/enumerations/DiscountType.md)

##### amount

`number`

#### Returns

`Promise`\<[`DiscountDto`](../../discounts.dto/classes/DiscountDto.md) \| `null`\>
