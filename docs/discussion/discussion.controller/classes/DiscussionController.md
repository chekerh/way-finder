[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [discussion/discussion.controller](../README.md) / DiscussionController

# Class: DiscussionController

Defined in: [src/discussion/discussion.controller.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L31)

Discussion Controller
Handles forum posts, comments, likes, and discussion threads

## Constructors

### Constructor

> **new DiscussionController**(`discussionService`): `DiscussionController`

Defined in: [src/discussion/discussion.controller.ts:32](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L32)

#### Parameters

##### discussionService

[`DiscussionService`](../../discussion.service/classes/DiscussionService.md)

#### Returns

`DiscussionController`

## Methods

### createPost()

> **createPost**(`req`, `dto`): `Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

Defined in: [src/discussion/discussion.controller.ts:41](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L41)

Create a new discussion post
Rate limited: 10 requests per minute to prevent spam

#### Parameters

##### req

`any`

##### dto

[`CreatePostDto`](../../discussion.dto/classes/CreatePostDto.md)

#### Returns

`Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

***

### getPosts()

> **getPosts**(`destination?`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>\>

Defined in: [src/discussion/discussion.controller.ts:52](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L52)

Get discussion posts with pagination

#### Parameters

##### destination?

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>\>

#### Query

destination - Filter by destination (optional)

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 20, max: 100)

***

### getPost()

> **getPost**(`id`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.controller.ts:66](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L66)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

***

### updatePost()

> **updatePost**(`req`, `id`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.controller.ts:72](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L72)

#### Parameters

##### req

`any`

##### id

`string`

##### dto

[`UpdatePostDto`](../../discussion.dto/classes/UpdatePostDto.md)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

***

### deletePost()

> **deletePost**(`req`, `id`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/discussion/discussion.controller.ts:82](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L82)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### likePost()

> **likePost**(`req`, `id`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.controller.ts:88](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L88)

#### Parameters

##### req

`any`

##### id

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

***

### createComment()

> **createComment**(`req`, `postId`, `dto`): `Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

Defined in: [src/discussion/discussion.controller.ts:99](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L99)

Create a comment on a post
Rate limited: 20 requests per minute to prevent spam

#### Parameters

##### req

`any`

##### postId

`string`

##### dto

[`CreateCommentDto`](../../discussion.dto/classes/CreateCommentDto.md)

#### Returns

`Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

***

### getComments()

> **getComments**(`postId`, `pagination?`): `Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

Defined in: [src/discussion/discussion.controller.ts:113](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L113)

Get comments for a post with pagination

#### Parameters

##### postId

`string`

##### pagination?

[`PaginationDto`](../../../common/dto/pagination.dto/classes/PaginationDto.md)

#### Returns

`Promise`\<[`PaginatedResponse`](../../../common/dto/pagination.dto/interfaces/PaginatedResponse.md)\<`any`\>\>

#### Query

page - Page number (default: 1)

#### Query

limit - Items per page (default: 50, max: 100)

***

### likeComment()

> **likeComment**(`req`, `commentId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.controller.ts:128](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L128)

#### Parameters

##### req

`any`

##### commentId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>\>

***

### deleteComment()

> **deleteComment**(`req`, `commentId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/discussion/discussion.controller.ts:134](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.controller.ts#L134)

#### Parameters

##### req

`any`

##### commentId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>
