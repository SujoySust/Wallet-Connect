/* eslint-disable @typescript-eslint/no-var-requires */
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { SellOfferConnection } from 'src/app/models/pagination/sell-offer-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { UserEntity } from '../../../../libs/decorators/user.decorator';
import { User } from '../../../models/user.model';
import { SellOfferFilter } from '../filter.dto';
import { SellOfferUserTypeArgs } from '../offer.args';
import { CreateSellOfferDto } from '../offer.dto';
import { SigDataModel } from '../sigdata.model';
import { SellOffer } from './sell-offer.model';
import { SellOfferService } from './sell-offer.service';
@Resolver(() => SellOffer)
export class SellOfferResolver {
  constructor(private readonly sellOfferService: SellOfferService) {}

  @UseGuards(GqlAuthGuard())
  @Query(() => SigDataModel)
  async getDataForSignSellOffer(
    @UserEntity() user: User,
    @Args('data') data: CreateSellOfferDto,
  ): Promise<SigDataModel> {
    return await this.sellOfferService.getDataForSignSellOffer(user, data);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => SellOffer)
  async createSellOffer(
    @UserEntity() user: User,
    @Args('data') data: CreateSellOfferDto,
  ): Promise<SellOffer> {
    return await this.sellOfferService.createSellOffer(user, data);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async cancelSellOffer(
    @UserEntity() user: User,
    @Args('sell_uid') uid: string,
  ): Promise<ResponseModel> {
    return await this.sellOfferService.cancelSellOffer(user, uid);
  }

  @UseGuards(GqlAuthGuard())
  @Query(() => SellOfferConnection)
  async getSellOfferLists(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: SellOfferFilter,
  ): Promise<SellOfferConnection> {
    return this.sellOfferService.getSellOfferLists(paginate, filter);
  }

  @Query(() => SellOfferConnection)
  async getActiveSellOfferLists(
    @Args() paginate: PaginationArgs,
  ): Promise<SellOfferConnection> {
    return this.sellOfferService.getActiveSellOfferLists(paginate);
  }

  @Query(() => SellOfferConnection)
  async getSellOfferListsByUser(
    @Args() paginate: PaginationArgs,
    @Args('status') status: number,
    @Args({ nullable: true }) userArgs: SellOfferUserTypeArgs,
  ): Promise<SellOfferConnection> {
    return this.sellOfferService.getSellOfferListsByUser(
      paginate,
      status,
      userArgs,
    );
  }
}
