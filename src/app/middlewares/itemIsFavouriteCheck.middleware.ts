import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { app, prisma_client } from '../helpers/functions';

export const itemIsFavouriteCheck: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const source = ctx.source;
  console.log(ctx);
  if (source.user_id || source.wallet_address) {
    const checkFav = await prisma_client.itemFavouriteList.findFirst({
      where: {
        user: {
          id: source.user_id ?? undefined,
          wallet_address: source.wallet_address ?? undefined,
        },
        item_id: source.id,
      },
    });
    return checkFav ? true : false;
  }
  return false;
};
