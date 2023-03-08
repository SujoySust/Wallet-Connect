import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DayWiseCountModel {
  @Field(() => Date)
  date: Date;

  @Field(() => Int)
  total_count: number;
}
