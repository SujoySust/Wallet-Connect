import { InputType } from '@nestjs/graphql';

@InputType()
export class RoleOrder {
  field: string;
  direction: string;
}
