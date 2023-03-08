import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { Collection } from './collection.model';
import { PaymentTokenModel } from './paymentToken.model';
import { User } from './user.model';

@ObjectType()
export class Ranking {
  @Field(() => Int)
  id: number;
  @Field(() => Int)
  collection_id: number;
  @Field(() => Int)
  blockchain_id: number;
  @Field(() => Int)
  native_token_id: number;
  @Field(() => Int)
  item_count: number;

  @Field(() => Decimal, { nullable: true })
  total_volume_in_native?: Decimal;
  @Field(() => Decimal, { nullable: true })
  total_volume_in_usd?: Decimal;

  @Field(() => Decimal, { nullable: true })
  one_day_volume_in_native?: Decimal;
  @Field(() => Decimal, { nullable: true })
  one_day_volume_in_usd?: Decimal;
  @Field(() => Float)
  one_day_volume_percent?: number;

  @Field(() => Decimal, { nullable: true })
  seven_days_volume_in_native?: Decimal;
  @Field(() => Decimal, { nullable: true })
  seven_days_volume_in_usd?: Decimal;
  @Field(() => Float)
  seven_days_volume_percent?: number;

  @Field(() => Decimal, { nullable: true })
  thirty_days_volume_in_native?: Decimal;
  @Field(() => Decimal, { nullable: true })
  thirty_days_volume_in_usd?: Decimal;
  @Field(() => Float)
  thirty_days_volume_percent?: number;

  @Field(() => Decimal, { nullable: true })
  floor_price_in_native?: Decimal;
  @Field(() => Decimal, { nullable: true })
  floor_price_in_usd?: Decimal;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Date, { nullable: true })
  updated_at: Date;

  @Field(() => Collection, { nullable: true })
  collection?: Collection;

  @Field(() => PaymentTokenModel, { nullable: true })
  native_token?: PaymentTokenModel;

  @Field(() => PaymentTokenModel, { nullable: true })
  user?: User;
}
