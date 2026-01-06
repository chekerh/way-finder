[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [auth/auth.service](../README.md) / AuthService

# Class: AuthService

Defined in: [src/auth/auth.service.ts:29](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L29)

## Constructors

### Constructor

> **new AuthService**(`userService`, `jwtService`, `googleAuthService`, `emailService`, `otpModel`): `AuthService`

Defined in: [src/auth/auth.service.ts:32](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L32)

#### Parameters

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### jwtService

`JwtService`

##### googleAuthService

[`GoogleAuthService`](../../google-auth.service/classes/GoogleAuthService.md)

##### emailService

[`EmailService`](../../email.service/classes/EmailService.md)

##### otpModel

`Model`\<`Document`\<`unknown`, \{ \}, `OTP`, \{ \}, \{ \}\> & `OTP` & `object` & `object`\>

#### Returns

`AuthService`

## Methods

### register()

> **register**(`dto`): `Promise`\<\{ `message`: `string`; `user`: \{ `__v`: `number`; `username`: `string`; `email`: `string`; `first_name`: `string`; `last_name`: `string`; `phone?`: `string`; `location?`: `string`; `bio?`: `string`; `profile_image_url?`: `string`; `google_id?`: `string`; `email_verified`: `boolean`; `email_verification_token?`: `string`; `email_verified_at?`: `Date`; `preferences`: `string`[]; `status`: `UserStatus`; `onboarding_completed`: `boolean`; `onboarding_completed_at`: `Date`; `onboarding_skipped`: `boolean`; `onboarding_preferences`: \{ `travel_type?`: `string`; `budget?`: `string`; `interests?`: `string`[]; `accommodation_preference?`: `string`; `destination_preferences?`: `string`[]; `group_size?`: `string`; `travel_frequency?`: `string`; `climate_preference?`: `string`; `duration_preference?`: `string`; \}; `fcm_token?`: `string`; `total_points`: `number`; `lifetime_points`: `number`; `current_streak`: `number`; `longest_streak`: `number`; `last_login_date?`: `Date`; `total_bookings`: `number`; `total_destinations`: `number`; `total_travel_days`: `number`; `total_distance_km`: `number`; `total_countries`: `number`; `total_outfits_analyzed`: `number`; `total_posts_shared`: `number`; \}; \}\>

Defined in: [src/auth/auth.service.ts:61](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L61)

Register a new user with email and password
Creates user account, sends verification email, and handles duplicate key errors gracefully

#### Parameters

##### dto

[`RegisterDto`](../../auth.dto/classes/RegisterDto.md)

Registration data containing username, email, password, first_name, last_name

#### Returns

`Promise`\<\{ `message`: `string`; `user`: \{ `__v`: `number`; `username`: `string`; `email`: `string`; `first_name`: `string`; `last_name`: `string`; `phone?`: `string`; `location?`: `string`; `bio?`: `string`; `profile_image_url?`: `string`; `google_id?`: `string`; `email_verified`: `boolean`; `email_verification_token?`: `string`; `email_verified_at?`: `Date`; `preferences`: `string`[]; `status`: `UserStatus`; `onboarding_completed`: `boolean`; `onboarding_completed_at`: `Date`; `onboarding_skipped`: `boolean`; `onboarding_preferences`: \{ `travel_type?`: `string`; `budget?`: `string`; `interests?`: `string`[]; `accommodation_preference?`: `string`; `destination_preferences?`: `string`[]; `group_size?`: `string`; `travel_frequency?`: `string`; `climate_preference?`: `string`; `duration_preference?`: `string`; \}; `fcm_token?`: `string`; `total_points`: `number`; `lifetime_points`: `number`; `current_streak`: `number`; `longest_streak`: `number`; `last_login_date?`: `Date`; `total_bookings`: `number`; `total_destinations`: `number`; `total_travel_days`: `number`; `total_distance_km`: `number`; `total_countries`: `number`; `total_outfits_analyzed`: `number`; `total_posts_shared`: `number`; \}; \}\>

User object (without password) and success message

#### Throws

BadRequestException if required fields are missing or invalid

#### Throws

ConflictException if username or email already exists

#### Example

```ts
const result = await authService.register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  first_name: 'John',
  last_name: 'Doe'
});

Note: Email verification token is automatically generated and sent
Note: Password is hashed using bcrypt with 10 salt rounds for security
```

***

### login()

> **login**(`dto`): `Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

Defined in: [src/auth/auth.service.ts:206](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L206)

Authenticate user with email and password
Validates credentials, updates login streak, and returns JWT token

#### Parameters

##### dto

[`LoginDto`](../../auth.dto/classes/LoginDto.md)

Login data containing email and password

#### Returns

`Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

JWT access token, user object (without password), and onboarding status

#### Throws

BadRequestException if email or password is missing

#### Throws

UnauthorizedException if credentials are invalid or user doesn't exist

#### Example

```ts
const result = await authService.login({
  email: 'john@example.com',
  password: 'SecurePass123!'
});

Note: Only accepts email addresses for login (not usernames)
Note: Updates user's day streak on successful login
Note: Google OAuth users without password cannot use this method
```

***

### googleSignIn()

> **googleSignIn**(`dto`): `Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `email_verified`: `boolean`; \}\>

Defined in: [src/auth/auth.service.ts:267](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L267)

Google Sign-In / Sign-Up
If user exists with Google ID, login; otherwise create new user

#### Parameters

##### dto

[`GoogleSignInDto`](../../auth.dto/classes/GoogleSignInDto.md)

#### Returns

`Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `email_verified`: `boolean`; \}\>

***

### verifyEmail()

> **verifyEmail**(`dto`): `Promise`\<\{ `message`: `string`; `user`: `any`; \}\>

Defined in: [src/auth/auth.service.ts:448](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L448)

