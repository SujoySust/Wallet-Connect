import { FileUpload } from 'graphql-upload';
import { randomUUID } from 'crypto';
import { ReadStream } from 'fs-capacitor';
import { BadRequestException } from '@nestjs/common';
import { errorResponse, __ } from '../helpers/functions';
import { DEAFAULT_MAX_FILE_SIZE_IN_BYTE } from '../helpers/coreconstants';

export class FileUtil {
  private static allowedMimes = {
    image: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
    video: ['video/mp4', 'video/mpeg', 'video/webm'],
    audio: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav'],
    _3d: ['application/octet-stream'],
  };
  private static allowedExts = {
    image: ['png', 'jpeg', 'jpg', 'gif', 'svg'],
    video: ['mp4', 'm4a', 'm4p', 'm4b', 'm4r', 'm4v', 'webm'],
    audio: ['mp3', 'ogg', 'wav'],
    _3d: ['glb'],
  };
  public static imageSizes = {
    thumb: { width: 200, height: 200 },
  };
  private maxSizeInByte: number;
  private maxSizeinMb: number;

  constructor(
    private readonly file: FileUpload,
    maxSizeInByte: number = DEAFAULT_MAX_FILE_SIZE_IN_BYTE,
  ) {
    this.maxSizeInByte = maxSizeInByte;
    this.maxSizeinMb = this.maxSizeInByte / 1000 ** 2;
  }

  static extension(name: string) {
    return name.split('.').pop();
  }

  extension(): string {
    return FileUtil.extension(this.file.filename);
  }

  async getSize(): Promise<number> {
    const uploadStream = this.file.createReadStream();
    let byteLength = 0;
    for await (const uploadChunk of uploadStream) {
      byteLength += (uploadChunk as Buffer).byteLength;
    }
    uploadStream.destroy();
    return byteLength;
  }

  async validateSize(): Promise<boolean> {
    const uploadStream = this.file.createReadStream();
    let byteLength = 0;
    for await (const uploadChunk of uploadStream) {
      byteLength += (uploadChunk as Buffer).byteLength;
      if (byteLength > this.maxSizeInByte) {
        uploadStream.destroy();
        throw new BadRequestException(
          errorResponse(
            `[${this.file.filename}]` +
              __(" File can't be more than ") +
              this.maxSizeinMb +
              ' MB',
          ),
          // errorResponse(__('Invalid size of file')),
        );
      }
    }
    uploadStream.destroy();
    return true;
  }

  mimeType(): string {
    return this.file.mimetype;
  }

  readStream(): ReadStream {
    return this.file.createReadStream();
  }

  hashName(): string {
    return randomUUID() + '.' + this.extension();
  }

  async isValid(validFileTypes?: string[]): Promise<boolean> {
    let exts = {};
    let mimes = {};
    if (validFileTypes?.length > 0) {
      for (let i = 0; i < validFileTypes.length; i++) {
        exts[validFileTypes[i]] = FileUtil.allowedExts[validFileTypes[i]];
        mimes[validFileTypes[i]] = FileUtil.allowedMimes[validFileTypes[i]];
      }
    } else {
      exts = FileUtil.allowedExts;
      mimes = FileUtil.allowedMimes;
    }
    return (
      Object.values(exts).flat().includes(this.extension()) &&
      Object.values(mimes).flat().includes(this.mimeType()) &&
      (await this.validateSize())
    );
  }

  static type(name: string) {
    for (const t in FileUtil.allowedExts) {
      if (FileUtil.allowedExts[t].includes(FileUtil.extension(name))) return t;
    }
    return undefined;
  }

  type(): string {
    return FileUtil.type(this.file.filename);
  }

  isImage(): boolean {
    return (
      FileUtil.allowedExts.image.includes(this.extension()) &&
      FileUtil.allowedMimes.image.includes(this.mimeType())
    );
  }

  isVideo(): boolean {
    return (
      FileUtil.allowedExts.video.includes(this.extension()) &&
      FileUtil.allowedMimes.video.includes(this.mimeType())
    );
  }
}
