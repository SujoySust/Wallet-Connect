import { ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../../../libs/model/base.model';
import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

@ObjectType()
export class SettingResponse extends BaseModel {
  @IsEmpty()
  address: string;

  @IsEmpty()
  adminCommission: string;

  @IsEmpty()
  applicationTitle: string;

  @IsEmpty()
  contactEmail: string;

  @IsEmpty()
  contactPhone: string;

  @IsEmpty()
  copyrightText: string;

  @IsEmpty()
  homepageDescription: string;

  @IsEmpty()
  homepageHeader: string;

  @IsEmpty()
  walletAddress: string;
}
