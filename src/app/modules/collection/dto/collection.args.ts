import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CollectionUserArgs {
  @Field({ nullable: true })
  user_id?: number;
  @Field({ nullable: true })
  user_wallet_address?: string;
}
