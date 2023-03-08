import { registerAs } from '@nestjs/config';
import { resolve } from 'path';
import { IFilesystemModuleOptions } from '@filesystem/nestjs/interfaces/file-system-module-options';
import { base_url } from 'src/app/helpers/functions';

export const FilesystemConfig = registerAs(
  'filesystem',
  (): IFilesystemModuleOptions => ({
    default: process.env.FILESYSTEM_DRIVER || 'public',
    disks: {
      public: {
        root: resolve('public/storage'),
        adapter: 'local',
        url: `${base_url()}`,
      },
    },
  }),
);
