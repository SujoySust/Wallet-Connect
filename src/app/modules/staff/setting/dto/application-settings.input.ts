import { Field, InputType } from '@nestjs/graphql';
import {
  SETTINGS_BUY_SELL_FEE_PERCENTAGE,
  SETTINGS_KEY_MINTING_INTERVAL_DURATION_IN_MIN,
  SETTINGS_KEY_PER_DAY_MINTING_LIMIT,
  SETTINGS_MAX_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN,
  SETTINGS_MIN_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN,
} from 'src/app/helpers/slugconstants';

@InputType()
export class ApplicationSettingsInput {
  @Field({ nullable: true })
  [SETTINGS_BUY_SELL_FEE_PERCENTAGE]: string;

  @Field({ nullable: true })
  [SETTINGS_MIN_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN]: string;

  @Field({ nullable: true })
  [SETTINGS_MAX_INTERVAL_FOR_BUY_SELL_OFFER_IN_MIN]: string;

  @Field({ nullable: true })
  [SETTINGS_KEY_PER_DAY_MINTING_LIMIT]: string;

  @Field({ nullable: true })
  [SETTINGS_KEY_MINTING_INTERVAL_DURATION_IN_MIN]: string;
}
