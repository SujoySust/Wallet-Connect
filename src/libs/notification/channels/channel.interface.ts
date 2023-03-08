import { Staff } from 'src/app/modules/staff/staff.model';
import { User } from '../../../app/models/user.model';
import { NotificationInterface } from '../notification.interface';

export interface ChannelInterface {
  send(
    notifiable: User | Staff,
    notification: NotificationInterface,
  ): Promise<void>;
}
