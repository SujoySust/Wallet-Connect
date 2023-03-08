import { Field, HideField, InputType } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload';
import { RestrictedKeyWordsCheck } from 'src/libs/decorators/restricted-keywords.decorator';
import { Unique } from '../../../../libs/decorators/unique.decorator';
import { __ } from '../../../helpers/functions';

@InputType()
export class BaseItemDto {
  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  external_url?: string;

  @HideField()
  token_uri?: string;

  @Field()
  is_unlockable_content: number;
  @Field({ nullable: true })
  unlockable_content: string;
}

@InputType()
export class CreateItemDto extends BaseItemDto {
  @Field()
  // @ProtectSpecialChar()
  @Unique('Item', { message: () => __('Name must be unique!') })
  @RestrictedKeyWordsCheck()
  name: string;
  @Field()
  collection_id: number;
  @Field(() => GraphQLUpload)
  media_file: FileUpload;
  @Field(() => GraphQLUpload, { nullable: true })
  thumbnail_file: FileUpload;
}

@InputType()
export class UpdateItemDto extends BaseItemDto {}
