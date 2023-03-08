import { Field, HideField, ObjectType } from '@nestjs/graphql';

@ObjectType('FileVariant')
class FileVariant {
  @Field()
  type: string;

  @Field()
  url: string;
}

@ObjectType('FileObject')
export class FileObject {
  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  url: string;

  @Field(() => [FileVariant], { nullable: true })
  variants?: Array<FileVariant>;
}
