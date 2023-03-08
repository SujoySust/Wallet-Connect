import {
  IsAlphanumeric,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';
import { InputType, Field, HideField } from '@nestjs/graphql';
import { Match } from '../../../../../libs/decorators/match.decorator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class UpdateStaffUserDto {
  @Field()
  @IsAlphanumeric()
  username: string;

  @Field()
  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  bio: string;

  @Field({ nullable: true })
  website_link: string;

  @Field({ nullable: true })
  instagram_link: string;

  @HideField()
  profile_img: string;

  @Field(() => GraphQLUpload, { nullable: true })
  profile_img_file: FileUpload;

  @HideField()
  banner_img: string;

  @Field(() => GraphQLUpload, { nullable: true })
  banner_img_file: FileUpload;
}
