import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { Match } from '../../decorators/match.decorator';

@InputType()
export class ResetPasswordInput {
  @Field()
  code: string;

  @Field()
  @IsEmail()
  email: string;

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
