import { InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../../libs/graphql/order/order';

export enum CommonOrderField {
  id = 'id',
  created_at = 'created_at',
  name = 'name',
}

registerEnumType(CommonOrderField, {
  name: 'CommonOrderField',
  description: 'Properties by which common connections can be ordered.',
});

@InputType()
export class CollectionOrder extends Order {
  field: CommonOrderField;
}
