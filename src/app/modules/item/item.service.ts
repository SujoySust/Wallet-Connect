/* eslint-disable @typescript-eslint/no-var-requires */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateItemDto, UpdateItemDto } from './dto/item.create.dto';
import { User } from '../../models/user.model';
import { Item } from '../../models/item.model';
import {
  __,
  containsSpecialChars,
  errorResponse,
  processException,
  successResponse,
  checkAndGetAddress,
  randomUsernameFromWalletAddress,
} from '../../helpers/functions';
import { ItemValidation } from './item.validation';

import { FilesystemService } from '../../filesystem/filesystem.service';
import { ItemData } from './item.data';
import { prisma_client } from 'src/app/helpers/functions';
import {
  ITEM_EVENT_MINT,
  ITEM_EVENTS,
  ITEM_MINT_STATUS_DONE,
  ITEM_MINT_STATUS_FAILED,
  ITEM_MINT_STATUS_IN_PROGRESS,
  STATUS_ACTIVE,
  SELL_OFFER_TYPE_ACUTION,
  BUY_SELL_STATUS_ACTIVE,
  EXCHANGE_STATUS_IN_PROGRESS,
} from '../../helpers/coreconstants';
import { NFTStorage } from 'nft.storage';
import { ConfigService } from '@nestjs/config';
import { NftService } from '../../core.services/nft.services';
import { MintQueue } from '../../queues/mint.queue';
import { OfferValidation } from '../offer/offer.validation';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { ItemActivityFilter, ItemFilter } from './dto/filter.dto';
import { ItemOrder } from 'src/app/models/input/item-order.input';
import { ItemConnection } from 'src/app/models/pagination/item-connection.model';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Prisma } from '@prisma/client';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { ItemActivitiesConnection } from 'src/app/models/pagination/item-activities-connection.model';
import { ItemActivity } from 'src/app/models/item-activity.model';
import Web3 from 'web3';
import { ItemUserArgs } from './dto/item.args';
import { CountModel } from 'src/app/models/dto/count.model';
import { Decimal } from '@prisma/client/runtime';
import { PriceCalculationModel } from 'src/app/models/priceCalculation.model';
import { filterItemActivityList, filterItemList } from './item.filter';
import {
  checkUniqueName,
  getActiveItem,
  getDayWiseItemPrice,
  getItemById,
  getItemBySlugOrTokenId,
  getUserFavouriteItem,
  getUserItemView,
} from './item.query';
import { RESTRICTED_KEY_WORDS } from 'src/app/helpers/corearray';
import { ItemFavouriteList } from 'src/app/models/item-favourite-list.model';
import { PaymentTokenModel } from 'src/app/models/paymentToken.model';
const web3 = require('web3');

@Injectable()
export class ItemService {
  private web3: Web3;
  constructor(
    private readonly itemValidation: ItemValidation,
    private readonly itemData: ItemData,
    private readonly fileService: FilesystemService,
    private readonly configService: ConfigService,
    private readonly mintQueue: MintQueue,
  ) {
    this.web3 = new web3();
  }

  async getItemUnlockAbleContent(slug: string, user: User): Promise<string> {
    const item = await prisma_client.item.findFirst({
      where: {
        slug: slug,
        status: STATUS_ACTIVE,
        owner_id: user.id,
      },
      select: {
        unlockable_content: true,
      },
    });
    if (!item)
      throw new BadRequestException(errorResponse(__('Invalid request.')));
    return item.unlockable_content;
  }

