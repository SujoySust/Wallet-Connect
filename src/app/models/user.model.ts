import { Field, ObjectType } from '@nestjs/graphql';
import { AuthenticatableInterface } from '../../libs/auth/authenticatable.interface';
import { BaseModel } from '../../libs/model/base.model';
import { imageLinkAddMiddleware } from '../middlewares/imageLinkAdd.middleware';

@ObjectType()
export class User extends BaseModel implements AuthenticatableInterface {
  wallet_address: string;
  username?: string;
  name?: string;
  @Field({ middleware: [imageLinkAddMiddleware] })
  profile_img?: string;
  @Field({ middleware: [imageLinkAddMiddleware] })
  banner_img?: string;
  email?: string;
  phone?: string;
  reset_code?: string;
  is_email_verified?: number;
  email_verified_at?: Date;
  bio?: string;
  status?: number;
}
