import { Field, ObjectType } from '@nestjs/graphql';
import { Item } from './item.model';
import { Collection } from './collection.model';
import { AuthenticatableInterface } from '../../libs/auth/authenticatable.interface';
import { BaseModel } from '../../libs/model/base.model';
import { imageLinkAddMiddleware } from '../middlewares/imageLinkAdd.middleware';
import { Exchange } from '../modules/exchange/exchange.model';
import { NotificationSettingModel } from './notification-setting.model';
import { SocialLinkModel } from './socialLink.model';

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

  collections?: Array<Collection>;
  ownedItems?: Array<Item>;
  createdItems?: Array<Item>;
  exchangesAsSeller?: Array<Exchange>;
  exchangesAsBuyer?: Array<Exchange>;
  notfication_settings?: NotificationSettingModel;
  social_links?: SocialLinkModel;
}
