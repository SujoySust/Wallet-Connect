import { NotificationService } from 'src/libs/notification/notification.service';
import {
  STATUS_ACTIVE,
  NOTIFICATION_EVENTS_ITEM_SOLD,
  NOTIFICATION_EVENTS_BID_ACTIVITY,
  NOTIFICATION_EVENTS_AUCTION_EXPIRATION,
  NOTIFICATION_EVENTS_SUCCESSFULLY_PURCHASED,
} from '../helpers/coreconstants';
import { prisma_client, __, app } from '../helpers/functions';
import { User } from '../models/user.model';
import { EventMailNotification } from '../notifications/event.notification';

export class UserNotificationService {
  async checkAndSendEventNotification(user: User, event: number, message = '') {
    try {
      if (user.email && user.is_email_verified == STATUS_ACTIVE) {
        const userSubscribedEvent =
          await prisma_client.notificationSetting.findFirst({
            where: {
              user_id: user.id,
            },
          });
        if (userSubscribedEvent && userSubscribedEvent.events) {
          const notifyableEvents = userSubscribedEvent.events
            .split(',')
            .map((item) => parseInt(item));
          if (notifyableEvents.includes(event)) {
            let event_description = '';
            let subject = '';
            if (event === NOTIFICATION_EVENTS_ITEM_SOLD) {
              subject = __('Item Sold');
              event_description =
                message || __('Your item has been sold successfully.');
            } else if (event === NOTIFICATION_EVENTS_BID_ACTIVITY) {
              subject = __('Bid Placed');
              event_description =
                message || __('A new bid has been placed to your item.');
            } else if (event === NOTIFICATION_EVENTS_AUCTION_EXPIRATION) {
              subject = __('Auction End');
              event_description =
                message || __('Your item auction has been expired.');
            } else if (event === NOTIFICATION_EVENTS_SUCCESSFULLY_PURCHASED) {
              subject = __('Item Puchase');
              event_description =
                message || __('You have successfully purchased a new item.');
            } else {
              return;
            }
            const mail_data = {
              subject: subject,
              description: event_description,
            };
            const notificationService = app.get(NotificationService);
            notificationService.send(
              new EventMailNotification(mail_data),
              user,
            );
          }
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }
}
