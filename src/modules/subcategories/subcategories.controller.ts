import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SubcategoriesService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Controller()
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @MessagePattern('createSubcategory')
  create(@Payload() createSubcategoryDto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(createSubcategoryDto);
  }

  @MessagePattern('findAllSubcategories')
  findAll() {
    return this.subcategoriesService.findAll();
  }

  @MessagePattern('findOneSubcategory')
  findOne(@Payload() id: number) {
    return this.subcategoriesService.findOne(id);
  }

  @MessagePattern('updateSubcategory')
  update(@Payload() updateSubcategoryDto: UpdateSubcategoryDto) {
    return this.subcategoriesService.update(updateSubcategoryDto.id, updateSubcategoryDto);
  }

  @MessagePattern('removeSubcategory')
  remove(@Payload() id: number) {
    return this.subcategoriesService.remove(id);
  }
}
