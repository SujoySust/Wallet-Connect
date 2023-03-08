import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PropertyDto {
  @Field()
  type: string;

  @Field()
  name: string;
}