  async ItemDetailsBySlugOrTokenId(
    slugOrTokenId: string,
    userArgs: ItemUserArgs,
  ): Promise<Item> {
    try {
      const item = await getItemBySlugOrTokenId(slugOrTokenId, userArgs);
      if (!item)
        throw new NotFoundException(errorResponse(__('Item not found.')));
      // item.unlockable_content = null;
      const user = userArgs
        ? await prisma_client.user.findFirst({
            where: {
              id: userArgs.viewer_id ?? undefined,
              wallet_address: userArgs.viewer_wallet_address ?? undefined,
            },
          })
        : null;

      const offerValidation = new OfferValidation();
      item['active_sell'] = await offerValidation.getActiveSellOffer(item.id);
      item['active_buy'] = user
        ? await offerValidation.getActiveBuyOffer(item.id, user.id)
        : null;
      if (
        item['active_sell'] &&
        item['active_sell'].type == SELL_OFFER_TYPE_ACUTION
      )
        item['highest_bid'] = await this.getHigestBid(
          item.id,
          item['active_sell'].payment_token_id,
          item['active_sell'].total_amount,
        );

      item['exchange_in_progress'] = await prisma_client.exchange.findFirst({
        where: {
          item_id: item.id,
          status: EXCHANGE_STATUS_IN_PROGRESS,
        },
      });

      return item;
    } catch (e) {
      processException(e);
    }
  }

  async ItemViewCount(
    item_id: number,
    user: User,
    ipAddress: string,
  ): Promise<CountModel> {
    try {
      const item = await getItemById(item_id);
      if (!item)
        throw new NotFoundException(errorResponse(__('Item not found.')));

      if (!user) return { count: item.view_count };
      const isItemViewed = await getUserItemView(item_id, user.id);
      if (!isItemViewed) {
        await prisma_client.itemViewList.create({
          data: {
            item_id: item_id,
            user_id: user.id,
            ip_address: ipAddress,
          },
        });
        let item_view_count = item.view_count;
        item_view_count++;
        await prisma_client.item.update({
          where: {
            id: item_id,
          },
          data: {
            view_count: item_view_count,
          },
        });
        return { count: item_view_count };
      }
      return { count: item.view_count };
    } catch (e) {
      processException(e);
    }
  }

  async getHigestBid(
    item_id: number,
    token_id: number,
    auction_amount: Decimal,
  ) {
    return await prisma_client.buyOffer.findFirst({
      where: {
        item_id: item_id,
        status: BUY_SELL_STATUS_ACTIVE,
        end_date: {
          gt: new Date(),
        },
        payment_token_id: token_id,
        total_amount: {
          gte: auction_amount,
        },
      },
      orderBy: [
        {
          total_amount: 'desc',
        },
        {
          id: 'asc',
        },
      ],
      include: {
        user: true,
      },
    });
  }

  async checkUniqueItem(id: number | null, name: string) {
    try {
      if (containsSpecialChars(name)) {
        throw new BadRequestException(errorResponse(__('Invalid Name!')));
      }
      if (RESTRICTED_KEY_WORDS.includes(name.toLowerCase())) {
        throw new BadRequestException(errorResponse(__('Restricted key word')));
      }
      const item = await checkUniqueName(name, id);
      if (item) {
        return errorResponse(__('Item name already taken!'));
      } else {
        return successResponse(__('Item name is available!'));
      }
    } catch (e) {
      processException(e);
    }
  }

  async createItem(payload: CreateItemDto, user: User): Promise<Item> {
    try {
      if (containsSpecialChars(payload.name)) {
        throw new BadRequestException(errorResponse(__('Invalid Name!')));
      }
      await this.itemValidation.createItemValidation(
        payload,
        prisma_client,
        user,
      );
      const uploadedFile = await this.itemData.uploadMediaFile(payload);
      const media_path = uploadedFile.url;
      if (media_path) {
        const thumbnail_path =
          await this.itemData.checkFileTypeAndProcessThumbnail(
            uploadedFile,
            payload,
          );
        const token_uri = await this.uploadFileToIpfs(payload, media_path);
        if (token_uri) {
          const item = await prisma_client.$transaction(async (prisma) => {
            const item = await this.saveItem(
              user,
              payload,
              {
                media_path,
                token_uri,
                filetype: uploadedFile.type,
                thumbnail_path,
              },
              prisma,
            );
            if (item) {
              await this.itemActivitySave(
                item.id,
                ITEM_EVENT_MINT,
                null,
                user.id,
                null,
                null,
                ITEM_MINT_STATUS_IN_PROGRESS,
                prisma,
              );
            }
            return item;
          });
          if (item) {
            this.mintQueue.mintToken(user, item.id, item.token_uri);
            return item;
          } else {
            this.fileService.deleteFile(media_path);
            this.fileService.deleteFile(thumbnail_path);
            throw new BadRequestException(
              errorResponse(__('Failed to create. Try again later.')),
            );
          }
        } else {
          this.fileService.deleteFile(media_path);
          this.fileService.deleteFile(thumbnail_path);
          throw new BadRequestException(
            errorResponse(__('File uploaded to ipfs failed.')),
          );
        }
      } else {
        throw new BadRequestException(errorResponse(__('File upload failed.')));
      }
    } catch (e) {
      processException(e);
    }
  }

