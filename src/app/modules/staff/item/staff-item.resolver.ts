/* eslint-disable prettier/prettier */
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { Collection } from 'src/app/models/collection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { StaffItemService } from './staff-item.service';
import { ItemConnection } from 'src/app/models/pagination/item-connection.model';
import { ItemOrder } from 'src/app/models/input/item-order.input';
import { ItemActivityFilter, ItemFilter } from '../../item/dto/filter.dto';
import { ItemActivitiesConnection } from 'src/app/models/pagination/item-activities-connection.model';
import { Item } from 'src/app/models/item.model';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';
import { PERMISSION_KEY_ASSET} from 'src/app/helpers/permission_constant';
import { ResponseModel } from 'src/app/models/dto/response.model';

@Resolver(() => Collection)
@UseGuards(GqlAuthGuard('staff'))
export class StaffItemResolver {
  constructor(private readonly staffItemService: StaffItemService) {}

  @Query(() => ItemConnection)
  async getStaffItemListsPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: ItemFilter,
    @Args({
      name: 'orderBy',
      type: () => ItemOrder,
      nullable: true,
    })
    orderBy: ItemOrder,
  ): Promise<ItemConnection> {
    return this.staffItemService.getStaffItemListsPaginate(paginate, filter, orderBy);
  }
  
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_ASSET))
  @Query(() => Item)
  async getStaffSingleItemBySlugOrTokenId(
    @Args('slugOrTokenId') slugOrTokenId: string,
  ): Promise<Item> {
    return this.staffItemService.getStaffSingleItemBySlugOrTokenId(slugOrTokenId);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_ASSET))
  @Mutation(() => ResponseModel)
  async updateItemStatus(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('status') status: number,
  ): Promise<ResponseModel> {
    return await this.staffItemService.updateItemStatus(id, status);
  }
}
