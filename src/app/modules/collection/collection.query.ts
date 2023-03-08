import {
  MODEL_TYPE_COLLECTION,
  PAYMENT_TOKEN_TYPE_NATIVE_COIN,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import { prisma_client } from 'src/app/helpers/functions';
import { DayWisePriceCountModel } from 'src/app/models/dayWisePriceCount.model';
import { CollectionPriceModel } from './dto/collection.price.model';

export async function findCollectionBySlug(slug: string) {
  return await prisma_client.collection.findFirst({
    where: {
      slug: slug,
      status: STATUS_ACTIVE,
    },
    include: {
      user: true,
      blockchain: {
        include: {
          payment_tokens: {
            where: {
              status: STATUS_ACTIVE,
            },
          },
        },
      },
    },
  });
}

export async function findUniqueCollection(filter: any, id: number | null) {
  return await prisma_client.collection.findFirst({
    where: {
      name: {
        equals: filter.name ? filter.name : undefined,
        mode: 'insensitive',
      },
      slug: filter.slug ? filter.slug : undefined,
      id: id ? { not: id } : undefined,
    },
  });
}

export async function getCollectionItemCount(
  collection_id: number,
): Promise<number> {
  return await prisma_client.item.count({
    where: {
      collection_id: collection_id,
      status: STATUS_ACTIVE,
    },
  });
}

export async function getCollectionSocialLink(
  collection_id: number,
  prismaService = null,
) {
  const prisma = prismaService ?? prisma_client;
  return await prisma.socialLinks.findFirst({
    where: {
      model_id: collection_id,
      model_type: MODEL_TYPE_COLLECTION,
    },
  });
}

export async function getCollectionToken(collection_id: number) {
  return await prisma_client.paymentTokenMapping.findMany({
    where: {
      collection_id: collection_id,
    },
    include: {
      payment_token: true,
    },
  });
}

export async function getCollectionItemUniqueOwner(collection_id: number) {
  return await prisma_client.item.findMany({
    distinct: ['owner_id'],
    where: {
      collection_id: collection_id,
    },
    select: {
      owner_id: true,
    },
  });
}

export async function getCollectionWatchedUser(
  user: any,
  collection_id: number,
) {
  return user.user_id || user.user_wallet_address
    ? await prisma_client.collectionWatchList.findFirst({
        where: {
          collection: {
            id: collection_id,
          },
          user: {
            id: user.user_id ?? undefined,
            wallet_address: user.user_wallet_address ?? undefined,
          },
        },
      })
    : null;
}

export async function getCollectionPrice(
  collection_id: number,
): Promise<CollectionPriceModel> {
  const queryVolumn = `
    SELECT 
    SUM(prices.amount*payment_tokens.usd_rate) as volume
    FROM prices 
            JOIN payment_tokens ON prices.payment_token_id = payment_tokens.id
            JOIN items ON prices.item_id = items.id
            JOIN collections ON items.collection_id = collections.id
    WHERE
    collections.id = ${collection_id}`;
  const volumn = await prisma_client.$queryRawUnsafe(queryVolumn);

  const queryFloor = `
    SELECT 
    MIN(items.price*payment_tokens.usd_rate) as floor_price
    FROM items 
            JOIN collections ON items.collection_id = collections.id
            JOIN payment_tokens ON items.payment_token_id = payment_tokens.id
    WHERE
    items.price > 0
    AND
    collections.id = ${collection_id}`;
  const floor_price = await prisma_client.$queryRawUnsafe(queryFloor);

  return {
    floor_price: floor_price[0]?.floor_price ?? 0,
    volume: volumn[0]?.volume ?? 0,
  };
}

export async function getCollectionNativeCoin(collection_id: number) {
  return await prisma_client.paymentToken.findFirst({
    where: {
      type: PAYMENT_TOKEN_TYPE_NATIVE_COIN,
      status: STATUS_ACTIVE,
      blockchain: {
        collections: {
          some: {
            id: collection_id,
          },
        },
      },
    },
    include: {
      blockchain: true,
    },
  });
}

export async function dayWiseCollectionPrice(
  collection_id: number,
  days: string,
): Promise<DayWisePriceCountModel[]> {
  let query = `SELECT 
    DATE(prices.created_at) as date, 
    AVG(prices.amount*payment_tokens.usd_rate) as avg_price,
    SUM(prices.amount*payment_tokens.usd_rate) as sum_price
        FROM prices 
        JOIN payment_tokens ON prices.payment_token_id = payment_tokens.id
        JOIN items ON prices.item_id = items.id
        JOIN collections ON items.collection_id = collections.id
        WHERE
        collections.id = ${collection_id} `;
  if (days !== 'all') {
    query += `AND
        DATE(prices.created_at) >= DATE_TRUNC('DAY', current_date - interval '${days}' DAY) `;
  }
  query += `AND DATE(prices.created_at) <= current_date GROUP BY DATE(prices.created_at) ORDER BY date ASC;`;

  return await prisma_client.$queryRawUnsafe(query);
}

export async function getSyncCollectionList() {
  const query = `SELECT 
    c.id AS collection_id,
    c.blockchain_id,
    c.user_id,
    payment_tokens.usd_rate as native_usd_rate,
    payment_tokens.id as native_token_id,
    (SELECT SUM(p.amount * pt.usd_rate)
       FROM prices p, items i, payment_tokens pt
       WHERE c.id = i.collection_id AND i.id=p.item_id
       AND p.payment_token_id = pt.id) total_volume,
    (SELECT SUM(p.amount * pt.usd_rate)
       FROM prices p, items i, payment_tokens pt
       WHERE c.id = i.collection_id AND i.id=p.item_id
       AND p.payment_token_id = pt.id
       AND DATE(p.created_at) >= current_date - 1) one_day_volume,
    (SELECT SUM(p.amount * pt.usd_rate)
       FROM prices p, items i, payment_tokens pt
       WHERE c.id = i.collection_id AND i.id=p.item_id
       AND p.payment_token_id = pt.id
       AND DATE(p.created_at) >= current_date - 2
       AND DATE(p.created_at) <= CURRENT_DATE - 1) prev_one_day_volume,
    (SELECT SUM(p.amount * pt.usd_rate)
       FROM prices p, items i, payment_tokens pt
       WHERE c.id = i.collection_id AND i.id=p.item_id
       AND p.payment_token_id = pt.id
       AND DATE(p.created_at) >= current_date - 7) seven_days_volume,
    (SELECT SUM(p.amount * pt.usd_rate)
       FROM prices p, items i, payment_tokens pt
       WHERE c.id = i.collection_id AND i.id=p.item_id
       AND p.payment_token_id = pt.id
       AND DATE(p.created_at) >= current_date - 14
       AND DATE(p.created_at) <= CURRENT_DATE - 7) prev_seven_days_volume,
    (SELECT SUM(p.amount * pt.usd_rate)
       FROM prices p, items i, payment_tokens pt
       WHERE c.id = i.collection_id AND i.id=p.item_id
       AND p.payment_token_id = pt.id
       AND DATE(p.created_at) >= current_date - 30) thirty_days_volume,
    (SELECT SUM(p.amount * pt.usd_rate)
       FROM prices p, items i, payment_tokens pt
       WHERE c.id = i.collection_id AND i.id=p.item_id
       AND p.payment_token_id = pt.id
       AND DATE(p.created_at) >= current_date - 60
       AND DATE(p.created_at) <= CURRENT_DATE - 30) prev_thirty_days_volume,
    (SELECT MIN(i.price * pt.usd_rate)
       FROM items i, payment_tokens pt
       WHERE c.id = i.collection_id
       AND i.payment_token_id = pt.id
       AND i.price > 0) floor_price,
    (SELECT COUNT(i.id)
       FROM items i
       WHERE c.id = i.collection_id
       AND i.status = 1) item_count
    FROM collections c
    JOIN blockchains ON c.blockchain_id = blockchains.id
    JOIN payment_tokens ON payment_tokens.blockchain_id = blockchains.id AND payment_tokens.type = 1
    `;
  const syncCollectionList: any[] = await prisma_client.$queryRawUnsafe(query);
  return syncCollectionList;
}
