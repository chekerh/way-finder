[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [chat/chat.service](../README.md) / ChatService

# Class: ChatService

Defined in: [src/chat/chat.service.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.service.ts#L27)

## Constructors

### Constructor

> **new ChatService**(`chatMessageModel`, `chatSessionModel`, `aiService`, `userService`, `catalogService`): `ChatService`

Defined in: [src/chat/chat.service.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.service.ts#L30)

#### Parameters

##### chatMessageModel

`Model`\<`Document`\<`unknown`, \{ \}, `ChatMessage`, \{ \}, \{ \}\> & `ChatMessage` & `object` & `object`\>

##### chatSessionModel

`Model`\<`Document`\<`unknown`, \{ \}, `ChatSession`, \{ \}, \{ \}\> & `ChatSession` & `object` & `object`\>

##### aiService

[`MultiModelAIService`](../../ai/multi-model-ai.service/classes/MultiModelAIService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### catalogService

[`CatalogService`](../../../catalog/catalog.service/classes/CatalogService.md)

#### Returns

`ChatService`

## Methods

### sendMessage()

> **sendMessage**(`userId`, `dto`): `Promise`\<[`ChatResponseDto`](../../chat.dto/classes/ChatResponseDto.md)\>

Defined in: [src/chat/chat.service.ts:40](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.service.ts#L40)

#### Parameters

##### userId

`string`

##### dto

[`SendMessageDto`](../../chat.dto/classes/SendMessageDto.md)

#### Returns

`Promise`\<[`ChatResponseDto`](../../chat.dto/classes/ChatResponseDto.md)\>

***

### switchModel()

> **switchModel**(`userId`, `dto`): `Promise`\<\{ `success`: `boolean`; `model`: `string`; \}\>

Defined in: [src/chat/chat.service.ts:189](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.service.ts#L189)

#### Parameters

##### userId

`string`

##### dto

[`SwitchModelDto`](../../chat.dto/classes/SwitchModelDto.md)

#### Returns

`Promise`\<\{ `success`: `boolean`; `model`: `string`; \}\>

***

### ~~getHistory()~~

> **getHistory**(`userId`, `limit`): `Promise`\<`any`[]\>

Defined in: [src/chat/chat.service.ts:216](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.service.ts#L216)

Get chat history (non-paginated - for backward compatibility)

#### Parameters

##### userId

`string`

##### limit

`number` = `50`

#### Returns

`Promise`\<`any`[]\>

#### Deprecated

Use getHistoryPaginated instead for better performance

***

### getHistoryPaginated()

> **getHistoryPaginated**(`userId`, `page`, `limit`): `Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Defined in: [src/chat/chat.service.ts:247](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.service.ts#L247)

Get paginated chat history

#### Parameters

##### userId

`string`

User ID

##### page

`number`

Page number (1-based)

##### limit

`number`

Items per page

#### Returns

`Promise`\<\{ `data`: `object`[]; `total`: `number`; \}\>

Paginated chat history results

***

### clearHistory()

> **clearHistory**(`userId`): `Promise`\<\{ `success`: `boolean`; \}\>

Defined in: [src/chat/chat.service.ts:280](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/chat/chat.service.ts#L280)

#### Parameters

##### userId

`string`

#### Returns

`Promise`\<\{ `success`: `boolean`; \}\>
