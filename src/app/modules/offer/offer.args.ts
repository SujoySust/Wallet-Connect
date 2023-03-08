import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class BuyOfferUserTypeArgs {
  @Field({ nullable: true })
  offer_receiver_id?: number;
  @Field({ nullable: true })
  offer_maker_id?: number;
}

@ArgsType()
export class SellOfferUserTypeArgs {
  @Field({ nullable: true })
  user_id?: number;
  @Field({ nullable: true })
  user_wallet_address?: string;
}
