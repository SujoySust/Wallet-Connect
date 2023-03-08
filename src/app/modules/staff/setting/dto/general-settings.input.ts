import { Field, InputType } from '@nestjs/graphql';
import {
  SETTINGS_SLUG_ADDRESS,
  SETTINGS_SLUG_ADMIN_COMMISSION,
  SETTINGS_SLUG_APPLICATION_TITLE,
  SETTINGS_SLUG_CONTRACT_EMAIL,
  SETTINGS_SLUG_CONTRACT_PHONE,
  SETTINGS_SLUG_COPY_RIGHT,
  SETTINGS_SLUG_WALLET_ADDRESS,
} from 'src/app/helpers/slugconstants';

@InputType()
export class generalSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG_APPLICATION_TITLE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_CONTRACT_EMAIL]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_CONTRACT_PHONE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_ADDRESS]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_COPY_RIGHT]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_WALLET_ADDRESS]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_ADMIN_COMMISSION]: string;
}
