import { Prisma } from '@prisma/client';
import { EXCHANGE_STATUS_DONE } from 'src/app/helpers/coreconstants';
import { ItemActivityFilter } from '../../item/dto/filter.dto';

export function salesFilter(query): Prisma.ExchangeWhereInput {
  return {
    status: EXCHANGE_STATUS_DONE,
    OR: query
      ? [
          {
            item: query
              ? {
                  name: {
                    contains: query,
                    mode: 'insensitive',
                  },
                }
              : undefined,
          },
          {
            payment_token: query
              ? {
                  OR: [
                    {
                      name: {
                        contains: query,
                        mode: 'insensitive',
                      },
                    },
                    {
                      token_symbol: {
                        contains: query,
                        mode: 'insensitive',
                      },
                    },
                    {
                      blockchain: {
                        network_name: {
                          contains: query,
                          mode: 'insensitive',
                        },
                      },
                    },
                  ],
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
    item: {
      name: filterData.query
        ? {
            contains: filterData.query,
            mode: 'insensitive',
          }
        : undefined,
      id: {
        in: filterData.item_id || undefined,
      },
      collection: {
        id: {
          in: filterData.collection_id || undefined,
        },
        blockchain: filterData.blockchain_id
          ? {
              id: {
                in: filterData.blockchain_id,
              },
            }
          : undefined,
      },
    },
    event: filterData.event_type
      ? {
          in: filterData.event_type,
        }
      : undefined,
  };
}
