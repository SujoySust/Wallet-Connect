import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { Category } from '../category.model';

@ObjectType()
export class CategoryConnection extends PaginatedResponse(Category) {}
