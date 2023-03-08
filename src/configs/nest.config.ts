import { registerAs } from '@nestjs/config';
import { NestConfig as NestConfigInterface } from './config.interface';

export const NestConfig = registerAs(
  'nest',
  (): NestConfigInterface => ({
    port: 3000,
  }),
);
