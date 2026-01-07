[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [auth/email.service](../README.md) / EmailService

# Class: EmailService

Defined in: [src/auth/email.service.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L11)

## Constructors

### Constructor

> **new EmailService**(): `EmailService`

Defined in: [src/auth/email.service.ts:20](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L20)

#### Returns

`EmailService`

## Methods

### generateVerificationToken()

> **generateVerificationToken**(): `string`

Defined in: [src/auth/email.service.ts:233](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L233)

Generate a secure random token for email verification

#### Returns

`string`

***

### sendVerificationEmail()

> **sendVerificationEmail**(`email`, `token`, `firstName?`): `Promise`\<`void`\>

Defined in: [src/auth/email.service.ts:240](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L240)

Send email verification email

#### Parameters

##### email

`string`

##### token

`string`

##### firstName?

`string`

#### Returns

`Promise`\<`void`\>

***

### generateOTPCode()

> **generateOTPCode**(): `string`

Defined in: [src/auth/email.service.ts:327](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L327)

Generate a 4-digit OTP code

#### Returns

`string`

***

### sendOTPEmail()

> **sendOTPEmail**(`email`, `otpCode`, `firstName?`): `Promise`\<`void`\>

Defined in: [src/auth/email.service.ts:334](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L334)

Send OTP code via email

#### Parameters

##### email

`string`

##### otpCode

`string`

##### firstName?

`string`

#### Returns

`Promise`\<`void`\>

***

### sendPasswordResetEmail()

> **sendPasswordResetEmail**(`email`, `token`, `firstName?`): `Promise`\<`void`\>

Defined in: [src/auth/email.service.ts:458](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L458)

Send password reset email (for future use)

#### Parameters

##### email

`string`

##### token

`string`

##### firstName?

`string`

#### Returns

`Promise`\<`void`\>

***

### sendRefundEmail()

> **sendRefundEmail**(`email`, `firstName`, `confirmationNumber`, `totalPrice`, `currency`, `destination`): `Promise`\<`void`\>

Defined in: [src/auth/email.service.ts:541](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L541)

Send refund email when booking is cancelled

#### Parameters

##### email

`string`

##### firstName

`string`

##### confirmationNumber

`string`

##### totalPrice

`number`

##### currency

`string`

##### destination

`string`

#### Returns

`Promise`\<`void`\>

***

### sendRebookingRequestEmail()

> **sendRebookingRequestEmail**(`userEmail`, `userName`, `confirmationNumber`, `bookingId`, `destination`, `totalPrice`, `currency`, `tripDetails?`): `Promise`\<`void`\>

Defined in: [src/auth/email.service.ts:635](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L635)

Send email to customer support when user requests to rebook a cancelled booking

#### Parameters

##### userEmail

`string`

##### userName

`string`

##### confirmationNumber

`string`

##### bookingId

`string`

##### destination

`string`

##### totalPrice

`number`

##### currency

`string`

##### tripDetails?

`any`

#### Returns

`Promise`\<`void`\>

***

### sendRebookingConfirmationEmail()

> **sendRebookingConfirmationEmail**(`email`, `firstName`, `confirmationNumber`, `destination`): `Promise`\<`void`\>

Defined in: [src/auth/email.service.ts:744](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/auth/email.service.ts#L744)

Send confirmation email to user when they request to rebook a cancelled booking

#### Parameters

##### email

`string`

##### firstName

`string`

##### confirmationNumber

`string`

##### destination

`string`

#### Returns

`Promise`\<`void`\>
