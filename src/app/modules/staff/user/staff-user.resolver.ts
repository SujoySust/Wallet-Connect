/* eslint-disable prettier/prettier */
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';
import { PERMISSION_KEY_COLLECTION } from 'src/app/helpers/permission_constant';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { StaffUserService } from './staff-user.service';
import { User } from 'src/app/models/user.model';
import { UserOrder } from 'src/app/models/input/user-order.input';
import { UserConnection } from 'src/app/models/pagination/user-connection.model';
import { StaffUserFilter } from './dto/filter.dto';

@Resolver(() => User)
@UseGuards(GqlAuthGuard('staff'))
export class StaffUserResolver {
  constructor(private readonly staffUserService: StaffUserService) {}

  @Query(() => UserConnection)
  async getStaffUserListsPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: StaffUserFilter,
    @Args({
      name: 'orderBy',
      type: () => UserOrder,
      nullable: true,
    })
    orderBy: UserOrder,
  ): Promise<UserConnection> {
    return await this.staffUserService.getStaffUserListsPaginate(
      paginate,
      filter,
      orderBy,
    );
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Query(() => User)
  async getStaffUserById(
    @Args({ name: 'id', type: () => Int }) id,
  ): Promise<User> {
    return await this.staffUserService.getStaffUserById(id);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Mutation(() => ResponseModel)
  async updateUserStatus(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('status') status: number,
  ): Promise<ResponseModel> {
    return await this.staffUserService.updateUserStatus(id, status);
  }
}
