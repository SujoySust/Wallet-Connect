import { IsNotEmpty, MinLength } from 'class-validator';
import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { __ } from 'src/app/helpers/functions';
import { IsEthAddress } from 'src/libs/decorators/eth-address.decorator';

@InputType()
export class LoginInput {
  @Field()
  username: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

@ObjectType()
export class WalletLoginMessage {
  nonce: string;
  login_message?: string;
}

@InputType()
export class WalletLoginInput {
  @Field()
  @IsNotEmpty()
  @IsEthAddress()
  address: string;

  @Field()
  @IsNotEmpty({
    message: () => __("Signature can't be empty."),
  })
  signature: string;

  @Field()
  @IsNotEmpty()
  nonce: string;
}
