import { ChannelInterface } from './channel.interface';
import { User } from '../../../app/models/user.model';
import { NotificationInterface } from '../notification.interface';

export class TwilioChannel implements ChannelInterface {
  send(notifiable: User, notification: NotificationInterface): Promise<void> {
    return Promise.resolve(undefined);
  }
}
