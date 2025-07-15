/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesRepository } from './categories.repository';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CacheService } from '../cache/cache.service';
//import { CategoriesKafkaController } from './categories-kafka.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema }
    ]),
    CacheModule.register({
      ttl: 300, // 5 minutes
      max: 1000, // maximum number of items in cache
    }),
  ],
  controllers: [
    CategoriesController,
    //CategoriesKafkaController
  ],
  providers: [
    CategoriesService,
    CategoriesRepository,
    CloudinaryService,
    CacheService
  ],
  exports: [
    CategoriesService,
    CategoriesRepository
  ]
})
export class CategoriesModule {}