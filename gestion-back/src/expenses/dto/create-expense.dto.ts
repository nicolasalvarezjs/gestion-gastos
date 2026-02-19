import { IsBoolean, IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  phone: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  categoryDescription?: string;

  @IsDateString()
  date: string;

  @IsBoolean()
  isFamilyShared: boolean;
}
