import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class StaffUserFilter {
  @Field(() => Int, { nullable: true })
  status?: number;
  @Field(() => String, { nullable: true })
  query?: string;
}
