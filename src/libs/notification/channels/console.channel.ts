import { ChannelInterface } from './channel.interface';
import { NotificationInterface } from '../notification.interface';
import { User } from '../../../app/models/user.model';

export class ConsoleChannel implements ChannelInterface {
  send(notifiable: User, notification: NotificationInterface): Promise<void> {
    const data = this.getData(notifiable, notification);
    return Promise.resolve(console.log(data));
  }

  private getData(
    notifiable: User,
    notification: NotificationInterface,
  ): string {
    if (typeof notification['toConsole'] === 'function') {
      return notification['toConsole'](notifiable);
    }
    throw new Error('toConsole method is missing into Notification class');
  }
}
