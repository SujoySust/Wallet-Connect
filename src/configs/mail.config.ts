import { registerAs } from '@nestjs/config';
import { MailConfig as MailConfigInterface } from './config.interface';

export const MailConfig = registerAs(
  'mail',
  (): MailConfigInterface => ({
    defaultMailer: process.env.MAIL_MAILER || 'smtp',
    mailers: {
      smtp: {
        host: process.env.MAIL_HOST || 'localhost',
        port: Number(process.env.MAIL_PORT || 1025),
        username: process.env.MAIL_USERNAME,
        password: process.env.MAIL_PASSWORD,
        encryption: process.env.MAIL_ENCRYPTION,
      },
      log: {},
    },
    from: {
      address: process.env.MAIL_FROM_ADDRESS || 'hello@example.com',
      name: process.env.MAIL_FROM_NAME || 'Example',
    },
  }),
);
