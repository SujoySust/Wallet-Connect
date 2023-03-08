import { InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../../libs/graphql/order/order';

export enum CollectionOrderField {
  id = 'id',
  created_at = 'created_at',
  name = 'name',
  loyalties = 'loyalties',
}

registerEnumType(CollectionOrderField, {
  name: 'CollectionOrderField',
  description: 'Properties by which collection connections can be ordered.',
});

@InputType()
export class CollectionOrder extends Order {
  field: CollectionOrderField;
}
