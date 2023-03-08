import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { DayWisePriceCountModel } from 'src/app/models/dayWisePriceCount.model';
import { DayWiseCountModel } from 'src/app/models/dayWiseUserCount.model';
import { DashboardModel } from 'src/app/models/dto/dashboard.model';
import { PriceCalculationModel } from 'src/app/models/priceCalculation.model';
import { GqlAuthGuard } from 'src/libs/auth/gql.auth.guard';
import { DashboardService } from './dashboard.service';

@Resolver()
@UseGuards(GqlAuthGuard('staff'))
export class DashboardResolver {
  constructor(private service: DashboardService) {}

  @Query(() => DashboardModel)
  async getDashboardData(): Promise<DashboardModel> {
    return await this.service.getDashboardData();
  }

  @Query(() => [DayWiseCountModel])
  async getDayWiseUserCount(): Promise<DayWiseCountModel[]> {
    return await this.service.getDayWiseUserCount();
  }

  @Query(() => [DayWiseCountModel])
  async getDayWiseSalesCount(): Promise<DayWiseCountModel[]> {
    return await this.service.getDayWiseSalesCount();
  }
}
