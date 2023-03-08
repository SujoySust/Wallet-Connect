import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UserNotificationSettingDto {
  @Field(() => [Int], { nullable: true })
  events: Array<number>;
}
