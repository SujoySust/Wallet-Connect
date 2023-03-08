import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { ItemActivity } from '../item-activity.model';

@ObjectType()
export class ItemActivitiesConnection extends PaginatedResponse(ItemActivity) {}
