import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { Item } from 'src/app/models/item.model';
import { PaymentTokenModel } from 'src/app/models/paymentToken.model';
import { User } from 'src/app/models/user.model';
import { BaseModel } from '../../../libs/model/base.model';
import { BuyOffer } from '../offer/buy/buy-offer.model';
import { SellOffer } from '../offer/sell/sell-offer.model';

@ObjectType()
export class Exchange extends BaseModel {
  @Field(() => String)
  uid: string;

  @Field(() => Int)
  item_id: number;

  @Field(() => Int)
  payment_token_id: number;

  @Field(() => Int, { nullable: true })
  sell_offer_id: number;

  @Field(() => Int, { nullable: true })
  buy_offer_id: number;

  @Field(() => Int, { nullable: true })
  seller_id: number;

  @Field(() => Int, { nullable: true })
  buyer_id: number;

  @Field(() => Decimal, { nullable: true })
  total_amount: Decimal;

  @Field(() => Int, { nullable: true })
  status?: number;

  @Field(() => String, { nullable: true })
  transaction_hash?: string;

  @Field(() => PaymentTokenModel, { nullable: true })
  payment_token?: PaymentTokenModel;

  @Field(() => Item, { nullable: true })
  item?: Item;

  @Field(() => SellOffer, { nullable: true })
  sell_offer?: SellOffer;

  @Field(() => BuyOffer, { nullable: true })
  buy_offer?: BuyOffer;

  @Field(() => User, { nullable: true })
  seller?: User;

  @Field(() => User, { nullable: true })
  buyer?: User;
}
