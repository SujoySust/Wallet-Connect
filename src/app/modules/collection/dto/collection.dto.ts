import { Field, Float, HideField, InputType } from '@nestjs/graphql';
import { IsNotEmpty, Length } from 'class-validator';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { Unique } from '../../../../libs/decorators/unique.decorator';
import { __ } from '../../../helpers/functions';
import { ProtectSpecialChar } from '../../../../libs/decorators/special-char.decorator';
import { RestrictedKeyWordsCheck } from 'src/libs/decorators/restricted-keywords.decorator';

@InputType()
export class BaseCollectionDto {
  @HideField()
  @Field({ nullable: true })
  contract_address: string;

  @Field({ nullable: true })
  description: string;

  @Field()
  category_id: number;

  @Field()
  display_theme: number;

  @Field()
  is_sensitive: number;

  @Field({ nullable: true })
  payout_address: string;

  @HideField()
  status: number;

  @HideField()
  logo: string;

  @HideField()
  feature_image: string;

  @Field(() => GraphQLUpload, { nullable: true })
  feature_image_file: FileUpload;

  @HideField()
  banner_image: string;

  @Field(() => GraphQLUpload, { nullable: true })
  banner_image_file: FileUpload;

  @Field({ nullable: true })
  payment_tokens: string;

  @Field({ nullable: true })
  website_link: string;

  @Field({ nullable: true })
  discord_link: string;

  @Field({ nullable: true })
  instagram_link: string;

  @Field({ nullable: true })
  medium_link: string;

  @Field({ nullable: true })
  telegram_link: string;

  @Field(() => Float)
  royalties: number;
}

@InputType()
export class CreateCollectionDto extends BaseCollectionDto {
  @Unique('Collection', {
    message: () => __('Collection name already exists.'),
  })
  @RestrictedKeyWordsCheck()
  @ProtectSpecialChar()
  @Length(1, 200)
  @IsNotEmpty()
  @Field()
  name: string;

  @Field({ nullable: true })
  @Unique('Collection', { message: () => __('Url already exists.') })
  @RestrictedKeyWordsCheck()
  slug: string;

  @Field(() => GraphQLUpload)
  logo_file: FileUpload;

  @Field()
  blockchain_id: number;
}

@InputType()
export class UpdateCollectionDto extends BaseCollectionDto {
  @Field()
  @IsNotEmpty()
  @Length(1, 200)
  @ProtectSpecialChar()
  @RestrictedKeyWordsCheck()
  name: string;

  @Field(() => GraphQLUpload, { nullable: true })
  logo_file: FileUpload;

  @Field({ nullable: true })
  @RestrictedKeyWordsCheck()
  slug: string;
}
