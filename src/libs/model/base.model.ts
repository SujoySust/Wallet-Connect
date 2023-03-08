import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class BaseModel {
  @Field(() => Int)
  id: number;
  @Field({
    description: 'Identifies the date and time when the object was created.',
  })
  created_at: Date;
  @Field({
    description:
      'Identifies the date and time when the object was last updated.',
  })
  updated_at: Date;
}
