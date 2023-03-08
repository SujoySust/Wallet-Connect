import { InputType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../../libs/graphql/order/order';

export enum UserOrderField {
  id = 'id',
  name = 'name',
}

registerEnumType(UserOrderField, {
  name: 'UserOrderField',
  description: 'Properties by which User connections can be ordered.',
});

@InputType()
export class UserOrder extends Order {
  field: UserOrderField;
}
