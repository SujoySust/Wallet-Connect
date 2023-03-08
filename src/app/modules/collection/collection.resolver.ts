import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Collection } from '../../models/collection.model';
import { CreateCollectionDto } from './dto/collection.dto';
import { CollectionService } from './collection.service';
import { UserEntity } from '../../../libs/decorators/user.decorator';
import { User } from '../../models/user.model';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../../libs/auth/gql.auth.guard';
import { CollectionWithMeta } from './dto/collection-with-meta.object';
import { CollectionConnection } from '../../models/pagination/collection-connection.model';
import { PaginationArgs } from '../../../libs/graphql/pagination/pagination.args';
import { CollectionOrder } from '../../models/input/collection-order.input';
import {
  CollectionFilter,
  CollectionUniqueFilter,
  CollectionWithItemFilter,
} from './dto/filter.dto';
import { ResponseModel } from '../../models/dto/response.model';
import { UpdateCollectionDto } from './dto/collection.dto';
import { CreatorEarningConnection } from 'src/app/models/pagination/creator-earnings-connection.model';
import { CollectionUserArgs } from './dto/collection.args';
import { PriceCalculationModel } from 'src/app/models/priceCalculation.model';
import { Ranking } from 'src/app/models/ranking.model';

@Resolver(() => Collection)
export class CollectionResolver {
  constructor(private readonly collectionService: CollectionService) {}

  @Query(() => CollectionWithMeta)
  async getCollectionDetails(
    @Args('slug') slug: string,
    @Args({ nullable: true }) user: CollectionUserArgs,
  ): Promise<CollectionWithMeta> {
    return this.collectionService.getCollectionDetails(slug, user);
  }

  // get collection lists paginate
  @Query(() => ResponseModel)
  async checkUniqueCollection(
    @Args('id', { nullable: true }) id: number,
    @Args({ nullable: true }) filter: CollectionUniqueFilter,
  ): Promise<ResponseModel> {
    return await this.collectionService.checkUniqueCollection(id, filter);
  }

  // get collection lists paginate
  @Query(() => CollectionConnection)
  async getCollectionListsPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: CollectionFilter,
    @Args({
      name: 'orderBy',
      type: () => CollectionOrder,
      nullable: true,
    })
    orderBy: CollectionOrder,
    @Args({ nullable: true }) withItemFilter: CollectionWithItemFilter,
  ): Promise<CollectionConnection> {
    return await this.collectionService.getCollectionListsPaginate(
      paginate,
      filter,
      orderBy,
      withItemFilter,
    );
  }

  @Query(() => [Collection])
  async collectionsByAddress(
    @Args('wallet_address') wallet_address: string,
  ): Promise<Collection[]> {
    return await this.collectionService.getCollectionListByAddress(
      wallet_address,
    );
  }

  @Query(() => [Collection], { description: 'collections for item create' })
  async collectionsForItem(
    @Args('wallet_address') wallet_address: string,
  ): Promise<CollectionConnection> {
    return await this.collectionService.collectionsForItemCreate(
      wallet_address,
    );
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => Collection)
  async createCollection(
    @UserEntity() user: User,
    @Args('data') data: CreateCollectionDto,
  ): Promise<Collection> {
    return await this.collectionService.createCollection(user, data);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => Collection)
  async updateCollection(
    @UserEntity() user: User,
    @Args('id') id: number,
    @Args('data') data: UpdateCollectionDto,
  ): Promise<Collection> {
    return await this.collectionService.updateCollection(id, user, data);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async deleteCollection(
    @UserEntity() user: User,
    @Args('collectionId') collectionId: number,
  ): Promise<ResponseModel> {
    return await this.collectionService.deleteCollection(collectionId, user.id);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async collectionWatchListToggle(
    @UserEntity() user: User,
    @Args('collectionId') collectionId: number,
  ) {
    return await this.collectionService.collectionWatchListToggle(
      collectionId,
      user.id,
    );
  }

  @UseGuards(GqlAuthGuard())
  @Query(() => CollectionConnection)
  async myCollectionWatchList(
    @UserEntity() user: User,
    @Args() paginate: PaginationArgs,
  ): Promise<CollectionConnection> {
    return await this.collectionService.myCollectionWatchList(
      paginate,
      user.id,
    );
  }

  @Query(() => Boolean)
  async checkCollectionWatchedByUser(
    @Args('collection_id') collection_id: number,
    @Args() userArgs: CollectionUserArgs,
  ): Promise<boolean> {
    return await this.collectionService.checkCollectionWatchedByUser(
      collection_id,
      userArgs,
    );
  }

  @Query(() => CreatorEarningConnection)
  getCreatorEarningListPaginate(
    @UserEntity() user: User,
    @Args() paginate: PaginationArgs,
    @Args('collection_id', { nullable: true }) collection_id: number,
    @Args('user_id', { nullable: true }) user_id: number,
  ): Promise<CreatorEarningConnection> {
    return this.collectionService.creatorEarningListPaginate(
      paginate,
      collection_id,
      user_id,
    );
  }

  @Query(() => PriceCalculationModel, { nullable: true })
  async getDayWiseCollectionPrice(
    @Args('collection_id') collection_id: number,
    @Args('days') days: string,
  ): Promise<PriceCalculationModel> {
    return await this.collectionService.getDayWiseCollectionPrice(
      collection_id,
      days,
    );
  }

  @Query(() => [Ranking])
  async getRankingList(
    @Args('days') days: number,
    @Args('blockchain_id', { nullable: true }) blockchain_id: number | null,
    @Args('limit', { nullable: true }) limit: number,
  ): Promise<Ranking[]> {
    return await this.collectionService.getRankingList(
      days,
      blockchain_id,
      limit,
    );
  }

  /* @Query(() => ResponseModel, { nullable: true })
  async synceRankingList(): Promise<ResponseModel> {
    return await this.collectionService.synceRankingList();
  } */

  @Query(() => [Collection])
  async getTopCollectionList(
    @Args('limit', { nullable: true }) limit: number,
  ): Promise<Collection[]> {
    return await this.collectionService.getTopCollectionList(limit);
  }

  @Query(() => [Collection])
  async getTrendingCollectionList(
    @Args('limit', { nullable: true }) limit: number,
  ): Promise<Collection[]> {
    return await this.collectionService.getTrendingCollectionList(limit);
  }

  @Query(() => [Collection])
  async getFeaturedCollectionList(
    @Args('limit', { nullable: true }) limit: number,
  ): Promise<Collection[]> {
    return await this.collectionService.getFeaturedCollectionList(limit);
  }
}
