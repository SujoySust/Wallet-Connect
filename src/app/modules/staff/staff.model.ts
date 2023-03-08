import { ObjectType, HideField, Field } from '@nestjs/graphql';
import { BaseModel } from '../../../libs/model/base.model';
import { AuthenticatableInterface } from '../../../libs/auth/authenticatable.interface';
import { Role } from './role/role.model';
import { imageLinkAddMiddleware } from '../../middlewares/imageLinkAdd.middleware';

@ObjectType()
export class Staff extends BaseModel implements AuthenticatableInterface {
  id: number;
  username: string;
  email: string;
  name: string;
  @Field({ middleware: [imageLinkAddMiddleware] })
  avatar?: string;
  description?: string;
  phone?: string;
  emailVerifiedAt?: Date;
  isEmailVerified: boolean;
  resetCode?: string;
  roleId?: number;
  status: number;
  role?: Role;
  @HideField()
  password: string;
}
