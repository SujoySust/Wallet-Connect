import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from '../../../libs/graphql/pagination/pagination';
import { Staff } from '../../modules/staff/staff.model';

@ObjectType()
export class StaffConnection extends PaginatedResponse(Staff) {}
