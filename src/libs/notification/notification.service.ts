import { Injectable, Type } from '@nestjs/common';
import { User } from '../../app/models/user.model';
import { NotificationInterface } from './notification.interface';
import { ChannelInterface } from './channels/channel.interface';
import { ModuleRef } from '@nestjs/core';
import { Staff } from 'src/app/modules/staff/staff.model';

@Injectable()
export class NotificationService {
  constructor(private moduleRef: ModuleRef) {}

  send(
    notification: NotificationInterface,
    notifiable: User | Staff,
  ): Promise<any> {
    const channels = notification.broadcastOn();
    return Promise.all(
      channels.map(async (channel: Type<ChannelInterface>) => {
        const channelObj: ChannelInterface = await this.resolveChannel(channel);
        await channelObj.send(notifiable, notification);
      }),
    );
  }

  /**
   * Resolve the channel needed to send the Notification
   * @param channel
   * @return Promise<ChannelInterface>
   */
  private async resolveChannel(channel: Type<ChannelInterface>) {
    return this.moduleRef.create(channel);
  }
}
