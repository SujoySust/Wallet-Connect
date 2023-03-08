import { ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
@ObjectType()
export class NewsletterSubscription extends BaseModel {
  email: string;
  status?: number;
}
