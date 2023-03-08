/* eslint-disable @typescript-eslint/no-var-requires */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Item, Nft, NftList } from '../../models/item.model';
import { UseGuards } from '@nestjs/common';
import { IpAddress, UserEntity } from '../../../libs/decorators/user.decorator';
import { User } from '../../models/user.model';
import { ItemService } from './item.service';
import { GqlAuthGuard } from '../../../libs/auth/gql.auth.guard';
import { NftService } from 'src/app/core.services/nft.services';
import {
  errorResponse,
  processException,
  successResponse,
} from 'src/app/helpers/functions';
import { prisma_client } from 'src/app/helpers/functions';
import Web3 from 'web3';
const Web3P = require('web3');
const web3: Web3 = new Web3P();
import { CreateItemDto, UpdateItemDto } from './dto/item.create.dto';
import { ResponseModel } from '../../models/dto/response.model';

import { ItemActivity } from '../../models/item-activity.model';
import { ExchangeNftService } from 'src/app/core.services/nft-exchange.service';
import { PAYMENT_TOKEN_TYPE_TOKEN } from 'src/app/helpers/coreconstants';
import { Exchange } from '../exchange/exchange.model';
import { ItemConnection } from 'src/app/models/pagination/item-connection.model';
import { ItemOrder } from 'src/app/models/input/item-order.input';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { ItemActivityFilter, ItemFilter } from './dto/filter.dto';
import { ItemActivitiesConnection } from 'src/app/models/pagination/item-activities-connection.model';
import { Decimal } from '@prisma/client/runtime';
import { TransferService } from '../transfer/transfer.service';
import { ItemUserArgs } from './dto/item.args';
import { CountModel } from 'src/app/models/dto/count.model';
import { GqlGetUserGuard } from 'src/libs/auth/gql.get-user.guard';
import { PriceCalculationModel } from 'src/app/models/priceCalculation.model';
import { getActiveItem } from './item.query';

@Resolver(() => Item)
export class ItemResolver {
  constructor(private readonly itemService: ItemService) {}

  /* @Query(() => ResponseModel)
  async testExchange(): Promise<ResponseModel> {
    try {
      const blockChain = await prisma_client.blockchain.findFirst();
      const exService = new ExchangeNftService(blockChain);
      await exService.init();
      const exchange: Exchange = {
        id: 1,
        uid: '1112220',
        item_id: 1,
        payment_token_id: 2,
        sell_offer_id: 1,
        buy_offer_id: 1,
        seller_id: 1,
        buyer_id: 2,
        total_amount: new Decimal('1.0089679976'),
        transaction_hash: '',
        created_at: new Date(),
        updated_at: new Date(),
        payment_token: {
          id: 2,
          sync_rate_status: 1,
          usd_rate: new Decimal(0),
          blockchain_id: 1,
          name: 'Wrapped Ether',
          min_amount_to_execute_auction: new Decimal(0),
          type: PAYMENT_TOKEN_TYPE_TOKEN,
          contract_address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
          token_symbol: 'WETH',
          is_default: 1,
          is_wrapable: 1,
          total_decimal: 18,
          logo: 'images/tokens/weth.svg',
        },
        item: {
          id: 2,
          name: 'string',
          slug: 'string',
          filetype: 'string',
          view_count: 0,
          payment_token_id: 2,
          like_count: 0,
          price: new Decimal('0'),
          collection_id: 1,
          owner_id: 1,
          creator_id: 1,
          is_minted: 1,
          status: 1,
          token_id: '34',
          created_at: new Date(),
          updated_at: new Date(),
        },
        sell_offer: {
          id: 1,
          uid: 'sell_6',
          nonce: 'sell_6',
          signature:
            '0xe11882d29772e5627f983cbc3f738b610ed0f990ca3e75037e63a0e21f4b2cd41ffd2310934b36804bac93f567dddce02191f41735bfd0512a22ce886a09534d1c',
          type: 1,
          payment_token_id: 2,
          item_id: 1,
          user_id: 1,
          total_amount: new Decimal(web3.utils.fromWei('50025')),
          seller_amount: new Decimal(web3.utils.fromWei('50000')),
          fee_percentage: 1,
          fee_amount: new Decimal(web3.utils.fromWei('20')),
          royalty_percentage: 0,
          royalty_amount: new Decimal(web3.utils.fromWei('0')),
          start_date: new Date(1650361182 * 1000),
          end_date: new Date(),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          user: {
            id: 1,
            wallet_address: '0x3f64e4b25862BDe8Ba388a9aD71D336b4d0f4332',
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
        buy_offer: {
          id: 1,
          uid: 'buy_6',
          nonce: 'buy_6',
          signature:
            '0x15be4e892eca2b0d50d2a01ddfb053907f43349f1b19c17a7b754f60bc8cf9e939b990284daa96e78b2afe156d49e81bfb5fb2d4c598222722345754dde257dc1b',
          type: 1,
          payment_token_id: 2,
          item_id: 1,
          user_id: 2,
          total_amount: new Decimal(web3.utils.fromWei('70100')),
          seller_amount: new Decimal(web3.utils.fromWei('70000')),
          fee_percentage: 1,
          fee_amount: new Decimal(web3.utils.fromWei('80')),
          royalty_percentage: 0,
          royalty_amount: new Decimal(web3.utils.fromWei('0')),
          start_date: new Date(1650361182 * 1000),
          end_date: new Date(1681901239 * 1000),
          status: 1,
          created_at: new Date(),
          updated_at: new Date(),
          user: {
            id: 1,
            wallet_address: '0x9908CbCb070d1ed8d8f2c064b281D3029545b185',
            created_at: new Date(),
            updated_at: new Date(),
          },
        },
      };
      const tx = await exService.exchangeNFTauction(exchange);
      console.log(tx.logs[0].topics);
      return successResponse();
    } catch (e) {
      processException(e);
    }
  } */

