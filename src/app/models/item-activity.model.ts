import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
import { Item } from './item.model';
import { PaymentTokenModel } from './paymentToken.model';
import { User } from './user.model';

@ObjectType()
export class ItemActivity extends BaseModel {
  item_id: number;
  from_id: number;
  to_id?: number;

  @Field(() => String, { nullable: true })
  hash?: string;

  @Field(() => String, { nullable: true })
  amount: string;
  payment_token_id: number;
  event: number;
  status: number;

  @Field(() => Item, { nullable: true })
  item?: Item;

  @Field(() => User, { nullable: true })
  from?: User;

  @Field(() => User, { nullable: true })
  to?: User;

  @Field(() => PaymentTokenModel, { nullable: true })
  payment_token?: PaymentTokenModel;
}
