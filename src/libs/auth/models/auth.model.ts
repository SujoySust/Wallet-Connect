import { ObjectType } from '@nestjs/graphql';
import { Token } from './token.model';

@ObjectType()
export class Auth<TModel> extends Token {
  user: TModel;
}