  /* @UseGuards(GqlAuthGuard())
  @Mutation(() => Nft)
  async mintNftTest(
    @UserEntity() user: User,
    @Args('tokenUri') tokenUri: string,
  ): Promise<Nft> {
    try {
      const blockChain = await prisma_client.blockchain.findFirst();
      const nftService = new NftService(blockChain);
      await nftService.init();
      const txObj = await nftService.mint(user.wallet_address, tokenUri);
      const id = txObj['tokenId'];
      return { id, tokenUri };
    } catch (e) {
      processException(e);
    }
  } */

  @UseGuards(GqlAuthGuard())
  @Query(() => NftList)
  async getNftsTest(@UserEntity() user: User): Promise<NftList> {
    try {
      const blockChain = await prisma_client.blockchain.findFirst();
      const nftService = new NftService(blockChain);
      await nftService.init();
      const nfts = await nftService.getAllNfts(user.wallet_address);
      const nftList: NftList = {
        pageKey: null,
        totalCount: nfts,
        ownedNfts: [],
      };
      /* if (!nfts.ownedNfts) return nftList;
      for (let i = 0; i < nfts.ownedNfts.length; i++) {
        const ownedNft: ownedNft = {
          title: nfts.ownedNfts[i].title,
          image: nfts.ownedNfts[i].metadata.image,
          tokenUri: nfts.ownedNfts[i].tokenUri.raw,
          description: nfts.ownedNfts[i].metadata.description,
        };
        try {
          ownedNft.id = web3.utils.hexToNumberString(
            nfts.ownedNfts[i].id.tokenId,
          );
        } catch (e) {
          ownedNft.id = nfts.ownedNfts[i].id.tokenId;
        }
        nftList.ownedNfts.push(ownedNft);
      } */
      return nftList;
    } catch (e) {
      processException(e);
    }
  }

  @Query(() => ItemConnection)
  async getItemLists(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: ItemFilter,
    @Args({
      name: 'orderBy',
      type: () => ItemOrder,
      nullable: true,
    })
    orderBy: ItemOrder,
    @Args({ nullable: true }) userArgs: ItemUserArgs,
  ): Promise<ItemConnection> {
    return this.itemService.getItemLists(paginate, filter, orderBy, userArgs);
  }

