import { NotificationInterface } from '../../libs/notification/notification.interface';
import { Type } from '@nestjs/common';
import { ChannelInterface } from '../../libs/notification/channels/channel.interface';
import { MailChannel } from '../../libs/notification/channels/mail.channel';
import { User } from '../models/user.model';
import { MessageInterface } from '../../libs/mail/messages/message.interface';
import { NotificationTemplate } from '../../libs/notification/notification.template';

export class MailVerificationNotification implements NotificationInterface {
  data: any;
  constructor(data: any) {
    this.data = data;
  }

  broadcastOn(): Type<ChannelInterface>[] {
    return [MailChannel];
  }

  async toMail(notifiable: User): Promise<MessageInterface> {
    return (
      await NotificationTemplate.toEmail('verify-email.html', {
        subject: 'Email Verification',
        name: notifiable.name || notifiable.username,
        email: notifiable.email,
        ...this.data,
      })
    ).to(notifiable.email);
  }

  queueable(): boolean {
    return false;
  }
}
