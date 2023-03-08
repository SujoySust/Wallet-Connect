import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CollectionFilter {
  @Field(() => Int, { nullable: true })
  user_id?: number;
  @Field(() => Int, { nullable: true })
  category_id?: number;
  @Field(() => String, { nullable: true })
  query?: string;
}

@ArgsType()
export class CollectionUniqueFilter {
  @Field(() => String, { nullable: true })
  name?: string;
  @Field(() => String, { nullable: true })
  slug?: string;
}

@ArgsType()
export class CollectionWithItemFilter {
  @Field(() => Boolean, { nullable: true })
  withItem?: boolean;
  @Field(() => Int, { nullable: true })
  totalItem?: number;
}
