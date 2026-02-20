import { IsOptional, IsString } from 'class-validator';

export class UpdateExpenseCategoryDto {
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  phone?: string;
}