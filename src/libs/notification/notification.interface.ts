import { Type } from '@nestjs/common';
import { ChannelInterface } from './channels/channel.interface';

export interface NotificationInterface {
  broadcastOn(): Type<ChannelInterface>[];
  queueable(): boolean;
}
