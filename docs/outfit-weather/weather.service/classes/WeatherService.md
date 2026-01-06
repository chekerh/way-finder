[**WayFinder Backend API Documentation v0.0.1**](../../../README.md)

***

[WayFinder Backend API Documentation](../../../README.md) / [outfit-weather/weather.service](../README.md) / WeatherService

# Class: WeatherService

Defined in: [src/outfit-weather/weather.service.ts:7](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/weather.service.ts#L7)

## Constructors

### Constructor

> **new WeatherService**(`httpService`, `configService`): `WeatherService`

Defined in: [src/outfit-weather/weather.service.ts:12](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/weather.service.ts#L12)

#### Parameters

##### httpService

`HttpService`

##### configService

`ConfigService`

#### Returns

`WeatherService`

## Methods

### getWeatherForecast()

> **getWeatherForecast**(`cityName`, `date?`): `Promise`\<`any`\>

Defined in: [src/outfit-weather/weather.service.ts:26](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/weather.service.ts#L26)

Get weather forecast for a destination

#### Parameters

##### cityName

`string`

Name of the destination city

##### date?

`Date`

Optional date for forecast (defaults to current date)

#### Returns

`Promise`\<`any`\>

Weather data including temperature, condition, etc.

***

### getClothingRecommendations()

> **getClothingRecommendations**(`weather`): `object`

Defined in: [src/outfit-weather/weather.service.ts:140](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/outfit-weather/weather.service.ts#L140)

Get clothing recommendations based on weather

#### Parameters

##### weather

`any`

#### Returns

`object`

##### suitable\_items

> **suitable\_items**: `string`[]

##### unsuitable\_items

> **unsuitable\_items**: `string`[]

##### suggestions

> **suggestions**: `string`[]
