import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { BaseModel } from '../../libs/model/base.model';
import { Item } from './item.model';
import { PaymentTokenModel } from './paymentToken.model';

@ObjectType()
export class Price extends BaseModel {
  item_id: number;

  @Field(() => Decimal)
  amount: Decimal;

  @Field(() => Int)
  payment_token_id: number;

  @Field(() => Float, { nullable: true })
  item?: Item;

  @Field(() => PaymentTokenModel)
  payment_token?: PaymentTokenModel;
}
