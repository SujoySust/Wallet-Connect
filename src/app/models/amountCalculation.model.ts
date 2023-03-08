import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { PaymentTokenModel } from 'src/app/models/paymentToken.model';

@ObjectType()
export class AmountCalculationModel {
  @Field(() => Decimal, { nullable: true })
  total_amount?: Decimal;

  @Field(() => Decimal, { nullable: true })
  seller_amount?: Decimal;

  @Field(() => Decimal, { nullable: true })
  fee_amount?: Decimal;

  @Field(() => PaymentTokenModel, { nullable: true })
  payment_token?: PaymentTokenModel;
}
