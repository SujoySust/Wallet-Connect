import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class roleInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field({ nullable: true })
  permissions: string;
}

@InputType()
export class roleId {
  @Field()
  id: number;
}
