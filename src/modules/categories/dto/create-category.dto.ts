/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsEnum, 
  IsOptional, 
  IsArray, 
  IsBoolean, 
  IsNumber, 
  IsObject, 
  IsUrl, 
  //IsDate,
  MinLength,
  MaxLength,
  Min,
  Max,
  //ValidateNested,
  IsNotEmpty,
  Matches,
  //IsMongoId
} from 'class-validator';
//import { Type, Transform } from 'class-transformer';
import { CategoryStatus } from '../../../common/enums/category-status.enum';
import { Gender } from '../../../common/enums/gender.enum';

// Create Category DTO
export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name - must be unique',
    example: 'Electronics & Gadgets',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug - must be unique, lowercase, no spaces',
    example: 'electronics-gadgets',
    pattern: '^[a-z0-9-]+$',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the category',
    example: 'All electronic devices, gadgets, and digital accessories',
    maxLength: 1000
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Category status',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    example: CategoryStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({
    description: 'Genders this category applies to',
    enum: Gender,
    isArray: true,
    example: [Gender.MEN, Gender.WOMEN],
    default: []
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  applicableGenders?: Gender[];

  @ApiPropertyOptional({
    description: 'Whether this category has subcategories',
    default: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  hasSubcategories?: boolean;

  @ApiPropertyOptional({
    description: 'Sort order for display (lower numbers appear first)',
    minimum: 0,
    maximum: 9999,
    default: 0,
    example: 10
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Additional metadata as key-value pairs',
    type: 'object',
    example: { 
      color: '#007bff',
      featured: true,
      priority: 'high',
      keywords: ['tech', 'digital', 'electronic']
    },
    additionalProperties: true
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'URL to category image (must be valid HTTP/HTTPS URL)',
    example: 'https://example.com/images/electronics-category.jpg',
    format: 'uri'
  })
  @IsOptional()
  @IsUrl({}, { message: 'Image URL must be a valid HTTP/HTTPS URL' })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier or CSS class name',
    example: 'fas fa-laptop',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;
}