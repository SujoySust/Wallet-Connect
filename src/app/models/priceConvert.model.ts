import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PriceConvertModel {
  @Field(() => Float, { nullable: true })
  usd_price?: number;

  @Field(() => Float, { nullable: true })
  native_price?: number;
}
