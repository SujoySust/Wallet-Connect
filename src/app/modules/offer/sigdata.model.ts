import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class domainData {
  @Field()
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

@ObjectType()
export class OrderType {
  @Field()
  name: string;
  type: string;
}

@ObjectType()
export class type {
  @Field(() => [OrderType])
  SellOrder?: OrderType[];
  @Field(() => [OrderType])
  BuyOrder?: OrderType[];
}

@ObjectType()
export class offerValue {
  @Field()
  _nonce: string;
  _startsAt: number;
  _expiresAt: number;
  _nftContract: string;
  _nftTokenId: string;
  _paymentTokenContract: string;
  _seller?: string;
  _buyer?: string;
  _royaltyPayTo: string;
  _sellerAmount: string;
  _feeAmount: string;
  _royaltyAmount: string;
  _totalAmount: string;
}

@ObjectType()
export class SigDataModel {
  @Field()
  domainData: domainData;
  type: type;
  offerValue: offerValue;
}
