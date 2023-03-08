/* eslint-disable @typescript-eslint/ban-types */
import { Field, HideField, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CountModel {
  @Field({ description: 'count' })
  count: number;
}
