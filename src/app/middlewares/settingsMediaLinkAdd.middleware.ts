import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { app } from '../helpers/functions';
import { FilesystemService } from '../filesystem/filesystem.service';
import { SETTINGS_VALUE_TYPE_MEDIA_URL } from '../helpers/slugconstants';

export const settingsMediaLink: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const source = ctx.source;
  const value = await next();
  const fileService = app.get(FilesystemService);
  return source.value_type == SETTINGS_VALUE_TYPE_MEDIA_URL
    ? fileService.url(value)
    : value;
};
