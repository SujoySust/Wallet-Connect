import { Field, Float, InputType } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, Max, Min } from 'class-validator';
import {
  MAX_OFFER_AMOUNT,
  MIN_OFFER_AMOUNT,
} from 'src/app/helpers/coreconstants';

@InputType()
class BaseOfferDto {
  @IsNotEmpty()
  @Field()
  type: number;

  @Field({ nullable: true })
  signature?: string;

  @IsNotEmpty()
  @Field()
  nonce: string;

  @IsNotEmpty()
  @Field()
  item_id: number;

  @IsNotEmpty()
  @Field()
  payment_token_id: number;

  @Max(MAX_OFFER_AMOUNT)
  @Min(MIN_OFFER_AMOUNT)
  @IsNotEmpty()
  @Field(() => Float)
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  @Field()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  @Field()
  end_date: string;
}

@InputType()
export class CreateBuyOfferDto extends BaseOfferDto {}

@InputType()
export class CreateBidDto extends BaseOfferDto {
  @IsNotEmpty()
  @Field()
  sell_offer_id: number;
}

@InputType()
export class CreateSellOfferDto extends BaseOfferDto {
  @Field(() => String, { nullable: true })
  reserved_address?: string;

  @Field({ nullable: true })
  reserved_price?: number;
}
