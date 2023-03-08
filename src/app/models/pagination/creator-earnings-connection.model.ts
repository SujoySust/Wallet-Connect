import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { CreatorEarning } from '../creator-earnings.model';

@ObjectType()
export class CreatorEarningConnection extends PaginatedResponse(
  CreatorEarning,
) {}
