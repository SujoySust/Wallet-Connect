/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ExchangeNftService } from 'src/app/core.services/nft-exchange.service';
import { UserNotificationService } from 'src/app/core.services/user-notification.service';
import {
  BUY_SELL_STATUS_ACTIVE,
  BUY_SELL_STATUS_COMPLETED,
  BUY_SELL_STATUS_EXPIRED,
  EXCHANGE_STATUS_FAILED,
  EXCHANGE_STATUS_IN_PROGRESS,
  NOTIFICATION_EVENTS_AUCTION_EXPIRATION,
  SELL_OFFER_TYPE_ACUTION,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import { app, getUidFromTime, marketplace_url, prisma_client, __ } from 'src/app/helpers/functions';
import { LOG_LEVEL_ERROR, MyLogger, newConsole } from 'src/libs/log/logger.service';
import { Exchange } from '../exchange/exchange.model';
import { ExchangeService } from '../exchange/exchange.service';
import { BuyOffer } from './buy/buy-offer.model';
import { OfferValidation } from './offer.validation';
import { SellOffer } from './sell/sell-offer.model';

@Injectable()
export class AuctionService {
  private logger: MyLogger;
  constructor() {
    this.logger = new MyLogger('auction.log');
  }

  async processAuction(sellOfferId: number) {
    const sell = await prisma_client.sellOffer.findFirst({
      where: {
        id: sellOfferId,
        type: SELL_OFFER_TYPE_ACUTION,
        status: {
          not: BUY_SELL_STATUS_COMPLETED,
        },
      },
      include: {
        item: {
          include: {
            collection: true,
            creator: true,
          },
        },
        payment_token: {
          include: {
            blockchain: true,
          },
        },
        user: true,
      },
    });
    if (!sell) {
      this.logger.write(`auction not found, sell_id: ${sellOfferId}`);
      this.logger.write(`---------------------`);
      return;
    }

    if (sell.item.status != STATUS_ACTIVE) {
      this.expireAuction(sell, false);
      this.logger.write(`Item is banned. sell_id: ${sellOfferId}, item_id: ${sell.item_id}`);
      this.logger.write(`---------------------`);
      return;
    }

    if (sell.item.collection.status != STATUS_ACTIVE) {
      this.expireAuction(sell, false);
      this.logger.write(`Collection is banned. sell_id: ${sellOfferId}, collection_id: ${sell.item.collection_id}`);
      this.logger.write(`---------------------`);
      return;
    }

    const exchangeInProgress = await prisma_client.exchange.findFirst({
      where: {
        item_id: sell.item_id,
        sell_offer_id: sell.id,
        status: EXCHANGE_STATUS_IN_PROGRESS,
      },
    });
    if (exchangeInProgress) {
      // this.logger.write(`auction already in progress!!`);
      // this.logger.write(`---------------------`);
      return;
    }

    this.logger.write(`---------------------`);
    this.logger.write(`Auction processing started, sell_id: ${sellOfferId}`);
    const highestBid = await prisma_client.buyOffer.findFirst({
      where: {
        item_id: sell.item_id,
        status: BUY_SELL_STATUS_ACTIVE,
        user_id: {
          not: sell.user_id,
        },
        total_amount: {
          gte: sell.total_amount,
        },
        end_date: {
          gte: new Date(),
        },
        payment_token_id: sell.payment_token_id,
      },
      orderBy: [
        {
          total_amount: 'desc',
        },
        {
          id: 'asc',
        },
      ],
      include: {
        user: true,
      },
    });
    if (!highestBid) {
      await this.expireAuction(sell);
      this.logger.write('No appropriate highest bid found');
      this.logger.write(`Auction expired!! sell_id: ${sell.id}`);
      this.logger.write(`---------------------`);
      return;
    }

    if (Number(highestBid.total_amount) < Number(sell.reserved_price)) {
      await this.expireAuction(sell);
      this.logger.write('Auction expired!!');
      this.logger.write(
        `Highest Bid amount: ${highestBid.total_amount} is less than 
          reserved_price: ${sell.reserved_price}`,
      );
      this.logger.write(`---------------------`);
      return;
    }
    const notificationService = new UserNotificationService();
    await notificationService.checkAndSendEventNotification(
      sell.user,
      NOTIFICATION_EVENTS_AUCTION_EXPIRATION,
      `Your auction is end, We are processing the bids. It will take some time. 
      <a href='${marketplace_url()}/assets/${sell.item.slug
      }'><u>Check it out</u></a>`,
    );

    const exchange = await this.createExchange(sell, highestBid);
    exchange.item = sell.item;
    exchange.payment_token = sell.payment_token;
    exchange.sell_offer = sell;
    exchange.buy_offer = highestBid;
    try {
      const excService = new ExchangeNftService(sell.payment_token.blockchain);
      await excService.init();
      const tx = await excService.exchangeNFTauction(exchange);
      await app.get(ExchangeService).finishExchangeProcess(exchange, tx);
    } catch (e) {
      this.logger.write(`Exchange failed. sell_id: ${sell.id}`);
      this.logger.write(e.stack, LOG_LEVEL_ERROR);
      this.logger.write(`---------------------`);

      await this.expireAuction(sell);
      await prisma_client.exchange.update({
        where: {
          id: exchange.id,
        },
        data: {
          status: EXCHANGE_STATUS_FAILED,
        },
      });
      return;
    }
    this.logger.write(
      `auction processing finished successfully. sell_id: ${sellOfferId}`,
    );
    this.logger.write(`---------------------`);
    return;
  }

  private async expireAuction(sell: SellOffer, sendMail = true) {
    await new OfferValidation().expireSellOffer(sell);
    if (sendMail){
      const notificationService = new UserNotificationService();
      await notificationService.checkAndSendEventNotification(
        sell.user,
        NOTIFICATION_EVENTS_AUCTION_EXPIRATION,
        `Your auction expired. No Sale event happened. You can manually accept the bids. 
        <a href='${marketplace_url()}/assets/${sell.item.slug
        }'><u>Check it out</u></a>`,
      );
    }
      
  }

  private async createExchange(
    sellOffer: SellOffer,
    buyOffer: BuyOffer,
  ): Promise<Exchange> {
    return await prisma_client.exchange.create({
      data: {
        uid: getUidFromTime(),
        total_amount: buyOffer.total_amount,
        status: EXCHANGE_STATUS_IN_PROGRESS,
        sell_offer: {
          connect: {
            id: sellOffer.id,
          },
        },
        buy_offer: {
          connect: {
            id: buyOffer.id,
          },
        },
        seller: {
          connect: {
            id: sellOffer.user_id,
          },
        },
        buyer: {
          connect: {
            id: buyOffer.user_id,
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
}
