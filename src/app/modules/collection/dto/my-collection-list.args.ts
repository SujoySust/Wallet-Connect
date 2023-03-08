import { ArgsType, Field } from '@nestjs/graphql';
import { CollectionOrder } from '../../../models/input/collection-order.input';

@ArgsType()
export class GetMyCollectionListArgs {
  @Field({ nullable: true })
  orderBy?: CollectionOrder;
}
