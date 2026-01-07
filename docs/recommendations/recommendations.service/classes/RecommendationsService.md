[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [recommendations/recommendations.service](../README.md) / RecommendationsService

# Class: RecommendationsService

Defined in: [src/recommendations/recommendations.service.ts:10](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/recommendations/recommendations.service.ts#L10)

Recommendations Service
Generates personalized travel recommendations based on user preferences and onboarding data

## Constructors

### Constructor

> **new RecommendationsService**(`userService`, `cacheService`): `RecommendationsService`

Defined in: [src/recommendations/recommendations.service.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/recommendations/recommendations.service.ts#L13)

#### Parameters

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### cacheService

[`CacheService`](../../../common/cache/cache.service/classes/CacheService.md)

#### Returns

`RecommendationsService`

## Methods

### generatePersonalizedRecommendations()

> **generatePersonalizedRecommendations**(`userId`, `type`, `limit`): `Promise`\<`any`\>

Defined in: [src/recommendations/recommendations.service.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/recommendations/recommendations.service.ts#L26)

Generate personalized recommendations for a user

#### Parameters

##### userId

`string`

User ID

##### type

`string` = `'all'`

Type of recommendations ('all', 'destinations', 'offers', 'activities')

##### limit

`number` = `10`

Maximum number of recommendations per category

#### Returns

`Promise`\<`any`\>

Personalized recommendations object

#### Throws

NotFoundException if user not found
