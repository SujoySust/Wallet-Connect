import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { Item } from 'src/app/models/item.model';
import { PaymentTokenModel } from 'src/app/models/paymentToken.model';
import { User } from 'src/app/models/user.model';
import { BaseModel } from '../../../../libs/model/base.model';

@ObjectType()
export class SellOffer extends BaseModel {
  @Field(() => String)
  uid: string;

  @Field(() => String)
  signature?: string;

  @Field(() => String)
  nonce: string;

  @Field(() => Int)
  type: number;

  @Field(() => Int)
  item_id: number;

  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  payment_token_id: number;

  @Field(() => Decimal)
  total_amount: Decimal;

  @Field(() => Decimal)
  seller_amount: Decimal;

  @Field(() => Float)
  fee_percentage: number;

  @Field(() => Decimal)
  fee_amount: Decimal;
  royalty_address?: string;
  @Field(() => Float)
  royalty_percentage: number;

  @Field(() => Decimal)
  royalty_amount: Decimal;

  @Field(() => Date)
  start_date: Date;

  @Field(() => Date)
  end_date: Date;

  @Field(() => Int)
  status: number;

  @Field(() => String, { nullable: true })
  reserved_address?: string;

  @Field(() => Decimal, { nullable: true })
  reserved_price?: Decimal;

  @Field(() => Item, { nullable: true })
  item?: Item;

  @Field(() => PaymentTokenModel, { nullable: true })
  payment_token?: PaymentTokenModel;

  @Field(() => User, { nullable: true })
  user?: User;
}
