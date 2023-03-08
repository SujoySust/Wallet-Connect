import { Field, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import {
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_FIVE,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_FOUR,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_ONE,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_THREE,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_TWO,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_FIVE,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_FOUR,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_ONE,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_THREE,
  SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_TWO,
} from 'src/app/helpers/slugconstants';

@InputType()
export class UsefulLinkSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_ONE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_ONE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_TWO]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_TWO]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_THREE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_THREE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_FOUR]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_FOUR]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_TITLE_FIVE]: string;

  @Field({ nullable: true })
  [SETTINGS_SLUG_FOOTER_USEFUL_LINK_URL_FIVE]: string;
}
