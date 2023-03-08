import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class RoleFilter {
  @Field(() => String, { nullable: true })
  query?: string;
}
