import { ObjectType } from '@nestjs/graphql';
import { Item } from 'src/app/models/item.model';
import { User } from 'src/app/models/user.model';

@ObjectType()
export class Transfer {
  id: number;
  uid: string;
  item_id: number;
  user_id: number;
  to_user_id: number;
  to_address: string;
  transaction_hash?: string;
  status: number;
  created_at: Date;
  updated_at: Date;

  user?: User;
  to_user?: User;
  item?: Item;
}
