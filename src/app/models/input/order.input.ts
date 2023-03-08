import { InputType } from '@nestjs/graphql';

@InputType()
export class Order {
  field: string;
  direction: string;
}
