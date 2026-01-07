[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [journey/imgbb.service](../README.md) / ImgBBService

# Class: ImgBBService

Defined in: [src/journey/imgbb.service.ts:52](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/imgbb.service.ts#L52)

## Constructors

### Constructor

> **new ImgBBService**(`httpService`): `ImgBBService`

Defined in: [src/journey/imgbb.service.ts:57](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/imgbb.service.ts#L57)

#### Parameters

##### httpService

`HttpService`

#### Returns

`ImgBBService`

## Methods

### uploadImage()

> **uploadImage**(`filePath`, `fileName?`): `Promise`\<`string`\>

Defined in: [src/journey/imgbb.service.ts:72](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/imgbb.service.ts#L72)

Upload a single image file to ImgBB

#### Parameters

##### filePath

`string`

Path to the image file

##### fileName?

`string`

Optional custom filename

#### Returns

`Promise`\<`string`\>

The ImgBB URL of the uploaded image

***

### uploadImages()

> **uploadImages**(`filePaths`): `Promise`\<`string`[]\>

Defined in: [src/journey/imgbb.service.ts:122](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/imgbb.service.ts#L122)

Upload multiple images in parallel

#### Parameters

##### filePaths

`string`[]

Array of file paths

#### Returns

`Promise`\<`string`[]\>

Array of ImgBB URLs

***

### uploadImageFromBuffer()

> **uploadImageFromBuffer**(`buffer`, `fileName`, `mimeType`): `Promise`\<`string`\>

Defined in: [src/journey/imgbb.service.ts:159](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/imgbb.service.ts#L159)

Upload image from buffer (useful for in-memory processing)

#### Parameters

##### buffer

`Buffer`

Image buffer

##### fileName

`string`

Filename

##### mimeType

`string` = `'image/jpeg'`

MIME type (e.g., 'image/jpeg')

#### Returns

`Promise`\<`string`\>

The ImgBB URL of the uploaded image

***

### uploadVideo()

> **uploadVideo**(`filePath`, `fileName?`): `Promise`\<`string` \| `null`\>

Defined in: [src/journey/imgbb.service.ts:214](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/journey/imgbb.service.ts#L214)

Upload video file to ImgBB
Note: ImgBB primarily supports images, but we'll try to upload MP4 files
If this fails, consider using Cloudinary or another video hosting service

#### Parameters

##### filePath

`string`

Path to the video file

##### fileName?

`string`

Optional custom filename

#### Returns

`Promise`\<`string` \| `null`\>

The ImgBB URL of the uploaded video (or null if upload fails)
