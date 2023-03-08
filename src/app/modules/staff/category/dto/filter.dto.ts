import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class CategoryFilter {
  @Field(() => String, { nullable: true })
  query?: string;

  @Field(() => Number, { nullable: true })
  status?: number;
}
