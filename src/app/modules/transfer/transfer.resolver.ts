import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { User } from 'src/app/models/user.model';
import { GqlAuthGuard } from 'src/libs/auth/gql.auth.guard';
import { UserEntity } from 'src/libs/decorators/user.decorator';
import { Transfer } from './transfer.model';
import { TransferService } from './transfer.service';

@Resolver()
export class TransferReslover {
  constructor(private readonly service: TransferService) {}

  @Query(() => [Transfer])
  async getTransferList(
    @Args('from_user_id', { nullable: true }) from_user_id: number,
    @Args('to_user_id', { nullable: true }) to_user_id: number,
  ): Promise<Transfer[]> {
    return this.service.getTransferList(from_user_id, to_user_id);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => Transfer)
  async createTransfer(
    @UserEntity() user: User,
    @Args('to_address') to: string,
    @Args('item_id') item_id: number,
  ): Promise<Transfer> {
    return this.service.createTransfer(user, to, item_id);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async cancelTransfer(
    @UserEntity() user: User,
    @Args('transfer_id') transfer_id: number,
  ): Promise<ResponseModel> {
    return this.service.cancelTransfer(user, transfer_id);
  }

  @Mutation(() => ResponseModel)
  async finishTransfer(
    @Args('transfer_id') transfer_id: number,
    @Args('transaction_hash') transaction_hash: string,
  ): Promise<ResponseModel> {
    return this.service.finishTransfer(transfer_id, transaction_hash);
  }
}
