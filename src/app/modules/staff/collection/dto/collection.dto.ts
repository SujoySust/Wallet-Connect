import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MaxFeaturedCollectionOrderDto {
  @Field()
  max_order: number;
}
