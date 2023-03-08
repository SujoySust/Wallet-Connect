import { ArgsType, Field, Float, Int } from '@nestjs/graphql';
@ArgsType()
export class ItemFilter {
  @Field(() => [Int], { nullable: true })
  collection_id?: Array<number>;

  @Field(() => Int, { nullable: true })
  owner_id?: number;

  @Field(() => Int, { nullable: true })
  creator_id?: number;

  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => [Int], { nullable: true })
  status?: Array<number>;

  @Field(() => [Int], { nullable: true })
  blockchain_id?: Array<number>;

  @Field(() => [Int], { nullable: true })
  category_id?: Array<number>;

  @Field(() => [Int], { nullable: true })
  payment_token_id?: Array<number>;

  @Field(() => Float, { nullable: true })
  min_price?: number;

  @Field(() => Float, { nullable: true })
  max_price?: number;
}

@ArgsType()
export class ItemActivityFilter {
  @Field(() => Int, { nullable: true })
  user_id?: number;
  @Field(() => Int, { nullable: true })
  item_id?: number;
  @Field(() => [Int], { nullable: true })
  collection_id?: number[];
  @Field(() => [Int], { nullable: true })
  blockchain_id?: Array<number>;
  @Field(() => [Int], { nullable: true })
  event_type?: Array<number>;
  @Field(() => String, { nullable: true })
  query?: string;
}
