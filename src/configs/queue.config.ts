import { registerAs } from '@nestjs/config';
import { QueueOptions } from 'bull';

export const QueueConfig = registerAs(
  'queue',
  (): QueueOptions => ({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      port: Number(process.env.REDIS_PORT || 6379),
      db: Number(process.env.REDIS_DATABASE || 0),
    },
  }),
);
