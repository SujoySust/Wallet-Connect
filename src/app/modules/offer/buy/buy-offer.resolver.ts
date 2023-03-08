/* eslint-disable @typescript-eslint/no-var-requires */
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../../../libs/auth/gql.auth.guard';
import { UserEntity } from '../../../../libs/decorators/user.decorator';
import { User } from '../../../models/user.model';
import { BuyOffer } from './buy-offer.model';
import { BuyOfferService } from './buy-offer.service';
import { CreateBuyOfferDto } from '../offer.dto';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { BuyOfferConnection } from 'src/app/models/pagination/buy-offer-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { BuyOfferUserTypeArgs } from '../offer.args';
import { BuyOfferFilter } from '../filter.dto';
import { SigDataModel } from '../sigdata.model';

@Resolver(() => BuyOffer)
export class BuyOfferResolver {
  constructor(private readonly buyOfferService: BuyOfferService) {}

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async cancelBuyOffer(
    @UserEntity() user: User,
    @Args('sell_uid') uid: string,
  ): Promise<ResponseModel> {
    return await this.buyOfferService.cancelBuyOffer(user, uid);
  }

  @UseGuards(GqlAuthGuard())
  @Query(() => SigDataModel)
  async getDataForSignBuyOffer(
    @UserEntity() user: User,
    @Args('data') data: CreateBuyOfferDto,
  ): Promise<SigDataModel> {
    return this.buyOfferService.getDataForSignBuyOffer(user, data);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => BuyOffer)
  async createBuyOffer(
    @UserEntity() user: User,
    @Args('data') data: CreateBuyOfferDto,
  ): Promise<BuyOffer> {
    return this.buyOfferService.createBuyOffer(user, data);
  }

  /* @UseGuards(GqlAuthGuard())
  @Mutation(() => BuyOffer)
  async createBid(
    @UserEntity() user: User,
    @Args('data') data: CreateBidDto,
  ): Promise<BuyOffer> {
    return this.buyOfferService.createBid(user, data);
  } */

  @Query(() => [BuyOffer])
  async itemBuyOfferList(
    @Args('item_id') item_id: number,
  ): Promise<BuyOffer[]> {
    return await this.buyOfferService.itemBuyOfferList(item_id);
  }

  @Query(() => BuyOffer)
  async getBuyOfferById(@Args('offerId') offerId: number): Promise<BuyOffer> {
    return await this.buyOfferService.getBuyOfferById(offerId);
  }

  @Query(() => BuyOfferConnection)
  async getUserBuyOfferLists(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) userArgs: BuyOfferUserTypeArgs,
    @Args({ nullable: true }) filter: BuyOfferFilter,
  ): Promise<BuyOfferConnection> {
    return await this.buyOfferService.getUserBuyOfferLists(
      paginate,
      userArgs,
      filter,
    );
  }
}
