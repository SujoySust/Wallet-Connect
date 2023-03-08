import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { __ } from 'src/app/helpers/functions';
@InputType()
export class PaymentTokenBaseDto {
  @Field()
  @IsNotEmpty()
  blockchain_id: number;

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  token_symbol: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  contract_address: string;

  @Field()
  total_decimal: number;

  @Field(() => Float)
  min_amount_to_execute_auction: number;

  @Field(() => Float, { nullable: true })
  usd_rate: number;

  @Field()
  type: number;

  @Field({ nullable: true })
  is_default?: number;

  @Field({ nullable: true })
  is_wrapable?: number;

  @Field({ nullable: true })
  sync_rate_status?: number;

  @Field(() => GraphQLUpload, { nullable: true })
  logo?: FileUpload;

  @Field({ nullable: true })
  status: number;
}

@InputType()
export class CreatePaymentTokenDto extends PaymentTokenBaseDto {}

@InputType()
export class UpdatePaymentTokenDto extends PaymentTokenBaseDto {}
