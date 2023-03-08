/* eslint-disable prettier/prettier */
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Staff } from './staff.model';
import {
  StaffCreateInput,
  StaffUpdateInput,
} from './dto/staff.input';

import { StaffService } from './staff.service';
import { GqlAuthGuard } from '../../../libs/auth/gql.auth.guard';
import { UserEntity } from '../../../libs/decorators/user.decorator';
import { UpdatePasswordInput } from '../user/dto/user.dto';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { StaffConnection } from 'src/app/models/pagination/staff-connection.model';
import { StaffOrder } from 'src/app/models/input/staff-order.input';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { StaffFilter } from './dto/filter.dto';
import { PERMISSION_KEY_STAFF } from 'src/app/helpers/permission_constant';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';

@Resolver(() => Staff)
@UseGuards(GqlAuthGuard('staff'))
export class StaffResolver {
  constructor(private readonly staffService: StaffService) {}

  @Query(() => Staff)
  async staff(@UserEntity() staff: Staff): Promise<Staff> {
    return staff;
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_STAFF))
  @Mutation(() => ResponseModel)
  async updateStaffProfile(
    @Args('data') data: StaffUpdateInput,
    @UserEntity() staff: Staff,
  ) {
    return await this.staffService.updateStaffProfile(data, staff);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_STAFF))
  @Mutation(() => ResponseModel)
  async updateStaffPassword(
    @Args('data') data: UpdatePasswordInput,
    @UserEntity() staff: Staff,
  ) {
    return await this.staffService.updateStaffPassword(data, staff);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_STAFF))
  @Query(() => StaffConnection)
  async getStaffLists(
    @Args({ name: 'paginateNumber', nullable: true }) paginateNumber: number,
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: StaffFilter,
    @Args({
      name: 'orderBy',
      type: () => StaffOrder,
      nullable: true,
    })
    orderBy: StaffOrder,
  ): Promise<StaffConnection> {
    return await this.staffService.getStaffLists(paginate, filter, orderBy);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_STAFF))
  @Query(() => Staff)
  async getStaff(@Args({ name: 'id', type: () => Int }) id): Promise<Staff> {
    return await this.staffService.getStaffByID(id);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_STAFF))
  @Mutation(() => ResponseModel)
  async createStaff(
    @Args('data') data: StaffCreateInput,
  ): Promise<ResponseModel> {
    return await this.staffService.createStaff(data);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_STAFF))
  @Mutation(() => ResponseModel)
  async updateStaff(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('data') data: StaffUpdateInput,
  ): Promise<ResponseModel> {
    return await this.staffService.updateStaff(id, data);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_STAFF))
  @Mutation(() => ResponseModel)
  async deleteStaff(
    @UserEntity() staff: Staff,
    @Args({ name: 'id', type: () => Int }) id,
  ): Promise<ResponseModel> {
    return await this.staffService.deleteStaff(staff, id);
  }
}
