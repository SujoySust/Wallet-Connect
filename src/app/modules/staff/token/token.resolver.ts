import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TokenService } from './token.service';
import {
  NativeNwrapTokenModel,
  PaymentTokenModel,
} from 'src/app/models/paymentToken.model';
import { PaymentTokenConnection } from 'src/app/models/pagination/payment-token-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { PaymentTokenFilter } from './dto/filter.dto';
import { PaymentTokenOrder } from 'src/app/models/input/payment-token-order.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/libs/auth/gql.auth.guard';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';
import { PERMISSION_KEY_PAYMENT_TOKEN } from 'src/app/helpers/permission_constant';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { CreatePaymentTokenDto, UpdatePaymentTokenDto } from './dto/create.dto';
import { Order } from 'src/app/models/input/order.input';
import { successResponse } from 'src/app/helpers/functions';

@Resolver()
export class TokenResolver {
  constructor(private readonly tokenService: TokenService) {}

  @Query(() => [PaymentTokenModel])
  async getTokenLists(
    @Args({ name: 'blockchain_id', nullable: true }) blockchain_id: number,
    @Args({ name: 'chain_id', nullable: true }) chain_id: number,
  ): Promise<PaymentTokenModel[]> {
    return await this.tokenService.getTokenLists(blockchain_id, chain_id);
  }

  @Query(() => [PaymentTokenModel])
  async getItemsTokens(
    @Args('item_id') item_id: number,
  ): Promise<PaymentTokenModel[]> {
    return await this.tokenService.getItemsTokens(item_id);
  }

  @Query(() => NativeNwrapTokenModel)
  async getNativeNwrapToken(
    @Args({ name: 'blockchain_id', nullable: true }) blockchain_id: number,
    @Args({ name: 'chain_id', nullable: true }) chain_id: number,
  ): Promise<NativeNwrapTokenModel> {
    return await this.tokenService.getNativeNwrapToken(blockchain_id, chain_id);
  }

  @Query(() => PaymentTokenConnection)
  async getTokenListsPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: PaymentTokenFilter,
    @Args({
      name: 'orderBy',
      type: () => PaymentTokenOrder,
      nullable: true,
    })
    orderBy: PaymentTokenOrder,
  ): Promise<PaymentTokenConnection> {
    return await this.tokenService.getTokenListsPaginate(
      paginate,
      filter,
      orderBy,
    );
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_PAYMENT_TOKEN))
  @Query(() => PaymentTokenModel)
  async getPaymentTokenById(
    @Args({ name: 'id', type: () => Int }) id,
  ): Promise<PaymentTokenModel> {
    return await this.tokenService.getPaymentTokenByID(id);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_PAYMENT_TOKEN))
  @Query(() => PaymentTokenConnection)
  async getStaffPaymentTokenListPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: PaymentTokenFilter,
    @Args({
      name: 'orderBy',
      type: () => Order,
      nullable: true,
    })
    orderBy: Order,
  ): Promise<PaymentTokenConnection> {
    return await this.tokenService.getStaffPaymentTokenListPaginate(
      paginate,
      filter,
      orderBy,
    );
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_PAYMENT_TOKEN))
  @Mutation(() => ResponseModel)
  async createPaymentToken(
    @Args('data') data: CreatePaymentTokenDto,
  ): Promise<ResponseModel> {
    return await this.tokenService.createPaymentToken(data);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_PAYMENT_TOKEN))
  @Mutation(() => ResponseModel)
  async updatePaymentToken(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('data') data: UpdatePaymentTokenDto,
  ): Promise<ResponseModel> {
    return await this.tokenService.updatePaymentToken(id, data);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_PAYMENT_TOKEN))
  @Mutation(() => ResponseModel)
  async updatePaymentTokenStatus(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('status') status: number,
  ): Promise<ResponseModel> {
    return await this.tokenService.updatePaymentTokenStatus(id, status);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_PAYMENT_TOKEN))
  @Mutation(() => ResponseModel)
  async deletePaymentToken(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<ResponseModel> {
    return await this.tokenService.deletePaymentToken(id);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_PAYMENT_TOKEN))
  @Mutation(() => ResponseModel)
  async syncUsdRates(): Promise<ResponseModel> {
    this.tokenService.syncUsdRates();
    return successResponse();
  }
}
