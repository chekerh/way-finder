[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [onboarding/onboarding.service](../README.md) / OnboardingService

# Class: OnboardingService

Defined in: [src/onboarding/onboarding.service.ts:23](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L23)

## Constructors

### Constructor

> **new OnboardingService**(`onboardingModel`, `aiService`, `userService`, `rewardsService`, `http`): `OnboardingService`

Defined in: [src/onboarding/onboarding.service.ts:24](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L24)

#### Parameters

##### onboardingModel

`Model`\<`Document`\<`unknown`, \{ \}, `OnboardingSession`, \{ \}, \{ \}\> & `OnboardingSession` & `object` & `object`\>

##### aiService

[`OnboardingAIService`](../../ai/onboarding-ai.service/classes/OnboardingAIService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### rewardsService

[`RewardsService`](../../../rewards/rewards.service/classes/RewardsService.md)

##### http

`HttpService`

#### Returns

`OnboardingService`

## Methods

### startSession()

> **startSession**(`userId`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.service.ts:39](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L39)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`any`\>

***

### submitAnswer()

> **submitAnswer**(`userId`, `dto`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.service.ts:66](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L66)

#### Parameters

##### userId

`string`

##### dto

[`AnswerDto`](../../onboarding.dto/classes/AnswerDto.md)

#### Returns

`Promise`\<`any`\>

***

### completeOnboarding()

> **completeOnboarding**(`userId`, `sessionId`, `providedPreferences?`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.service.ts:99](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L99)

#### Parameters

##### userId

`string`

##### sessionId

`string`

##### providedPreferences?

`any`

#### Returns

`Promise`\<`any`\>

***

### getStatus()

> **getStatus**(`userId`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.service.ts:171](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L171)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`any`\>

***

### resumeSession()

> **resumeSession**(`userId`, `sessionId?`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.service.ts:191](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L191)

#### Parameters

##### userId

`string`

##### sessionId?

`string`

#### Returns

`Promise`\<`any`\>

***

### skipOnboarding()

> **skipOnboarding**(`userId`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.service.ts:221](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L221)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`any`\>

***

### resetOnboarding()

> **resetOnboarding**(`userId`): `Promise`\<`any`\>

Defined in: [src/onboarding/onboarding.service.ts:262](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/onboarding.service.ts#L262)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<`any`\>
