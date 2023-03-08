import { ObjectType, HideField, Field } from '@nestjs/graphql';
import { imageLinkAddMiddleware } from 'src/app/middlewares/imageLinkAdd.middleware';
import { PaymentTokenModel } from 'src/app/models/paymentToken.model';

@ObjectType()
export class BlockchainBaseModel {
  id: number;
  network_name: string;
  description?: string;
  slug: string;
  chain_id?: number;
  provider: number;
  explorer_url?: string;
  currency_symbol: string;
  nft_contract?: string;
  public_rpc_url?: string;
  exchange_contract?: string;
  @Field({ middleware: [imageLinkAddMiddleware] })
  logo?: string;
  status?: number;
  payment_tokens?: PaymentTokenModel[];
}

@ObjectType()
export class BlockchainModel extends BlockchainBaseModel {
  @HideField()
  api_key?: string;
  @HideField()
  rpc_url?: string;
  @HideField()
  wss_url?: string;
}

@ObjectType()
export class BlockchainStaffModel extends BlockchainBaseModel {
  api_key?: string;
  rpc_url?: string;
  public_rpc_url?: string;
  wss_url?: string;
}
