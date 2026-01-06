[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [user/user.service](../README.md) / UserService

# Class: UserService

Defined in: [src/user/user.service.ts:12](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L12)

User Service
Handles all user-related operations including CRUD, authentication helpers, and profile management

## Constructors

### Constructor

> **new UserService**(`userModel`): `UserService`

Defined in: [src/user/user.service.ts:13](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L13)

#### Parameters

##### userModel

`Model`\<`Document`\<`unknown`, \{ \}, `User`, \{ \}, \{ \}\> & `User` & `object` & `object`\>

#### Returns

`UserService`

## Methods

### create()

> **create**(`createUserDto`): `Promise`\<`User`\>

Defined in: [src/user/user.service.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L22)

Create a new user

#### Parameters

##### createUserDto

[`CreateUserDto`](../../user.dto/classes/CreateUserDto.md)

User creation data

#### Returns

`Promise`\<`User`\>

Created user document

***

### findByUsername()

> **findByUsername**(`username`): `Promise`\<`User` \| `null`\>

Defined in: [src/user/user.service.ts:48](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L48)

Find user by username (case-sensitive, trimmed)

#### Parameters

##### username

`string`

Username to search for

#### Returns

`Promise`\<`User` \| `null`\>

User document or null if not found

***

### findByEmail()

> **findByEmail**(`email`): `Promise`\<`User` \| `null`\>

Defined in: [src/user/user.service.ts:59](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L59)

Find user by email (case-insensitive, normalized to lowercase)

#### Parameters

##### email

`string`

Email address to search for

#### Returns

`Promise`\<`User` \| `null`\>

User document or null if not found

***

### findByGoogleId()

> **findByGoogleId**(`googleId`): `Promise`\<`User` \| `null`\>

Defined in: [src/user/user.service.ts:70](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L70)

Find user by Google OAuth ID

#### Parameters

##### googleId

`string`

Google user ID

#### Returns

`Promise`\<`User` \| `null`\>

User document or null if not found

***

### findByVerificationToken()

> **findByVerificationToken**(`token`): `Promise`\<`User` \| `null`\>

Defined in: [src/user/user.service.ts:79](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L79)

Find user by email verification token

#### Parameters

##### token

`string`

Email verification token

#### Returns

`Promise`\<`User` \| `null`\>

User document or null if not found

***

### findById()

> **findById**(`id`): `Promise`\<`User` \| `null`\>

Defined in: [src/user/user.service.ts:88](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L88)

Find user by MongoDB ObjectId

#### Parameters

##### id

`string`

User ID (ObjectId string)

#### Returns

`Promise`\<`User` \| `null`\>

User document or null if not found

***

### updateGoogleId()

> **updateGoogleId**(`userId`, `googleId`): `Promise`\<`User`\>

Defined in: [src/user/user.service.ts:99](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L99)

Update user's Google OAuth ID (links Google account to existing user)

#### Parameters

##### userId

`string`

User ID

##### googleId

`string`

Google user ID to link

#### Returns

`Promise`\<`User`\>

Updated user document

#### Throws

NotFoundException if user not found

***

### verifyEmail()

> **verifyEmail**(`userId`): `Promise`\<`User`\>

Defined in: [src/user/user.service.ts:118](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L118)

Mark user's email as verified
Removes verification token and sets verified status

#### Parameters

##### userId

`string`

User ID

#### Returns

`Promise`\<`User`\>

Updated user document

#### Throws

NotFoundException if user not found

***

### updateVerificationToken()

> **updateVerificationToken**(`userId`, `token`): `Promise`\<`User`\>

Defined in: [src/user/user.service.ts:136](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L136)

#### Parameters

##### userId

`string`

##### token

`string`

#### Returns

`Promise`\<`User`\>

***

### updateProfile()

> **updateProfile**(`userId`, `updateUserDto`): `Promise`\<`User`\>

Defined in: [src/user/user.service.ts:148](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L148)

#### Parameters

##### userId

`string`

##### updateUserDto

[`UpdateUserDto`](../../user.dto/classes/UpdateUserDto.md)

#### Returns

`Promise`\<`User`\>

***

### updateFcmToken()

> **updateFcmToken**(`userId`, `fcmToken`): `Promise`\<`User`\>

Defined in: [src/user/user.service.ts:169](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L169)

#### Parameters

##### userId

`string`

##### fcmToken

`string`

#### Returns

`Promise`\<`User`\>

***

### getFcmToken()

> **getFcmToken**(`userId`): `Promise`\<`string` \| `null`\>

Defined in: [src/user/user.service.ts:181](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L181)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### updateDayStreak()

> **updateDayStreak**(`userId`): `Promise`\<\{ `current_streak`: `number`; `longest_streak`: `number`; `streak_updated`: `boolean`; \}\>

Defined in: [src/user/user.service.ts:193](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L193)

Update day streak when user logs in or performs an activity
Returns the updated streak count

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `current_streak`: `number`; `longest_streak`: `number`; `streak_updated`: `boolean`; \}\>

***

### incrementLifetimeMetric()

> **incrementLifetimeMetric**(`userId`, `metric`, `amount`): `Promise`\<`void`\>

Defined in: [src/user/user.service.ts:260](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/user/user.service.ts#L260)

Increment lifetime metrics

#### Parameters

##### userId

`string`

##### metric

`"total_bookings"` | `"total_destinations"` | `"total_travel_days"` | `"total_distance_km"` | `"total_countries"` | `"total_outfits_analyzed"` | `"total_posts_shared"`

##### amount

`number` = `1`

#### Returns

`Promise`\<`void`\>
