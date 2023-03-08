import { Field, InputType } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import {
  SETTINGS_SLUG_APP_LOGO_LARGE,
  SETTINGS_SLUG_APP_LOGO_SMALL,
  SETTINGS_SLUG_FAVICON_LOGO,
} from 'src/app/helpers/slugconstants';
@InputType()
export class logoSettingsInput {
  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG_APP_LOGO_LARGE]: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG_APP_LOGO_SMALL]: FileUpload;

  @Field(() => GraphQLUpload, { nullable: true })
  [SETTINGS_SLUG_FAVICON_LOGO]: FileUpload;
}
