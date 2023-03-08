import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class UserUniqueFilter {
  @Field(() => String, { nullable: true })
  username?: string;
  @Field(() => String, { nullable: true })
  email?: string;
}

@ArgsType()
export class UserFilter {
  @Field(() => String, { nullable: true })
  query?: string;
}
