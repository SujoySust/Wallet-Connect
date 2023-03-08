import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { app } from '../helpers/functions';
import { FilesystemService } from '../filesystem/filesystem.service';
import {
  getCollectionPrice,
  getCollectionNativeCoin,
  getCollectionItemUniqueOwner,
} from '../modules/collection/collection.query';
import { CollectionModelMetadata } from '../modules/collection/dto/collection-with-meta.object';

export const collectionMeatadatAdd: FieldMiddleware = async (
  ctx: MiddlewareContext,
) => {
  const collectionWithMeta: CollectionModelMetadata = {};
  const collection_price = await getCollectionPrice(ctx.source.id);

  const collection_native_coin = await getCollectionNativeCoin(ctx.source.id);

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
  const uniqueOwner = await getCollectionItemUniqueOwner(ctx.source.id);
  collectionWithMeta.owner_count = uniqueOwner.length;
  return collectionWithMeta;
};
