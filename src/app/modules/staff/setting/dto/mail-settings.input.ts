import { Field, InputType } from '@nestjs/graphql';
import {
  SETTINGS_SLUG_MAIL_DIRIVER,
  SETTINGS_SLUG_MAIL_HOST,
  SETTINGS_SLUG_MAIL_PORT,
  SETTINGS_SLUG_MAIL_USERNAME,
  SETTINGS_SLUG_MAIL_PASSWORD,
  SETTINGS_SLUG_MAIL_ENCRYPTION,
  SETTINGS_SLUG_MAIL_FROM_ADDRESS,
  SETTINGS_SLUG_MAIL_FROM_NAME,
} from 'src/app/helpers/slugconstants';

@InputType()
export class mailSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_DIRIVER]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_HOST]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_PORT]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_USERNAME]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_PASSWORD]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_ENCRYPTION]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_FROM_ADDRESS]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_MAIL_FROM_NAME]: string;
}
