import { Field, InputType } from '@nestjs/graphql';
import {
  SETTINGS_SLUG_FACEBOOK_LINK,
  SETTINGS_SLUG_TWITTER_LINK,
  SETTINGS_SLUG_INSTAGRAM_LINK,
  SETTINGS_SLUG_DISCORD_LINK,
  SETTINGS_SLUG_WHATSAPP_LINK,
  SETTINGS_SLUG_LINKEDIN_LINK,
} from 'src/app/helpers/slugconstants';

@InputType()
export class socialSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG_FACEBOOK_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_TWITTER_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_INSTAGRAM_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_DISCORD_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_WHATSAPP_LINK]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_LINKEDIN_LINK]: string;
}
