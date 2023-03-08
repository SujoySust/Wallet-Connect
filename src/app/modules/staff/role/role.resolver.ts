import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { roleInput } from './dto/role.input';
import { UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from './role.model';
import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { RoleOrder } from '../../../models/input/role-order.input';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';
import { PERMISSION_KEY_ROLE } from 'src/app/helpers/permission_constant';

@Resolver(() => Role)
@UseGuards(GqlAuthGuard('staff'))
@UseGuards(new RolePermissionGuard(PERMISSION_KEY_ROLE))
export class RoleResolver {
  constructor(private readonly roleService: RoleService) {}

  @Query(() => Role)
  async getRole(
    @Args({ name: 'id', type: () => Int }) id: number | null,
  ): Promise<Role> {
    return await this.roleService.getRole(id);
  }

  @Query(() => [Role])
  async getRoles(
    @Args({
      name: 'query',
      type: () => String,
      nullable: true,
    })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => RoleOrder,
      nullable: true,
    })
    orderBy: RoleOrder,
  ): Promise<Role[]> {
    return await this.roleService.getRoles(query, orderBy);
  }

  @Mutation(() => ResponseModel)
  async createRole(@Args('data') data: roleInput): Promise<ResponseModel> {
    return await this.roleService.createRole(data);
  }

  @Mutation(() => ResponseModel)
  async updateRole(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('data') data: roleInput,
  ): Promise<ResponseModel> {
    return await this.roleService.updateRole(id, data);
  }

  @Mutation(() => ResponseModel)
  async deleteRole(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<ResponseModel> {
    return await this.roleService.deleteRole(id);
  }
}
