import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
import { imageLinkAddMiddleware } from '../middlewares/imageLinkAdd.middleware';
import { BuyOffer } from '../modules/offer/buy/buy-offer.model';
import { Exchange } from '../modules/exchange/exchange.model';
import { SellOffer } from '../modules/offer/sell/sell-offer.model';
import { Collection } from './collection.model';
import { ItemActivity } from './item-activity.model';
import { User } from './user.model';
import { Price } from './price.model';
import { PaymentTokenModel } from './paymentToken.model';
import { Decimal } from '@prisma/client/runtime';
import { ItemFavouriteList } from './item-favourite-list.model';

@ObjectType()
export class ItemProperty {
  @Field(() => ID)
  id: number;
  itemId: number;
  type: string;
  name: string;
  item?: Item;
}

@ObjectType()
export class ItemLevel {
  @Field(() => ID)
  id: number;
  itemId: number;
  name: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  valueof: number;

  item?: Item;
}

@ObjectType()
export class ItemStat {
  @Field(() => ID)
  id: number;
  itemId: number;
  name: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  valueof: number;

  item?: Item;
}

@ObjectType()
export class Like {
  @Field(() => ID)
  id: number;
  itemId: number;
  userId: number;

  item?: Item;
  user?: User;
}

@ObjectType()
export class Nft {
  id?: string;
  tokenUri?: string;
}

export class TokenUri {
  raw: string;
  gateway: string;
}

export class NftMedia {
  uri?: TokenUri;
}

export class NftMetadata {
  name?: string;
  description?: string;
  image?: string;
}

@ObjectType()
export class ownedNft {
  id?: string;
  title?: string;
  image?: string;
  description?: string;
  tokenUri?: string;
}
@ObjectType()
export class NftList {
  ownedNfts: ownedNft[];
  pageKey?: string;
  totalCount: number;
}

@ObjectType()
export class Item extends BaseModel {
  @Field()
  name: string;
  slug: string;

  @Field()
  description?: string;
  external_url?: string;

  @Field({ middleware: [imageLinkAddMiddleware] })
  media_path?: string;

  @Field({ middleware: [imageLinkAddMiddleware] })
  thumbnail_path?: string;
  filetype: string;
  token_uri?: string;
  token_id?: string;

  @Field(() => Int)
  view_count: number;

  @Field(() => Int, { nullable: true })
  payment_token_id: number;

  @Field(() => Int)
  like_count: number;

  @Field(() => Decimal)
  price: Decimal;
  is_unlockable_content?: number;
  unlockable_content?: string;
  collection_id: number;
  owner_id: number;
  owner_name?: string;
  creator_id: number;
  is_minted: number;
  status: number;

  @Field(() => Date, { nullable: true })
  minted_at?: Date;

  @Field(() => Date)
  created_at: Date;

  @Field(() => Date, { nullable: true })
  updated_at: Date;

  @Field(() => Collection, { nullable: true })
  collection?: Collection;

  @Field(() => User, { nullable: true })
  owner?: User;

  @Field(() => User, { nullable: true })
  creator?: User;

  @Field(() => [ItemActivity], { nullable: true })
  item_activities?: ItemActivity[];

  item_favourite_lists?: ItemFavouriteList[];

  @Field(() => [BuyOffer], { nullable: true })
  buy_offers?: BuyOffer[];

  @Field(() => [SellOffer], { nullable: true })
  sell_offers?: SellOffer[];

  @Field(() => SellOffer, { nullable: true })
  active_sell?: SellOffer;

  @Field(() => BuyOffer, { nullable: true })
  active_buy?: BuyOffer;

  @Field(() => BuyOffer, { nullable: true })
  highest_bid?: BuyOffer;

  @Field(() => Exchange, { nullable: true })
  exchange_in_progress?: Exchange;

  @Field(() => [Exchange], { nullable: true })
  exchanges?: Exchange[];

  @Field(() => [Price], { nullable: true })
  prices?: Price[];

  @Field(() => PaymentTokenModel, { nullable: true })
  payment_token?: PaymentTokenModel;
}
