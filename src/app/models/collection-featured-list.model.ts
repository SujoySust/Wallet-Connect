import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';

@ObjectType()
export class FeaturedCollectionList extends BaseModel {
  @Field(() => Int)
  collection_id: number;

  @Field(() => Int)
  order: number;
}
