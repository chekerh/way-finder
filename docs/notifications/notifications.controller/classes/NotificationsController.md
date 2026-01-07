[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [notifications/notifications.controller](../README.md) / NotificationsController

# Class: NotificationsController

Defined in: [src/notifications/notifications.controller.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L31)

Notifications Controller
Handles user notifications, read/unread status, and notification management

## Constructors

### Constructor

> **new NotificationsController**(`notificationsService`): `NotificationsController`

Defined in: [src/notifications/notifications.controller.ts:32](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L32)

#### Parameters

##### notificationsService

[`NotificationsService`](../../notifications.service/classes/NotificationsService.md)

#### Returns

`NotificationsController`

## Methods

### createNotification()

> **createNotification**(`req`, `createNotificationDto`): `Promise`\<`any`\>

Defined in: [src/notifications/notifications.controller.ts:35](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L35)

#### Parameters

##### req

`any`

##### createNotificationDto

[`CreateNotificationDto`](../../notifications.dto/classes/CreateNotificationDto.md)

#### Returns

`Promise`\<`any`\>

***

### getNotifications()

> **getNotifications**(`req`, `unreadOnly?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/notifications/notifications.controller.ts:58](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L58)

Get user notifications with pagination
Rate limited: 60 requests per minute to allow frequent polling

#### Parameters

##### req

`any`

##### unreadOnly?

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

unreadOnly - Filter to unread notifications only (default: false)

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getUnreadCount()

> **getUnreadCount**(`req`): `Promise`\<\{ `count`: `number`; \}\>

Defined in: [src/notifications/notifications.controller.ts:88](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L88)

Get unread notifications count
Rate limited: 60 requests per minute to allow frequent polling

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `count`: `number`; \}\>

***

### markAsRead()

> **markAsRead**(`req`, `id`): `Promise`\<`any`\>

Defined in: [src/notifications/notifications.controller.ts:94](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L94)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<`any`\>

***

### markAllAsRead()

> **markAllAsRead**(`req`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/notifications/notifications.controller.ts:106](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L106)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### markAsReadByAction()

> **markAsReadByAction**(`req`, `body`): `Promise`\<\{ `message`: `string`; `count`: `number`; \}\>

Defined in: [src/notifications/notifications.controller.ts:112](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L112)

#### Parameters

##### req

`any`

##### body

###### actionUrl

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `count`: `number`; \}\>

***

### deleteNotification()

> **deleteNotification**(`req`, `id`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/notifications/notifications.controller.ts:125](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L125)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### deleteAllNotifications()

> **deleteAllNotifications**(`req`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/notifications/notifications.controller.ts:131](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L131)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### cleanupDuplicates()

> **cleanupDuplicates**(`req`): `Promise`\<\{ `message`: `string`; `deletedCount`: `number`; \}\>

Defined in: [src/notifications/notifications.controller.ts:137](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.controller.ts#L137)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `message`: `string`; `deletedCount`: `number`; \}\>
