[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [auth/auth.controller](../README.md) / AuthController

# Class: AuthController

Defined in: [src/auth/auth.controller.ts:20](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L20)

Authentication Controller
Handles user authentication, registration, email verification, and OTP-based login

## Constructors

### Constructor

> **new AuthController**(`authService`): `AuthController`

Defined in: [src/auth/auth.controller.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L21)

#### Parameters

##### authService

[`AuthService`](../../auth.service/classes/AuthService.md)

#### Returns

`AuthController`

## Methods

### register()

> **register**(`dto`): `Promise`\<\{ `message`: `string`; `user`: \{ `__v`: `number`; `username`: `string`; `email`: `string`; `first_name`: `string`; `last_name`: `string`; `phone?`: `string`; `location?`: `string`; `bio?`: `string`; `profile_image_url?`: `string`; `google_id?`: `string`; `email_verified`: `boolean`; `email_verification_token?`: `string`; `email_verified_at?`: `Date`; `preferences`: `string`[]; `status`: `UserStatus`; `onboarding_completed`: `boolean`; `onboarding_completed_at`: `Date`; `onboarding_skipped`: `boolean`; `onboarding_preferences`: \{ `travel_type?`: `string`; `budget?`: `string`; `interests?`: `string`[]; `accommodation_preference?`: `string`; `destination_preferences?`: `string`[]; `group_size?`: `string`; `travel_frequency?`: `string`; `climate_preference?`: `string`; `duration_preference?`: `string`; \}; `fcm_token?`: `string`; `total_points`: `number`; `lifetime_points`: `number`; `current_streak`: `number`; `longest_streak`: `number`; `last_login_date?`: `Date`; `total_bookings`: `number`; `total_destinations`: `number`; `total_travel_days`: `number`; `total_distance_km`: `number`; `total_countries`: `number`; `total_outfits_analyzed`: `number`; `total_posts_shared`: `number`; \}; \}\>

Defined in: [src/auth/auth.controller.ts:29](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L29)

Register a new user account
Rate limited: 5 requests per minute to prevent abuse

#### Parameters

##### dto

[`RegisterDto`](../../auth.dto/classes/RegisterDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `user`: \{ `__v`: `number`; `username`: `string`; `email`: `string`; `first_name`: `string`; `last_name`: `string`; `phone?`: `string`; `location?`: `string`; `bio?`: `string`; `profile_image_url?`: `string`; `google_id?`: `string`; `email_verified`: `boolean`; `email_verification_token?`: `string`; `email_verified_at?`: `Date`; `preferences`: `string`[]; `status`: `UserStatus`; `onboarding_completed`: `boolean`; `onboarding_completed_at`: `Date`; `onboarding_skipped`: `boolean`; `onboarding_preferences`: \{ `travel_type?`: `string`; `budget?`: `string`; `interests?`: `string`[]; `accommodation_preference?`: `string`; `destination_preferences?`: `string`[]; `group_size?`: `string`; `travel_frequency?`: `string`; `climate_preference?`: `string`; `duration_preference?`: `string`; \}; `fcm_token?`: `string`; `total_points`: `number`; `lifetime_points`: `number`; `current_streak`: `number`; `longest_streak`: `number`; `last_login_date?`: `Date`; `total_bookings`: `number`; `total_destinations`: `number`; `total_travel_days`: `number`; `total_distance_km`: `number`; `total_countries`: `number`; `total_outfits_analyzed`: `number`; `total_posts_shared`: `number`; \}; \}\>

***

### login()

> **login**(`dto`): `Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

Defined in: [src/auth/auth.controller.ts:39](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L39)

User login
Rate limited: 5 requests per minute to prevent brute force attacks

#### Parameters

##### dto

[`LoginDto`](../../auth.dto/classes/LoginDto.md)

#### Returns

`Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

***

### googleSignIn()

> **googleSignIn**(`dto`): `Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `email_verified`: `boolean`; \}\>

Defined in: [src/auth/auth.controller.ts:44](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L44)

#### Parameters

##### dto

[`GoogleSignInDto`](../../auth.dto/classes/GoogleSignInDto.md)

#### Returns

`Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `email_verified`: `boolean`; \}\>

***

### verifyEmail()

> **verifyEmail**(`dto`): `Promise`\<\{ `message`: `string`; `user`: `any`; \}\>

Defined in: [src/auth/auth.controller.ts:49](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L49)

#### Parameters

##### dto

[`VerifyEmailDto`](../../auth.dto/classes/VerifyEmailDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `user`: `any`; \}\>

***

### verifyEmailGet()

> **verifyEmailGet**(`token`): `Promise`\<\{ `message`: `string`; `user`: `any`; \}\>

Defined in: [src/auth/auth.controller.ts:54](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L54)

#### Parameters

##### token

`string`

#### Returns

`Promise`\<\{ `message`: `string`; `user`: `any`; \}\>

***

### resendVerificationEmail()

> **resendVerificationEmail**(`body`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/auth/auth.controller.ts:64](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L64)

Resend email verification
Rate limited: 3 requests per minute to prevent spam

#### Parameters

##### body

###### email

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### sendOTP()

> **sendOTP**(`dto`): `Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

Defined in: [src/auth/auth.controller.ts:74](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L74)

Send OTP for login
Rate limited: 3 requests per minute to prevent spam

#### Parameters

##### dto

[`SendOTPDto`](../../auth.dto/classes/SendOTPDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

***

### verifyOTP()

> **verifyOTP**(`dto`): `Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

Defined in: [src/auth/auth.controller.ts:79](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L79)

#### Parameters

##### dto

[`VerifyOTPDto`](../../auth.dto/classes/VerifyOTPDto.md)

#### Returns

`Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

***

### sendOTPForRegistration()

> **sendOTPForRegistration**(`dto`): `Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

Defined in: [src/auth/auth.controller.ts:89](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L89)

Send OTP for registration
Rate limited: 3 requests per minute to prevent spam

#### Parameters

##### dto

[`SendOTPForRegistrationDto`](../../auth.dto/classes/SendOTPForRegistrationDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

***

### registerWithOTP()

> **registerWithOTP**(`dto`): `Promise`\<\{ `message`: `string`; `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `auto_login`: `boolean`; \} \| \{ `access_token?`: `undefined`; `onboarding_completed?`: `undefined`; `auto_login?`: `undefined`; `message`: `string`; `user`: `any`; \}\>

Defined in: [src/auth/auth.controller.ts:94](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.controller.ts#L94)

#### Parameters

##### dto

[`RegisterWithOTPDto`](../../auth.dto/classes/RegisterWithOTPDto.md)

#### Returns

`Promise`\<\{ `message`: `string`; `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `auto_login`: `boolean`; \} \| \{ `access_token?`: `undefined`; `onboarding_completed?`: `undefined`; `auto_login?`: `undefined`; `message`: `string`; `user`: `any`; \}\>
