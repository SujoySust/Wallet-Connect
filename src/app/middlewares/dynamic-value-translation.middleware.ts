import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { __ } from '../helpers/functions';

export const dynamicValueTranslationMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  return value ? __(value) : value;
};
