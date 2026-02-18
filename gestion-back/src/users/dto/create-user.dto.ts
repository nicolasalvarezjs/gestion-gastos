import { IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^\d{8,15}$/)
  phone: string;
}
