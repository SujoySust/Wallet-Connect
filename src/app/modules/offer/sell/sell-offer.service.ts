import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OfferData } from 'src/app/modules/offer/offer.data';
import { OfferValidation } from 'src/app/modules/offer/offer.validation';
import {
  BUY_SELL_STATUS_ACTIVE,
  BUY_SELL_STATUS_CANCELLED,
  ITEM_EVENT_LISTINGS,
  STATUS_ACTIVE,
  ITEM_EVENT_LISTING_CANCEL,
  EXCHANGE_STATUS_IN_PROGRESS,
} from 'src/app/helpers/coreconstants';
import { Item } from 'src/app/models/item.model';
import { User } from 'src/app/models/user.model';
import {
  app,
  errorResponse,
  getSettingsGroup,
  prisma_client,
  processException,
  successResponse,
  __,
} from '../../../helpers/functions';
import { CreateSellOfferDto } from '../offer.dto';
import { SellOffer } from './sell-offer.model';
import { ItemService } from '../../item/item.service';
import { ResponseModel } from 'src/app/models/dto/response.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { SellOfferFilter } from '../filter.dto';
import { SellOfferConnection } from 'src/app/models/pagination/sell-offer-connection.model';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Prisma, PrismaClient } from '@prisma/client';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { PaymentTokenModel } from 'src/app/models/paymentToken.model';
import { SETTINGS_GROUP_APPLICATION } from 'src/app/helpers/slugconstants';
import { SellOfferUserTypeArgs } from '../offer.args';
import { SigDataModel } from '../sigdata.model';

@Injectable()
export class SellOfferService extends OfferValidation {
  public settings: any;
  constructor(private readonly offerData: OfferData) {
    super();
  }

  async init() {
    this.settings = await getSettingsGroup(prisma_client, [
      SETTINGS_GROUP_APPLICATION,
    ]);
  }

  async cancelSellOffer(user: User, uid: string): Promise<ResponseModel> {
    const sell_offer = await prisma_client.sellOffer.findFirst({
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
    if (!sell_offer)
      throw new NotFoundException(errorResponse(__('Sell offer not found')));
    if (sell_offer.exchanges.length > 0)
      throw new BadRequestException(
        errorResponse(
          __(
            "Can't cancel the listing now, already a buying process in progress.",
          ),
        ),
      );

    return await prisma_client.$transaction(async (prisma) => {
      const updatedOffer = await prisma.sellOffer.update({
        where: {
          id: sell_offer.id,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_CANCELLED,
        },
      });
      if (updatedOffer.status == BUY_SELL_STATUS_CANCELLED) {
        await prisma.item.update({
          where: {
            id: sell_offer.item_id,
          },
          data: {
            price: 0,
            payment_token_id: null,
          },
        });
        const itemService = app.get(ItemService);
        await itemService.itemActivitySave(
          sell_offer.item_id,
          ITEM_EVENT_LISTING_CANCEL,
          user.id,
          null,
          null,
          sell_offer.total_amount.toString(),
          STATUS_ACTIVE,
          prisma,
          sell_offer.payment_token_id,
        );
        return successResponse(__('Cancelled successfully'));
      } else {
        return errorResponse();
      }
    });
  }

  async getDataForSignSellOffer(
    user: User,
    payload: CreateSellOfferDto,
  ): Promise<SigDataModel> {
    try {
      await this.init();
      return <SigDataModel>(
        await this.createSellOfferValidation(payload, user, this.settings, true)
      );
    } catch (e) {
      processException(e);
    }
  }

  async createSellOffer(
    user: User,
    payload: CreateSellOfferDto,
  ): Promise<SellOffer> {
    try {
      await this.init();

      const { item, payment_token } = <
        { item: Item; payment_token: PaymentTokenModel }
      >await this.createSellOfferValidation(payload, user, this.settings);

      return await prisma_client.$transaction(async (prisma) => {
        const sellOffer = await this.saveSellOffer(
          payload,
          item,
          payment_token,
          user,
          prisma,
        );
        if (sellOffer) {
          await prisma.item.update({
            where: {
              id: sellOffer.item_id,
            },
            data: {
              price: sellOffer.total_amount,
              payment_token_id: sellOffer.payment_token_id,
            },
          });
          const itemService = app.get(ItemService);
          await itemService.itemActivitySave(
            item.id,
            ITEM_EVENT_LISTINGS,
            sellOffer.user_id,
            null,
            null,
            sellOffer.total_amount.toString(),
            STATUS_ACTIVE,
            prisma,
            sellOffer.payment_token_id,
          );
        }
        return sellOffer;
      });
    } catch (e) {
      processException(e);
    }
  }

  async saveSellOffer(
    payload: CreateSellOfferDto,
    item: Item,
    token: PaymentTokenModel,
    user: User,
    prisma: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ): Promise<SellOffer> {
    item.payment_token = token;
    const sellOfferData = await this.offerData.prepareSellOfferData(
      payload,
      item,
      this.settings,
    );
    if (!prisma) prisma = prisma_client;
    return await prisma.sellOffer.create({
      data: {
        ...sellOfferData,
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

  async getSellOfferLists(
    paginate: PaginationArgs,
    filter?: SellOfferFilter,
  ): Promise<SellOfferConnection> {
    return findManyCursorConnection<
      SellOffer,
      Pick<Prisma.SellOfferWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.sellOffer.findMany({
          where: {
            type: filter.type || undefined,
            user_id: filter.user_id || undefined,
            item: {
              status: STATUS_ACTIVE,
              collection: {
                status: STATUS_ACTIVE,
              },
            },
          },
          include: {
            user: true,
            item: true,
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.sellOffer.count({
          where: {
            type: filter.type || undefined,
            user_id: filter.user_id || undefined,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getActiveSellOfferLists(
    paginate: PaginationArgs,
  ): Promise<SellOfferConnection> {
    return findManyCursorConnection<
      SellOffer,
      Pick<Prisma.SellOfferWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.sellOffer.findMany({
          where: {
            end_date: {
              gt: new Date(),
            },
            status: BUY_SELL_STATUS_ACTIVE,
            item: {
              status: STATUS_ACTIVE,
              collection: {
                status: STATUS_ACTIVE,
              },
            },
          },
          include: {
            user: true,
            item: {
              include: {
                collection: true,
              },
            },
            payment_token: true,
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.sellOffer.count({
          where: {
            end_date: {
              gte: new Date(),
            },
            status: BUY_SELL_STATUS_ACTIVE,
          },
        }),
      paginate,
      pOptions,
    );
  }

  async getSellOfferListsByUser(
    paginate: PaginationArgs,
    status: number,
    userArgs?: SellOfferUserTypeArgs,
  ): Promise<SellOfferConnection> {
    return findManyCursorConnection<
      SellOffer,
      Pick<Prisma.SellOfferWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.sellOffer.findMany({
          where: {
            status: status,
            user: {
              OR: [
                {
                  id: userArgs.user_id ?? 0,
                },
                {
                  wallet_address: userArgs.user_wallet_address ?? '',
                },
              ],
            },
            item: {
              status: STATUS_ACTIVE,
              collection: {
                status: STATUS_ACTIVE,
              },
            },
          },
          include: {
            user: true,
            item: true,
            payment_token: true,
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.sellOffer.count({
          where: {
            status: status,
            user: {
              OR: [
                {
                  id: userArgs.user_id ?? 0,
                },
                {
                  wallet_address: userArgs.user_wallet_address ?? '',
                },
              ],
            },
          },
        }),
      paginate,
      pOptions,
    );
  }
}
