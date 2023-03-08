/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  BUY_SELL_STATUS_ACTIVE,
  BUY_SELL_STATUS_CANCELLED,
  BUY_SELL_STATUS_COMPLETED,
  EXCHANGE_STATUS_DONE,
  EXCHANGE_STATUS_FAILED,
  EXCHANGE_STATUS_IN_PROGRESS,
  ITEM_EVENT_SALES,
  NOTIFICATION_EVENTS_ITEM_SOLD,
  NOTIFICATION_EVENTS_SUCCESSFULLY_PURCHASED,
  SELL_OFFER_TYPE_ACUTION,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import { User } from 'src/app/models/user.model';
import {
  app,
  errorResponse,
  marketplace_url,
  prisma_client,
  processException,
  successResponse,
  toMilliS,
  __,
} from '../../helpers/functions';
import { TransactionReceipt } from 'web3-eth';
import { ItemService } from '../item/item.service';
import { ExchangeData } from './exchange.data';
import { Exchange } from './exchange.model';
import { ExchangeValidation } from './exchange.validation';
import { MyLogger } from 'src/libs/log/logger.service';
import { EventLog } from 'web3-core';
import { BlockchainModel } from '../staff/blockchain/blockchain.model';
import { PrismaService } from 'src/libs/prisma/prisma.service';
import { UserNotificationService } from 'src/app/core.services/user-notification.service';

@Injectable()
export class ExchangeService extends ExchangeValidation {
  constructor(
    private readonly exchangeData: ExchangeData,
  ) {
    super();
  }

  /**
   * Buyer buy sell-offer created by seller
   * @param sellOfferId
   * @param user
   * @returns
   */
  async buyNow(sellOfferId: number, user: User): Promise<Exchange> {
    try {
      const { sellOffer } = await this.buyNowValidation(sellOfferId, user);
      const exchange = await this.buyNowProcess(sellOffer, user);
      // this.exchagneFailSetTimeOut(exchange);
      return exchange;
    } catch (e) {
      processException(e);
    }
  }

  /**
   * Seller accecpt buy-offer requested from buyer
   * @param buyOfferId
   * @param user
   * @returns
   */
  async acceptOffer(buyOfferId: number, user: User): Promise<Exchange> {
    try {
      const { buyOffer } = await this.acceptOfferValidation(buyOfferId, user);
      const exchange = await this.acceptOfferProcess(buyOffer, user);
      // this.exchagneFailSetTimeOut(exchange);
      return exchange;
    } catch (e) {
      processException(e);
    }
  }

  exchagneFailSetTimeOut(exchange: Exchange) {
    try {
      setTimeout(async () => {
        await prisma_client.exchange.updateMany({
          data: {
            status: EXCHANGE_STATUS_FAILED,
          },
          where: {
            id: exchange.id,
            status: EXCHANGE_STATUS_IN_PROGRESS,
          },
        });
      }, toMilliS(15));
    } catch (e) {
      console.error(e.stack);
    }
  }

  /**
   * Finish up exchange process
   * @param exchangeId
   * @param user
   * @returns
   */
  async finishExchage(
    exchangeId: number,
    transactionHash: string,
  ) {
    try {
      const { exchange, tx, alreadyDone } = await this.exchangeFinishValidation(
        exchangeId,
        transactionHash,
      );
      if (alreadyDone) {
        return successResponse(__('Exchange Updated successfully!'));
      }
      const finished_exchange = await this.finishExchangeProcess(exchange, tx);

      if (finished_exchange) {
        return successResponse(__('Exchange Updated successfully!'));
      } else {
        return errorResponse(__('Exchange update failed!'));
      }
    } catch (e) {
      processException(e);
    }
  }

  async cancelExchang(exchangeId: number, user: User) {
    try {
      const exchange = await prisma_client.exchange.findFirst({
        where: {
          id: exchangeId,
          status: EXCHANGE_STATUS_IN_PROGRESS,
        },
      });
      if (!exchange) this.throwError(__('Exchange Not found!'));
      if (!(exchange.seller_id === user.id || exchange.buyer_id === user.id))
        this.throwError(__('Invalid user!'));

      const cancelledExchange = await prisma_client.exchange.update({
        where: {
          id: exchange.id,
        },
        data: {
          status: EXCHANGE_STATUS_FAILED,
        },
      });
      if (cancelledExchange) {
        return successResponse(__('Exchange cancelled successfully!'));
      } else {
        return errorResponse(__('Exchange cancelled failed!'));
      }
    } catch (e) {
      processException(e);
    }
  }

