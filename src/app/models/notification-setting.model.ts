import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class NotificationSettingModel {
  @Field(() => Int)
  id: number;
  @Field(() => Int)
  user_id: number;
  @Field(() => String, { nullable: true })
  events?: string;

  user?: User;
}
