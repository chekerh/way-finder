[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [catalog/activities.service](../README.md) / ActivitiesService

# Class: ActivitiesService

Defined in: [src/catalog/activities.service.ts:37](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/activities.service.ts#L37)

## Constructors

### Constructor

> **new ActivitiesService**(`http`, `cacheService`): `ActivitiesService`

Defined in: [src/catalog/activities.service.ts:43](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/activities.service.ts#L43)

#### Parameters

##### http

`HttpService`

##### cacheService

[`CacheService`](../../../common/cache/cache.service/classes/CacheService.md)

#### Returns

`ActivitiesService`

## Methods

### findActivities()

> **findActivities**(`params`): `Promise`\<[`ActivityFeedResponse`](../interfaces/ActivityFeedResponse.md)\>

Defined in: [src/catalog/activities.service.ts:48](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/catalog/activities.service.ts#L48)

#### Parameters

##### params

[`ActivitySearchDto`](../../dto/activity-search.dto/interfaces/ActivitySearchDto.md)

#### Returns

`Promise`\<[`ActivityFeedResponse`](../interfaces/ActivityFeedResponse.md)\>
