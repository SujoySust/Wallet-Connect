import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class RangeDto {
  @Field()
  name: string;

  @Field(() => Float)
  value: number;

  @Field(() => Float)
  valueof: number;
}
