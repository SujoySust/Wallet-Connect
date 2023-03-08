import { Module } from '@nestjs/common';
import { StaffCollectionResolver } from './staff-collection.resolver';
import { StaffCollectionService } from './staff-collection.service';

@Module({
  imports: [],
  providers: [StaffCollectionResolver, StaffCollectionService],
})
export class StaffCollectionModule {}
