[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [recommendations/recommendations.controller](../README.md) / RecommendationsController

# Class: RecommendationsController

Defined in: [src/recommendations/recommendations.controller.ts:10](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/recommendations/recommendations.controller.ts#L10)

Recommendations Controller
Handles personalized travel recommendations based on user preferences

## Constructors

### Constructor

> **new RecommendationsController**(`recommendationsService`): `RecommendationsController`

Defined in: [src/recommendations/recommendations.controller.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/recommendations/recommendations.controller.ts#L11)

#### Parameters

##### recommendationsService

[`RecommendationsService`](../../recommendations.service/classes/RecommendationsService.md)

#### Returns

`RecommendationsController`

## Methods

### getPersonalized()

> **getPersonalized**(`req`, `type`, `limit`): `Promise`\<`any`\>

Defined in: [src/recommendations/recommendations.controller.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/recommendations/recommendations.controller.ts#L23)

Get personalized recommendations for the authenticated user

#### Parameters

##### req

`any`

##### type

`string` = `'all'`

##### limit

`string` = `'10'`

#### Returns

`Promise`\<`any`\>

Personalized recommendations object with destinations, offers, and activities

#### Query

type - Type of recommendations ('all', 'destinations', 'offers', 'activities')

#### Query

limit - Maximum number of recommendations per category (default: 10)

***

### regenerate()

> **regenerate**(`req`): `Promise`\<`any`\>

Defined in: [src/recommendations/recommendations.controller.ts:42](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/recommendations/recommendations.controller.ts#L42)

Regenerate personalized recommendations for the authenticated user

#### Parameters

##### req

`any`

#### Returns

`Promise`\<`any`\>

Fresh personalized recommendations object
