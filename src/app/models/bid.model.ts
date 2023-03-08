import { Field, Float, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
import { Item } from './item.model';
import { User } from './user.model';

export const BidStatus = {
  PENDING: 'PENDING',
  TRANSFERED: 'TRANSFERED',
  CANCELED: 'CANCELED',
};

export type BidStatus = typeof BidStatus[keyof typeof BidStatus];

@ObjectType()
export class Bid extends BaseModel {
  itemId: number;
  senderId: number;

  @Field(() => Float)
  amount: number;

  @Field(() => String)
  status: BidStatus;

  @Field(() => Item, { nullable: true })
  item?: Item;

  @Field(() => User, { nullable: true })
  sender?: User;
}
