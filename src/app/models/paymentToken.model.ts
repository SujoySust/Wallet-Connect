import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime';
import { imageLinkAddMiddleware } from '../middlewares/imageLinkAdd.middleware';
import { BlockchainModel } from '../modules/staff/blockchain/blockchain.model';

@ObjectType()
export class PaymentTokenModel {
  @Field(() => Int)
  id: number;
  blockchain_id: number;
  name: string;
  type: number;
  total_decimal: number;
  @Field(() => Decimal)
  min_amount_to_execute_auction: Decimal;
  @Field(() => Decimal)
  usd_rate: Decimal;
  @Field({ middleware: [imageLinkAddMiddleware] })
  logo?: string;
  sync_rate_status: number;
  token_symbol?: string;
  contract_address?: string;
  is_default: number;
  is_wrapable: number;
  status?: number;
  blockchain?: BlockchainModel;
}

@ObjectType()
export class PaymentTokenMappingModel {
  payment_token: PaymentTokenModel;
}

@ObjectType()
export class NativeNwrapTokenModel {
  native_token?: PaymentTokenModel;
  wrap_token?: PaymentTokenModel;
}
