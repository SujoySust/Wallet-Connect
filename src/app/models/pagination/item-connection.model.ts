import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { Item } from '../item.model';

@ObjectType()
export class ItemConnection extends PaginatedResponse(Item) {}
