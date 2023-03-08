import { STATUS_ACTIVE } from 'src/app/helpers/coreconstants';
import { prisma_client } from 'src/app/helpers/functions';
import { DayWisePriceCountModel } from 'src/app/models/dayWisePriceCount.model';
import { ItemUserArgs } from './dto/item.args';

export async function getItemById(item_id: number) {
  return await prisma_client.item.findFirst({
    where: {
      id: item_id,
      status: STATUS_ACTIVE,
    },
  });
}

export async function checkUniqueName(name: string, id: number | null) {
  return await prisma_client.item.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      id: id ? { not: id } : undefined,
    },
  });
}

export async function getItemBySlugOrTokenId(
  slugOrTokenId: string,
  userArgs: ItemUserArgs,
) {
  return await prisma_client.item.findFirst({
    where: {
      status: STATUS_ACTIVE,
      collection: {
        status: STATUS_ACTIVE,
      },
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
  });
}

export async function getUserItemView(item_id: number, user_id: number) {
  return await prisma_client.itemViewList.findFirst({
    where: {
      item_id: item_id,
      user_id: user_id,
      // OR: [{ user_id: user.id ?? 0 }, { ip_address: ipAddress }],
    },
  });
}

export async function getUserFavouriteItem(user_id: number, item_id: number) {
  return await prisma_client.itemFavouriteList.findFirst({
    where: {
      user_id: user_id,
      item_id: item_id,
    },
  });
}

export async function getActiveItem(id = undefined, slug = undefined) {
  return await prisma_client.item.findFirst({
    where: {
      id: id,
      slug: slug,
      status: STATUS_ACTIVE,
      collection: {
        status: STATUS_ACTIVE,
      },
    },
    include: {
      owner: true,
      creator: true,
    },
  });
}

export async function getDayWiseItemPrice(
  item_id: number,
  days: string,
): Promise<DayWisePriceCountModel[]> {
  let query = `
  SELECT 
    DATE(prices.created_at) as date,
    AVG(prices.amount*payment_tokens.usd_rate) as avg_price,
    SUM(prices.amount*payment_tokens.usd_rate) as sum_price
    FROM prices JOIN payment_tokens ON prices.payment_token_id = payment_tokens.id
    WHERE
    prices.item_id = ${item_id} `;

  if (days !== 'all') {
    query += `AND
    DATE(prices.created_at) >= DATE_TRUNC('DAY', current_date - interval '${days}' DAY) `;
  }
  query += `AND DATE(prices.created_at) <= current_date  GROUP BY DATE(prices.created_at) ORDER BY DATE(prices.created_at) ASC;`;
  return await prisma_client.$queryRawUnsafe(query);
}
