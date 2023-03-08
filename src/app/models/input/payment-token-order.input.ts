import { InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Order } from '../../../libs/graphql/order/order';

export enum PaymentTokenOrderField {
  id = 'id',
  name = 'name',
}

registerEnumType(PaymentTokenOrderField, {
  name: 'PaymentTokenOrderField',
  description: 'Properties by which payment token connections can be ordered.',
});

@InputType()
export class PaymentTokenOrder extends Order {
  field: PaymentTokenOrderField;
}
