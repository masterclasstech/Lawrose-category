/* eslint-disable prettier/prettier */
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
//import { CreateCategoryDto } from "./create-category.dto";
import { Transform, Type } from "class-transformer";
import { CategoryStatus } from "src/common/enums/category-status.enum";
import { Gender } from "src/common/enums/gender.enum";
export class UpdateCategoryDto {
  @ApiPropertyOptional({ 
    description: 'Category name',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Category description',
    maxLength: 500
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Category status',
    enum: CategoryStatus
  })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({ 
    description: 'Applicable genders',
    enum: Gender,
    isArray: true
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  applicableGenders?: Gender[];

  @ApiPropertyOptional({ 
    description: 'Has subcategories'
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasSubcategories?: boolean;

  @ApiPropertyOptional({ 
    description: 'Sort order'
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ 
    description: 'Additional metadata'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Category icon'
  })
  @IsOptional()
  @IsString()
  icon?: string;

  // Note: imageUrl will be handled by the service after file upload
  // The actual file upload will be handled via multipart form data
}

export class UpdateCategoryWithFileDto extends UpdateCategoryDto {
  @ApiPropertyOptional({ 
    description: 'Category image file',
    type: 'string',
    format: 'binary'
  })
  image?: Express.Multer.File;
}