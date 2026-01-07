[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [outfit-weather/image-analysis.service](../README.md) / ImageAnalysisService

# Class: ImageAnalysisService

Defined in: [src/outfit-weather/image-analysis.service.ts:14](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/image-analysis.service.ts#L14)

## Constructors

### Constructor

> **new ImageAnalysisService**(`httpService`, `configService`): `ImageAnalysisService`

Defined in: [src/outfit-weather/image-analysis.service.ts:19](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/image-analysis.service.ts#L19)

#### Parameters

##### httpService

`HttpService`

##### configService

`ConfigService`

#### Returns

`ImageAnalysisService`

## Methods

### analyzeOutfit()

> **analyzeOutfit**(`imageUrl`, `imageFile?`): `Promise`\<`string`[]\>

Defined in: [src/outfit-weather/image-analysis.service.ts:34](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/image-analysis.service.ts#L34)

Analyze an outfit image and detect clothing items

#### Parameters

##### imageUrl

`string`

URL of the outfit image

##### imageFile?

`File`

Optional file buffer for base64 encoding (more reliable than URL)

#### Returns

`Promise`\<`string`[]\>

Array of detected clothing items

***

### compareWithWeather()

> **compareWithWeather**(`detectedItems`, `suitableItems`, `unsuitableItems`): `object`

Defined in: [src/outfit-weather/image-analysis.service.ts:416](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/image-analysis.service.ts#L416)

Compare detected items with weather recommendations

#### Parameters

##### detectedItems

`string`[]

##### suitableItems

`string`[]

##### unsuitableItems

`string`[]

#### Returns

`object`

##### score

> **score**: `number`

##### feedback

> **feedback**: `string`

##### suggestions

> **suggestions**: `string`[]
