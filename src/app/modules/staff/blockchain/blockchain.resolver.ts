import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BlockchainService } from './blockchain.service';
import { BlockchainModel, BlockchainStaffModel } from './blockchain.model';
import { UseGuards } from '@nestjs/common';
import { RolePermissionGuard } from 'src/app/guards/role-permission.guard';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { GqlAuthGuard } from 'src/libs/auth/gql.auth.guard';
import { CreateBlockChainDto, UpdateBlockChainDto } from './dto/create.dto';
import { PERMISSION_KEY_BLOCKCHAIN } from 'src/app/helpers/permission_constant';
import { BlockchainFilter } from './dto/filter.dto';
import { BlockchainStaffConnection } from 'src/app/models/pagination/blockchain-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { Order } from 'src/app/models/input/order.input';

@Resolver()
export class BlockchainResolver {
  constructor(private readonly blockChainService: BlockchainService) {}

  @Query(() => [BlockchainModel])
  async getBlockchainLists(
    @Args({ name: 'status', type: () => Int, nullable: true }) status,
  ): Promise<BlockchainModel[]> {
    return await this.blockChainService.getBlockchainLists(status);
  }

  @Query(() => BlockchainModel, { nullable: true })
  async getBlockchainDetails(
    @Args('chain_id', { nullable: true }) chain_id?: number,
    @Args('id', { nullable: true }) id?: number,
  ): Promise<BlockchainModel> {
    return await this.blockChainService.getBlockchainDetails(chain_id, id);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_BLOCKCHAIN))
  @Query(() => BlockchainStaffModel)
  async getBlockchainById(
    @Args({ name: 'id', type: () => Int }) id,
  ): Promise<BlockchainStaffModel> {
    return await this.blockChainService.getBlockchainByID(id);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_BLOCKCHAIN))
  @Query(() => BlockchainStaffConnection)
  async getStaffBlockchainListPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: BlockchainFilter,
    @Args({
      name: 'orderBy',
      type: () => Order,
      nullable: true,
    })
    orderBy: Order,
  ): Promise<BlockchainStaffConnection> {
    return await this.blockChainService.getStaffBlockchainListPaginate(
      paginate,
      filter,
      orderBy,
    );
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_BLOCKCHAIN))
  @Mutation(() => ResponseModel)
  async createBlockchain(
    @Args('data') data: CreateBlockChainDto,
  ): Promise<ResponseModel> {
    return await this.blockChainService.createBlockchain(data);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_BLOCKCHAIN))
  @Mutation(() => ResponseModel)
  async updateBlockchain(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('data') data: UpdateBlockChainDto,
  ): Promise<ResponseModel> {
    return await this.blockChainService.updateBlockchain(id, data);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_BLOCKCHAIN))
  @Mutation(() => ResponseModel)
  async updateBlockchainStatus(
    @Args({ name: 'id', type: () => Int }) id: number,
    @Args('status') status: number,
  ): Promise<ResponseModel> {
    return await this.blockChainService.updateBlockchainStatus(id, status);
  }

  @UseGuards(GqlAuthGuard('staff'))
  @UseGuards(new RolePermissionGuard(PERMISSION_KEY_BLOCKCHAIN))
  @Mutation(() => ResponseModel)
  async deleteBlockchain(
    @Args({ name: 'id', type: () => Int }) id: number,
  ): Promise<ResponseModel> {
    return await this.blockChainService.deleteBlockchain(id);
  }
}