  @Query(() => Item)
  async ItemDetailsBySlugOrTokenId(
    @Args('slugOrTokenId') slugOrTokenId: string,
    @Args({ nullable: true }) userArgs: ItemUserArgs,
  ): Promise<Item> {
    return this.itemService.ItemDetailsBySlugOrTokenId(slugOrTokenId, userArgs);
  }

  @UseGuards(GqlGetUserGuard())
  @Mutation(() => CountModel)
  async itemViewCount(
    @Args('item_id') item_id: number,
    @UserEntity() user: User,
    @IpAddress() ipAddress: string,
  ): Promise<CountModel> {
    return this.itemService.ItemViewCount(item_id, user, ipAddress);
  }

  @UseGuards(GqlAuthGuard())
  @Query(() => String)
  async getItemUnlockAbleContent(
    @Args('item_slug') slug: string,
    @UserEntity() user: User,
  ): Promise<string> {
    return this.itemService.getItemUnlockAbleContent(slug, user);
  }

  @Query(() => ResponseModel)
  async checkUniqueItem(
    @Args('name') name: string,
    @Args('id', { nullable: true }) id: number,
  ): Promise<ResponseModel> {
    return await this.itemService.checkUniqueItem(id, name);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => Item)
  async createItem(
    @UserEntity() user: User,
    @Args('data') data: CreateItemDto,
  ): Promise<Item> {
    return this.itemService.createItem(data, user);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => Item)
  async updateItem(
    @UserEntity() user: User,
    @Args('id') id: number,
    @Args('data') data: UpdateItemDto,
  ): Promise<Item> {
    return await this.itemService.updateItem(id, user, data);
  }

  @Query(() => [ItemActivity])
  async getItemActivities(
    @Args('item_id') item_id: number,
    @Args('events', { nullable: true }) events: string,
  ): Promise<ItemActivity[]> {
    return await this.itemService.getItemActivities(item_id, events);
  }

  @Query(() => ItemActivitiesConnection)
  async getItemActivitiesPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: ItemActivityFilter,
  ): Promise<ItemActivitiesConnection> {
    return this.itemService.getItemActivitiesPaginate(paginate, filter);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async itemReMint(
    @UserEntity() user: User,
    @Args('activity_id') activity_id: number,
  ): Promise<ResponseModel> {
    return await this.itemService.itemReMint(activity_id, user);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => CountModel)
  async itemFavouriteListToggle(
    @UserEntity() user: User,
    @Args('item_id') item_id: number,
  ): Promise<CountModel> {
    return await this.itemService.itemFavouriteListToggle(item_id, user.id);
  }

  @Query(() => ItemConnection)
  async getUserItemFavouriteLists(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) userArgs: ItemUserArgs,
  ): Promise<ItemActivitiesConnection> {
    return this.itemService.getUserItemFavouriteLists(paginate, userArgs);
  }

  @Query(() => Boolean)
  async checkItemFavouriteByUser(
    @Args('item_id') item_id: number,
    @Args() userArgs: ItemUserArgs,
  ): Promise<boolean> {
    return await this.itemService.checkItemFavouriteByUser(item_id, userArgs);
  }

  @Mutation(() => ResponseModel)
  async syncItemOwner(
    @Args('item_id') item_id: number,
  ): Promise<ResponseModel> {
    const item = await getActiveItem(item_id);
    const updatedOwner = await this.itemService.syncItemOwner(item_id);
    if (updatedOwner && item.owner_id != updatedOwner.id) {
      new TransferService().cancelActiveSells(item_id);
      new TransferService().cancelActiveBuyOffers(item_id, updatedOwner.id);
    }
    return updatedOwner ? successResponse('') : errorResponse();
  }

  @Query(() => PriceCalculationModel, { nullable: true })
  async getDayWiseItemPrice(
    @Args('item_id') item_id: number,
    @Args('days') days: string,
  ): Promise<PriceCalculationModel> {
    return await this.itemService.getDayWiseItemPrice(item_id, days);
  }

  @Query(() => [Item])
  async getTrendingItemList(
    @Args('limit', { nullable: true }) limit: number,
    @Args({ nullable: true }) userArgs: ItemUserArgs,
  ): Promise<Item[]> {
    return await this.itemService.getTrendingItemList(limit, userArgs);
  }
}
