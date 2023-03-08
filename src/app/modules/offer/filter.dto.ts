import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class SellOfferFilter {
  @Field(() => Int, { nullable: true })
  type?: number;
  @Field(() => Int, { nullable: true })
  user_id?: number;
}

@ArgsType()
export class BuyOfferFilter {
  @Field(() => Int, { nullable: true })
  collection_id?: number;
}
