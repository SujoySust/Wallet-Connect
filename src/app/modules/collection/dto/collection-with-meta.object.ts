import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Collection } from '../../../models/collection.model';
import { SocialLinkModel } from '../../../models/socialLink.model';
import {
  PaymentTokenMappingModel,
  PaymentTokenModel,
} from '../../../models/paymentToken.model';
import { PriceConvertModel } from 'src/app/models/priceConvert.model';

@ObjectType()
export class CollectionWithMeta {
  @Field(() => Collection)
  collection: Collection;
  @Field(() => SocialLinkModel)
  social_links: SocialLinkModel;
  @Field(() => [PaymentTokenMappingModel])
  token_mappings?: PaymentTokenMappingModel[];
  @Field(() => Int, { nullable: true })
  owner_count?: number;
  @Field(() => Int)
  itemCount: number;
  @Field(() => Boolean)
  is_watched: boolean;
  @Field(() => PriceConvertModel, { nullable: true })
  volume?: PriceConvertModel;
  @Field(() => PriceConvertModel, { nullable: true })
  floor_price?: PriceConvertModel;
  @Field(() => PaymentTokenModel, { nullable: true })
  native_token?: PaymentTokenModel;
}

@ObjectType()
export class CollectionModelMetadata {
  @Field(() => Int, { nullable: true })
  owner_count?: number;
  @Field(() => PriceConvertModel, { nullable: true })
  volume?: PriceConvertModel;
  @Field(() => PriceConvertModel, { nullable: true })
  floor_price?: PriceConvertModel;
  @Field(() => PaymentTokenModel, { nullable: true })
  native_token?: PaymentTokenModel;
}
