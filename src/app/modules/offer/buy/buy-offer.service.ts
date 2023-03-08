import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferData } from 'src/app/modules/offer/offer.data';
import { OfferValidation } from 'src/app/modules/offer/offer.validation';
import {
  BUY_OFFER_TYPE_DEFAULT,
  BUY_SELL_STATUS_ACTIVE,
  BUY_SELL_STATUS_CANCELLED,
  EXCHANGE_STATUS_IN_PROGRESS,
  ITEM_EVENT_BIDS,
  ITEM_EVENT_BID_CANCEL,
  ITEM_EVENT_BUY_OFFERS,
  ITEM_EVENT_BUY_OFFER_CANCEL,
  NOTIFICATION_EVENTS_BID_ACTIVITY,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import { User } from 'src/app/models/user.model';
import {
  app,
  errorResponse,
  getSettingsGroup,
  marketplace_url,
  prisma_client,
  processException,
  successResponse,
  __,
} from '../../../helpers/functions';
import { BuyOffer } from './buy-offer.model';
import { CreateBidDto, CreateBuyOfferDto } from '../offer.dto';
import { ItemService } from '../../item/item.service';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { SETTINGS_GROUP_APPLICATION } from 'src/app/helpers/slugconstants';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { BuyOfferUserTypeArgs } from '../offer.args';
import { BuyOfferConnection } from 'src/app/models/pagination/buy-offer-connection.model';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Prisma } from '@prisma/client';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { BuyOfferFilter } from '../filter.dto';
import { UserNotificationService } from 'src/app/core.services/user-notification.service';
import { PaymentTokenModel } from '../../../models/paymentToken.model';
import { SigDataModel } from '../sigdata.model';
import { Item } from '../../../models/item.model';

@Injectable()
export class BuyOfferService extends OfferValidation {
  public settings: any;
  constructor(private readonly offerData: OfferData) {
    super();
  }

  async init() {
    this.settings = await getSettingsGroup(prisma_client, [
      SETTINGS_GROUP_APPLICATION,
    ]);
  }

  async cancelBuyOffer(user: User, uid: string): Promise<ResponseModel> {
    const buy_offer = await prisma_client.buyOffer.findFirst({
      where: {
        uid: uid,
        user_id: user.id,
        status: BUY_SELL_STATUS_ACTIVE,
      },
      include: {
        exchanges: {
          where: {
            status: EXCHANGE_STATUS_IN_PROGRESS,
          },
        },
      },
    });
    if (!buy_offer)
      throw new NotFoundException(errorResponse(__('Buy offer not found')));
    if (buy_offer.exchanges.length > 0)
      throw new BadRequestException(
        __(
          "Can't cancel the offer now, already a selling process in progress.",
        ),
      );

    return await prisma_client.$transaction(async (prisma) => {
      const updatedOffer = await prisma.buyOffer.update({
        where: {
          id: buy_offer.id,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_CANCELLED,
        },
      });
      if (updatedOffer.status == BUY_SELL_STATUS_CANCELLED) {
        const itemService = app.get(ItemService);
        await itemService.itemActivitySave(
          buy_offer.item_id,
          buy_offer.type == BUY_OFFER_TYPE_DEFAULT
            ? ITEM_EVENT_BUY_OFFER_CANCEL
            : ITEM_EVENT_BID_CANCEL,
          user.id,
          null,
          null,
          buy_offer.total_amount.toString(),
          STATUS_ACTIVE,
          prisma,
          buy_offer.payment_token_id,
        );
        return successResponse(__('Cancelled successfully'));
      } else {
        return errorResponse();
      }
    });
  }

  async getDataForSignBuyOffer(
    user: User,
    payload: CreateBuyOfferDto,
  ): Promise<SigDataModel> {
    try {
      await this.init();
      return <SigDataModel>(
        await this.createBuyOfferValidation(payload, user, this.settings, true)
      );
    } catch (e) {
      processException(e);
    }
  }

  async createBuyOffer(
    user: User,
    payload: CreateBuyOfferDto,
  ): Promise<BuyOffer> {
    try {
      await this.init();
      const { item } = <{ item: Item; payment_token: PaymentTokenModel }>(
        await this.createBuyOfferValidation(payload, user, this.settings)
      );
      return await prisma_client.$transaction(async (prisma) => {
        const buyOffer = await this.saveBuyOffer(payload, item, user, prisma);
        if (buyOffer) {
          const itemService = app.get(ItemService);
          await itemService.itemActivitySave(
            item.id,
            buyOffer.type == BUY_OFFER_TYPE_DEFAULT
              ? ITEM_EVENT_BUY_OFFERS
              : ITEM_EVENT_BIDS,
            buyOffer.user_id,
            null,
            null,
            buyOffer.total_amount.toString(),
            STATUS_ACTIVE,
            prisma,
            buyOffer.payment_token_id,
          );
          const notificationService = new UserNotificationService();
          notificationService.checkAndSendEventNotification(
            item.owner,
            NOTIFICATION_EVENTS_BID_ACTIVITY,
            `A new bid has been placed to your item. 
            <a href='${marketplace_url()}/assets/${
              item.slug
            }'><u>Check it out</u></a>`,
          );
        }
        return buyOffer;
      });
    } catch (e) {
      processException(e);
    }
  }

