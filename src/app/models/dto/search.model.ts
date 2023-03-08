/* eslint-disable @typescript-eslint/ban-types */
import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { Collection } from '../collection.model';
import { Item } from '../item.model';
import { User } from '../user.model';

@ObjectType()
export class SearchModel {
  @Field(() => [Collection], { nullable: true })
  collection?: Collection[];

  @Field(() => [User], { nullable: true })
  account?: User[];

  @Field(() => [Item], { nullable: true })
  item: Item[];
}
