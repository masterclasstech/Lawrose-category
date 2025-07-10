import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GenderService } from './gender.service';
import { CreateGenderDto } from './dto/create-gender.dto';
import { UpdateGenderDto } from './dto/update-gender.dto';

@Controller()
export class GenderController {
  constructor(private readonly genderService: GenderService) {}

  @MessagePattern('createGender')
  create(@Payload() createGenderDto: CreateGenderDto) {
    return this.genderService.create(createGenderDto);
  }

  @MessagePattern('findAllGender')
  findAll() {
    return this.genderService.findAll();
  }

  @MessagePattern('findOneGender')
  findOne(@Payload() id: number) {
    return this.genderService.findOne(id);
  }

  @MessagePattern('updateGender')
  update(@Payload() updateGenderDto: UpdateGenderDto) {
    return this.genderService.update(updateGenderDto.id, updateGenderDto);
  }

  @MessagePattern('removeGender')
  remove(@Payload() id: number) {
    return this.genderService.remove(id);
  }
}
