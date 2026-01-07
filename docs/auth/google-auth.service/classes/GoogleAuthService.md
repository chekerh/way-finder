[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [auth/google-auth.service](../README.md) / GoogleAuthService

# Class: GoogleAuthService

Defined in: [src/auth/google-auth.service.ts:5](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/google-auth.service.ts#L5)

## Constructors

### Constructor

> **new GoogleAuthService**(): `GoogleAuthService`

Defined in: [src/auth/google-auth.service.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/google-auth.service.ts#L11)

#### Returns

`GoogleAuthService`

## Methods

### verifyIdToken()

> **verifyIdToken**(`idToken`, `clientType`): `Promise`\<\{ `googleId`: `string`; `email`: `string`; `emailVerified`: `boolean`; `name`: `string`; `firstName`: `string`; `lastName`: `string`; `picture?`: `string`; \}\>

Defined in: [src/auth/google-auth.service.ts:44](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/google-auth.service.ts#L44)

Verify Google ID token and extract user information

#### Parameters

##### idToken

`string`

Google ID token from client

##### clientType

'web' or 'android' to determine which client ID to verify against

`"web"` | `"android"`

#### Returns

`Promise`\<\{ `googleId`: `string`; `email`: `string`; `emailVerified`: `boolean`; `name`: `string`; `firstName`: `string`; `lastName`: `string`; `picture?`: `string`; \}\>

User information from Google

***

### isConfigured()

> **isConfigured**(): `boolean`

Defined in: [src/auth/google-auth.service.ts:133](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/google-auth.service.ts#L133)

Check if Google OAuth is properly configured
For Android, only client ID is needed. For Web, both ID and secret are needed.

#### Returns

`boolean`

***

### isAndroidConfigured()

> **isAndroidConfigured**(): `boolean`

Defined in: [src/auth/google-auth.service.ts:145](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/google-auth.service.ts#L145)

Check if Android OAuth is configured

#### Returns

`boolean`
