import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class SignupInput {
  @Field()
  @IsAlphanumeric()
  username: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  phone: string;

  @Field()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
