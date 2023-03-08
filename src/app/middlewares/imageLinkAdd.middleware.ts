import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { app } from '../helpers/functions';
import { FilesystemService } from '../filesystem/filesystem.service';

export const imageLinkAddMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value = await next();
  const fileService = app.get(FilesystemService);
  return value ? fileService.url(value) : null;
};
