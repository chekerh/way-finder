export interface ActivitySearchDto {
  city: string;
  themes?: string[] | string;
  limit?: number;
  radiusMeters?: number;
}

