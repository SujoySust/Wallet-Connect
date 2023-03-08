import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from '../../configs/config.interface';
import { transports } from './transports';
import { TransportInterface } from './transports/transport.interface';
import { MessageInterface } from './messages/message.interface';
import { getSettingsGroup, prisma_client } from '../../app/helpers/functions';
import {
  SETTINGS_GROUP_EMAIL,
  SETTINGS_SLUG_MAIL_DIRIVER,
  SETTINGS_SLUG_MAIL_ENCRYPTION,
  SETTINGS_SLUG_MAIL_FROM_ADDRESS,
  SETTINGS_SLUG_MAIL_HOST,
  SETTINGS_SLUG_MAIL_PASSWORD,
  SETTINGS_SLUG_MAIL_PORT,
  SETTINGS_SLUG_MAIL_USERNAME,
} from '../../app/helpers/slugconstants';

@Injectable()
export class MailService {
  private mailConfig: MailConfig;
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly configService: ConfigService,
  ) {
    this.mailConfig = this.configService.get<MailConfig>('mail');
  }
  async send(message: MessageInterface) {
    const mailSettings = await getSettingsGroup(prisma_client, [
      SETTINGS_GROUP_EMAIL,
    ]);
    const defaultMailer =
      mailSettings[SETTINGS_SLUG_MAIL_DIRIVER] ?? this.mailConfig.defaultMailer;
    const mailConfig = {
      host:
        mailSettings[SETTINGS_SLUG_MAIL_HOST] ??
        this.mailConfig.mailers[defaultMailer].host,
      port: Number(
        mailSettings[SETTINGS_SLUG_MAIL_PORT] ??
          this.mailConfig.mailers[defaultMailer].port,
      ),
      username:
        mailSettings[SETTINGS_SLUG_MAIL_USERNAME] ??
        this.mailConfig.mailers[defaultMailer].username,
      password:
        mailSettings[SETTINGS_SLUG_MAIL_PASSWORD] ??
        this.mailConfig.mailers[defaultMailer].password,
      encryption:
        mailSettings[SETTINGS_SLUG_MAIL_ENCRYPTION] ??
        this.mailConfig.mailers[defaultMailer].encryption,
    };
    const transport: TransportInterface = await this.resolveTransport(
      defaultMailer,
    );
    const data = await message.toTransporter();
    if (!data.from) {
      data.from =
        mailSettings[SETTINGS_SLUG_MAIL_FROM_ADDRESS] ?? this.mailConfig.from;
    }
    return await transport.send(data, mailConfig);
  }
  resolveTransport(defaultMailer) {
    return this.moduleRef.create(transports[defaultMailer]);
  }
}
