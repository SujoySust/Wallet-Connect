import { CacheModule as CacheModuleCore, Global, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';
import { CacheConfigInterface } from '../../configs/config.interface';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    CacheModuleCore.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get<CacheConfigInterface>('cache');
        return {
          store: redisStore,
          ...redisConfig,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
