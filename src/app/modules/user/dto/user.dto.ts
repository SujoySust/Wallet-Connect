import {
  IsAlphanumeric,
  IsNotEmpty,
  Matches,
  MinLength,
} from 'class-validator';
import { InputType, Field, HideField } from '@nestjs/graphql';
import { Match } from '../../../../libs/decorators/match.decorator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

@InputType()
export class UpdateProfileInput {
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

@InputType()
export class UpdatePasswordInput {
  @Field()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  @Match('password')
  passwordConfirm: string;
}
