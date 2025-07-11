/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CategoryResponseDto } from "./category-response.dto";
import { Gender } from "src/common/enums/gender.enum";
import { CategoryStatus } from "src/common/enums/category-status.enum";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { CategoryQueryDto } from "./category-filter.dto";
import { Type } from "class-transformer";


export class CategoryStatsDto {
  @ApiProperty({
    description: 'Total number of categories',
    example: 150
  })
  total: number;

  @ApiProperty({
    description: 'Categories breakdown by status',
    type: 'object',
    properties: {
      active: { type: 'number', example: 120 },
      inactive: { type: 'number', example: 25 },
      pending: { type: 'number', example: 5 }
    }
  })
  byStatus: Record<CategoryStatus, number>;

  @ApiProperty({
    description: 'Categories breakdown by gender applicability',
    type: 'object',
    properties: {
      male: { type: 'number', example: 45 },
      female: { type: 'number', example: 50 },
      unisex: { type: 'number', example: 40 },
      kids: { type: 'number', example: 15 }
    }
  })
  byGender: Record<Gender, number>;

  @ApiProperty({
    description: 'Number of categories with subcategories',
    example: 35
  })
  withSubcategories: number;

  @ApiProperty({
    description: 'Number of categories without subcategories',
    example: 115
  })
  withoutSubcategories: number;

  @ApiProperty({
    description: 'Number of soft-deleted categories',
    example: 8
  })
  softDeleted: number;

  @ApiProperty({
    description: 'Most recently created categories',
    type: [CategoryResponseDto],
    maxItems: 5
  })
  recentlyCreated: CategoryResponseDto[];

  @ApiProperty({
    description: 'Most recently updated categories',
    type: [CategoryResponseDto],
    maxItems: 5
  })
  recentlyUpdated: CategoryResponseDto[];
}

// Category Validation Response DTO
export class CategoryValidationDto {
  @ApiProperty({
    description: 'Whether the category name is available',
    example: true
  })
  nameAvailable: boolean;

  @ApiProperty({
    description: 'Whether the category slug is available',
    example: false
  })
  slugAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Suggested alternative slug if current is unavailable',
    example: 'electronics-gadgets-2'
  })
  suggestedSlug?: string;

  @ApiProperty({
    description: 'Validation messages',
    type: 'array',
    items: { type: 'string' },
    example: ['Name is available', 'Slug is already in use']
  })
  messages: string[];
}


export class CategoryExportDto {
  @ApiPropertyOptional({
    description: 'Export format',
    enum: ['json', 'csv', 'xlsx'],
    default: 'json',
    example: 'xlsx'
  })
  @IsOptional()
  @IsString()
  format?: 'json' | 'csv' | 'xlsx';

  @ApiPropertyOptional({
    description: 'Fields to include in export',
    type: [String],
    example: ['name', 'slug', 'status', 'createdAt']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({
    description: 'Filter criteria for export',
    type: CategoryQueryDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryQueryDto)
  filters?: CategoryQueryDto;
}