  async saveBuyOffer(
    payload: CreateBuyOfferDto,
    item: Item,
    user: User,
    prisma = null,
  ) {
    if (!prisma) prisma = prisma_client;
    const buyOfferData = await this.offerData.prepareBuyOfferData(
      payload,
      item,
      this.settings,
    );
    return await prisma.buyOffer.create({
      data: {
        ...buyOfferData,
        user: {
          connect: {
            id: user.id,
          },
        },
        item: {
          connect: {
            id: payload.item_id,
          },
        },
        payment_token: {
          connect: {
            id: payload.payment_token_id,
          },
        },
      },
    });
  }

  /* async createBid(user: User, payload: CreateBidDto): Promise<BuyOffer> {
    try {
      await this.init();
      const { item } = await this.createBidValidation(
        payload,
        user,
        this.settings,
      );
      const bid = await this.saveBid(payload, item, user);
      if (bid) {
        const itemService = app.get(ItemService);
        await itemService.itemActivitySave(
          item.id,
          ITEM_EVENT_BIDS,
          bid.user_id,
          null,
          null,
          bid.total_amount.toString(),
          STATUS_ACTIVE,
        );
      }
      return bid;
    } catch (e) {
      processException(e);
    }
  } */

  /* async saveBid(payload: CreateBidDto, item: Item, user: User) {
    const bidData = await this.offerData.prepareBuyOfferData(
      payload,
      item,
      this.settings,
    );
    return await prisma_client.buyOffer.create({
      data: {
        ...bidData,
        user: {
          connect: {
            id: user.id,
          },
        },
        item: {
          connect: {
            id: payload.item_id,
          },
        },
        payment_token: {
          connect: {
            id: payload.payment_token_id,
          },
        },
        sell_offer: {
          connect: {
            id: payload.sell_offer_id,
          },
        },
      },
    });
  } */

  async itemBuyOfferList(itemId: number) {
    try {
      return await prisma_client.buyOffer.findMany({
        where: {
          item_id: itemId,
          item: {
            status: STATUS_ACTIVE,
          },
          status: BUY_SELL_STATUS_ACTIVE,
          end_date: {
            gt: new Date(),
          },
        },
        orderBy: {
          total_amount: 'desc',
        },
        include: {
          user: true,
          payment_token: true,
        },
      });
    } catch (e) {
      processException(e);
    }
  }

  async getBuyOfferById(offerId: number) {
    try {
      const buyOffer = await prisma_client.buyOffer.findFirst({
        where: {
          id: offerId,
          status: BUY_SELL_STATUS_ACTIVE,
        },
        include: {
          user: true,
          payment_token: true,
        },
      });
      if (!buyOffer) {
        this.throwError('Invalid buy offer.');
      }
      return buyOffer;
    } catch (e) {
      processException(e);
    }
  }

  async getUserBuyOfferLists(
    paginate: PaginationArgs,
    userArgs?: BuyOfferUserTypeArgs,
    filter?: BuyOfferFilter,
  ): Promise<BuyOfferConnection> {
    return findManyCursorConnection<
      BuyOffer,
      Pick<Prisma.BuyOfferWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.buyOffer.findMany({
          where: {
            user_id: userArgs.offer_maker_id ?? undefined,
            item: {
              owner_id: userArgs.offer_receiver_id || undefined,
              collection_id: filter.collection_id || undefined,
              status: STATUS_ACTIVE,
              collection: {
                status: STATUS_ACTIVE,
              },
            },
          },
          include: {
            item: {
              include: {
                owner: true,
                collection: true,
              },
            },
            payment_token: true,
            user: true,
          },
          orderBy: [
            {
              id: 'desc',
            },
          ],
          ...args,
        }),
      () =>
        prisma_client.buyOffer.count({
          where: {
            user_id: userArgs.offer_maker_id ?? undefined,
            item: userArgs.offer_receiver_id
              ? {
                  owner_id: userArgs.offer_receiver_id,
                }
              : undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }
}