  async saveItem(user, payload, fileData, prisma): Promise<Item> {
    const itemData = await this.itemData.prepareItemInsertData(
      payload,
      fileData,
    );
    return await prisma.item.create({
      data: {
        ...itemData,
        owner: {
          connect: {
            id: user.id,
          },
        },
        creator: {
          connect: {
            id: user.id,
          },
        },
        collection: {
          connect: {
            id: payload.collection_id,
          },
        },
      },
    });
  }

  async mintItem(user, itemId, tokenUri) {
    try {
      const item = await prisma_client.item.findFirst({
        where: {
          id: itemId,
        },
        include: {
          collection: {
            include: {
              blockchain: true,
            },
          },
        },
      });
      const blockChain = item.collection.blockchain;
      const nftService = new NftService(blockChain);
      await nftService.init();
      const txObj = await nftService.mint(user.wallet_address, tokenUri);
      const id = txObj.status ? txObj['tokenId'] : null;
      const transactionHash = txObj.transactionHash ?? null;
      if (id) {
        await prisma_client.item.update({
          where: {
            id: itemId,
          },
          data: {
            token_id: id,
            minted_at: new Date(Date.now()),
            is_minted: STATUS_ACTIVE,
          },
        });
        await this.itemActivitySave(
          itemId,
          ITEM_EVENT_MINT,
          null,
          user.id,
          transactionHash,
          null,
          ITEM_MINT_STATUS_DONE,
        );
      } else {
        await this.itemActivitySave(
          itemId,
          ITEM_EVENT_MINT,
          null,
          user.id,
          transactionHash,
          null,
          ITEM_MINT_STATUS_FAILED,
        );
      }
    } catch (e) {
      console.error(e.stack);
      await this.itemActivitySave(
        itemId,
        ITEM_EVENT_MINT,
        null,
        user.id,
        null,
        null,
        ITEM_MINT_STATUS_FAILED,
      );
    }
  }

  async updateItem(
    id: number,
    user: User,
    payload: UpdateItemDto,
  ): Promise<Item> {
    try {
      const findItem = await getActiveItem(id);
      if (!findItem) {
        throw new BadRequestException(errorResponse(__('Item not found!')));
      }
      if (user.id !== findItem.owner_id) {
        throw new UnauthorizedException();
      }
      const updateItem = await this.updateItemProcess(
        id,
        payload,
        findItem,
        prisma_client,
      );

      return updateItem;
    } catch (e) {
      processException(e);
    }
  }

  async updateItemProcess(id, payload, findItem, prismaService) {
    const itemData = await this.itemData.prepareItemUpdateData(
      payload,
      findItem,
    );
    return await prismaService.item.update({
      where: {
        id: id,
      },
      data: {
        ...itemData,
      },
    });
  }

