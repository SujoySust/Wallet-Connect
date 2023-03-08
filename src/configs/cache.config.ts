import { registerAs } from '@nestjs/config';
import { CacheConfigInterface } from './config.interface';

export const CacheConfig = registerAs(
  'cache',
  (): CacheConfigInterface => ({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    ttl: 1000,
  }),
);
