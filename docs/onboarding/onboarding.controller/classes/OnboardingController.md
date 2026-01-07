[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [onboarding/onboarding.controller](../README.md) / OnboardingController

# Class: OnboardingController

Defined in: [src/onboarding/onboarding.controller.ts:11](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L11)

Onboarding Controller
Handles AI-driven dynamic onboarding flow for new users

## Constructors

### Constructor

> **new OnboardingController**(`onboardingService`): `OnboardingController`

Defined in: [src/onboarding/onboarding.controller.ts:12](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L12)

#### Parameters

##### onboardingService

[`OnboardingService`](../../onboarding.service/classes/OnboardingService.md)

#### Returns

`OnboardingController`

## Methods

### start()

> **start**(`req`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.controller.ts:20](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L20)

Start a new onboarding session for the authenticated user

#### Parameters

##### req

`any`

#### Returns

`Promise`\<`any`\>

Onboarding session with first question

***

### answer()

> **answer**(`req`, `dto`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.controller.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L31)

Submit an answer to the current onboarding question

#### Parameters

##### req

`any`

##### dto

[`AnswerDto`](../../onboarding.dto/classes/AnswerDto.md)

#### Returns

`Promise`\<`any`\>

Next question or completion status

#### Body

AnswerDto - Answer data including question_id and answer

***

### status()

> **status**(`req`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.controller.ts:41](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L41)

Get current onboarding status for the authenticated user

#### Parameters

##### req

`any`

#### Returns

`Promise`\<`any`\>

Current onboarding status, progress, and session info

***

### resume()

> **resume**(`req`, `dto`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.controller.ts:52](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L52)

Resume an existing onboarding session

#### Parameters

##### req

`any`

##### dto

[`ResumeOnboardingDto`](../../onboarding.dto/classes/ResumeOnboardingDto.md)

#### Returns

`Promise`\<`any`\>

Onboarding session with current question

#### Body

ResumeOnboardingDto - Session ID to resume

***

### skip()

> **skip**(`req`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.controller.ts:63](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L63)

Skip the onboarding process for the authenticated user
Marks onboarding as completed without answering questions

#### Parameters

##### req

`any`

#### Returns

`Promise`\<`any`\>

Completion status

***

### reset()

> **reset**(`req`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.controller.ts:74](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.controller.ts#L74)

Reset onboarding for the authenticated user
Clears all onboarding data and starts fresh

#### Parameters

##### req

`any`

#### Returns

`Promise`\<`any`\>

Reset confirmation and new session
