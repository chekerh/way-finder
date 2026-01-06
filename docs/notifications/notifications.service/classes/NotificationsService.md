[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [notifications/notifications.service](../README.md) / NotificationsService

# Class: NotificationsService

Defined in: [src/notifications/notifications.service.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L22)

Notifications Service
Handles in-app notifications, push notifications (FCM), and notification management
Includes duplicate prevention, atomic operations, and booking verification

## Constructors

### Constructor

> **new NotificationsService**(`notificationModel`, `bookingModel`, `fcmService`, `userService`): `NotificationsService`

Defined in: [src/notifications/notifications.service.ts:25](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L25)

#### Parameters

##### notificationModel

`Model`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

##### bookingModel

`Model`\<`Document`\<`unknown`, \{ \}, `Booking`, \{ \}, \{ \}\> & `Booking` & `object` & `object`\>

##### fcmService

[`FcmService`](../../fcm.service/classes/FcmService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

#### Returns

`NotificationsService`

## Methods

### createNotification()

> **createNotification**(`userId`, `createNotificationDto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

Defined in: [src/notifications/notifications.service.ts:44](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L44)

Create a new notification with duplicate prevention
For booking notifications, verifies booking exists and prevents duplicates
Sends FCM push notification if configured and user has FCM token

#### Parameters

##### userId

`string`

User ID to send notification to

##### createNotificationDto

[`CreateNotificationDto`](../../notifications.dto/classes/CreateNotificationDto.md)

Notification data

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

Created notification document

#### Throws

BadRequestException if userId is invalid

#### Throws

NotFoundException if booking doesn't exist for booking notifications

***

### ~~getUserNotifications()~~

> **getUserNotifications**(`userId`, `unreadOnly`): `Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`[]\>

Defined in: [src/notifications/notifications.service.ts:405](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L405)

Get user notifications (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### unreadOnly

`boolean` = `false`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`[]\>

#### Deprecated

Use getUserNotificationsPaginated instead for better performance

***

### getUserNotificationsPaginated()

> **getUserNotificationsPaginated**(`userId`, `unreadOnly`, `page`, `limit`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/notifications/notifications.service.ts:428](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L428)

Get paginated user notifications

#### Parameters

##### userId

`string`

User ID

##### unreadOnly

`boolean` = `false`

Filter to unread notifications only

##### page

`number`

Page number (1-based)

##### limit

`number`

Items per page

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated notification results

***

### markNotificationsAsReadByAction()

> **markNotificationsAsReadByAction**(`userId`, `actionUrl`): `Promise`\<`number`\>

Defined in: [src/notifications/notifications.service.ts:453](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L453)

#### Parameters

##### userId

`string`

##### actionUrl

`string`

#### Returns

`Promise`\<`number`\>

***

### getUnreadCount()

> **getUnreadCount**(`userId`): `Promise`\<`number`\>

Defined in: [src/notifications/notifications.service.ts:467](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L467)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`number`\>

***

### markAsRead()

> **markAsRead**(`userId`, `notificationId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

Defined in: [src/notifications/notifications.service.ts:473](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L473)

#### Parameters

##### userId

`string`

##### notificationId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

***

### markAllAsRead()

> **markAllAsRead**(`userId`): `Promise`\<`void`\>

Defined in: [src/notifications/notifications.service.ts:489](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L489)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteNotification()

> **deleteNotification**(`userId`, `notificationId`): `Promise`\<`void`\>

Defined in: [src/notifications/notifications.service.ts:498](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L498)

#### Parameters

##### userId

`string`

##### notificationId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteAllNotifications()

> **deleteAllNotifications**(`userId`): `Promise`\<`void`\>

Defined in: [src/notifications/notifications.service.ts:507](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L507)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`void`\>

***

### deleteNotificationsByBookingId()

> **deleteNotificationsByBookingId**(`userId`, `bookingId`): `Promise`\<`void`\>

Defined in: [src/notifications/notifications.service.ts:517](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L517)

Delete all notifications related to a specific booking
This is called when a booking is permanently deleted to prevent infinite notification loops

#### Parameters

##### userId

`string`

##### bookingId

`string`

#### Returns

`Promise`\<`void`\>

***

### findExistingNotification()

> **findExistingNotification**(`userId`, `type`, `bookingId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object` \| `null`\>

Defined in: [src/notifications/notifications.service.ts:536](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L536)

Check if a notification already exists for a booking
This is used to prevent unnecessary calls to createNotification

#### Parameters

##### userId

`string`

##### type

`"booking_confirmed"` | `"booking_cancelled"` | `"booking_updated"`

##### bookingId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object` \| `null`\>

***

### cleanupDuplicateBookingNotifications()

> **cleanupDuplicateBookingNotifications**(`userId`): `Promise`\<`number`\>

Defined in: [src/notifications/notifications.service.ts:557](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L557)

Clean up duplicate notifications for booking-related events
This removes all but the most recent notification for each bookingId+type combination

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`number`\>

***

### createBookingNotification()

> **createBookingNotification**(`userId`, `type`, `bookingId`, `message`, `data?`): `Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

Defined in: [src/notifications/notifications.service.ts:622](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L622)

#### Parameters

##### userId

`string`

##### type

`"booking_confirmed"` | `"booking_cancelled"` | `"booking_updated"`

##### bookingId

`string`

##### message

`string`

##### data?

`Record`\<`string`, `any`\>

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

***

### createPriceAlertNotification()

> **createPriceAlertNotification**(`userId`, `destinationId`, `destinationName`, `oldPrice`, `newPrice`): `Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

Defined in: [src/notifications/notifications.service.ts:647](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L647)

#### Parameters

##### userId

`string`

##### destinationId

`string`

##### destinationName

`string`

##### oldPrice

`number`

##### newPrice

`number`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

***

### createPaymentNotification()

> **createPaymentNotification**(`userId`, `type`, `bookingId`, `amount`): `Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>

Defined in: [src/notifications/notifications.service.ts:668](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/notifications/notifications.service.ts#L668)

#### Parameters

##### userId

`string`

##### type

`"payment_success"` | `"payment_failed"`

##### bookingId

`string`

##### amount

`number`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Notification`, \{ \}, \{ \}\> & `Notification` & `object` & `object`\>
