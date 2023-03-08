import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { User } from '../user.model';

@ObjectType()
export class UserConnection extends PaginatedResponse(User) {}
