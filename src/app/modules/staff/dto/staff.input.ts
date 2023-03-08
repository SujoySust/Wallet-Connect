import { IsAlphanumeric, IsEmail, IsEmpty, MinLength } from 'class-validator';
import { InputType, Field, HideField } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { Unique } from 'src/libs/decorators/unique.decorator';
import { __ } from 'src/app/helpers/functions';

@InputType()
export class StaffCreateInput {
  @Field()
  @IsAlphanumeric()
  username: string;

  @IsEmail()
  @Unique('Staff', {
    message: () => __('Email already exists.'),
  })
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  roleId: number;

  @Field()
  @MinLength(8)
  password: string;
}

@InputType()
export class StaffUpdateInput {
  @Field({
    nullable: true,
    description: 'Send email field only if it is admin',
  })
  email: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  username: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  phone: string;

  @HideField()
  avatar: string;

  @Field(() => GraphQLUpload, { nullable: true })
  avatarFile: FileUpload;

  @Field({ nullable: true })
  roleId: number;

  @Field({ nullable: true })
  password: string;
}
