[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [notifications/fcm.service](../README.md) / FcmService

# Class: FcmService

Defined in: [src/notifications/fcm.service.ts:9](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/fcm.service.ts#L9)

## Constructors

### Constructor

> **new FcmService**(): `FcmService`

Defined in: [src/notifications/fcm.service.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/fcm.service.ts#L13)

#### Returns

`FcmService`

## Methods

### sendNotification()

> **sendNotification**(`fcmToken`, `title`, `message`, `data?`): `Promise`\<`boolean`\>

Defined in: [src/notifications/fcm.service.ts:60](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/fcm.service.ts#L60)

#### Parameters

##### fcmToken

`string`

##### title

`string`

##### message

`string`

##### data?

###### type?

`string`

###### notificationId?

`string`

###### actionUrl?

`string`

#### Returns

`Promise`\<`boolean`\>

***

### sendNotificationToMultiple()

> **sendNotificationToMultiple**(`fcmTokens`, `title`, `message`, `data?`): `Promise`\<`BatchResponse`\>

Defined in: [src/notifications/fcm.service.ts:179](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/fcm.service.ts#L179)

#### Parameters

##### fcmTokens

`string`[]

##### title

`string`

##### message

`string`

##### data?

`Record`\<`string`, `any`\>

#### Returns

`Promise`\<`BatchResponse`\>

***

### isInitialized()

> **isInitialized**(): `boolean`

Defined in: [src/notifications/fcm.service.ts:254](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/fcm.service.ts#L254)

#### Returns

`boolean`
