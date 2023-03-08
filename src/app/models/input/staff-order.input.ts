import { InputType } from '@nestjs/graphql';

@InputType()
export class StaffOrder {
  field: string;
  direction: string;
}
