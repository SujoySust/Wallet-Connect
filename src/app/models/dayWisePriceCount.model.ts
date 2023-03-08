import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DayWisePriceCountModel {
  @Field(() => Date)
  date: Date;

  @Field(() => Float)
  avg_price: number;

  @Field(() => Float)
  sum_price: number;
}
