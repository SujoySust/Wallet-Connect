import { InputType, Field } from '@nestjs/graphql';
import { __ } from '@squareboat/nestjs-localization/dist/src';
import { IsEmail } from 'class-validator';

@InputType()
export class NewsletterSubscriptionInput {
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  status: number;
}
