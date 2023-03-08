import { Prisma } from '@prisma/client';
import {
  ITEM_FILTER_STATUS_BUY_NOW,
  ITEM_FILTER_STATUS_ON_AUCTION,
  ITEM_FILTER_STATUS_HAS_OFFERS,
  ITEM_FILTER_STATUS_NEW,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import { subMinutes, getNewOrRecentInMin } from 'src/app/helpers/functions';
import { ItemActivityFilter } from './dto/filter.dto';

export function filterItemList(filterData): Prisma.ItemWhereInput {
  const sellOfferStatus = filterData.status
    ? filterData.status.filter((item) =>
        [ITEM_FILTER_STATUS_BUY_NOW, ITEM_FILTER_STATUS_ON_AUCTION].includes(
          item,
        ),
      )
    : null;
  const buyOfferStatus = filterData.status
    ? filterData.status.includes(ITEM_FILTER_STATUS_HAS_OFFERS)
      ? ITEM_FILTER_STATUS_HAS_OFFERS
      : null
    : null;

  const date = subMinutes(new Date(), getNewOrRecentInMin());
  const newItemStatus = filterData.status
    ? filterData.status.includes(ITEM_FILTER_STATUS_NEW)
      ? date
      : null
    : null;

  return {
    name: filterData.query
      ? {
          contains: filterData.query,
          mode: 'insensitive',
        }
      : undefined,
    status: STATUS_ACTIVE,
    owner_id: filterData.owner_id || undefined,
    creator_id: filterData.creator_id || undefined,
    payment_token_id: {
      in: filterData.payment_token_id || undefined,
    },
    price: {
      gte: filterData.min_price ?? undefined,
      lte: filterData.max_price ?? undefined,
    },
    collection: {
      status: STATUS_ACTIVE,
      id: filterData.collection_id
        ? {
            in: filterData.collection_id,
          }
        : undefined,
      category: filterData.category_id
        ? {
            id: {
              in: filterData.category_id,
            },
          }
        : undefined,
      blockchain: filterData.blockchain_id
        ? {
            id: {
              in: filterData.blockchain_id,
            },
          }
        : undefined,
    },
    OR:
      buyOfferStatus || sellOfferStatus || newItemStatus
        ? [
            {
              buy_offers: buyOfferStatus
                ? {
                    some: {
                      status: STATUS_ACTIVE,
                    },
                  }
                : undefined,
            },
            {
              sell_offers: sellOfferStatus
                ? {
                    some: {
                      type: {
                        in: sellOfferStatus ?? undefined,
                      },
                      status: STATUS_ACTIVE,
                      end_date: {
                        gte: new Date(),
                      },
                    },
                  }
                : undefined,
            },
            {
              created_at: newItemStatus
                ? {
                    gte: newItemStatus,
                  }
                : undefined,
            },
          ]
        : undefined,
  };
}

export function filterItemActivityList(
  filterData: ItemActivityFilter,
): Prisma.ItemActivityWhereInput {
  return {
    from_id: filterData.user_id ?? undefined,
    item: {
      status: STATUS_ACTIVE,
      id: filterData.item_id || undefined,
      collection: {
        status: STATUS_ACTIVE,
        id: {
          in: filterData.collection_id || undefined,
        },
        blockchain: {
          id: {
            in: filterData.blockchain_id || undefined,
          },
        },
      },
    },
    event: filterData.event_type
      ? {
          in: filterData.event_type,
        }
      : undefined,
  };
}
