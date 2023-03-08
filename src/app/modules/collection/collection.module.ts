import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionResolver } from './collection.resolver';
import { CollectionValidation } from './collection.validation';
import { CollectionData } from './collection.data';

@Module({
  providers: [
    CollectionService,
    CollectionResolver,
    CollectionValidation,
    CollectionData,
  ],
  imports: [],
})
export class CollectionModule {}
