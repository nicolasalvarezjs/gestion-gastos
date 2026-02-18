import { IsString, Matches } from 'class-validator';

export class AddSecondaryPhoneDto {
  @IsString()
  @Matches(/^\d{8,15}$/)
  phone: string;
}
