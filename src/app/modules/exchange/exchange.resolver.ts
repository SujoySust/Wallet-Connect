/* eslint-disable @typescript-eslint/no-var-requires */
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { GqlAuthGuard } from '../../../libs/auth/gql.auth.guard';
import { UserEntity } from '../../../libs/decorators/user.decorator';
import { User } from '../../models/user.model';
import { Exchange } from './exchange.model';
import { ExchangeService } from './exchange.service';

@Resolver(() => Exchange)
export class ExchangeResolver {
  constructor(private readonly exchangeService: ExchangeService) {}

  @UseGuards(GqlAuthGuard())
  @Mutation(() => Exchange)
  async buyNow(
    @UserEntity() user: User,
    @Args('offerId') offerId: number,
  ): Promise<Exchange> {
    return this.exchangeService.buyNow(offerId, user);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => Exchange)
  async acceptOffer(
    @UserEntity() user: User,
    @Args('offerId') offerId: number,
  ): Promise<Exchange> {
    return this.exchangeService.acceptOffer(offerId, user);
  }

  @Mutation(() => ResponseModel)
  async finishExchang(
    @Args('exchangeId') exchangeId: number,
    @Args('transactionHash') transactionHash: string,
  ): Promise<ResponseModel> {
    return this.exchangeService.finishExchage(exchangeId, transactionHash);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async cancelExchange(
    @UserEntity() user: User,
    @Args('exchangeId') exchangeId: number,
  ): Promise<ResponseModel> {
    return await this.exchangeService.cancelExchang(exchangeId, user);
  }
}
