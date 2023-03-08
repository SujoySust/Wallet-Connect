import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';
import { Item } from './item.model';
import { BaseModel } from 'src/libs/model/base.model';

@ObjectType()
export class ItemFavouriteList extends BaseModel {
  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  item_id: number;

  @Field(() => User)
  user?: User;

  @Field(() => Item)
  item?: Item;
}