Verify user email address using verification token
Marks email as verified and removes verification token

#### Parameters

##### dto

[`VerifyEmailDto`](../../auth.dto/classes/VerifyEmailDto.md)

Email verification data containing verification token

#### Returns

`Promise`\<\{ `message`: `string`; `user`: `any`; \}\>

Success message and user object with verified email status

#### Throws

NotFoundException if verification token is invalid or expired

#### Example

```ts
const result = await authService.verifyEmail({
  token: 'verification-token-from-email'
});

Note: Verification tokens are single-use and expire after a set period
Note: After verification, email_verified is set to true and email_verified_at is set
```

***

### resendVerificationEmail()

> **resendVerificationEmail**(`email`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/auth/auth.service.ts:483](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L483)

Resend email verification token to user
Generates new verification token and sends verification email

#### Parameters

##### email

`string`

User email address to resend verification to

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

Success message

#### Throws

NotFoundException if user doesn't exist with the provided email

#### Throws

BadRequestException if email is already verified

#### Example

```ts
const result = await authService.resendVerificationEmail('user@example.com');

Note: Generates a new verification token, invalidating the previous one
Note: Only works for unverified email addresses
```

***

### sendOTP()

> **sendOTP**(`dto`): `Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

Defined in: [src/auth/auth.service.ts:533](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L533)

Send OTP code to existing user's email for login
Validates user exists, generates OTP, and sends verification email

#### Parameters

##### dto

[`SendOTPDto`](../../auth.dto/classes/SendOTPDto.md)

OTP request containing email address

#### Returns

`Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

Success message and email confirmation

#### Throws

NotFoundException if user doesn't exist with the provided email

#### Throws

BadRequestException if cooldown period hasn't elapsed (30 seconds) or email service fails

#### Example

```ts
const result = await authService.sendOTP({
  email: 'existinguser@example.com'
});

Note: OTP code is 4 digits and expires after 5 minutes
Note: 30-second cooldown between OTP requests
Note: Existing OTPs for the email are invalidated when new one is sent
Note: Use sendOTPForRegistration() for new user signups
```

***

### verifyOTP()

> **verifyOTP**(`dto`): `Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

Defined in: [src/auth/auth.service.ts:650](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L650)

Verify OTP code and authenticate user
Validates 4-digit OTP, marks it as used, and returns JWT token for login

#### Parameters

##### dto

[`VerifyOTPDto`](../../auth.dto/classes/VerifyOTPDto.md)

OTP verification data containing email and 4-digit code

#### Returns

`Promise`\<\{ `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; \}\>

JWT access token, user object (without password), and onboarding status

#### Throws

BadRequestException if code format is invalid or no OTP was sent

#### Throws

UnauthorizedException if code is invalid, expired, or already used

#### Throws

NotFoundException if user doesn't exist after OTP verification

#### Example

```ts
const result = await authService.verifyOTP({
  email: 'john@example.com',
  code: '1234'
});

Note: OTP code is normalized to 4 digits (removes non-digit characters)
Note: OTP expires after 5 minutes
Note: Each OTP can only be used once
Note: Updates user's day streak on successful login
```

***

### sendOTPForRegistration()

> **sendOTPForRegistration**(`dto`): `Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

Defined in: [src/auth/auth.service.ts:790](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L790)

Send OTP code for new user registration
Validates that email doesn't exist, generates OTP, and sends verification email

#### Parameters

##### dto

[`SendOTPForRegistrationDto`](../../auth.dto/classes/SendOTPForRegistrationDto.md)

Registration OTP request containing email address

#### Returns

`Promise`\<\{ `message`: `string`; `email`: `string`; \}\>

Success message and email confirmation

#### Throws

ConflictException if email already exists (user should login instead)

#### Throws

BadRequestException if cooldown period hasn't elapsed (30 seconds) or email service fails

#### Example

```ts
const result = await authService.sendOTPForRegistration({
  email: 'newuser@example.com'
});

Note: OTP code is 4 digits and expires after 5 minutes
Note: 30-second cooldown between OTP requests
Note: Existing OTPs for the email are invalidated when new one is sent
Note: For existing users, use sendOTP() instead
```

***

### registerWithOTP()

> **registerWithOTP**(`dto`): `Promise`\<\{ `message`: `string`; `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `auto_login`: `boolean`; \} \| \{ `access_token?`: `undefined`; `onboarding_completed?`: `undefined`; `auto_login?`: `undefined`; `message`: `string`; `user`: `any`; \}\>

Defined in: [src/auth/auth.service.ts:917](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/auth.service.ts#L917)

Register a new user using OTP verification code
Verifies OTP code, creates user account with email already verified

#### Parameters

##### dto

[`RegisterWithOTPDto`](../../auth.dto/classes/RegisterWithOTPDto.md)

Registration data with OTP code, username, email, first_name, last_name

#### Returns

`Promise`\<\{ `message`: `string`; `access_token`: `string`; `user`: `any`; `onboarding_completed`: `boolean`; `auto_login`: `boolean`; \} \| \{ `access_token?`: `undefined`; `onboarding_completed?`: `undefined`; `auto_login?`: `undefined`; `message`: `string`; `user`: `any`; \}\>

User object (without password) and success message

#### Throws

BadRequestException if OTP format is invalid, required fields missing, or username format invalid

#### Throws

UnauthorizedException if OTP is invalid, expired, or already used

#### Throws

ConflictException if username or email already exists

#### Example

```ts
const result = await authService.registerWithOTP({
  email: 'newuser@example.com',
  otp_code: '1234',
  username: 'newuser',
  first_name: 'New',
  last_name: 'User'
});

Note: Email is automatically verified since OTP was sent to it
Note: No password required for OTP-based registration
Note: User can login later using OTP code or set password
```
