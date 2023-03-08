import { MessageInterface } from '../mail/messages/message.interface';
import { MailMessage } from '../mail/messages/mail.message';
import { createWriteStream, readFileSync } from 'fs';
import { resolve } from 'path';
import { compile } from 'handlebars';
import { app, marketplace_url, prisma_client } from '../../app/helpers/functions';
import {
  SETTINGS_SLUG_APP_LOGO_LARGE,
  SETTINGS_SLUG_CONTRACT_EMAIL,
} from '../../app/helpers/slugconstants';
import { FilesystemService } from '../../app/filesystem/filesystem.service';

export class NotificationTemplate {
  static async toEmail(
    template: string,
    variables: any,
  ): Promise<MessageInterface> {
    try {
      variables = await NotificationTemplate.getOtherVariables(variables);
      const { subject, content } = NotificationTemplate.resolve(
        'email',
        template,
        variables,
      );
      return new MailMessage(content).subject(subject);
    } catch (e) {
      console.error(e.stack);
    }
  }

  static async getOtherVariables(variables: any) {
    const settings = await prisma_client.setting.findMany({
      where: {
        option_key: {
          in: [SETTINGS_SLUG_APP_LOGO_LARGE, SETTINGS_SLUG_CONTRACT_EMAIL],
        },
      },
    });
    let settingObj = {};
    if (settings.length > 0) {
      settingObj = settings.reduce(
        (acc, cur) => ({ ...acc, [cur.option_key]: cur.option_value }),
        {},
      );
    }
    variables.settings = settingObj;
    if (variables.settings.app_logo_large) {
      const fileService = app.get(FilesystemService);
      variables.settings.app_logo_large = fileService.url(
        variables.settings.app_logo_large,
      );
    }

    variables.marketplace_url = marketplace_url();
    variables.header_layout = compile(
      readFileSync(
        resolve(`src/app/notifications/templates/email/layouts/header.html`),
      ).toString(),
    )({ settings: settingObj, marketplace_url: variables.marketplace_url });

    variables.footer_layout = compile(
      readFileSync(
        resolve(`src/app/notifications/templates/email/layouts/footer.html`),
      ).toString(),
    )({ settings: settingObj, marketplace_url: variables.marketplace_url });

    return variables;
  }

  static update(channel: string, template: string, payload: any) {
    createWriteStream(
      resolve(`src/app/notifications/templates/${channel}/${template}.json`),
    ).write(JSON.stringify(payload));
  }

  static get(channel: string, template: string) {
    try {
      const templatePayload = readFileSync(
        resolve(`src/app/notifications/templates/${channel}/${template}.json`),
      ).toString();
      return JSON.parse(templatePayload) ?? null;
    } catch (e) {
      console.error(e.stack);
      return null;
    }
  }

  static resolve(channel: string, template: string, variables: any) {
    const subject = variables.subject;
    let content = '';
    /* content += readFileSync(
      resolve(`src/app/notifications/templates/email/layouts/header.html`),
    ).toString(); */
    content += readFileSync(
      `src/app/notifications/templates/email/${template}`,
    ).toString();
    /* content += readFileSync(
      resolve(`src/app/notifications/templates/email/layouts/footer.html`),
    ).toString(); */
    content = compile(content)(variables);
    content = NotificationTemplate.processDynamicHtml(content);
    return { subject, content };
  }

  static processDynamicHtml(content: string): string {
    content = content.replace(/&lt;/g, '<');
    content = content.replace(/&gt;/g, '>');
    content = content.replace(/&#x3D;/g, '=');
    content = content.replace(/&#x27;/g, '"');
    content = content.replace(/&quot;/g, '"');
    return content;
  }
}
