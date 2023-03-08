import { BaseModel } from './base.model';
import { HideField, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class Authenticatable extends BaseModel {
  @HideField()
  getAuthIdentifier() {
    return 'id';
  }
}
