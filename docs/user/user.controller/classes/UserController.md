[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [user/user.controller](../README.md) / UserController

# Class: UserController

Defined in: [src/user/user.controller.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.controller.ts#L30)

User Controller
Handles user profile management, profile image uploads, and FCM token registration

## Constructors

### Constructor

> **new UserController**(`userService`, `imgbbService`): `UserController`

Defined in: [src/user/user.controller.ts:33](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.controller.ts#L33)

#### Parameters

##### userService

[`UserService`](../../user.service/classes/UserService.md)

##### imgbbService

[`ImgBBService`](../../../journey/imgbb.service/classes/ImgBBService.md)

#### Returns

`UserController`

## Methods

### getProfile()

> **getProfile**(`req`): `Promise`\<`any`\>

Defined in: [src/user/user.controller.ts:44](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.controller.ts#L44)

Get authenticated user's profile

#### Parameters

##### req

`any`

#### Returns

`Promise`\<`any`\>

User profile without password field

***

### updateProfile()

> **updateProfile**(`req`, `dto`): `Promise`\<`any`\>

Defined in: [src/user/user.controller.ts:59](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.controller.ts#L59)

Update authenticated user's profile

#### Parameters

##### req

`any`

##### dto

[`UpdateUserDto`](../../user.dto/classes/UpdateUserDto.md)

#### Returns

`Promise`\<`any`\>

Updated user profile without password field

#### Body

UpdateUserDto - Profile update data

***

### uploadProfileImage()

> **uploadProfileImage**(`req`, `file`): `Promise`\<\{ `message`: `string`; `profile_image_url`: `string`; `user`: `any`; \}\>

Defined in: [src/user/user.controller.ts:99](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.controller.ts#L99)

Upload profile image
Rate limited: 5 requests per minute to prevent abuse

#### Parameters

##### req

`any`

##### file

`File`

#### Returns

`Promise`\<\{ `message`: `string`; `profile_image_url`: `string`; `user`: `any`; \}\>

***

### registerFcmToken()

> **registerFcmToken**(`req`, `body`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/user/user.controller.ts:176](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.controller.ts#L176)

Register FCM (Firebase Cloud Messaging) token for push notifications

#### Parameters

##### req

`any`

##### body

###### token

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

Success message

#### Body

token - FCM token string
