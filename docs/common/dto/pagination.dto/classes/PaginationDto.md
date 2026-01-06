[**WayFinder Backend API Documentation v0.0.1**](../../../../README.md)

***

[WayFinder Backend API Documentation](../../../../README.md) / [common/dto/pagination.dto](../README.md) / PaginationDto

# Class: PaginationDto

Defined in: [src/common/dto/pagination.dto.ts:9](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/dto/pagination.dto.ts#L9)

Common pagination DTO used across all list endpoints
Ensures consistent pagination behavior and prevents resource exhaustion

## Constructors

### Constructor

> **new PaginationDto**(): `PaginationDto`

#### Returns

`PaginationDto`

## Properties

### page?

> `optional` **page**: `number` = `1`

Defined in: [src/common/dto/pagination.dto.ts:27](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/dto/pagination.dto.ts#L27)

Page number (1-based)

#### Default

```ts
1
```

#### Example

```ts
1
```

***

### limit?

> `optional` **limit**: `number` = `20`

Defined in: [src/common/dto/pagination.dto.ts:50](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/dto/pagination.dto.ts#L50)

Number of items per page

#### Default

```ts
20
```

#### Minimum

1

#### Maximum

100

#### Example

```ts
20
```

## Accessors

### skip

#### Get Signature

> **get** **skip**(): `number`

Defined in: [src/common/dto/pagination.dto.ts:55](https://github.com/chekerh/way-finder/blob/66fdb01210fb53740cbac5d86a860651fedc5f70/src/common/dto/pagination.dto.ts#L55)

Calculates skip value for MongoDB queries

##### Returns

`number`
