/* eslint-disable @typescript-eslint/ban-types */
import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';

@ObjectType()
export class DashboardModel {
  @Field(() => Int, { nullable: true })
  total_blockchain?: number;

  @Field(() => Int, { nullable: true })
  total_collection?: number;

  @Field(() => Int, { nullable: true })
  total_item?: number;

  @Field(() => Int, { nullable: true })
  total_sales?: number;

  @Field(() => Float, { nullable: true })
  total_sale_amount?: Decimal;

  @Field(() => Int, { nullable: true })
  total_sell_offer?: number;

  @Field(() => Float, { nullable: true })
  total_income?: Decimal;

  @Field(() => Int, { nullable: true })
  total_users?: number;
}
