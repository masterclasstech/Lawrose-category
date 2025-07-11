/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { CategoryStatus } from "src/common/enums/category-status.enum";
import { Gender } from "src/common/enums/gender.enum";


export class CategoryQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by category status',
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({
    description: 'Filter by applicable gender',
    enum: Gender,
    example: Gender.UNISEX
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Filter by whether category has subcategories',
    type: 'boolean',
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasSubcategories?: boolean;

  @ApiPropertyOptional({
    description: 'Search term for name or description (case-insensitive)',
    example: 'electronics',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Include deleted categories in results',
    type: 'boolean',
    default: false,
    example: false
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ['name', 'slug', 'createdAt', 'updatedAt', 'sortOrder', 'status'],
    default: 'sortOrder',
    example: 'name'
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'slug' | 'createdAt' | 'updatedAt' | 'sortOrder' | 'status';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'asc',
    example: 'asc'
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Include subcategories in response',
    type: 'boolean',
    default: false,
    example: true
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  includeSubcategories?: boolean;
}
