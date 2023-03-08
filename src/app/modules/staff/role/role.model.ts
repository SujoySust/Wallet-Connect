import { ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../../../libs/model/base.model';
import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class Role extends BaseModel {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmpty()
  permissions?: string;
}
