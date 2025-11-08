import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class ConfirmBookingDto {
  @IsNotEmpty()
  @IsString()
  offer_id: string;

  @IsNotEmpty()
  @IsObject()
  payment_details: Record<string, any>;
}