  // Buyer buy now process for one sell offer created by seller
  async buyNowProcess(sellOffer, user) {
    const exchangeData = await this.exchangeData.prepareBuyNowData(sellOffer);
    return await prisma_client.exchange.create({
      data: {
        ...exchangeData,
        sell_offer: {
          connect: {
            id: sellOffer.id,
          },
        },
        seller: {
          connect: {
            id: sellOffer.user_id,
          },
        },
        buyer: {
          connect: {
            id: user.id,
          },
        },
        item: {
          connect: {
            id: sellOffer.item_id,
          },
        },
        payment_token: {
          connect: {
            id: sellOffer.payment_token_id,
          },
        },
      },
    });
  }

  //Seller Accept offer process for buy request from buyer
  async acceptOfferProcess(buyOffer, user) {
    const exchangeData = await this.exchangeData.prepareAcceptOfferData(
      buyOffer,
    );
    return await prisma_client.exchange.create({
      data: {
        ...exchangeData,
        buy_offer: {
          connect: {
            id: buyOffer.id,
          },
        },
        seller: {
          connect: {
            id: user.id,
          },
        },
        buyer: {
          connect: {
            id: buyOffer.user_id,
          },
        },
        item: {
          connect: {
            id: buyOffer.item_id,
          },
        },
        payment_token: {
          connect: {
            id: buyOffer.payment_token_id,
          },
        },
      },
    });
  }

  // Finish exchange process
  async finishExchangeProcess(
    exchange: Exchange,
    tx: TransactionReceipt | { transactionHash: string; status: boolean },
  ) {
    // return await prisma_client.$transaction(async (prisma) => {

    // });

    const prisma = prisma_client;
    const updatedExchange = await prisma.exchange.update({
      where: {
        id: exchange.id,
      },
      data: {
        status: tx.status ? EXCHANGE_STATUS_DONE : EXCHANGE_STATUS_FAILED,
        transaction_hash: tx.transactionHash,
      },
      include: {
        item: {
          include: {
            creator: true,
          },
        },
        buy_offer: true,
        sell_offer: true,
        seller: true,
        buyer: true,
      },
    });
    if (updatedExchange && tx.status) {
      await this.updateItem(updatedExchange, prisma);
      await this.updateBuySell(updatedExchange, prisma);
      await this.updatePrice(updatedExchange, prisma);
      await this.cancelMyBuyOffersAfterExchange(updatedExchange, updatedExchange.buyer_id);
      await this.cancelMySellOffersAfterExchange(updatedExchange, updatedExchange.seller_id);
      await this.updateItemActivity(ITEM_EVENT_SALES, updatedExchange, prisma);
      await this.addCreatorEarning(updatedExchange, prisma);
      this.processNotifications(updatedExchange);
    }
    return updatedExchange;
  }

  processNotifications(exchange: Exchange) {
    const notificationService = new UserNotificationService();
    notificationService.checkAndSendEventNotification(exchange.seller, NOTIFICATION_EVENTS_ITEM_SOLD, 
      `Your item has been sold. 
          <a href='${marketplace_url()}/assets/${
            exchange.item.slug
          }'><u>Check it out</u></a>`,);
    notificationService.checkAndSendEventNotification(exchange.buyer, NOTIFICATION_EVENTS_SUCCESSFULLY_PURCHASED, 
      `Youhave puschased an item. 
          <a href='${marketplace_url()}/assets/${
            exchange.item.slug
          }'><u>Check it out</u></a>`,);
  }

  async cancelMyBuyOffersAfterExchange(exchange: Exchange, userId: number) {
    try {
      await prisma_client.buyOffer.updateMany({
        where: {
          user_id: userId,
          item_id: exchange.item_id,
          status: BUY_SELL_STATUS_ACTIVE,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_CANCELLED,
        },
      });
      /* app
        .get(ItemService)
        .itemActivitySave(
          exchange.item_id,
          ITEM_EVENT_BUY_OFFER_CANCEL,
          userId,
        ); */
    } catch (e) {
      console.error(e.stack);
    }
  }

