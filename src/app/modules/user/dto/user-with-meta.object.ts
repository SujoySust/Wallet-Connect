import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SocialLinkModel } from '../../../models/socialLink.model';
import { User } from '../../../models/user.model';

@ObjectType()
export class UserWithMetaObject {
  @Field(() => User)
  user: User;

  @Field(() => SocialLinkModel)
  social_links: SocialLinkModel;
}
