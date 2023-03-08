/* eslint-disable prettier/prettier */
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BUY_SELL_STATUS_ACTIVE,
  BUY_SELL_STATUS_EXPIRED,
  EXCHANGE_STATUS_FAILED,
  EXCHANGE_STATUS_IN_PROGRESS,
  ITEM_MINT_STATUS_FAILED,
  ITEM_MINT_STATUS_IN_PROGRESS,
  SELL_OFFER_TYPE_ACUTION,
} from '../helpers/coreconstants';
import { app, prisma_client, subMinutes } from '../helpers/functions';
import { CollectionService } from '../modules/collection/collection.service';
import { AuctionService } from '../modules/offer/auction.service';
import { TokenService } from '../modules/staff/token/token.service';

export class CornJobs {

  //Auction job
  @Cron(process.env.AUCTION_CRON_TIME_PATTERN || CronExpression.EVERY_SECOND)
  async checkAuctions() {
    try {
      const finishedAuctions = await prisma_client.sellOffer.findMany({
        where: {
          type: SELL_OFFER_TYPE_ACUTION,
          end_date: {
            lte: new Date(),
          },
          status: BUY_SELL_STATUS_ACTIVE,
        },
      });
      // console.log(finishedAuctions);
      for (let i = 0; i < finishedAuctions.length; i++) {
        new AuctionService().processAuction(finishedAuctions[i].id);
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  //In Progress Exchange and transfer fail job
  @Cron(CronExpression.EVERY_MINUTE)
  async checkInProgressExchangeAndTransfer() {
    try {
      await prisma_client.exchange.updateMany({
        where: {
          status: EXCHANGE_STATUS_IN_PROGRESS,
          created_at: {
            lte: subMinutes(new Date(), 15),      //data which were created 15 mins ago or more
          },
        },
        data: {
          status: EXCHANGE_STATUS_FAILED,
        },
      });
      await prisma_client.transfer.updateMany({
        where: {
          status: EXCHANGE_STATUS_IN_PROGRESS,
          created_at: {
            lte: subMinutes(new Date(), 15),
          },
        },
        data: {
          status: EXCHANGE_STATUS_FAILED,
        },
      });
    } catch (e) {
      console.error(e.stack);
    }
  }

  //Not minted item checking
  @Cron(CronExpression.EVERY_MINUTE)
  async checkNotMintedItem() {
    try {
      await prisma_client.itemActivity.updateMany({
        where: {
          status: ITEM_MINT_STATUS_IN_PROGRESS,
          updated_at: {
            lte: subMinutes(new Date(), 1440),      //data which were updated 1 day ago or more
          },
        },
        data: {
          status: ITEM_MINT_STATUS_FAILED,
        },
      });
    } catch (e) {
      console.error(e.stack);
    }
  }

  //Buy offer expiration
  @Cron(CronExpression.EVERY_MINUTE)
  async checkExpireBuyOffers() {
    try {
      await prisma_client.buyOffer.updateMany({
        where: {
          status: BUY_SELL_STATUS_ACTIVE,
          end_date: {
            lte: new Date(),
          },
        },
        data: {
          signature: null,
          status: BUY_SELL_STATUS_EXPIRED,
        },
      });
    } catch (e) {
      console.error(e.stack);
    }
  }

  //USD rate sync cron
  @Cron(CronExpression.EVERY_2_HOURS)
  async syncUsdRates() {
    try {
      await app.get(TokenService).syncUsdRates();
    } catch (e) {
      console.error(e.stack);
    }
  }
  
  //Ranking sync cron
  @Cron(process.env.RANKING_SYNC_CRON_TIME_PATTERN || CronExpression.EVERY_2_HOURS)
  async syncRankingList() {
    try {
      await app.get(CollectionService).synceRankingList();
    } catch (e) {
      console.error(e.stack);
    }
  }
}