  async cancelMySellOffersAfterExchange(exchange: Exchange, userId: number) {
    try {
      await prisma_client.sellOffer.updateMany({
        where: {
          user_id: userId,
          item_id: exchange.item_id,
          status: BUY_SELL_STATUS_ACTIVE,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_CANCELLED,
        },
      });
      /* app
        .get(ItemService)
        .itemActivitySave(exchange.item_id, ITEM_EVENT_LISTING_CANCEL, userId); */
    } catch (e) {
      console.error(e.stack);
    }
  }

  async updateItem(
    exchange: Exchange,
    prisma: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    await prisma.item.update({
      where: {
        id: exchange.item_id,
      },
      data: {
        owner_id: exchange.buyer_id,
        price: 0,
        payment_token_id: null,
      },
    });
  }

  // creator earning data saving
  async addCreatorEarning(exchange: Exchange, prisma: PrismaService) {
    try {
      const offer = exchange.buy_offer ?? exchange.sell_offer;
      if (Number(offer.royalty_amount) <= 0) return;
      if (!prisma) prisma = prisma_client;
      await prisma.creatorEarning.create({
        data: {
          exchange_id: exchange.id,
          user_id: exchange.item.creator.id,
          item_id: exchange.item.id,
          collection_id: exchange.item.collection_id,
          royalty_address: offer.royalty_address,
          royalty_amount: offer.royalty_amount,
          payment_token_id: exchange.payment_token_id,
        }
      });
    } catch (e) {
      console.error(e.stack);
    }
  }

  // Item activity update..
  async updateItemActivity(event: number, exchange: Exchange, prisma: PrismaService) {
    const itemService = app.get(ItemService);
    await itemService.itemActivitySave(
      exchange.item_id,
      event,
      exchange.seller_id,
      exchange.buyer_id,
      exchange.transaction_hash,
      exchange.total_amount.toString(),
      STATUS_ACTIVE,
      prisma,
      exchange.payment_token_id,
    );
  }

  // Buy sell status update
  async updateBuySell(
    exchange: Exchange,
    prisma: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    if (!prisma) prisma = prisma_client;
    if (exchange.buy_offer_id) {
      await prisma.buyOffer.update({
        where: {
          id: exchange.buy_offer_id,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_COMPLETED,
        },
      });
    }

    if (exchange.sell_offer_id) {
      await prisma.sellOffer.update({
        where: {
          id: exchange.sell_offer_id,
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_COMPLETED,
        },
      });
    }
  }

  // Item price table update
  async updatePrice(
    exchange: Exchange,
    prisma: Omit<
      PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation
      >,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
    >,
  ) {
    await prisma.price.create({
      data: {
        item_id: exchange.item_id,
        amount: exchange.total_amount,
        payment_token_id: exchange.payment_token_id,
      },
    });
  }

  async processExchangeForEvent(
    event: EventLog,
    blockchain: BlockchainModel,
  ) {
    const logger = new MyLogger(`${blockchain.slug}-xchange-event.log`);
    try {
      logger.write(`---------------------`);
      logger.write(`on data`);
      logger.write(`txHash: ${event.transactionHash}`);
      const exchangeId = event.returnValues['exchangeId'];
      logger.write(`exchangeId: ${exchangeId}`);

      const exchange = await prisma_client.exchange.findFirst({
        where: {
          uid: exchangeId,
        },
        include: {
          item: {
            include: {
              creator: true,
            },
          },
          sell_offer: true,
          buy_offer: true,
        },
      });
      if (!exchange) {
        logger.write('Exchange not found');
      }
      else if (
        exchange.sell_offer &&
        exchange.sell_offer.type == SELL_OFFER_TYPE_ACUTION
      ) {
        logger.write('Auction exchange. Skipped!!');
      }
      else if (exchange.status == EXCHANGE_STATUS_DONE) {
        logger.write('Exchange already done');
        logger.write(`exchange: ${JSON.stringify(exchange)}`);
      } else {
        logger.write('Exchange finishing process started...');
        const tx = {
          transactionHash: event.transactionHash,
          status: true,
        };
        await this.finishExchangeProcess(exchange, tx);
        logger.write('Exchange finishing process end.');
      }
      logger.write(`---------------------`);
    } catch (e) {
      logger.write(e.satck);
      logger.write(`---------------------`);
    }
  }

}
