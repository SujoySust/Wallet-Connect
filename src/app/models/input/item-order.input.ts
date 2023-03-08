import { InputType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../../libs/graphql/order/order';

export enum ItemOrderField {
  id = 'id',
  recently_created = 'created_at',
  price = 'price',
  view = 'view_count',
  most_favourite = 'most_favourite',
}

registerEnumType(ItemOrderField, {
  name: 'ItemOrderField',
  description: 'Properties by which Item connections can be ordered.',
});

@InputType()
export class ItemOrder extends Order {
  field: ItemOrderField;
}
