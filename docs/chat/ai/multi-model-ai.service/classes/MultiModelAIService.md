[**WayFinder Backend API Documentation v0.0.1**](../../../../README.md)

***

[WayFinder Backend API Documentation](../../../../README.md) / [chat/ai/multi-model-ai.service](../README.md) / MultiModelAIService

# Class: MultiModelAIService

Defined in: [src/chat/ai/multi-model-ai.service.ts:8](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/ai/multi-model-ai.service.ts#L8)

## Constructors

### Constructor

> **new MultiModelAIService**(`http`): `MultiModelAIService`

Defined in: [src/chat/ai/multi-model-ai.service.ts:15](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/ai/multi-model-ai.service.ts#L15)

#### Parameters

##### http

`HttpService`

#### Returns

`MultiModelAIService`

## Methods

### generateResponse()

> **generateResponse**(`userMessage`, `conversationHistory`, `userPreferences`, `model`): `Promise`\<\{ `response`: `string`; `flightPacks?`: `any`[]; \}\>

Defined in: [src/chat/ai/multi-model-ai.service.ts:35](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/ai/multi-model-ai.service.ts#L35)

#### Parameters

##### userMessage

`string`

##### conversationHistory

`object`[]

##### userPreferences

`any`

##### model

[`ChatModel`](../../../chat.dto/enumerations/ChatModel.md)

#### Returns

`Promise`\<\{ `response`: `string`; `flightPacks?`: `any`[]; \}\>

***

### isModelAvailable()

> **isModelAvailable**(`model`): `boolean`

Defined in: [src/chat/ai/multi-model-ai.service.ts:292](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/ai/multi-model-ai.service.ts#L292)

#### Parameters

##### model

[`ChatModel`](../../../chat.dto/enumerations/ChatModel.md)

#### Returns

`boolean`
