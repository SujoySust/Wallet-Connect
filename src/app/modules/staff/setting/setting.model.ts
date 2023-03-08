import { Field, Int, ObjectType } from '@nestjs/graphql';
import { dynamicValueTranslationMiddleware } from 'src/app/middlewares/dynamic-value-translation.middleware';
import { settingsMediaLink } from 'src/app/middlewares/settingsMediaLinkAdd.middleware';

@ObjectType()
export class Setting {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: true })
  value_type: number;

  @Field(() => String, { nullable: true })
  option_group: string;

  @Field(() => String)
  option_key: string;

  @Field(() => String, {
    nullable: true,
    middleware: [settingsMediaLink, dynamicValueTranslationMiddleware],
  })
  option_value: string;
}
