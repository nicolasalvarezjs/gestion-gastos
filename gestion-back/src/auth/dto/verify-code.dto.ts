import { IsString, Length, Matches } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @Matches(/^\d{8,15}$/)
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
