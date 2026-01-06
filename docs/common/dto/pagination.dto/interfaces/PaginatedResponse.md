[**WayFinder Backend API Documentation v0.0.1**](../../../../README.md)

***

[WayFinder Backend API Documentation](../../../../README.md) / [common/dto/pagination.dto](../README.md) / PaginatedResponse

# Interface: PaginatedResponse\<T\>

Defined in: [src/common/dto/pagination.dto.ts:63](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/dto/pagination.dto.ts#L63)

Standard paginated response structure

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T`[]

Defined in: [src/common/dto/pagination.dto.ts:64](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/dto/pagination.dto.ts#L64)

***

### pagination

> **pagination**: `object`

Defined in: [src/common/dto/pagination.dto.ts:65](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/dto/pagination.dto.ts#L65)

#### page

> **page**: `number`

#### limit

> **limit**: `number`

#### total

> **total**: `number`

#### totalPages

> **totalPages**: `number`

#### hasNext

> **hasNext**: `boolean`

#### hasPrev

> **hasPrev**: `boolean`
