/* eslint-disable @typescript-eslint/no-var-requires */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/collection.dto';
import { Prisma } from '@prisma/client';
import { User } from '../../models/user.model';
import { Collection } from '../../models/collection.model';
import { CollectionOrder } from '../../models/input/collection-order.input';
import { PaginationArgs } from '../../../libs/graphql/pagination/pagination.args';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { CollectionConnection } from '../../models/pagination/collection-connection.model';
import { pOptions } from '../../../libs/graphql/pagination/number-cursor';
import {
  errorResponse,
  processException,
  successResponse,
  __,
  containsSpecialChars,
} from '../../helpers/functions';
import {
  GLOBAL_SEARCH_QUERY_LIMIT,
  STATUS_ACTIVE,
} from '../../helpers/coreconstants';
import { prisma_client } from 'src/app/helpers/functions';
import { FilesystemService } from '../../filesystem/filesystem.service';
import { CollectionWithMeta } from './dto/collection-with-meta.object';
import { CollectionValidation } from './collection.validation';
import { CollectionData } from './collection.data';
import { UpdateCollectionDto } from './dto/collection.dto';
import Web3 from 'web3';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { CreatorEarningConnection } from 'src/app/models/pagination/creator-earnings-connection.model';
import { CreatorEarning } from 'src/app/models/creator-earnings.model';
import { CollectionUserArgs } from './dto/collection.args';
import { PriceCalculationModel } from 'src/app/models/priceCalculation.model';
import {
  dayWiseCollectionPrice,
  findCollectionBySlug,
  findUniqueCollection,
  getCollectionItemCount,
  getCollectionItemUniqueOwner,
  getCollectionNativeCoin,
  getCollectionPrice,
  getCollectionSocialLink,
  getCollectionToken,
  getCollectionWatchedUser,
  getSyncCollectionList,
} from './collection.query';
import {
  CollectionUniqueFilter,
  CollectionWithItemFilter,
} from './dto/filter.dto';
import { RESTRICTED_KEY_WORDS } from 'src/app/helpers/corearray';
import { Ranking } from 'src/app/models/ranking.model';
const web3 = require('web3');

@Injectable()
export class CollectionService {
  web3Handler: Web3;
  constructor(
    private readonly fileService: FilesystemService,
    private readonly collectionValidation: CollectionValidation,
    private readonly collectionData: CollectionData,
  ) {
    this.web3Handler = new web3();
  }

