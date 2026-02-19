import { IsDateString, IsNumberString, IsOptional, IsString } from 'class-validator';

export class ExpensesQueryDto {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
