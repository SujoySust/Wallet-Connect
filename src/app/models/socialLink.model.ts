import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SocialLinkModel {
  @Field(() => Int)
  id: number;
  @Field()
  model_id: number;
  model_type: number;
  website_link?: string;
  discord_link?: string;
  instagram_link?: string;
  medium_link?: string;
  telegram_link?: string;
  facebook_link?: string;
  whatsapp_link?: string;
  linkedin_link?: string;
}