  async itemActivitySave(
    item_id: number,
    event: number,
    from_id: number | null = null,
    to_id: number | null = null,
    hash: string | null = null,
    amount: string | null = null,
    status = STATUS_ACTIVE,
    prisma = null,
    payment_token_id = null,
  ) {
    if (!prisma) prisma = prisma_client;
    const activity = await prisma.itemActivity.findFirst({
      where: {
        item_id: item_id,
        event: event,
      },
    });
    if (activity && event == ITEM_EVENT_MINT) {
      return await prisma.itemActivity.update({
        where: {
          id: activity.id,
        },
        data: {
          item_id,
          event,
          from_id,
          to_id,
          hash,
          amount,
          status,
          payment_token_id,
        },
      });
    } else {
      return await prisma.itemActivity.create({
        data: {
          item_id,
          event,
          from_id,
          to_id,
          hash,
          amount,
          status,
          payment_token_id,
        },
      });
    }
  }

  async uploadFileToIpfs(payload, media_path) {
    try {
      const media_file = await this.fileService.getFileForNft(media_path);
      const serviceConfig = this.configService.get('services');
      const client = new NFTStorage({
        token: serviceConfig.nftStorage.api_key,
      });
      const metadata = await client.store({
        name: payload.name,
        description: payload.description || payload.name,
        image: media_file,
      });
      if (!metadata.url) {
        await this.fileService.deleteFile(media_path);
        throw new BadRequestException(
          errorResponse(__('File upload to ipfs failed')),
        );
      }
      return metadata.url;
    } catch (e) {
      await this.fileService.deleteFile(media_path);
      processException(e);
    }
  }

