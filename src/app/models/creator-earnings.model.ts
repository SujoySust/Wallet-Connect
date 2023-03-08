import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
import { User } from './user.model';
import { Collection } from './collection.model';
import { Decimal } from '@prisma/client/runtime';
import { Item } from './item.model';
import { PaymentTokenModel } from './paymentToken.model';
import { Exchange } from '../modules/exchange/exchange.model';

@ObjectType()
export class CreatorEarning extends BaseModel {
  @Field(() => Int)
  exchange_id: number;

  @Field(() => Int)
  collection_id: number;

  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  item_id: number;

  @Field(() => Int)
  payment_token_id: number;
  royalty_address?: string;
  @Field(() => Float)
  royalty_percentage: number;

  @Field(() => Decimal)
  royalty_amount: Decimal;

  exchange?: Exchange;
  @Field(() => Collection)
  collection?: Collection;
  @Field(() => User)
  user?: User;
  @Field(() => Item)
  item?: Item;
  @Field(() => PaymentTokenModel)
  payment_token?: PaymentTokenModel;
}
