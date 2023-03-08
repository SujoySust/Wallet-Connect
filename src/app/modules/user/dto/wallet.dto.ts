import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WalletDto {
  @Field({ nullable: true })
  walletAddress: string;
}
