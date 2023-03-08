import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectFilesystem } from '@filesystem/nestjs';
import { IFilesystemAdapter } from '@filesystem/core/interfaces';
import { ConfigService } from '@nestjs/config';
import { FileUpload } from 'graphql-upload';
import { IFilesystemModuleOptions } from '@filesystem/nestjs/interfaces/file-system-module-options';
import { User } from '../models/user.model';
import { FileUtil } from './fileUtil';
import { FileObject } from './file.object';
import { resolve } from 'path';
import { readdir } from 'fs/promises';
import { clearTrailingSlash, errorResponse, __ } from '../helpers/functions';
import { File } from 'nft.storage';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sharp = require('sharp');

@Injectable()
export class FilesystemService {
  constructor(
    private readonly configService: ConfigService,
    @InjectFilesystem('public') private readonly publicDisk: IFilesystemAdapter,
  ) {}

  async listFile(user: User): Promise<Array<FileObject>> {
    const baseDir = `user-${user.id}`;
    const directory = resolve(`public/storage/${baseDir}`);
    try {
      const files = await readdir(directory);
      return files
        .filter((item) => {
          const reg = /[\w,\s-]+\.[A-Za-z0-9]{3}/g;
          return reg.test(item);
        })
        .map((item): FileObject => {
          const type = FileUtil.type(item);
          return {
            name: item,
            type: type,
            url: this.url(baseDir + '/' + item),
            variants:
              type == 'image'
                ? Object.keys(FileUtil.imageSizes).map((sizeKey) => {
                    return {
                      type: sizeKey,
                      url: this.url(baseDir + '/' + sizeKey + '/' + item),
                    };
                  })
                : null,
          };
        });
    } catch (e) {
      console.error(e.stack);
      return [];
    }
  }

  async upload(
    upload: FileUpload,
    dir: string,
    validFileTypes?: string[],
    maxSizeInByte?: number,
  ): Promise<FileObject> {
    const file = new FileUtil(upload, maxSizeInByte);
    if (!(await file.isValid(validFileTypes)))
      throw new BadRequestException(
        errorResponse(
          __('Invalid file type. Valid types are: ') + validFileTypes,
        ),
      );
    //if (file.isImage()) return await this.resizeAndSave(file, dir);

    const name = file.hashName();
    await this.publicDisk.writeStream(dir + '/' + name, file.readStream());
    return {
      name: name,
      type: file.type(),
      url: 'storage/' + dir + '/' + name,
    };
  }

  url(filepath: string, diskName = 'public') {
    const filesystemConfig =
      this.configService.get<IFilesystemModuleOptions>('filesystem');
    const diskConfig = filesystemConfig.disks[diskName];

    if (diskName === 'public' && filepath) {
      return (
        clearTrailingSlash(diskConfig.url.trimEnd()) +
        '/' +
        filepath.trimStart()
      );
    }
    return null;
  }

  async getFileForNft(path: string) {
    path = path.split('storage/').pop();
    const content = await this.publicDisk.read(path);
    return new File([content], path, { type: 'image/*' });
  }

  async resizeAndSave(file: FileUtil, baseDir = ''): Promise<FileObject> {
    if (!file.isImage()) throw new Error(__('Unable to resize non image file'));
    let readStream = file.readStream();
    const name = file.hashName();
    const fileObject: FileObject = {
      name: name,
      type: 'image',
      url: null,
      variants: [],
    };

    await this.publicDisk.writeStream(baseDir + '/' + name, readStream);
    fileObject.url = this.url(baseDir + '/' + name);

    for (const sizeKey of Object.keys(FileUtil.imageSizes)) {
      readStream = await this.publicDisk.readStream(baseDir + '/' + name);
      await this.publicDisk.writeStream(
        baseDir + '/' + sizeKey + '/' + name,
        await readStream.pipe(sharp().resize(FileUtil.imageSizes[sizeKey])),
      );
      fileObject.variants.push({
        type: sizeKey,
        url: baseDir + '/' + sizeKey + '/' + name,
      });
    }

    return fileObject;
  }

  async deleteFile(filepath: string): Promise<boolean> {
    if (!filepath) return true;
    filepath = filepath.split('storage/').pop();
    await this.publicDisk.delete(filepath);
    return true;
  }

  async adminUpload(upload: FileUpload): Promise<FileObject> {
    const userDir = `admin`;
    const file = new FileUtil(upload);
    if (!file.isValid()) throw new Error('Invalid file');
    if (file.isImage()) return await this.resizeAndSave(file, userDir);
    const name = file.hashName();
    await this.publicDisk.writeStream(userDir + '/' + name, file.readStream());
    return {
      name: name,
      type: file.type(),
      url: this.url(userDir + '/' + name),
    };
  }

  async adminFileList(): Promise<Array<FileObject>> {
    const baseDir = `admin`;
    const directory = resolve(`public/storage/${baseDir}`);
    try {
      const files = await readdir(directory);
      return files
        .filter((item) => {
          const reg = /[\w,\s-]+\.[A-Za-z0-9]{3}/g;
          return reg.test(item);
        })
        .map((item): FileObject => {
          const type = FileUtil.type(item);
          return {
            name: item,
            type: type,
            url: this.url(baseDir + '/' + item),
            variants:
              type == 'image'
                ? Object.keys(FileUtil.imageSizes).map((sizeKey) => {
                    return {
                      type: sizeKey,
                      url: this.url(baseDir + '/' + sizeKey + '/' + item),
                    };
                  })
                : null,
          };
        });
    } catch (e) {
      console.error(e.stack);
      return [];
    }
  }
}
