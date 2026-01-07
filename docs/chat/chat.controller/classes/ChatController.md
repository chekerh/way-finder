[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [chat/chat.controller](../README.md) / ChatController

# Class: ChatController

Defined in: [src/chat/chat.controller.ts:21](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.controller.ts#L21)

## Constructors

### Constructor

> **new ChatController**(`chatService`, `aiService`): `ChatController`

Defined in: [src/chat/chat.controller.ts:22](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.controller.ts#L22)

#### Parameters

##### chatService

[`ChatService`](../../chat.service/classes/ChatService.md)

##### aiService

[`MultiModelAIService`](../../ai/multi-model-ai.service/classes/MultiModelAIService.md)

#### Returns

`ChatController`

## Methods

### sendMessage()

> **sendMessage**(`req`, `dto`): `Promise`\<[`ChatResponseDto`](../../chat.dto/classes/ChatResponseDto.md)\>

Defined in: [src/chat/chat.controller.ts:29](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.controller.ts#L29)

#### Parameters

##### req

`any`

##### dto

[`SendMessageDto`](../../chat.dto/classes/SendMessageDto.md)

#### Returns

`Promise`\<[`ChatResponseDto`](../../chat.dto/classes/ChatResponseDto.md)\>

***

### switchModel()

> **switchModel**(`req`, `dto`): `Promise`\<\{ `success`: `boolean`; `model`: `string`; \}\>

Defined in: [src/chat/chat.controller.ts:35](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.controller.ts#L35)

#### Parameters

##### req

`any`

##### dto

[`SwitchModelDto`](../../chat.dto/classes/SwitchModelDto.md)

#### Returns

`Promise`\<\{ `success`: `boolean`; `model`: `string`; \}\>

***

### getHistory()

> **getHistory**(`req`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<\{ `message`: `string`; `role`: `"user"` \| `"assistant"`; `model_used`: `string`; `flight_packs`: `object`[]; `created_at`: `any`; \}\>\>

Defined in: [src/chat/chat.controller.ts:46](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.controller.ts#L46)

Get chat history with pagination

#### Parameters

##### req

`any`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<\{ `message`: `string`; `role`: `"user"` \| `"assistant"`; `model_used`: `string`; `flight_packs`: `object`[]; `created_at`: `any`; \}\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 50, max: 100)

***

### clearHistory()

> **clearHistory**(`req`): `Promise`\<\{ `success`: `boolean`; \}\>

Defined in: [src/chat/chat.controller.ts:58](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.controller.ts#L58)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>

***

### getAvailableModels()

> **getAvailableModels**(`req`): `Promise`\<\{ `models`: `object`[]; \}\>

Defined in: [src/chat/chat.controller.ts:64](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.controller.ts#L64)

#### Parameters

##### req

`any`

#### Returns

`Promise`\<\{ `models`: `object`[]; \}\>
