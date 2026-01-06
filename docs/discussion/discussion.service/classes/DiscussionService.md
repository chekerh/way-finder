[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [discussion/discussion.service](../README.md) / DiscussionService

# Class: DiscussionService

Defined in: [src/discussion/discussion.service.ts:30](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L30)

Discussion Service
Handles forum posts, comments, likes, and discussion features
Includes notifications and reward points for user engagement

## Constructors

### Constructor

> **new DiscussionService**(`postModel`, `commentModel`, `notificationsService`, `userService`, `rewardsService`): `DiscussionService`

Defined in: [src/discussion/discussion.service.ts:33](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L33)

#### Parameters

##### postModel

`Model`\<`Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`\>

##### commentModel

`Model`\<`Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`\>

##### notificationsService

[`NotificationsService`](../../../notifications/notifications.service/classes/NotificationsService.md)

##### userService

[`UserService`](../../../user/user.service/classes/UserService.md)

##### rewardsService

[`RewardsService`](../../../rewards/rewards.service/classes/RewardsService.md)

#### Returns

`DiscussionService`

## Methods

### createPost()

> **createPost**(`userId`, `dto`): `Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

Defined in: [src/discussion/discussion.service.ts:63](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L63)

Create a new discussion post
Creates a post and populates user information for immediate display

#### Parameters

##### userId

`string`

ID of the user creating the post

##### dto

[`CreatePostDto`](../../discussion.dto/classes/CreatePostDto.md)

Post data containing title, content, tags, destination, image_url

#### Returns

`Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

Created post document with populated user information

#### Throws

BadRequestException if user ID is invalid

#### Example

```ts
const post = await discussionService.createPost('user123', {
  title: 'Travel tips for Paris',
  content: 'Great places to visit...',
  tags: ['travel', 'paris'],
  destination: 'Paris'
});

Note: User information is automatically populated for immediate display
Note: Tags and destination are optional fields
```

***

### ~~getPosts()~~

> **getPosts**(`limit`, `skip`, `destination?`): `Promise`\<\{ `posts`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; `limit`: `number`; `skip`: `number`; \}\>

Defined in: [src/discussion/discussion.service.ts:84](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L84)

Get posts (non-paginated - for backward compatibility)

#### Parameters

##### limit

`number` = `20`

##### skip

`number` = `0`

##### destination?

`string`

#### Returns

`Promise`\<\{ `posts`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; `limit`: `number`; `skip`: `number`; \}\>

#### Deprecated

Use getPostsPaginated instead for better performance

***

### getPostsPaginated()

> **getPostsPaginated**(`page`, `limit`, `destination?`): `Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Defined in: [src/discussion/discussion.service.ts:115](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L115)

Get paginated posts

#### Parameters

##### page

`number`

Page number (1-based)

##### limit

`number`

Items per page

##### destination?

`string`

Optional destination filter

#### Returns

`Promise`\<\{ `data`: `Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>[]; `total`: `number`; \}\>

Paginated post results

***

### getPost()

> **getPost**(`postId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.service.ts:147](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L147)

Get a single discussion post by ID
Retrieves post with populated user information

#### Parameters

##### postId

`string`

ID of the post to retrieve

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Post document with populated user information

#### Throws

NotFoundException if post doesn't exist

#### Example

```ts
const post = await discussionService.getPost('post123');
```

***

### updatePost()

> **updatePost**(`userId`, `postId`, `dto`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.service.ts:176](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L176)

Update an existing discussion post
Only the post owner can update their posts

#### Parameters

##### userId

`string`

ID of the user updating the post (must be post owner)

##### postId

`string`

ID of the post to update

##### dto

[`UpdatePostDto`](../../discussion.dto/classes/UpdatePostDto.md)

Updated post data (title, content, tags, destination, image_url)

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Updated post document

#### Throws

NotFoundException if post doesn't exist or user is not the owner

#### Example

```ts
const updated = await discussionService.updatePost('user123', 'post123', {
  title: 'Updated title',
  content: 'Updated content'
});
```

***

### deletePost()

> **deletePost**(`userId`, `postId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/discussion/discussion.service.ts:197](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L197)

#### Parameters

##### userId

`string`

##### postId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>

***

### likePost()

> **likePost**(`userId`, `postId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.service.ts:217](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L217)

#### Parameters

##### userId

`string`

##### postId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionPost`, \{ \}, \{ \}\> & `DiscussionPost` & `object` & `object` & `Required`\<\{ \}\>\>

***

### createComment()

> **createComment**(`userId`, `postId`, `dto`): `Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

Defined in: [src/discussion/discussion.service.ts:282](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L282)

#### Parameters

##### userId

`string`

##### postId

`string`

##### dto

[`CreateCommentDto`](../../discussion.dto/classes/CreateCommentDto.md)

#### Returns

`Promise`\<`Omit`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>, `never`\>\>

***

### ~~getComments()~~

> **getComments**(`postId`, `limit`, `skip`): `Promise`\<\{ `comments`: `any`[]; `total`: `number`; `limit`: `number`; `skip`: `number`; \}\>

Defined in: [src/discussion/discussion.service.ts:428](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L428)

Get comments for a post (non-paginated - for backward compatibility)

#### Parameters

##### postId

`string`

##### limit

`number` = `50`

##### skip

`number` = `0`

#### Returns

`Promise`\<\{ `comments`: `any`[]; `total`: `number`; `limit`: `number`; `skip`: `number`; \}\>

#### Deprecated

Use getCommentsPaginated instead for better performance

***

### getCommentsPaginated()

> **getCommentsPaginated**(`postId`, `page`, `limit`): `Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Defined in: [src/discussion/discussion.service.ts:495](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L495)

Get paginated comments for a post

#### Parameters

##### postId

`string`

Post ID

##### page

`number`

Page number (1-based)

##### limit

`number`

Items per page (top-level comments only)

#### Returns

`Promise`\<\{ `data`: `any`[]; `total`: `number`; \}\>

Paginated comment results (includes replies for each comment)

***

### likeComment()

> **likeComment**(`userId`, `commentId`): `Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>\>

Defined in: [src/discussion/discussion.service.ts:552](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L552)

#### Parameters

##### userId

`string`

##### commentId

`string`

#### Returns

`Promise`\<`Document`\<`unknown`, \{ \}, `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object`, \{ \}, \{ \}\> & `Document`\<`unknown`, \{ \}, `DiscussionComment`, \{ \}, \{ \}\> & `DiscussionComment` & `object` & `object` & `Required`\<\{ \}\>\>

***

### deleteComment()

> **deleteComment**(`userId`, `commentId`): `Promise`\<\{ `message`: `string`; \}\>

Defined in: [src/discussion/discussion.service.ts:578](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/discussion/discussion.service.ts#L578)

#### Parameters

##### userId

`string`

##### commentId

`string`

#### Returns

`Promise`\<\{ `message`: `string`; \}\>
