import { FieldMiddleware, MiddlewareContext } from '@nestjs/graphql';
import { getCollectionItemCount } from '../modules/collection/collection.query';
import { Count } from '../models/collection.model';

export const collectionItemCount: FieldMiddleware = async (
  ctx: MiddlewareContext,
) => {
  const totalCount: Count = {
    items: 0,
  };
  const itemCount = await getCollectionItemCount(ctx.source.id);
  totalCount.items = itemCount;
  return totalCount;
};
