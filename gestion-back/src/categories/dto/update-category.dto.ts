import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
	@IsString()
	@MaxLength(50)
	name?: string;

	@IsOptional()
	@IsString()
	@MaxLength(120)
	description?: string;
}
