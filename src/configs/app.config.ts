import { AppConfig as AppConfigInterface } from './config.interface';
import { registerAs } from '@nestjs/config';
export const AppConfig = registerAs(
  'app',
  (): AppConfigInterface => ({
    timeZone: process.env.TZ || 'Asia/Dhaka',
    env: process.env.NODE_ENV,
    name: process.env.APP_NAME,
    port: process.env.APP_PORT,
    sentryDsn: process.env.SENTRY_DSN,
  }),
);
