/* eslint-disable prettier/prettier */
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { Collection } from 'src/app/models/collection.model';
import { CollectionOrder } from 'src/app/models/input/collection-order.input';
import { CollectionConnection } from 'src/app/models/pagination/collection-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { CollectionFilter } from '../../collection/dto/filter.dto';
import { StaffCollectionService } from './staff-collection.service';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';
import { PERMISSION_KEY_COLLECTION } from 'src/app/helpers/permission_constant';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { MaxFeaturedCollectionOrderDto } from './dto/collection.dto';

@Resolver(() => Collection)
@UseGuards(GqlAuthGuard('staff'))
export class StaffCollectionResolver {
  constructor(private readonly staffCollectionService: StaffCollectionService) {}

  @Query(() => CollectionConnection)
  async getStaffCollectionListsPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: CollectionFilter,
    @Args({
      name: 'orderBy',
      type: () => CollectionOrder,
      nullable: true,
    })
    orderBy: CollectionOrder,
  ): Promise<CollectionConnection> {
    return await this.staffCollectionService.getStaffCollectionListsPaginate(
      paginate,
      filter,
      orderBy,
    );
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Query(() => [Collection])
  async getStaffNotFeaturedCollectionLists(): Promise<Collection[]> {
    return await this.staffCollectionService.getStaffNotFeaturedCollectionLists();
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Mutation(() => ResponseModel)
  async updateStaffCollectionStatus(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('status') status: number,
  ): Promise<ResponseModel> {
    return await this.staffCollectionService.updateCollectionStatus(id, status);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Mutation(() => ResponseModel)
  async addStaffCollectionToFeatured(
    @Args({ name: 'collection_id', type: () => Int }) collectionId: number,
    @Args({ name: 'order', type: () => Int}) order: number,
  ): Promise<ResponseModel> {
    return await this.staffCollectionService.addCollectionToFeatured(collectionId, order);
  }
  
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Query(() => MaxFeaturedCollectionOrderDto)
  async getStaffFeaturedCollectionMaxOrder() {
    return await this.staffCollectionService.getFeaturedCollectionMaxOrder();
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Mutation(() => ResponseModel)
  async updateStaffFeaturedCollectionOrder(
    @Args({ name: 'collection_id', type: () => Int }) collectionId: number,
    @Args({ name: 'order', type: () => Int}) order: number,
  ): Promise<ResponseModel> {
    return await this.staffCollectionService.updateFeaturedCollectionOrder(collectionId, order);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Mutation(() => ResponseModel)
  async removeStaffCollectionFromFeatured(
    @Args({ name: 'collection_id', type: () => Int }) collectionId: number,
  ): Promise<ResponseModel> {
    return await this.staffCollectionService.removeCollectionFromFeatured(collectionId);
  }

  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_COLLECTION))
  @Query(() => CollectionConnection)
  async getStaffFeaturedCollectionListPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: CollectionFilter,
  ): Promise<CollectionConnection> {
    return await this.staffCollectionService.getStaffFeaturedCollectionListsPaginate(paginate,filter);
  }
}
