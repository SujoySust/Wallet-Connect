import { Field, Int, ObjectType } from '@nestjs/graphql';
import { dynamicValueTranslationMiddleware } from '../middlewares/dynamic-value-translation.middleware';

@ObjectType()
export class NotificationEventModel {
  @Field(() => Int)
  id: number;
  @Field(() => String, {
    nullable: true,
    middleware: [dynamicValueTranslationMiddleware],
  })
  title: string;
  @Field(() => String, {
    nullable: true,
    middleware: [dynamicValueTranslationMiddleware],
  })
  description: string;
  @Field(() => Int)
  status: number;
}
