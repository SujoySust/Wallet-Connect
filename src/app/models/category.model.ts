import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../libs/model/base.model';
import { imageLinkAddMiddleware } from '../middlewares/imageLinkAdd.middleware';

@ObjectType()
export class Category extends BaseModel {
  id: number;
  @Field()
  title: string;
  @Field({
    nullable: true,
    middleware: [imageLinkAddMiddleware],
  })
  image: string;
  @Field(() => Number)
  status: number;
}
