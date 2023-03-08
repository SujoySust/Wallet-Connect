import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ResponseMessageWithStatusModel {
  @Field({ description: 'success' })
  success: boolean;

  @Field({ description: 'message' })
  message: string;
}
