import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Common pagination DTO used across all list endpoints
 * Ensures consistent pagination behavior and prevents resource exhaustion
 */
export class PaginationDto {
  /**
   * Page number (1-based)
   * @default 1
   * @example 1
   */
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    type: Number,
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
  page?: number = 1;

  /**
   * Number of items per page
   * @default 20
   * @minimum 1
   * @maximum 100
   * @example 20
   */
  @ApiPropertyOptional({
    description: 'Number of items per page',
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => (value ? parseInt(value, 10) : 20))
  limit?: number = 20;

  /**
   * Calculates skip value for MongoDB queries
   */
  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }
}

/**
 * Standard paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Helper function to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
