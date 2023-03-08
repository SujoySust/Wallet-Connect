import { ObjectType } from '@nestjs/graphql';
import { Collection } from '../collection.model';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';

@ObjectType()
export class CollectionConnection extends PaginatedResponse(Collection) {}
