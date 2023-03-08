import { Injectable } from '@nestjs/common';
import { prisma_client } from 'src/app/helpers/functions';
import { AmountCalculationModel } from 'src/app/models/amountCalculation.model';
import { ItemActivitiesConnection } from 'src/app/models/pagination/item-activities-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { ItemActivityFilter } from '../../item/dto/filter.dto';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { ItemActivity, Prisma } from '@prisma/client';
import { pOptions } from 'src/libs/graphql/pagination/number-cursor';
import { ExchangeConnection } from 'src/app/models/pagination/exchange-connection.model';
import { Exchange } from '../../exchange/exchange.model';
import { filterItemActivityList, salesFilter } from './report.filter';
import { feeCalulation } from './report.process';

@Injectable()
export class ReportService {
  async getStaffItemActivitiesPaginate(
    paginate: PaginationArgs,
    filter?: ItemActivityFilter,
  ): Promise<ItemActivitiesConnection> {
    return findManyCursorConnection<
      ItemActivity,
      Pick<Prisma.ItemActivityWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.itemActivity.findMany({
          where: filterItemActivityList(filter),
          include: {
            from: true,
            to: true,
            item: true,
            payment_token: true,
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.itemActivity.count({
          where: filterItemActivityList(filter),
        }),
      paginate,
      pOptions,
    );
  }

  async getStaffSalesDataPaginate(
    paginate: PaginationArgs,
    query?: string,
  ): Promise<ExchangeConnection> {
    return findManyCursorConnection<
      Exchange,
      Pick<Prisma.ExchangeWhereUniqueInput, 'id'>
    >(
      (args) =>
        prisma_client.exchange.findMany({
          where: salesFilter(query),
          include: {
            item: true,
            buyer: true,
            seller: true,
            payment_token: {
              include: {
                blockchain: true,
              },
            },
          },
          orderBy: { id: 'desc' },
          ...args,
        }),
      () =>
        prisma_client.exchange.count({
          where: salesFilter(query),
        }),
      paginate,
      pOptions,
    );
  }

  async getFeesByPaymentToken(): Promise<AmountCalculationModel[]> {
    const offer = await feeCalulation();
    return await Promise.all(
      offer.map(async (item) => {
        return {
          total_amount: item._sum.total_amount,
          fee_amount: item._sum.fee_amount,
          seller_amount: item._sum.seller_amount,
          payment_token: await prisma_client.paymentToken.findFirst({
            where: {
              id: item.payment_token_id,
            },
            include: {
              blockchain: true,
            },
          }),
        };
      }),
    );
  }
}
