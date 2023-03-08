import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Collection, Prisma, PrismaClient } from '@prisma/client';
import { STATUS_ACTIVE, STATUS_INACTIVE } from 'src/app/helpers/coreconstants';
import {
  errorResponse,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { CollectionOrder } from 'src/app/models/input/collection-order.input';
import { CollectionConnection } from 'src/app/models/pagination/collection-connection.model';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { MaxFeaturedCollectionOrderDto } from './dto/collection.dto';

@Injectable()
export class StaffCollectionService {
  async getStaffCollectionListsPaginate(
    paginate: PaginationArgs,
    filter?: any,
    orderBy?: CollectionOrder,
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
            status: filter.status !== null ? filter.status : undefined,
            name: filter.query
              ? {
                  contains: filter.query,
                  mode: 'insensitive',
                }
              : undefined,
          },
          include: {
            user: true,
            items: true,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.collection.count({
          where: {
            user_id: filter.user_id ? filter.user_id : undefined,
            category_id: filter.category_id ? filter.category_id : undefined,
            status: filter.status ? filter.status : undefined,
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

  async getStaffNotFeaturedCollectionLists(): Promise<Collection[]> {
    const featuredCollectionArray = [];
    (await prisma_client.featuredCollection.findMany()).map((collection) => {
      featuredCollectionArray.push(collection.collection_id);
    });
    return await prisma_client.collection.findMany({
      where: {
        status: STATUS_ACTIVE,
        id: {
          notIn: featuredCollectionArray,
        },
      },
    });
  }

  async updateCollectionStatus(
    id: number,
    status: number,
  ): Promise<ResponseModel> {
    try {
      const collection = await prisma_client.collection.findUnique({
        where: {
          id: id,
        },
      });
      if (!collection) {
        throw new BadRequestException(errorResponse(__('Invalid Collection.')));
      }

      const response = await prisma_client.collection.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });
      return response
        ? successResponse(__('Collection status updated successfully!'))
        : errorResponse(__('Collection status update failed.'));
    } catch (e) {
      processException(e);
    }
  }

  async getCollectionById(id: number) {
    return prisma_client.collection.findUnique({
      where: {
        id: id,
      },
    });
  }

  async getFeaturedCollectionByCollectionId(collectionId: number) {
    return await prisma_client.featuredCollection.findFirst({
      where: {
        collection_id: collectionId,
      },
    });
  }

  async getFeaturedCollectionMaxOrder(): Promise<MaxFeaturedCollectionOrderDto> {
    const order = await prisma_client.featuredCollection.aggregate({
      _max: { order: true },
    });
    return { max_order: order?._max?.order ?? 0 };
  }

  async updateCollectionFeature(
    collectionId: number,
    status: number,
    prisma?: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    prisma = prisma ?? prisma_client;
    return await prisma.collection.update({
      where: {
        id: collectionId,
      },
      data: {
        is_featured: status,
      },
    });
  }

  async createFeaturedCollection(
    collectionId: number,
    order: number,
    prisma?: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    prisma = prisma ?? prisma_client;
    return await prisma.featuredCollection.create({
      data: {
        collection_id: collectionId,
        order: order,
      },
    });
  }

  async createFeatureCollectionOrderUpdated(
    order: number,
    collectionId: number,
    prisma?: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    prisma = prisma ?? prisma_client;

    await prisma.featuredCollection.updateMany({
      where: {
        AND: [
          {
            order: {
              gte: order,
            },
          },
          {
            collection_id: {
              not: collectionId,
            },
          },
        ],
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });
  }

  async addCollectionToFeatured(
    collectionId: number,
    order: number,
  ): Promise<ResponseModel> {
    try {
      const collection = await this.getCollectionById(collectionId);
      if (!collection) {
        throw new BadRequestException(__('Invalid collection.'));
      }

      const maxOrder = await this.getFeaturedCollectionMaxOrder();
      if (order > maxOrder.max_order + 1 || order <= 0) {
        throw new BadRequestException(__('Invalid order.'));
      }
      const checkFeatured = await this.getFeaturedCollectionByCollectionId(
        collectionId,
      );

      if (checkFeatured) {
        throw new BadRequestException(
          __('This collection already added to featured list.'),
        );
      }

      await prisma_client.$transaction(async (prisma) => {
        await this.createFeaturedCollection(collectionId, order, prisma);
        await this.updateCollectionFeature(collectionId, STATUS_ACTIVE, prisma);
        await this.createFeatureCollectionOrderUpdated(
          order,
          collectionId,
          prisma,
        );
      });
      return successResponse(__('Collection added to featured successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  async updateFeaturedCollectionOrder(
    collectionId: number,
    order: number,
  ): Promise<ResponseModel> {
    try {
      const maxOrder = await this.getFeaturedCollectionMaxOrder();
      if (order > maxOrder.max_order || order <= 0) {
        throw new BadRequestException(__('Invalid order.'));
      }

      const checkFeatured = await this.getFeaturedCollectionByCollectionId(
        collectionId,
      );

      if (!checkFeatured) {
        throw new BadRequestException(
          __('This collection not added to the featured. Please add it first.'),
        );
      }

      const oldOrder = checkFeatured.order;
      const newOrder = order;
      if (oldOrder == newOrder) {
        return successResponse(__('Collection order updated successfully!'));
      }
      await prisma_client.$transaction(async (prisma) => {
        await prisma.featuredCollection.update({
          where: {
            id: checkFeatured.id,
          },
          data: {
            order: order,
          },
        });
        await this.updateFeatureCollectionOrderUpdate(
          oldOrder,
          newOrder,
          collectionId,
          prisma,
        );
      });

      return successResponse(__('Collection order updated successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  async updateFeatureCollectionOrderUpdate(
    oldOrder: number,
    newOrder: number,
    collectionId: number,
    prisma?: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    prisma = prisma ?? prisma_client;
    if (oldOrder >= newOrder) {
      return await prisma.featuredCollection.updateMany({
        where: {
          AND: [
            {
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            {
              collection_id: {
                not: collectionId,
              },
            },
          ],
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });
    } else {
      return await prisma.featuredCollection.updateMany({
        where: {
          AND: [
            {
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            {
              collection_id: {
                not: collectionId,
              },
            },
          ],
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });
    }
  }

  async removeCollectionFromFeatured(
    collectionId: number,
  ): Promise<ResponseModel> {
    try {
      const checkFeatured = await prisma_client.featuredCollection.findFirst({
        where: {
          collection_id: collectionId,
        },
      });

      if (!checkFeatured) {
        throw new BadRequestException(
          __('This collection is not in featured list.'),
        );
      }

      await prisma_client.$transaction(async (prisma) => {
        await prisma.featuredCollection.delete({
          where: {
            id: checkFeatured.id,
          },
        });
        await prisma.collection.update({
          where: {
            id: collectionId,
          },
          data: {
            is_featured: STATUS_INACTIVE,
          },
        });
        await prisma.featuredCollection.updateMany({
          where: {
            AND: [
              {
                order: {
                  gt: checkFeatured.order,
                },
              },
            ],
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        });
      });
      return successResponse(
        __('Collection removed from featured successfully!'),
      );
    } catch (e) {
      processException(e);
    }
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

  async getStaffFeaturedCollectionListsPaginate(
    paginate: PaginationArgs,
    filter?: any,
  ): Promise<CollectionConnection> {
    return await findManyCursorConnection<
      Collection,
      Pick<Prisma.CollectionWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.collection.findMany({
          where: {
            is_featured: STATUS_ACTIVE,
            user_id: filter.user_id ? filter.user_id : undefined,
            category_id: filter.category_id ? filter.category_id : undefined,
            status: filter.status !== null ? filter.status : undefined,
            name: filter.query
              ? {
                  contains: filter.query,
                  mode: 'insensitive',
                }
              : undefined,
          },
          include: {
            user: true,
            featured_collections: true,
          },
          orderBy: {
            featured_collections: {
              order: 'asc',
            },
          },
          ...args,
        }),
      () =>
        prisma_client.collection.count({
          where: {
            is_featured: STATUS_ACTIVE,
            user_id: filter.user_id ? filter.user_id : undefined,
            category_id: filter.category_id ? filter.category_id : undefined,
            status: filter.status ? filter.status : undefined,
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
}