  async getActiveCollection(
    id = undefined,
    slug = undefined,
    user_id = undefined,
  ) {
    return await prisma_client.collection.findFirst({
      where: {
        id: id,
        slug: slug,
        user_id: user_id,
        status: STATUS_ACTIVE,
      },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
        user: true,
        blockchain: true,
      },
    });
  }

  async getCollectionDetails(
    slug: string,
    user: CollectionUserArgs,
  ): Promise<CollectionWithMeta> {
    try {
      const collectionWithMeta = new CollectionWithMeta();
      const collection = await findCollectionBySlug(slug);
      if (!collection) {
        throw new NotFoundException(errorResponse(__('Collection Not Found')));
      }
      collectionWithMeta.collection = collection;
      collectionWithMeta.itemCount = await getCollectionItemCount(
        collection.id,
      );
      collectionWithMeta.social_links = await getCollectionSocialLink(
        collection.id,
      );

      collectionWithMeta.token_mappings = await getCollectionToken(
        collection.id,
      );
      const uinqueOwner = await getCollectionItemUniqueOwner(collection.id);
      collectionWithMeta.owner_count = uinqueOwner.length;

      const watchedUser = await getCollectionWatchedUser(user, collection.id);
      collectionWithMeta.is_watched = watchedUser ? true : false;

      const collection_price = await getCollectionPrice(collection.id);

      const collection_native_coin = await getCollectionNativeCoin(
        collection.id,
      );

      collectionWithMeta.volume = {
        usd_price: collection_price.volume,
        native_price: parseFloat(collection_native_coin.usd_rate.toString())
          ? parseFloat(collection_price.volume.toString()) /
            parseFloat(collection_native_coin.usd_rate.toString())
          : null,
      };

      collectionWithMeta.floor_price = {
        usd_price: collection_price.floor_price,
        native_price: parseFloat(collection_native_coin.usd_rate.toString())
          ? parseFloat(collection_price.floor_price.toString()) /
            parseFloat(collection_native_coin.usd_rate.toString())
          : null,
      };

      collectionWithMeta.native_token = collection_native_coin;

      return collectionWithMeta;
    } catch (e) {
      processException(e);
    }
  }

  async checkUniqueCollection(
    id: number | null,
    filter?: CollectionUniqueFilter,
  ) {
    try {
      if (!filter.name && !filter.slug) {
        throw new BadRequestException(
          errorResponse(__('Invalid empty name and slug!')),
        );
      }
      if (filter.name && containsSpecialChars(filter.name)) {
        throw new BadRequestException(errorResponse(__('Invalid Name!')));
      }
      if (filter.slug && containsSpecialChars(filter.slug, true)) {
        throw new BadRequestException(errorResponse(__('Invalid slug!')));
      }
      if (
        RESTRICTED_KEY_WORDS.includes(filter.name?.toLowerCase()) ||
        RESTRICTED_KEY_WORDS.includes(filter.slug?.toLowerCase())
      ) {
        throw new BadRequestException(errorResponse(__('Restricted key word')));
      }
      const collection = await findUniqueCollection(filter, id);
      if (collection) {
        return errorResponse(__('Already taken!'));
      } else {
        return successResponse(__('Available!'));
      }
    } catch (e) {
      processException(e);
    }
  }

  // Get collection lists by paginate..
  async getCollectionListsPaginate(
    paginate: PaginationArgs,
    filter?: any,
    orderBy?: CollectionOrder,
    withItemFilter?: CollectionWithItemFilter,
  ): Promise<CollectionConnection> {
    return await findManyCursorConnection<
      Collection,
      Pick<Prisma.CollectionWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.collection.findMany({
          where: {
            user_id: filter.user_id ? filter.user_id : undefined,
            category_id: filter.category_id ? filter.category_id : undefined,
            status: STATUS_ACTIVE,
            name: filter.query
              ? {
                  contains: filter.query,
                  mode: 'insensitive',
                }
              : undefined,
          },
          include: {
            user: true,
            items:
              withItemFilter && withItemFilter.withItem
                ? {
                    take: withItemFilter.totalItem ?? GLOBAL_SEARCH_QUERY_LIMIT,
                    orderBy: { id: 'desc' },
                  }
                : false,
          },
          orderBy: orderBy
            ? { [orderBy.field]: orderBy.direction }
            : { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.collection.count({
          where: {
            user_id: filter.user_id ? filter.user_id : undefined,
            category_id: filter.category_id ? filter.category_id : undefined,
            status: STATUS_ACTIVE,
            name: filter.query
              ? {
                  contains: filter.query,
                  mode: 'insensitive',
                }
              : undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getCollectionListByAddress(
    wallet_address: string,
  ): Promise<Collection[]> {
    try {
      return await prisma_client.collection.findMany({
        where: {
          status: STATUS_ACTIVE,
          user: {
            wallet_address: {
              equals: wallet_address,
              mode: 'insensitive',
            },
          },
        },
        include: {
          user: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: [
          {
            id: 'desc',
          },
        ],
      });
    } catch (e) {
      processException(e);
    }
  }

  async collectionsForItemCreate(
    wallet_address: string,
  ): Promise<CollectionConnection> {
    try {
      return await prisma_client.collection.findMany({
        where: {
          user: {
            wallet_address: {
              equals: wallet_address,
              mode: 'insensitive',
            },
          },
          blockchain: {
            status: STATUS_ACTIVE,
          },
          status: STATUS_ACTIVE,
        },
        orderBy: { id: 'desc' },
      });
    } catch (e) {
      processException(e);
    }
  }

  // Create new collection
  async createCollection(
    user: User,
    payload: CreateCollectionDto | UpdateCollectionDto,
  ): Promise<Collection> {
    try {
      if (!user) {
        throw new BadRequestException(errorResponse(__('User not found!')));
      }
      payload =
        await this.collectionValidation.createOrUpdateCollectionValidation(
          payload,
          prisma_client,
        );

      if (payload.royalties && payload.payout_address) {
        payload.payout_address = this.web3Handler.utils.toChecksumAddress(
          payload.payout_address,
        );
      }

      payload.contract_address =
        await this.collectionValidation.validateBlockchain(payload);

      return await prisma_client.$transaction(async (prisma) => {
        const collection = await this.saveCollection(user, payload, prisma);
        if (collection) {
          await this.saveCollectionSocialLinks(collection, payload, prisma);
          await this.saveCollectionPaymentToken(collection, payload, prisma);
        }
        return collection;
      });
    } catch (e) {
      processException(e);
    }
  }

  // Save collection
  async saveCollection(user, payload, prismaService): Promise<Collection> {
    const collectionData =
      await this.collectionData.prepareCollectionInsertData(payload);
    return await prismaService.collection.create({
      data: {
        ...collectionData,
        user: {
          connect: {
            id: user.id,
          },
        },
        category: {
          connect: {
            id: payload.category_id,
          },
        },
        blockchain: {
          connect: {
            id: payload.blockchain_id,
          },
        },
      },
    });
  }

  //Save collection social links.
  async saveCollectionSocialLinks(collection, payload, prismaService) {
    const socialLinks =
      await this.collectionData.prepareCollectionSocialLinkData(
        collection.id,
        payload,
      );

    await prismaService.socialLinks.create({
      data: {
        ...socialLinks,
      },
    });
  }

  // Save collection payment token..
  async saveCollectionPaymentToken(collection, payload, prismaService) {
    const paymentTokensData = await this.collectionData.preparePaymentTokenData(
      payload.payment_tokens,
      collection.id,
    );

    await prismaService.paymentTokenMapping.createMany({
      data: paymentTokensData,
    });
  }

  // Edit collection by id
  async updateCollection(
    id: number,
    user: User,
    payload: UpdateCollectionDto,
  ): Promise<Collection> {
    try {
      const logo_file = await payload.logo_file;
      const feature_image_file = await payload.feature_image_file;
      const banner_image_file = await payload.banner_image_file;

      const findCollection = await this.getActiveCollection(
        id,
        undefined,
        user.id,
      );

      if (!findCollection) {
        throw new BadRequestException(
          errorResponse(__('Invalid Collection Request!')),
        );
      }
      payload['blockchain_id'] = findCollection.blockchain_id;
      if (findCollection._count.items > 0)
        payload.royalties = findCollection.royalties;

      payload =
        await this.collectionValidation.createOrUpdateCollectionValidation(
          payload,
          prisma_client,
        );

      if (payload.payout_address) {
        payload.payout_address = this.web3Handler.utils.toChecksumAddress(
          payload.payout_address,
        );
      }

      const update = await prisma_client.$transaction(async (prisma) => {
        const updateCollection = await this.updateCollectionData(
          id,
          payload,
          findCollection,
          prisma,
        );

        if (updateCollection) {
          await this.updateSocialLink(updateCollection, payload, prisma);
          await this.updatePaymentTokenData(updateCollection, payload, prisma);
        }
        return updateCollection;
      });

      if (logo_file) await this.fileService.deleteFile(findCollection.logo);
      if (feature_image_file)
        await this.fileService.deleteFile(findCollection.feature_image);
      if (banner_image_file)
        await this.fileService.deleteFile(findCollection.banner_image);

      return update;
    } catch (e) {
      processException(e);
    }
  }

  // Update collection
  async updateCollectionData(id, payload, findCollection, prismaService) {
    const collectionData =
      await this.collectionData.prepareCollectionUpdateData(
        payload,
        findCollection,
      );
    return await prismaService.collection.update({
      where: {
        id: id,
      },
      data: {
        ...collectionData,
        category_id: payload.category_id,
      },
    });
  }

  // Update collection social link..
  async updateSocialLink(updateCollection, payload, prismaService) {
    const socialLinks =
      await this.collectionData.prepareCollectionSocialLinkData(
        updateCollection.id,
        payload,
      );
    const checkCollectionSocialData = await getCollectionSocialLink(
      updateCollection.id,
      prismaService,
    );
    if (checkCollectionSocialData) {
      await prismaService.socialLinks.update({
        where: {
          id: checkCollectionSocialData.id,
        },
        data: {
          ...socialLinks,
        },
      });
    } else {
      await prismaService.socialLinks.create({
        data: {
          ...socialLinks,
        },
      });
    }
  }

  // Update collection payment token
  async updatePaymentTokenData(updateCollection, payload, prismaService) {
    const paymentTokensData = await this.collectionData.preparePaymentTokenData(
      payload.payment_tokens,
      updateCollection.id,
    );
    await prismaService.paymentTokenMapping.deleteMany({
      where: {
        collection_id: updateCollection.id,
      },
    });
    await prismaService.paymentTokenMapping.createMany({
      data: paymentTokensData,
    });
  }

  async deleteCollection(collectionId: number, user_id: number) {
    try {
      const collection = await this.getActiveCollection(
        collectionId,
        undefined,
        user_id,
      );
      if (!collection) {
        throw new BadRequestException(
          errorResponse(__('Invalid Collection Request!')),
        );
      } else {
        if (collection._count.items > 0) {
          throw new BadRequestException(
            errorResponse(__('Collection has items. It can not be deleted.')),
          );
        } else {
          await prisma_client.paymentTokenMapping.deleteMany({
            where: {
              collection_id: collectionId,
            },
          });
          await prisma_client.collection.delete({
            where: {
              id: collectionId,
            },
          });
          if (collection.logo)
            await this.fileService.deleteFile(collection.logo);
          if (collection.feature_image)
            await this.fileService.deleteFile(collection.feature_image);
          if (collection.banner_image)
            await this.fileService.deleteFile(collection.banner_image);
          return successResponse(__('Collection deleted successfully!'));
        }
      }
    } catch (e) {
      processException(e);
    }
  }
  async collectionWatchListToggle(
    collectionId: number,
    user_id: number,
  ): Promise<ResponseModel> {
    try {
      const collection = await this.getActiveCollection(collectionId);
      if (!collection) {
        throw new BadRequestException(
          errorResponse(__('Collection not found!')),
        );
      }
      const checkWatchList = await prisma_client.collectionWatchList.findFirst({
        where: {
          collection_id: collectionId,
          user_id: user_id,
        },
      });
      if (!checkWatchList) {
        await prisma_client.collectionWatchList.create({
          data: {
            collection_id: collectionId,
            user_id: user_id,
            status: STATUS_ACTIVE,
          },
        });
        return successResponse(
          __('Collection added to watchlist successfully!'),
        );
      } else {
        await prisma_client.collectionWatchList.delete({
          where: {
            id: checkWatchList.id,
          },
        });
        return successResponse(
          __('Collection removed from watchlist successfully!'),
        );
      }
    } catch (e) {
      processException(e);
    }
  }

  async myCollectionWatchList(
    paginate: PaginationArgs,
    user_id: number,
  ): Promise<CollectionConnection> {
    return await findManyCursorConnection<
      Collection,
      Pick<Prisma.CollectionWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.collection.findMany({
          where: {
            collection_watch_lists: {
              some: {
                user_id: user_id,
              },
            },
          },
          include: {
            user: true,
            items: true,
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.collection.count({
          where: {
            collection_watch_lists: {
              some: {
                user_id: user_id,
              },
            },
          },
        }),
      paginate,
      pOptions,
    );
  }

  async checkCollectionWatchedByUser(
    collection_id: number,
    userArgs: CollectionUserArgs,
  ): Promise<boolean> {
    const getWatched = await prisma_client.collectionWatchList.findFirst({
      where: {
        collection_id: collection_id,
        user: {
          OR: [
            {
              id: userArgs.user_id ?? 0,
            },
            {
              wallet_address: userArgs.user_wallet_address ?? '',
            },
          ],
        },
      },
    });
    return getWatched ? true : false;
  }

  async creatorEarningListPaginate(
    paginate: PaginationArgs,
    collection_id: number,
    user_id: number,
  ): Promise<CreatorEarningConnection> {
    return await findManyCursorConnection<
      CreatorEarning,
      Pick<Prisma.CreatorEarningWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.creatorEarning.findMany({
          where: {
            user_id: user_id ?? 0,
            collection_id: collection_id ?? undefined,
          },
          include: {
            collection: true,
            item: true,
            user: true,
            payment_token: true,
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.creatorEarning.count({
          where: {
            user_id: user_id ?? 0,
            collection_id: collection_id ?? undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getDayWiseCollectionPrice(
    collection_id: number,
    days: string,
  ): Promise<PriceCalculationModel> {
    try {
      const day_wise_price = await dayWiseCollectionPrice(collection_id, days);
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

  async getRankingList(
    days: number,
    blockchain_id: number | undefined,
    limit?: number,
  ): Promise<Ranking[]> {
    let order_by_column = 'one_day_volume_in_usd';
    switch (days) {
      case 7:
        order_by_column = 'seven_days_volume_in_usd';
        break;
      case 30:
        order_by_column = 'thirty_days_volume_in_usd';
        break;
      default:
        order_by_column = 'one_day_volume_in_usd';
        break;
    }
    return await prisma_client.ranking.findMany({
      where: {
        blockchain_id: blockchain_id || undefined,
        [order_by_column]: {
          gt: 0,
        },
      },
      include: {
        native_token: true,
        collection: true,
      },
      orderBy: [
        {
          [order_by_column]: 'desc',
        },
      ],
      take: limit ?? 100,
    });
  }

  async synceRankingList(): Promise<ResponseModel> {
    const synceCollections: any[] = await getSyncCollectionList();
    synceCollections.map(async (collection) => {
      let one_day_volume_percent = null;
      let seven_days_volume_percent = null;
      let thirty_days_volume_percent = null;
      if (collection.prev_one_day_volume && collection.one_day_volume) {
        one_day_volume_percent =
          ((collection.one_day_volume - collection.prev_one_day_volume) * 100) /
          collection.one_day_volume;
      }
      if (collection.prev_seven_days_volume && collection.seven_days_volume) {
        seven_days_volume_percent =
          ((collection.seven_days_volume - collection.prev_seven_days_volume) *
            100) /
          collection.seven_days_volume;
      }
      if (collection.prev_thirty_days_volume && collection.thirty_days_volume) {
        thirty_days_volume_percent =
          ((collection.thirty_days_volume -
            collection.prev_thirty_days_volume) *
            100) /
          collection.thirty_days_volume;
      }
      const ranking = {
        collection_id: collection.collection_id,
        user_id: collection.user_id,
        blockchain_id: collection.blockchain_id,
        native_token_id: collection.native_token_id,
        item_count: collection.item_count,

        total_volume_in_native:
          collection.total_volume / collection.native_usd_rate || null,
        total_volume_in_usd: collection.total_volume,

        one_day_volume_in_native:
          collection.one_day_volume / collection.native_usd_rate || null,
        one_day_volume_in_usd: collection.one_day_volume,
        one_day_volume_percent: one_day_volume_percent,

        seven_days_volume_in_native:
          collection.seven_days_volume / collection.native_usd_rate || null,
        seven_days_volume_in_usd: collection.seven_days_volume,
        seven_days_volume_percent: seven_days_volume_percent,

        thirty_days_volume_in_native:
          collection.thirty_days_volume / collection.native_usd_rate || null,
        thirty_days_volume_in_usd: collection.thirty_days_volume,
        thirty_days_volume_percent: thirty_days_volume_percent,

        floor_price_in_native:
          collection.floor_price / collection.native_usd_rate || null,
        floor_price_in_usd: collection.floor_price,
      };

      if (
        collection.total_volume ||
        collection.one_day_volume ||
        collection.seven_days_volume ||
        collection.thirty_days_volume
      ) {
        await prisma_client.ranking.upsert({
          where: { collection_id: collection.collection_id },
          update: ranking,
          create: ranking,
        });
      }
    });
    return successResponse(__('Ranking synced successfully.'));
  }

  async getTopCollectionList(limit?: number): Promise<Collection[]> {
    const ranking = await prisma_client.collection.findMany({
      where: {
        ranking: {
          total_volume_in_usd: {
            gt: 0,
          },
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        ranking: {
          total_volume_in_usd: 'desc',
        },
      },
      take: limit || undefined,
    });
    const rankingCount = ranking.length;

    const withoutRankingLimit = limit - rankingCount;
    if (withoutRankingLimit > 0) {
      const rankingCollectionIds = [];
      if (rankingCount > 0) {
        ranking.map((item) => rankingCollectionIds.push(item.id));
      }
      const withoutRanking = await prisma_client.collection.findMany({
        where: {
          status: STATUS_ACTIVE,
          id: {
            notIn: rankingCollectionIds,
          },
        },
        include: {
          user: true,
        },
        orderBy: [
          {
            items: {
              _count: 'desc',
            },
          },
          {
            id: 'desc',
          },
        ],
        take: withoutRankingLimit,
      });
      ranking.push(...withoutRanking);
    }
    return ranking;
  }

  async getTrendingCollectionList(limit?: number): Promise<Collection[]> {
    const query = `SELECT 
    collections.*,
    users.username,
    users.wallet_address as user_wallet_address
    FROM
    collections
    JOIN users ON collections.user_id = users.id
    JOIN items ON items.collection_id = collections.id
    LEFT JOIN item_favourite_lists ON item_favourite_lists.item_id = items.id
      AND DATE(item_favourite_lists.created_at) >= current_date - 7
    LEFT JOIN item_view_lists ON item_view_lists.item_id = items.id
      AND DATE(item_view_lists.created_at) >= current_date - 7
    LEFT JOIN buy_offers ON buy_offers.item_id = items.id
      AND buy_offers.status = ${STATUS_ACTIVE} 
      AND DATE(buy_offers.created_at) >= current_date - 7
    GROUP BY collections.id, users.username, users.wallet_address
    ORDER BY 
    COUNT(DISTINCT buy_offers.user_id) DESC,
    COUNT(DISTINCT item_favourite_lists.user_id) DESC,
    COUNT(DISTINCT item_view_lists.id) DESC,
    collections.id DESC ${limit ? 'LIMIT ' + limit : ''}`;
    return await prisma_client.$queryRawUnsafe(query);
  }

  async getFeaturedCollectionList(limit: number): Promise<Collection[]> {
    return await prisma_client.collection.findMany({
      where: {
        is_featured: STATUS_ACTIVE,
      },
      include: {
        user: true,
      },
      orderBy: {
        featured_collections: {
          order: 'asc',
        },
      },
      take: limit || undefined,
    });
  }
}
