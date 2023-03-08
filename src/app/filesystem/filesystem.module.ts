import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesystemService } from './filesystem.service';
import { NestFilesystemModule } from '@filesystem/nestjs';
import { IFilesystemModuleOptions } from '@filesystem/nestjs/interfaces/file-system-module-options';
import { FilesystemResolver } from './filesystem.resolver';

@Global()
@Module({
  imports: [
    ConfigModule,
    NestFilesystemModule.registerAsync({
      availableDisks: ['public'],
      useFactory: (configService: ConfigService) => {
        return configService.get<IFilesystemModuleOptions>('filesystem');
      },
      inject: [ConfigService],
    }),
  ],
  providers: [FilesystemService, FilesystemResolver],
  exports: [FilesystemService],
})
export class FilesystemModule {}
