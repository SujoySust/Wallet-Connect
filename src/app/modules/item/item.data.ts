import { BadRequestException, Injectable } from '@nestjs/common';
import { FileObject } from 'src/app/filesystem/file.object';
import { FilesystemService } from '../../filesystem/filesystem.service';
import {
  FILE_TYPE_3D,
  FILE_TYPE_AUDIO,
  FILE_TYPE_IMAGE,
  FILE_TYPE_VIDEO,
  STATUS_ACTIVE,
} from '../../helpers/coreconstants';
import { convertToSlug, errorResponse, __ } from '../../helpers/functions';
import { Item } from '../../models/item.model';
import { CreateItemDto } from './dto/item.create.dto';

@Injectable()
export class ItemData {
  constructor(private readonly fileService: FilesystemService) {}

  async uploadMediaFile(payload: CreateItemDto) {
    const media_file = await payload.media_file;
    if (!media_file)
      throw new BadRequestException(
        errorResponse(__('Asset Media File required!!')),
      );
    const uploadedMediaFile = await this.fileService.upload(
      media_file,
      `item`,
      [FILE_TYPE_IMAGE, FILE_TYPE_VIDEO, FILE_TYPE_AUDIO, FILE_TYPE_3D],
      100000000, //100 mb
    );
    if (!uploadedMediaFile.url) throw new Error(errorResponse().message);
    return uploadedMediaFile;
  }

  async checkFileTypeAndProcessThumbnail(
    mediaFile: FileObject,
    payload: CreateItemDto,
  ): Promise<string> {
    if (mediaFile.type == FILE_TYPE_IMAGE) return mediaFile.url;
    const thumbnail_file = await payload.thumbnail_file;
    if (!thumbnail_file) {
      await this.fileService.deleteFile(mediaFile.url);
      throw new BadRequestException(
        errorResponse(__('Preview or Thumbnail image required!!')),
      );
    }
    try {
      const uploadedThumbnailFile = await this.fileService.upload(
        thumbnail_file,
        `item`,
        [FILE_TYPE_IMAGE],
        2000000, //2 mb
      );
      if (!uploadedThumbnailFile.url) throw new Error(errorResponse().message);
      return uploadedThumbnailFile.url;
    } catch (e) {
      await this.fileService.deleteFile(mediaFile.url);
      throw e;
    }
  }

  async prepareItemInsertData(payload: CreateItemDto, fileData) {
    const itemData = {
      name: payload.name,
      slug: convertToSlug(payload.name),
      description: payload.description,
      external_url: payload.external_url,
      media_path: fileData.media_path,
      token_uri: fileData.token_uri,
      filetype: fileData.filetype,
      thumbnail_path: fileData.thumbnail_path,
      is_unlockable_content: payload.is_unlockable_content,
      unlockable_content: payload.unlockable_content,
      status: STATUS_ACTIVE,
    };
    return itemData;
  }

  async prepareItemUpdateData(payload: CreateItemDto, item: Item) {
    return {
      description: payload.description ?? item.description,
      external_url: payload.external_url ?? item.external_url,
      is_unlockable_content: payload.is_unlockable_content,
      unlockable_content: payload.unlockable_content,
    };
  }
}
