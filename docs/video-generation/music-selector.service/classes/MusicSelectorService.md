[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [video-generation/music-selector.service](../README.md) / MusicSelectorService

# Class: MusicSelectorService

Defined in: [src/video-generation/music-selector.service.ts:31](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/music-selector.service.ts#L31)

## Constructors

### Constructor

> **new MusicSelectorService**(`httpService`): `MusicSelectorService`

Defined in: [src/video-generation/music-selector.service.ts:36](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/music-selector.service.ts#L36)

#### Parameters

##### httpService

`HttpService`

#### Returns

`MusicSelectorService`

## Methods

### selectAndDownloadMusic()

> **selectAndDownloadMusic**(`destination`, `tags`, `duration`): `Promise`\<\{ `filePath`: `string`; `source`: `string`; `originalUrl`: `string`; \}\>

Defined in: [src/video-generation/music-selector.service.ts:53](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/music-selector.service.ts#L53)

Select and download music for a destination

#### Parameters

##### destination

`string`

The destination name (e.g., "Paris", "Beach")

##### tags

`string`[] = `[]`

Optional tags to help select music

##### duration

`number` = `60`

Desired duration in seconds (for trimming/looping)

#### Returns

`Promise`\<\{ `filePath`: `string`; `source`: `string`; `originalUrl`: `string`; \}\>

Path to the downloaded music file

***

### cleanupOldMusicFiles()

> **cleanupOldMusicFiles**(): `Promise`\<`void`\>

Defined in: [src/video-generation/music-selector.service.ts:256](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/video-generation/music-selector.service.ts#L256)

Clean up old music files (older than 7 days)

#### Returns

`Promise`\<`void`\>
