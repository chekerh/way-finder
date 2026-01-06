[**WayFinder Backend API Documentation v0.0.1**](../../../../README.md)

***

[WayFinder Backend API Documentation](../../../../README.md) / [onboarding/ai/onboarding-ai.service](../README.md) / OnboardingAIService

# Class: OnboardingAIService

Defined in: [src/onboarding/ai/onboarding-ai.service.ts:7](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/ai/onboarding-ai.service.ts#L7)

## Constructors

### Constructor

> **new OnboardingAIService**(): `OnboardingAIService`

Defined in: [src/onboarding/ai/onboarding-ai.service.ts:14](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/ai/onboarding-ai.service.ts#L14)

#### Returns

`OnboardingAIService`

## Methods

### generateNextQuestion()

> **generateNextQuestion**(`session`): `Promise`\<`Question` \| `null`\>

Defined in: [src/onboarding/ai/onboarding-ai.service.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/ai/onboarding-ai.service.ts#L30)

Generates the next contextual question based on previous answers
Uses AI to create questions that flow naturally and relate to previous responses

#### Parameters

##### session

`OnboardingSession`

#### Returns

`Promise`\<`Question` \| `null`\>

***

### hasEnoughData()

> **hasEnoughData**(`answers`): `boolean`

Defined in: [src/onboarding/ai/onboarding-ai.service.ts:478](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/ai/onboarding-ai.service.ts#L478)

#### Parameters

##### answers

`Record`\<`string`, `any`\>

#### Returns

`boolean`

***

### extractPreferences()

> **extractPreferences**(`answers`): `any`

Defined in: [src/onboarding/ai/onboarding-ai.service.ts:500](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/onboarding/ai/onboarding-ai.service.ts#L500)

#### Parameters

##### answers

`Record`\<`string`, `any`\>

#### Returns

`any`
