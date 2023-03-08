import { Injectable } from '@nestjs/common';
import { Decimal } from '@prisma/client/runtime';
import {
  EXCHANGE_STATUS_DONE,
  STATUS_ACTIVE,
} from 'src/app/helpers/coreconstants';
import {
  prisma_client,
  processException,
  successResponse,
} from 'src/app/helpers/functions';
import { DayWiseCountModel } from 'src/app/models/dayWiseUserCount.model';
import { processAmountSum } from '../report/report.process';
import { ReportService } from '../report/report.service';

@Injectable()
export class DashboardService {
  private reportService: ReportService;
  constructor() {
    this.reportService = new ReportService();
  }
  async getDashboardData() {
    try {
      const blockchain_count = await prisma_client.blockchain.count();
      const collection_count = await prisma_client.collection.count();
      const item_count = await prisma_client.item.count();
      const user_count = await prisma_client.user.count();
      const sell_offer_count = await prisma_client.sellOffer.count({
        where: {
          status: STATUS_ACTIVE,
          end_date: {
            gt: new Date(),
          },
        },
      });

      const sales = await prisma_client.exchange.aggregate({
        where: {
          status: EXCHANGE_STATUS_DONE,
        },
        _count: true,
      });

      const paymentTokenFees = await this.reportService.getFeesByPaymentToken();
      const allFees = processAmountSum(paymentTokenFees);
      return {
        total_blockchain: blockchain_count,
        total_collection: collection_count,
        total_item: item_count,
        total_users: user_count,
        total_sell_offer: sell_offer_count,
        total_sales: sales._count,
        total_sale_amount: new Decimal(allFees.total_amount),
        total_income: new Decimal(allFees.fee_amount),
      };
    } catch (e) {
      processException(e);
    }
  }

  async getDayWiseUserCount(): Promise<DayWiseCountModel[]> {
    try {
      return await prisma_client.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(id) as total_count 
      FROM users 
      WHERE status=${STATUS_ACTIVE}
      AND
      DATE(created_at) >= DATE_TRUNC('DAY', current_date - interval '30' DAY)
      AND DATE(created_at) <= current_date
      GROUP BY DATE(created_at);`;
    } catch (e) {
      processException(e);
    }
  }

  async getDayWiseSalesCount(): Promise<DayWiseCountModel[]> {
    try {
      return await prisma_client.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(id) as total_count 
          FROM exchanges 
          WHERE status=${EXCHANGE_STATUS_DONE}
          AND
          DATE(created_at) >= DATE_TRUNC('DAY', current_date - interval '30' DAY)
          AND DATE(created_at) <= current_date
          GROUP BY DATE(created_at)`;
    } catch (e) {
      processException(e);
    }
  }
}
