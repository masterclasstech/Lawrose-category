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
  MinLength,
  MaxLength,
} from 'class-validator';
//import { Type, Transform } from 'class-transformer';
import { CategoryStatus } from '../../../common/enums/category-status.enum';
import { Gender } from '../../../common/enums/gender.enum';
import { Transform, Type } from 'class-transformer';

// Create Category DTO
export class CreateCategoryDto {
  @ApiProperty({ 
    description: 'Category name', 
    example: 'Electronics',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiPropertyOptional({ 
    description: 'Category description',
    example: 'Electronic devices and accessories',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Category status',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({ 
    description: 'Applicable genders',
    enum: Gender,
    isArray: true,
    example: [Gender.MEN, Gender.WOMEN]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  applicableGenders?: Gender[];

  @ApiPropertyOptional({ 
    description: 'Has subcategories',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasSubcategories?: boolean;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ 
    description: 'Additional metadata',
    example: { featured: true, priority: 1 }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Category icon',
    example: 'electronics-icon'
  })
  @IsOptional()
  @IsString()
  icon?: string;

  // Note: imageUrl will be handled by the service after file upload
  // The actual file upload will be handled via multipart form data
}

export class CreateCategoryWithFileDto extends CreateCategoryDto {
  @ApiPropertyOptional({ 
    description: 'Category image file',
    type: 'string',
    format: 'binary'
  })
  image?: Express.Multer.File;
}