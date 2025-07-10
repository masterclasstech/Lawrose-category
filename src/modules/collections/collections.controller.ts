import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @MessagePattern('createCollection')
  create(@Payload() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @MessagePattern('findAllCollections')
  findAll() {
    return this.collectionsService.findAll();
  }

  @MessagePattern('findOneCollection')
  findOne(@Payload() id: number) {
    return this.collectionsService.findOne(id);
  }

  @MessagePattern('updateCollection')
  update(@Payload() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionsService.update(updateCollectionDto.id, updateCollectionDto);
  }

  @MessagePattern('removeCollection')
  remove(@Payload() id: number) {
    return this.collectionsService.remove(id);
  }
}
