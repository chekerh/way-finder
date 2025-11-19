import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { BookingStatus } from '../common/enums/booking-status.enum';

export class ConfirmBookingDto {
  @IsNotEmpty()
  @IsString()
  offer_id: string;

  @IsNotEmpty()
  @IsObject()
  payment_details: Record<string, any>;

  @IsOptional()
  @IsNumber({}, { message: 'total_price must be a number' })
  @Type(() => Number)
  total_price?: number;
}

export class TripDetailsDto {
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsString()
  departure_date?: string;

  @IsOptional()
  @IsString()
  return_date?: string;

  @IsOptional()
  @IsString()
  travel_class?: string;

  @IsOptional()
  @IsString()
  seats?: string;
}

export class PassengerDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsOptional()
  @IsString()
  traveler_type?: string;

  @IsOptional()
  @IsString()
  document_number?: string;
}

export class CreateBookingDto extends ConfirmBookingDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TripDetailsDto)
  trip_details?: TripDetailsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PassengerDto)
  passengers?: PassengerDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsOptional()
  @IsIn(Object.values(BookingStatus))
  status?: BookingStatus;
}
