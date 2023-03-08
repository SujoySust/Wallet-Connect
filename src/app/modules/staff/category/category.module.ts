import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';

@Module({
  providers: [CategoryService, CategoryResolver],
  imports: [],
})
export class CategoryModule {}
