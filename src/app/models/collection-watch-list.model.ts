import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
import { User } from './user.model';
import { Collection } from './collection.model';

@ObjectType()
export class CollectionWatchList extends BaseModel {
  @Field(() => Int)
  collection_id: number;

  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  status: number;

  collection: Collection;
  user: User;
}
