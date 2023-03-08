import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { DayWisePriceCountModel } from './dayWisePriceCount.model';

@ObjectType()
export class PriceCalculationModel {
  @Field(() => Float)
  total_avg_price: number;

  @Field(() => Float)
  total_sum_price: number;

  @Field(() => [DayWisePriceCountModel])
  day_wise_price_count: DayWisePriceCountModel[];
}
