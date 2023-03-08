import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CollectionPriceModel {
  @Field(() => Float)
  floor_price: number;

  @Field(() => Float)
  volume: number;
}