  async getItemActivities(item_id: number, events: string | null) {
    try {
      const eventsArray = events
        ? events.split(',').map((e: any) => parseInt(e))
        : ITEM_EVENTS;
      return await prisma_client.itemActivity.findMany({
        where: {
          item_id: item_id,
          event: {
            in: eventsArray,
          },
          item: {
            status: STATUS_ACTIVE,
            collection: {
              status: STATUS_ACTIVE,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
        include: {
          from: true,
          to: true,
          payment_token: true,
        },
      });
    } catch (e) {
      processException(e);
    }
  }

  async getItemActivitiesPaginate(
    paginate: PaginationArgs,
    filter?: ItemActivityFilter,
  ): Promise<ItemActivitiesConnection> {
    return findManyCursorConnection<
      ItemActivity,
      Pick<Prisma.ItemActivityWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.itemActivity.findMany({
          where: filterItemActivityList(filter),
          include: {
            from: true,
            to: true,
            item: {
              include: {
                owner: true,
              },
            },
            payment_token: true,
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.itemActivity.count({
          where: filterItemActivityList(filter),
        }),
      paginate,
      pOptions,
    );
  }

  async itemReMint(activity_id: number, user: User) {
    try {
      const findActivity = await prisma_client.itemActivity.findUnique({
        where: { id: activity_id },
      });

      if (!findActivity) {
        throw new BadRequestException(errorResponse(__('Invalid activity!')));
      }

      const item = await getActiveItem(findActivity.item_id);
      if (!item) {
        throw new BadRequestException(errorResponse(__('Item not found!')));
      }

      if (user.id !== item.owner_id) {
        throw new UnauthorizedException();
      }

      if (item.is_minted == STATUS_ACTIVE) {
        throw new BadRequestException(
          errorResponse(__('Item already minted!')),
        );
      }

      await prisma_client.itemActivity.update({
        where: {
          id: findActivity.id,
        },
        data: {
          status: ITEM_MINT_STATUS_IN_PROGRESS,
        },
      });

      this.mintQueue.mintToken(user, item.id, item.token_uri);
      return successResponse(__('Item minting sent in queue!'));
    } catch (e) {
      processException(e);
    }
  }

  async itemFavouriteListToggle(
    item_id: number,
    user_id: number,
  ): Promise<CountModel> {
    try {
      const item = await getActiveItem(item_id);
      if (!item) {
        throw new BadRequestException(errorResponse(__('Item not found!')));
      }
      const checkFav = await getUserFavouriteItem(user_id, item_id);
      if (!checkFav) {
        await prisma_client.itemFavouriteList.create({
          data: {
            user_id,
            item_id,
          },
        });
        const newLikeCount = item.like_count + 1;
        await this.updateLikeCount(item.id, newLikeCount);
        return { count: newLikeCount };
      } else {
        await prisma_client.itemFavouriteList.delete({
          where: {
            id: checkFav.id,
          },
        });
        let newLikeCount = 0;
        if (item.like_count > 0) {
          newLikeCount = item.like_count - 1;
          await this.updateLikeCount(item.id, newLikeCount);
        }
        return { count: newLikeCount };
      }
    } catch (e) {
      processException(e);
    }
  }

  async updateLikeCount(item_id: number, like_count: number) {
    await prisma_client.item.update({
      where: {
        id: item_id,
      },
      data: {
        like_count: like_count,
      },
    });
  }

  async checkItemFavouriteByUser(
    item_id: number,
    userArgs: ItemUserArgs,
  ): Promise<boolean> {
    const getFavourite = await prisma_client.itemFavouriteList.findFirst({
      where: {
        item_id: item_id,
        user: {
          OR: [
            {
              id: userArgs.viewer_id ?? 0,
            },
            {
              wallet_address: userArgs.viewer_wallet_address ?? '',
            },
          ],
        },
      },
    });
    return getFavourite ? true : false;
  }

  async getItemLists(
    paginate: PaginationArgs,
    filter?: ItemFilter,
    orderBy?: ItemOrder,
    userArgs?: ItemUserArgs,
  ): Promise<ItemConnection> {
    return findManyCursorConnection<
      Item,
      Pick<Prisma.ItemWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.item.findMany({
          where: filterItemList(filter),
          include: {
            owner: true,
            creator: true,
            collection: true,
            payment_token: true,
            item_favourite_lists: {
              where: {
                user: {
                  OR: [
                    { id: userArgs.viewer_id ?? 0 },
                    { wallet_address: userArgs.viewer_wallet_address ?? '' },
                  ],
                },
              },
            },
          },
          orderBy: [
            {
              is_minted: 'desc',
            },
            orderBy ? this.orderItemList(orderBy) : undefined,
          ],
          ...args,
        }),
      () =>
        prisma_client.item.count({
          where: filterItemList(filter),
        }),
      paginate,
      pOptions,
    );
  }

  orderItemList(orderBy: any): Prisma.ItemOrderByWithRelationInput {
    if (orderBy.field === 'most_favourite') {
      return {
        item_favourite_lists: {
          _count: orderBy.direction,
        },
      };
    } else {
      return { [orderBy.field]: orderBy.direction };
    }
  }

  async syncItemOwner(item_id: number, item?: Item): Promise<User> {
    try {
      if (!item)
        item = await prisma_client.item.findFirst({
          where: {
            id: item_id,
          },
          include: {
            owner: true,
            collection: {
              include: {
                blockchain: true,
              },
            },
          },
        });

      if (!item) throw new Error(__('Item not found'));
      if (!item.token_id) return item.owner;
      const nftService = new NftService(item.collection.blockchain);
      await nftService.init();
      let owner = await nftService.ownerOf(item.token_id);
      owner = checkAndGetAddress(this.web3, owner);
      if (!owner)
        throw new Error(
          __('Got Invalid owner address from blockchain.') + ` owner: ${owner}`,
        );

      if (item.owner.wallet_address.toLowerCase() == owner.toLowerCase())
        return item.owner;

      const updatedItem = await prisma_client.item.update({
        where: {
          id: item.id,
        },
        data: {
          owner: {
            connectOrCreate: {
              where: {
                wallet_address: owner,
              },
              create: {
                wallet_address: owner,
                username: randomUsernameFromWalletAddress(owner),
              },
            },
          },
        },
        include: {
          owner: true,
        },
      });
      return updatedItem.owner;
    } catch (e) {
      console.error(e.stack);
      return null;
    }
  }

  async getUserItemFavouriteLists(
    paginate: PaginationArgs,
    userArgs?: ItemUserArgs,
  ): Promise<ItemConnection> {
    return findManyCursorConnection<
      Item,
      Pick<Prisma.ItemWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.item.findMany({
          where: {
            item_favourite_lists: {
              some: {
                user: {
                  OR: [
                    { id: userArgs.viewer_id ?? 0 },
                    { wallet_address: userArgs.viewer_wallet_address ?? '' },
                  ],
                },
              },
            },
          },
          include: {
            owner: true,
            creator: true,
            collection: true,
            payment_token: true,
            item_favourite_lists: {
              where: {
                user: {
                  OR: [
                    { id: userArgs.viewer_id ?? 0 },
                    { wallet_address: userArgs.viewer_wallet_address ?? '' },
                  ],
                },
              },
            },
          },
          orderBy: [
            {
              is_minted: 'desc',
            },
            {
              id: 'desc',
            },
          ],
          ...args,
        }),
      () =>
        prisma_client.item.count({
          where: {
            item_favourite_lists: {
              some: {
                user: {
                  OR: [
                    { id: userArgs.viewer_id ?? 0 },
                    { wallet_address: userArgs.viewer_wallet_address ?? '' },
                  ],
                },
              },
            },
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getDayWiseItemPrice(
    item_id: number,
    days: string,
  ): Promise<PriceCalculationModel> {
    try {
      const day_wise_price = await getDayWiseItemPrice(item_id, days);
      const totalPrice = day_wise_price.reduce(
        (totalPrice, item) => {
          return {
            total_avg_price: totalPrice.total_avg_price + item.avg_price,
            total_sum_price: totalPrice.total_sum_price + item.sum_price,
          };
        },
        {
          total_avg_price: 0,
          total_sum_price: 0,
        },
      );
      return {
        total_avg_price: totalPrice.total_avg_price,
        total_sum_price: totalPrice.total_sum_price,
        day_wise_price_count: day_wise_price,
      };
    } catch (e) {
      processException(e);
    }
  }

  async getTrendingItemList(
    limit?: number,
    userArgs?: ItemUserArgs,
  ): Promise<Item[]> {
    const query = `SELECT 
    items.*
    FROM
    items
    JOIN users ON items.owner_id = users.id
    LEFT JOIN item_favourite_lists ON item_favourite_lists.item_id = items.id
      AND DATE(item_favourite_lists.created_at) >= current_date - 7
    LEFT JOIN item_view_lists ON item_view_lists.item_id = items.id
      AND DATE(item_view_lists.created_at) >= current_date - 7
    LEFT JOIN buy_offers ON buy_offers.item_id = items.id 
      AND buy_offers.item_id = ${STATUS_ACTIVE}
      AND DATE(buy_offers.created_at) >= current_date - 7
    GROUP BY items.id,users.id
    ORDER BY 
    COUNT(DISTINCT buy_offers.user_id) DESC,
    COUNT(DISTINCT item_favourite_lists.user_id) DESC,
    COUNT(DISTINCT item_view_lists.id) DESC,
    items.id DESC ${limit ? 'LIMIT ' + limit : ''}`;

    const trendingItems: Item[] = await prisma_client.$queryRawUnsafe(query);

    const newItems: any = await Promise.all(
      trendingItems.map(async (item) => {
        const favList: Promise<ItemFavouriteList[]> =
          prisma_client.itemFavouriteList.findMany({
            where: {
              item_id: item.id,
              user: {
                OR: [
                  { id: userArgs.viewer_id ?? 0 },
                  { wallet_address: userArgs.viewer_wallet_address ?? '' },
                ],
              },
            },
          });
        const owner: Promise<User> = prisma_client.user.findFirst({
          where: {
            id: item.owner_id,
          },
        });
        const payment_token: Promise<PaymentTokenModel> =
          prisma_client.paymentToken.findFirst({
            where: {
              id: item.payment_token_id ?? 0,
            },
          });
        const data: any = await Promise.all([favList, owner, payment_token]);
        return {
          ...item,
          item_favourite_lists: data[0],
          owner: data[1],
          payment_token: data[2],
        };
      }),
    );
    return newItems;
  }
}
