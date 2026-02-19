import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseItemDto {
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

export class CreateExpensesDto {
  @IsString()
  phone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseItemDto)
  expenses: CreateExpenseItemDto[];
}
