import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ItemActivity, Prisma } from '@prisma/client';
import { STATUS_ACTIVE } from 'src/app/helpers/coreconstants';
import {
  errorResponse,
  prisma_client,
  processException,
  successResponse,
  __,
} from 'src/app/helpers/functions';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { ItemOrder } from 'src/app/models/input/item-order.input';
import { Item } from 'src/app/models/item.model';
import { ItemActivitiesConnection } from 'src/app/models/pagination/item-activities-connection.model';
import { ItemConnection } from 'src/app/models/pagination/item-connection.model';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { ItemActivityFilter, ItemFilter } from '../../item/dto/filter.dto';
import { OfferValidation } from '../../offer/offer.validation';

@Injectable()
export class StaffItemService {
  async getStaffItemListsPaginate(
    paginate: PaginationArgs,
    filter?: ItemFilter,
    orderBy?: ItemOrder,
  ): Promise<ItemConnection> {
    return findManyCursorConnection<
      Item,
      Pick<Prisma.ItemWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.item.findMany({
          where: {
            owner_id: filter.owner_id || undefined,
            OR: filter.query
              ? [
                  {
                    name: {
                      contains: filter.query,
                      mode: 'insensitive',
                    },
                  },
                  {
                    collection: {
                      name: {
                        contains: filter.query,
                        mode: 'insensitive',
                      },
                    },
                  },
                ]
              : undefined,
            creator_id: filter.creator_id || undefined,
            collection: {
              id: filter.collection_id
                ? {
                    in: filter.collection_id,
                  }
                : undefined,
              category: filter.category_id
                ? {
                    id: {
                      in: filter.category_id,
                    },
                  }
                : undefined,
            },
          },
          include: {
            owner: true,
            creator: true,
            collection: true,
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : undefined,
          ...args,
        }),
      () =>
        prisma_client.item.count({
          where: {
            owner_id: filter.owner_id || undefined,
            creator_id: filter.creator_id || undefined,
            collection_id: filter.collection_id
              ? {
                  in: filter.collection_id,
                }
              : undefined,
            name: filter.query
              ? {
                  contains: filter.query,
                  mode: 'insensitive',
                }
              : undefined,
            status: STATUS_ACTIVE,
            is_minted: STATUS_ACTIVE,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getStaffSingleItemBySlugOrTokenId(
    slugOrTokenId: string,
  ): Promise<Item> {
    try {
      const item = await prisma_client.item.findFirst({
        where: {
          status: STATUS_ACTIVE,
          OR: [
            {
              slug: slugOrTokenId,
            },
            {
              token_id: slugOrTokenId,
            },
          ],
        },
        include: {
          collection: {
            include: {
              blockchain: true,
            },
          },
          owner: true,
          creator: true,
        },
      });
      if (!item)
        throw new NotFoundException(errorResponse(__('Item not found.')));
      // item.unlockable_content = null;

      const offerValidation = new OfferValidation();
      item['active_sell'] = await offerValidation.getActiveSellOffer(item.id);
      return item;
    } catch (e) {
      processException(e);
    }
  }
  async updateItemStatus(id: number, status: number): Promise<ResponseModel> {
    try {
      const item = await prisma_client.item.findUnique({
        where: {
          id: id,
        },
      });
      if (!item) {
        throw new BadRequestException(errorResponse(__('Invalid Item.')));
      }

      const response = await prisma_client.item.update({
        where: {
          id: id,
        },
        data: {
          status: status,
        },
      });
      return response
        ? successResponse('Item status updated successfully!')
        : errorResponse('Item status update failed.');
    } catch (e) {
      processException(e);
    }
  }
}
