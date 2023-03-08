import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class ItemUserArgs {
  @Field({ nullable: true })
  viewer_id?: number;
  @Field({ nullable: true })
  viewer_wallet_address?: string;
}
