import { Field, Float, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
import { Item } from './item.model';
import { User } from './user.model';
import { Category } from './category.model';
import { imageLinkAddMiddleware } from '../middlewares/imageLinkAdd.middleware';
import { BlockchainModel } from '../modules/staff/blockchain/blockchain.model';
import { CollectionWatchList } from './collection-watch-list.model';
import { CollectionModelMetadata } from '../modules/collection/dto/collection-with-meta.object';
import { collectionMeatadatAdd } from '../middlewares/collectionMetadataAdd.middleware';
import { collectionItemCount } from '../middlewares/collectionItemCount.middleware';
import { FeaturedCollectionList } from './collection-featured-list.model';

@ObjectType()
export class Count {
  items: number;
}
@ObjectType()
export class Collection extends BaseModel {
  @Field()
  name: string;

  slug: string;
  contract_address?: string;

  description?: string;

  @Field({ middleware: [imageLinkAddMiddleware] })
  logo: string;

  @Field({ middleware: [imageLinkAddMiddleware] })
  feature_image?: string;

  @Field({ middleware: [imageLinkAddMiddleware] })
  banner_image?: string;

  @Field(() => Float)
  royalties?: number;

  @Field()
  payout_address?: string;

  @Field()
  category_id: number;

  @Field()
  blockchain_id: number;

  @Field()
  display_theme: number;

  @Field()
  is_sensitive: number;

  @Field()
  is_featured: number;

  user?: User;
  user_id?: number;
  username?: string;
  user_wallet_address?: string;

  items?: Array<Item>;

  blockchain?: BlockchainModel;

  category?: Category;

  collection_watch_lists?: CollectionWatchList[];

  featured_collections?: FeaturedCollectionList;

  @Field({ middleware: [collectionMeatadatAdd] })
  metadata?: CollectionModelMetadata;

  @Field()
  status: number;

  @Field({ middleware: [collectionItemCount] })
  _count?: Count;
}
