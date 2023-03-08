import { Args, Query, Resolver } from '@nestjs/graphql';
import { ReportService } from './report.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/libs/auth/gql.auth.guard';
import { AmountCalculationModel } from 'src/app/models/amountCalculation.model';
import { ItemActivitiesConnection } from 'src/app/models/pagination/item-activities-connection.model';
import { PaginationArgs } from 'src/libs/graphql/pagination/pagination.args';
import { ItemActivityFilter } from '../../item/dto/filter.dto';
import { ExchangeConnection } from 'src/app/models/pagination/exchange-connection.model';

@Resolver()
@UseGuards(GqlAuthGuard('staff'))
export class ReportResolver {
  constructor(private readonly reportService: ReportService) {}

  @Query(() => ItemActivitiesConnection)
  async getStaffItemActivitiesPaginate(
    @Args() paginate: PaginationArgs,
    @Args({ nullable: true }) filter: ItemActivityFilter,
  ): Promise<ItemActivitiesConnection> {
    return this.reportService.getStaffItemActivitiesPaginate(paginate, filter);
  }

  @Query(() => [AmountCalculationModel], { nullable: true })
  async getFeeByPaymentToken(): Promise<AmountCalculationModel[]> {
    return await this.reportService.getFeesByPaymentToken();
  }

  @Query(() => ExchangeConnection)
  async getStaffSalesDataPaginate(
    @Args() paginate: PaginationArgs,
    @Args('query', { nullable: true }) query: string,
  ): Promise<ExchangeConnection> {
    return await this.reportService.getStaffSalesDataPaginate(paginate, query);
  }
}
