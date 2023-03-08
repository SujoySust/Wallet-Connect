import { ChannelInterface } from './channel.interface';
import { User } from '../../../app/models/user.model';
import { NotificationInterface } from '../notification.interface';
import { MailService } from '../../mail/mail.service';
import { MessageInterface } from '../../mail/messages/message.interface';
import { Injectable } from '@nestjs/common';
import { Staff } from '../../../../src/app/modules/staff/staff.model';

@Injectable()
export class MailChannel implements ChannelInterface {
  constructor(private readonly mailService: MailService) {}

  async send(
    notifiable: User | Staff,
    notification: NotificationInterface,
  ): Promise<any> {
    const mailMessage: MessageInterface = await this.getData(
      notifiable,
      notification,
    );
    return this.mailService.send(
      mailMessage.to({
        name: notifiable.name || notifiable.username,
        address: notifiable.email,
      }),
    );
  }

  private async getData(
    notifiable: User | Staff,
    notification: NotificationInterface,
  ): Promise<MessageInterface> {
    if (typeof notification['toMail'] === 'function') {
      return notification['toMail'](notifiable);
    }
    throw new Error('toMail method is missing into Notification class');
  }
}
