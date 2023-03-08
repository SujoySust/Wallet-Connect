import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PaymentTokenFilter {
  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Int, { nullable: true })
  collection_id?: number;

  @Field(() => Int, { nullable: true })
  chain_id?: number;

  @Field(() => Int, { nullable: true })
  blockchain_id?: number;

  @Field(() => Int, { nullable: true })
  status?: number;
}

@ArgsType()
export class PaymentTokenFeesFilter {
  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Int, { nullable: true })
  status?: number;
}
