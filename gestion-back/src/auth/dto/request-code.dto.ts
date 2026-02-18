import { IsString, Matches } from 'class-validator';

export class RequestCodeDto {
  @IsString()
  @Matches(/^\d{8,15}$/)
  phone: string;
}
